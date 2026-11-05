const ROOT="https://raw.githubusercontent.com/Ahmad-full-stuck/eva-store/main/artifacts/client-stores/";
const ROUTES={laya:"laya",njom:"njom",lna:"lna",scoop:"scoop",mukhtar:"mukhtar"};
export default {async fetch(request,env,ctx){
 const url=new URL(request.url),slug=ROUTES[url.hostname.split(".")[0]];
 if(!slug)return new Response("Unknown storefront",{status:404});
 if(url.pathname==="/api/health")return Response.json({ok:true,store:slug});
 if(url.pathname==="/api/orders"&&request.method==="POST"){
  let b;try{if(Number(request.headers.get("content-length")||0)>12000)return Response.json({ok:false},{status:413});b=await request.json();}catch(_){return Response.json({ok:false},{status:400});}
  const name=typeof b.name==="string"?b.name.trim().slice(0,70):"",phone=typeof b.phone==="string"?b.phone.trim().slice(0,24):"",area=typeof b.area==="string"?b.area.trim().slice(0,100):"",note=typeof b.note==="string"?b.note.trim().slice(0,300):"";
  const items=Array.isArray(b.items)?b.items.slice(0,20).map(x=>({id:String(x.id||"").slice(0,80),name:String(x.name||"").slice(0,120),qty:Math.max(1,Math.min(20,Number(x.qty)||1))})).filter(x=>x.id&&x.name):[];
  if(!name||!phone||!area||!items.length)return Response.json({ok:false,error:"Complete order details"},{status:400});
  const id="ORD-"+crypto.randomUUID().slice(0,8).toUpperCase();
  try{await env.DB.prepare("INSERT INTO orders(id,customer_name,phone,area,note,items_json,status,created_at) VALUES(?1,?2,?3,?4,?5,?6,'new',CURRENT_TIMESTAMP)").bind(id,name,phone,area,note,JSON.stringify(items)).run();return Response.json({ok:true,id,store:slug},{status:201});}
  catch(e){console.error("order-save",String(e));return Response.json({ok:false,error:"Could not save order"},{status:503});}
 }
 if(url.pathname==="/api/orders")return new Response("Method not allowed",{status:405});
 if(request.method!=="GET"&&request.method!=="HEAD")return new Response("Method not allowed",{status:405});
 const path=url.pathname==="/store.json"?"store.json":url.pathname==="/favicon.svg"?"favicon.svg":url.pathname==="/assets/storefront.js"?"../shared/storefront.js":url.pathname==="/assets/storefront.css"?"../shared/storefront.css":"index.html";
 const upstream=await fetch(ROOT+slug+"/"+path,{cf:{cacheTtl:300,cacheEverything:true}});
 if(!upstream.ok)return new Response("Storefront source unavailable",{status:503});
 const headers=new Headers(upstream.headers);headers.set("x-content-type-options","nosniff");headers.set("referrer-policy","strict-origin-when-cross-origin");
 if(path==="index.html")headers.set("content-type","text/html; charset=utf-8");
 if(path.endsWith(".js"))headers.set("content-type","application/javascript; charset=utf-8");
 if(path.endsWith(".css"))headers.set("content-type","text/css; charset=utf-8");
 return new Response(request.method==="HEAD"?null:upstream.body,{status:200,headers});
}};