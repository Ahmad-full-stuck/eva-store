const SLUGS = new Set(["laya","njom","lna","scoop","mukhtar"]);
const RAW = "https://raw.githubusercontent.com/Ahmad-full-stuck/eva-store/main/artifacts";
const COMMON_ASSETS = "client-platform/dist";
const json = (value, status=200, cache="no-store") => new Response(JSON.stringify(value), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": cache,
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin"
  }
});
const text = (value, status=200, cache="no-store") => new Response(value, {
  status,
  headers: {"content-type":"text/plain; charset=utf-8","cache-control":cache,"x-content-type-options":"nosniff"}
});
const mime = (path) => {
  const p = path.toLowerCase();
  if (p.endsWith(".html")) return "text/html; charset=utf-8";
  if (p.endsWith(".js") || p.endsWith(".mjs")) return "application/javascript; charset=utf-8";
  if (p.endsWith(".css")) return "text/css; charset=utf-8";
  if (p.endsWith(".json") || p.endsWith(".webmanifest")) return "application/json; charset=utf-8";
  if (p.endsWith(".svg")) return "image/svg+xml";
  if (p.endsWith(".woff2")) return "font/woff2";
  if (p.endsWith(".woff")) return "font/woff";
  if (p.endsWith(".png")) return "image/png";
  if (p.endsWith(".webp")) return "image/webp";
  if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
  if (p.endsWith(".ico")) return "image/x-icon";
  return "application/octet-stream";
};
const githubFile = async (path, ttl=300) => {
  const safe = path.replace(/^\/+/, "");
  if (safe.split("/").some((part) => part === ".." || part === ".")) return null;
  const response = await fetch(RAW + "/" + safe, { cf: { cacheTtl: ttl, cacheEverything: true } });
  if (!response.ok) return null;
  return response;
};
const profileFor = async (slug) => {
  const response = await githubFile("client-stores/" + slug + "/store.json", 120);
  if (!response) return null;
  try { return await response.json(); } catch { return null; }
};
const readKV = async (env, slug, key, fallback=null) => {
  try {
    const raw = await env.ORDERS.get(slug + ":" + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};
const writeKV = async (env, slug, key, value) => env.ORDERS.put(slug + ":" + key, JSON.stringify(value));
const productRows = (profile, overrides=[]) => {
  const base = Array.isArray(profile.products) ? profile.products : [];
  const map = new Map();
  for (const item of base) {
    const id = String(item.id || item.slug || "");
    if (!id) continue;
    const image = String(item.image || profile.heroImage || "");
    const category = String(item.category || "مختاراتنا");
    map.set(id, {
      id, slug: id, name: String(item.name || "منتج"),
      type: category, categoryId: category,
      description: String(item.description || ""),
      price: 0, image, images: Array.isArray(item.images) ? item.images : [image].filter(Boolean),
      colors: [{id:"default",name:"أساسي",hex:"#b4a08a",available:true,stockMeters:1000}],
      colorsEnabled: false,
      specs: {
        composition: "تُؤكد التفاصيل مع المتجر",
        width: "حسب الموديل",
        weight: "حسب الموديل",
        stretch: "غير محدد",
        isStretch: false,
        opacity: "غير محدد",
        finish: "حسب المنتج",
        care: "راجع إرشادات العناية المرفقة مع المنتج",
        use: String(item.description || "راجع تفاصيل المنتج مع المتجر")
      },
      faqs: [], isNew: Boolean(item.isNew), isFeatured: item.isFeatured !== false,
      stockMeters: 1000, createdAt: String(item.createdAt || new Date().toISOString().slice(0,10))
    });
  }
  for (const item of overrides) {
    if (!item || typeof item !== "object") continue;
    const id = String(item.id || item.slug || "");
    if (id) map.set(id, item);
  }
  return [...map.values()];
};
const categoryRows = (profile) => {
  const names = Array.isArray(profile.categories) ? profile.categories.filter(Boolean) : [];
  const rows = names.filter((name) => name !== "الكل").map((name, index) => {
    const product = (profile.products || []).find((item) => item.category === name);
    return {
      id: name, slug: "category-" + index, name: String(name),
      description: "تصفح مجموعة " + name,
      image: product?.image || profile.heroImage || "",
      accent: profile.theme?.accent || "#9b8060"
    };
  });
  return rows.length ? rows : [{id:"featured",slug:"featured",name:"مختاراتنا",description:"تشكيلة المتجر",image:profile.heroImage||"",accent:profile.theme?.accent||"#9b8060"}];
};
const routeRows = () => [
  {id:"home",label:"الرئيسية",path:"/",header:true},
  {id:"catalog",label:"المنتجات",path:"/catalog",header:true},
  {id:"new",label:"وصل حديثاً",path:"/catalog?sort=newest",header:true},
  {id:"favorites",label:"المفضلة",path:"/favorites",header:false},
  {id:"about",label:"من نحن",path:"/about",header:true},
  {id:"contact",label:"تواصل معنا",path:"/contact",header:true},
  {id:"tracking",label:"تتبع الطلب",path:"/order-tracking",header:false},
  {id:"policies",label:"السياسات",path:"/policies",header:false}
];
const contentFor = (p, saved={}) => {
  const phones = Array.isArray(p.phones) ? p.phones : [];
  const primaryPhone = String(phones[0]?.number || "");
  const theme = p.theme || {};
  const defaultContent = {
    shopName:p.name, shortName:p.name, monogram:p.monogram || "", tagline:p.tagline || "",
    phone:primaryPhone, whatsapp:primaryPhone, instagram:p.instagram || "",
    contactUrl:p.contactUrl || p.instagram || "",
    location:p.location || "", hours:p.hours || "",
    announcementRight:p.location || "تواصل مباشر مع المتجر",
    announcementLeft:p.note || "تأكد من تفاصيل المنتج قبل الطلب",
    aboutTitle:p.storyTitle || "قصة العلامة",
    aboutText:p.storyText || p.description || "",
    contactTitle:"هل تحتاج مساعدة في اختيارك؟",
    contactText:"أرسل استفسارك عن المنتجات أو المقاسات أو التوفر، وسيعود إليك فريق المتجر لتأكيد التفاصيل.",
    heroEyebrow:p.eyebrow || "تجربة تسوق متكاملة",
    heroTitle:p.heroTitle || "اكتشف اختياراتنا",
    heroText:p.heroText || p.description || "",
    heroNote:p.location || "تواصل مباشر مع المتجر",
    heroNoteAlt:p.note || "تأكيد التفاصيل قبل الطلب",
    statsTitle:"التجربة في أرقام",
    heroSlides:p.heroImage ? [p.heroImage] : [],
    hiddenSections:["discovery","guide","newsletter"],
    categoriesEyebrow:"تصفح حسب القسم",
    categoriesTitle:"الأقسام الرئيسية",
    newEyebrow:"تشكيلة المتجر",
    newTitle:"مختاراتنا",
    newDesc:"مجموعة من المنتجات والنماذج المتاحة للتصفح",
    guideEyebrow:"دليل التسوق",
    guideTitle:"اختر بثقة|واطلب بسهولة",
    guideText:"راجع الصور والتفاصيل، واستفسر عن التوفر والمقاسات قبل إتمام الطلب.",
    guideCta:"تصفح المنتجات",
    newsletterEyebrow:"ابقَ على اطلاع",
    newsletterTitle:"تواصل معنا مباشرة",
    newsletterText:"تابع الجديد واسأل عن المنتجات والتفاصيل المتاحة عبر قنوات المتجر الرسمية.",
    promoPill:"خدمة المتجر", promoLead:"تجربة تسوق",
    promoText:"تصفح التشكيلة وتواصل معنا لتأكيد التفاصيل",
    emailOrdersTo:"", emailFromName:p.name || "المتجر", emailFrom:"",
    emailSubjectOrder:"طلب جديد من المتجر #{orderNumber}", emailTemplateOrder:"",
    emailProvider:"mailto", emailFormSubmitAction:"",
    catalogLabel:"المنتجات", quantityUnit:"قطعة", quantityUnitEn:"item",
    storyImage:p.heroImage || "",
    deliveryNote:p.location || "تُؤكد تفاصيل التوصيل مع المتجر",
    paymentNote:p.note || "تُؤكد طريقة الدفع مباشرة مع المتجر",
    statsDeliveryValue:0, statsTrustValue:phones.length || 1,
    theme:{
      bg:theme.bg || "#f5f2ed",
      surface:theme.surface || "#fff",
      surfaceStrong:theme.surface || "#fff",
      ink:theme.ink || "#252a2f",
      muted:theme.muted || "#7e858a",
      line:theme.line || "#e3e1db",
      lineStrong:theme.line || "#d7d5cf",
      accent:theme.accent || "#92795e",
      accentDark:theme.accent || "#755b42",
      accentSoft:theme.hero || "#f0ebe4",
      accentTint:theme.photo || "#eee8df",
      warm:theme.accent || "#92795e",
      highlight:theme.hero || "#e7ded1",
      dark:theme.ink || "#252a2f",
      success:"#50775e"
    },
    texts:{
      "home.steps.s1.title":"تصفح المنتجات",
      "home.steps.s1.text":"شاهد الأقسام والصور والتفاصيل، ثم اختر المنتج الذي يناسب احتياجك.",
      "home.steps.s1.hint":"تصفح مباشر",
      "home.steps.s2.title":"راجع التفاصيل",
      "home.steps.s2.text":"راجع الموديل والكمية والملاحظات، واسأل المتجر عن التوفر قبل تأكيد الطلب.",
      "home.steps.s2.hint":"اختر الكمية المطلوبة",
      "home.steps.s3.title":"أرسل الطلب",
      "home.steps.s3.text":"أكمل بيانات التواصل والعنوان، وسيتواصل معك المتجر لتأكيد التوفر وطريقة الدفع والاستلام.",
      "home.steps.s3.hint":"تأكيد مع المتجر",
      "co.trustCod":"يتم تأكيد طريقة الدفع مع المتجر",
      "pd.perkDelivery":"تأكيد تفاصيل التوصيل مع المتجر",
      "pd.perkOneBox":"راجع خيارات المنتج قبل الطلب",
      "cart.free":"تؤكد مع المتجر",
      "cart.freeUnlocked":"تواصل مع المتجر لتأكيد رسوم التوصيل",
      "foot.pricesNote":"يتم تأكيد الأسعار والتوفر قبل اعتماد الطلب",
      "home.storyText2":"صور واضحة وتفاصيل منظمة وطرق تواصل مباشرة تساعدك على اتخاذ قرارك قبل إرسال الطلب."
    }
  };
  return {...defaultContent,...saved};
};
const jsonData = (data, status=200) => json({data},status);
const adminTokenValid = async (request,env,slug) => {
  const supplied = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i,"");
  if (!supplied) return false;
  const expected = await env.ORDERS.get(slug + ":admin-token");
  return Boolean(expected && supplied === expected);
};
const listKVRecords = async (env,prefix) => {
  const listed = await env.ORDERS.list({prefix,limit:1000});
  const rows = await Promise.all((listed.keys || []).map(async (entry) => {
    const value = await env.ORDERS.get(entry.name);
    if (!value) return null;
    try { return JSON.parse(value); } catch { return null; }
  }));
  return rows.filter(Boolean).sort((a,b) => String(b.created_at || b.createdAt || "").localeCompare(String(a.created_at || a.createdAt || "")));
};
const staticAsset = async (request,env) => {
  if (!env.ASSETS) return text("Store assets are not configured",503);
  return env.ASSETS.fetch(request);
};
export default { async fetch(request,env) {
  const url = new URL(request.url);
  const slug = url.hostname.split(".")[0];
  if (!SLUGS.has(slug)) return text("Unknown storefront",404);
  const path = url.pathname;
  if (path === "/api/health") return json({ok:true,store:slug},200);
  if (!path.startsWith("/api/")) return staticAsset(request,env);
  const profile = await profileFor(slug);
  if (!profile) return text("Store profile is temporarily unavailable",503);
  const savedContent = await readKV(env,slug,"content",{});
  const savedSettings = await readKV(env,slug,"settings",{});
  if (path === "/store.json" && request.method === "GET") return json(profile,200,"public,max-age=120");
  if (path === "/api/content" && request.method === "GET") return jsonData(contentFor(profile,savedContent),200);
  if (path === "/api/settings" && request.method === "GET") return jsonData({colorsEnabled:false,freeDeliveryFrom:0,deliveryFee:0,...savedSettings},200);
  if (path === "/api/products" && request.method === "GET") {
    const saved = await readKV(env,slug,"products",{overrides:[],removed:[]});
    const overrides = Array.isArray(saved) ? saved : (Array.isArray(saved.overrides) ? saved.overrides : []);
    const removed = new Set(Array.isArray(saved.removed) ? saved.removed : []);
    return jsonData(productRows(profile,overrides).filter((item) => !removed.has(item.slug)),200);
  }
  if (path === "/api/categories" && request.method === "GET") return jsonData(categoryRows(profile),200);
  if (path === "/api/routes" && request.method === "GET") return jsonData(routeRows(),200);
  if (path === "/api/contact" && request.method === "POST") {
    try {
      const body = await request.json();
      const name = String(body.name || "").trim().slice(0,80);
      const phone = String(body.phone || "").trim().slice(0,24);
      const message = String(body.message || "").trim().slice(0,1200);
      if (!name || !phone || message.length < 5) return json({error:"بيانات التواصل غير مكتملة"},400);
      const id = "MSG-" + crypto.randomUUID().slice(0,10).toUpperCase();
      const row = {id,name,phone,message,created_at:new Date().toISOString(),store:slug};
      await writeKV(env,slug,"contact:"+id,row);
      return json({data:{id}},201);
    } catch { return json({error:"تعذر تسجيل الرسالة"},400); }
  }
  if (path === "/api/orders" && request.method === "POST") {
    try {
      const raw = await request.text();
      if (raw.length > 25000) return json({error:"بيانات الطلب كبيرة جداً"},413);
      const body = JSON.parse(raw);
      const customer = body.customer && typeof body.customer === "object" ? body.customer : {};
      const name = String(body.customerName || customer.name || body.name || "").trim().slice(0,80);
      const phone = String(body.phone || customer.phone || "").trim().slice(0,24);
      const area = String(body.governorate || customer.governorate || body.area || "").trim().slice(0,100);
      const items = Array.isArray(body.items) ? body.items.slice(0,40).map((item) => ({
        id:String(item.productId || item.id || item.productSlug || "").slice(0,100),
        name:String(item.productName || item.name || "").slice(0,140),
        qty:Math.max(1,Math.min(50,Number(item.quantity || item.qty) || 1)),
        color:String(item.colorName || item.color || ""),
        price:Number(item.unitPrice || 0) || 0,
        total:Number(item.totalPrice || 0) || 0
      })).filter((item) => item.id && item.name) : [];
      if (!name || !phone || !area || !items.length) return json({error:"أكمل بيانات الطلب"},400);
      const orderNumber = slug.toUpperCase() + "-" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random()*90+10);
      const record = {
        id:orderNumber, order_number:orderNumber, orderNumber,
        store:slug, status:"جديد", created_at:new Date().toISOString(), createdAt:new Date().toISOString(),
        customer:{name,phone,email:String(body.email || customer.email || ""),governorate:area,district:String(body.district || ""),address:String(body.address || ""),landmark:String(body.landmark || "")},
        customerName:name, phone, governorate:area, district:String(body.district || ""),
        address:String(body.address || ""), landmark:String(body.landmark || ""), notes:String(body.notes || ""),
        items, totals:{subtotal:Number(body.subtotal || 0),deliveryFee:Number(body.deliveryFee || 0),total:Number(body.total || 0)},
        subtotal:Number(body.subtotal || 0),deliveryFee:Number(body.deliveryFee || 0),total:Number(body.total || 0)
      };
      await writeKV(env,slug,"order:"+orderNumber,record);
      return json({data:{orderNumber}},201);
    } catch { return json({error:"تعذر تسجيل الطلب"},400); }
  }
  const mediaMatch = path.match(/^\/api\/media\/([a-f0-9-]+)$/i);
  if (mediaMatch && request.method === "GET") {
    const stored = await env.ORDERS.get(slug + ":asset:" + mediaMatch[1]);
    if (!stored || !stored.startsWith("data:image/")) return json({error:"الصورة غير موجودة"},404);
    const comma = stored.indexOf(",");
    if (comma < 0) return json({error:"الصورة غير صالحة"},400);
    const header = stored.slice(0,comma);
    const payload = stored.slice(comma + 1);
    const mimeType = header.slice(5).split(";")[0] || "image/jpeg";
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let index=0; index<binary.length; index++) bytes[index] = binary.charCodeAt(index);
    return new Response(bytes,{headers:{"content-type":mimeType,"cache-control":"public,max-age=31536000,immutable","x-content-type-options":"nosniff"}});
  }
  const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
  if (orderMatch && request.method === "GET") {
    const number = decodeURIComponent(orderMatch[1]);
    const record = await readKV(env,slug,"order:"+number,null);
    if (!record) return json({error:"الطلب غير موجود"},404);
    return jsonData({order_number:record.order_number,status:record.status,created_at:record.created_at,customerName:record.customerName},200);
  }
  if (path === "/api/admin/login" && request.method === "POST") {
    try {
      const body = await request.json();
      const expected = await env.ORDERS.get(slug + ":admin-pin") || "2468";
      if (String(body.pin || "") !== expected) return json({error:"رمز الإدارة غير صحيح"},401);
      let token = await env.ORDERS.get(slug + ":admin-token");
      if (!token) {
        token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g,"");
        await env.ORDERS.put(slug + ":admin-token",token);
      }
      return json({data:{token}},200);
    } catch { return json({error:"تعذر تسجيل الدخول"},400); }
  }
  if (path.startsWith("/api/admin/")) {
    if (!(await adminTokenValid(request,env,slug))) return json({error:"يلزم تسجيل الدخول إلى لوحة الإدارة"},401);
    if (path === "/api/admin/whoami" && request.method === "GET") return jsonData({authenticated:true,username:"store-admin"},200);
    if (path === "/api/admin/orders" && request.method === "GET") return jsonData(await listKVRecords(env,slug + ":order:"),200);
    if (path === "/api/admin/contacts" && request.method === "GET") return jsonData(await listKVRecords(env,slug + ":contact:"),200);
    if (path === "/api/admin/content" && request.method === "PUT") {
      const value = await request.json();
      await writeKV(env,slug,"content",value);
      return json({data:value},200);
    }
    if (path === "/api/admin/upload" && request.method === "POST") {
      const body = await request.json();
      const dataUrl = String(body.dataUrl || "");
      if (!dataUrl.startsWith("data:image/") || dataUrl.length > 6000000) return json({error:"الصورة غير صالحة أو حجمها كبير"},400);
      const assetId = crypto.randomUUID();
      await env.ORDERS.put(slug + ":asset:" + assetId,dataUrl);
      return json({data:{url:"/api/media/" + assetId}},201);
    }
    if (path === "/api/admin/pin" && request.method === "POST") {
      const body = await request.json();
      const pin = String(body.pin || "").trim();
      if (!/^\d{4,12}$/.test(pin)) return json({error:"رمز الإدارة يجب أن يكون من 4 إلى 12 رقماً"},400);
      await env.ORDERS.put(slug + ":admin-pin",pin);
      return json({data:{saved:true}},200);
    }
    if (path === "/api/admin/products" && request.method === "POST") {
      const product = await request.json();
      const productSlug = String(product.slug || product.id || "").trim();
      if (!productSlug) return json({error:"المنتج يحتاج إلى معرف"},400);
      const saved = await readKV(env,slug,"products",{overrides:[],removed:[]});
      const state = Array.isArray(saved) ? {overrides:saved,removed:[]} : saved;
      const overrides = Array.isArray(state.overrides) ? state.overrides : [];
      const removed = Array.isArray(state.removed) ? state.removed.filter((item) => item !== productSlug) : [];
      const next = [product,...overrides.filter((item) => String(item.slug || item.id) !== productSlug)];
      await writeKV(env,slug,"products",{overrides:next,removed});
      return json({data:product},201);
    }
    if (path === "/api/admin/restore" && request.method === "POST") {
      const body = await request.json();
      const slugs = Array.isArray(body.slugs) ? body.slugs.map(String) : [];
      const saved = await readKV(env,slug,"products",{overrides:[],removed:[]});
      const state = Array.isArray(saved) ? {overrides:saved,removed:[]} : saved;
      const removed = (Array.isArray(state.removed) ? state.removed : []).filter((item) => !slugs.includes(item));
      await writeKV(env,slug,"products",{overrides:Array.isArray(state.overrides)?state.overrides:[],removed});
      return json({data:{restored:slugs.length}},200);
    }
    if (path === "/api/admin/settings" && request.method === "PUT") {
      const value = await request.json();
      await writeKV(env,slug,"settings",value);
      return json({data:value},200);
    }
    const productAdmin = path.match(/^\/api\/admin\/products\/([^/]+)$/);
    if (productAdmin && request.method === "DELETE") {
      const productSlug = decodeURIComponent(productAdmin[1]);
      const saved = await readKV(env,slug,"products",{overrides:[],removed:[]});
      const state = Array.isArray(saved) ? {overrides:saved,removed:[]} : saved;
      const overrides = (Array.isArray(state.overrides) ? state.overrides : []).filter((item) => String(item.slug || item.id) !== productSlug);
      const removed = [...new Set([...(Array.isArray(state.removed)?state.removed:[]),productSlug])];
      await writeKV(env,slug,"products",{overrides,removed});
      return json({data:{deleted:true}},200);
    }
    const orderAdmin = path.match(/^\/api\/admin\/orders\/([^/]+)$/);
    if (orderAdmin) {
      const number = decodeURIComponent(orderAdmin[1]);
      const record = await readKV(env,slug,"order:"+number,null);
      if (!record) return json({error:"الطلب غير موجود"},404);
      if (request.method === "PATCH") {
        const body = await request.json();
        record.status = String(body.status || record.status).slice(0,60);
        await writeKV(env,slug,"order:"+number,record);
        return json({data:record},200);
      }
      if (request.method === "DELETE") {
        await env.ORDERS.delete(slug + ":order:" + number);
        return json({data:{deleted:true}},200);
      }
    }
    const contactDelete = path.match(/^\/api\/admin\/contacts\/(.+)$/);
    if (contactDelete && request.method === "DELETE") {
      await env.ORDERS.delete(slug + ":contact:" + decodeURIComponent(contactDelete[1]));
      return json({data:{deleted:true}},200);
    }
    return json({error:"المسار غير مدعوم"},404);
  }
  if (request.method !== "GET" && request.method !== "HEAD") return text("Method not allowed",405);
  return staticAsset(request,slug,path);
} };
