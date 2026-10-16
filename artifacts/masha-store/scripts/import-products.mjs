#!/usr/bin/env node
// Validate and normalize a product JSON file locally. This is not an Instagram scraper.
import fs from 'node:fs'
import path from 'node:path'
const input=process.argv[2]
if(!input){console.error('Usage: node scripts/import-products.mjs <products.json>');process.exit(2)}
let rows
try{rows=JSON.parse(fs.readFileSync(path.resolve(process.cwd(),input),'utf8'))}catch(e){console.error('Invalid JSON:',e instanceof Error?e.message:String(e));process.exit(2)}
if(!Array.isArray(rows)){console.error('Expected an array of products');process.exit(2)}
const categories=new Set(['بناتي','ولادي','مواليد','أطقم']),seen=new Set()
const slug=s=>String(s||'').trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g,'-').replace(/^-|-$/g,'')
const ig=value=>{if(!value)return '';let u;try{u=new URL(value)}catch{throw Error('Invalid Instagram URL: '+value)}if(!/(^|\.)instagram\.com$/i.test(u.hostname))throw Error('Only instagram.com links accepted: '+value);if(!/^\/(reel|reels|p|tv)\/[A-Za-z0-9_-]+\/?/.test(u.pathname))throw Error('Expected a public Reel/Post URL: '+value);return 'https://www.instagram.com'+u.pathname.replace(/\/?$/,'/')}
const clean=rows.map((r,i)=>{if(!r||typeof r!=='object')throw Error('Row '+(i+1)+' must be an object');const name=String(r.name||'').trim();if(!name)throw Error('Row '+(i+1)+': name required');const id=String(r.id||slug(name)||('product-'+(i+1)));if(seen.has(id))throw Error('Duplicate id: '+id);seen.add(id);const price=Number(r.price);if(!Number.isSafeInteger(price)||price<0)throw Error(name+': price must be integer IQD');if(!categories.has(String(r.category||'')))throw Error(name+': invalid category');const sizes=Array.isArray(r.sizes)?r.sizes.map(String).filter(Boolean):[];if(!sizes.length)throw Error(name+': sizes required');return {id,name,category:r.category,price,oldPrice:r.oldPrice==null?undefined:Number(r.oldPrice),image:String(r.image||''),badge:String(r.badge||''),age:String(r.age||''),sizes,colors:Array.isArray(r.colors)?r.colors.map(String):[],description:String(r.description||''),instagramVideoUrl:ig(r.instagramVideoUrl||'')}})
const output=path.resolve(process.cwd(),'data/masha-products.validated.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(clean,null,2)+'\n','utf8');console.log('Validated '+clean.length+' products → '+path.relative(process.cwd(),output))
