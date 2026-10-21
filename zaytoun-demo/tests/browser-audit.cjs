const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const baseUrl = 'http://127.0.0.1:4173/';
const artifactDir = process.env.AUDIT_ARTIFACTS || path.join(os.tmpdir(), 'zaytoun-ui-audit');
fs.mkdirSync(artifactDir, { recursive: true });
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, baseUrl).pathname); } catch (_) { res.writeHead(400); return res.end('Bad request'); }
  const requested = path.resolve(root, pathname === '/' ? 'index.html' : '.' + pathname);
  if (!requested.startsWith(root + path.sep) && requested !== path.join(root, 'index.html')) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(requested, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': mime[path.extname(requested)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(4173, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  page.setDefaultTimeout(12000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => { window.__openedUrls=[]; window.open=(url)=>{ window.__openedUrls.push(String(url)); return { closed:false, close(){} }; }; });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  assert.equal(await page.title(), 'زيتون كروب | متجر الأداء الرياضي');
  console.log('PASS initial render and product catalogue');
  assert.equal(await page.locator('#productGrid .product').count(), 5);

  const viewports = [
    {name:'phone-360', width:360, height:800},
    {name:'phone-390', width:390, height:844},
    {name:'ipad-portrait-768', width:768, height:1024},
    {name:'tablet-landscape-1024', width:1024, height:768},
    {name:'laptop-1366', width:1366, height:900},
    {name:'desktop-1600', width:1600, height:1000}
  ];
  for (const v of viewports) {
    await page.setViewportSize({width:v.width,height:v.height});
    await page.waitForTimeout(80);
    const dims = await page.evaluate(() => ({
      viewport: innerWidth,
      doc: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      productGrid: Math.round(document.querySelector('#productGrid').getBoundingClientRect().width)
    }));
    assert.ok(Math.max(dims.doc,dims.body) <= dims.viewport + 1, v.name+' horizontal overflow '+JSON.stringify(dims));
    assert.ok(dims.productGrid <= dims.viewport, v.name+' grid overflow');
    if (v.name==='phone-390') await page.screenshot({path:path.join(artifactDir,'phone-light.png'),fullPage:true});
    if (v.name==='ipad-portrait-768') await page.screenshot({path:path.join(artifactDir,'ipad-portrait-light.png'),fullPage:true});
    if (v.name==='laptop-1366') await page.screenshot({path:path.join(artifactDir,'laptop-light.png'),fullPage:true});
  }

  await page.setViewportSize({width:390,height:844});
  await page.locator('#menuBtn').click();
  assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'true');
  assert.ok(await page.locator('#mainNav').evaluate(n=>n.classList.contains('open')));
  await page.locator('#mainNav a[href="#products"]').click();
  assert.equal(await page.locator('#menuBtn').getAttribute('aria-expanded'),'false');

  await page.evaluate(() => document.querySelectorAll('img').forEach(img => { if (img.getAttribute('src')) img.loading='eager'; }));
  await page.waitForFunction(() => Array.from(document.images).filter(img=>img.getAttribute('src')).every(img=>img.complete || img.dataset.imageFallback==='true'),null,{timeout:20000});
  await page.waitForTimeout(300);
  const imageReport = await page.evaluate(() => Array.from(document.images).filter(img=>img.getAttribute('src')).map(img=>({alt:img.alt,src:img.currentSrc,width:img.naturalWidth,height:img.naturalHeight,fallback:img.dataset.imageFallback==='true'})));
  assert.ok(imageReport.length>=7,'expected hero, story, and five product images');
  const broken = imageReport.filter(img=>!img.width||img.fallback);
  assert.equal(broken.length,0,'bad image(s): '+JSON.stringify(broken));
  console.log('PASS image loading ('+imageReport.length+' images)');

  await page.locator('#themeToggle').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  console.log('PASS mobile menu and responsive layout');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme),'dark');
  await page.screenshot({path:path.join(artifactDir,'phone-dark.png'),fullPage:true});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
  await page.locator('#themeToggle').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');

  console.log('PASS light/dark theme persistence');
  await page.locator('#filters [data-filter="gainer"]').click();
  assert.equal(await page.locator('#productGrid .product').count(),2);
  await page.locator('#filters [data-filter="all"]').click();
  await page.locator('#productSearch').fill('creatine');
  assert.equal(await page.locator('#productGrid .product').count(),1);
  await page.locator('#productSearch').fill('');
  assert.equal(await page.locator('#productGrid .product').count(),5);

  console.log('PASS product filtering and search');
  await page.locator('#productGrid [data-product="mass-pro"].product-photo').click();
  assert.ok(await page.locator('#productModal').evaluate(n=>n.classList.contains('open')));
  assert.equal(await page.locator('#productModal').getAttribute('aria-hidden'),'false');
  await page.locator('#modalImage').click();
  assert.ok(await page.locator('#imageZoom').evaluate(n=>n.classList.contains('open')),'image zoom should open');
  assert.equal(await page.locator('#imageZoom').getAttribute('aria-hidden'),'false');
  await page.locator('#closeImageZoom').click();
  assert.equal(await page.locator('#imageZoom').getAttribute('aria-hidden'),'true','image zoom should close');
  await page.locator('#qtyChoices [data-qty="2"]').click();
  await page.locator('#modalAdd').click();
  assert.equal(await page.locator('#cartCount').innerText(),'2');
  assert.ok(await page.locator('#cartDrawer').evaluate(n=>n.classList.contains('open')));
  await page.locator('#checkoutBtn').click();
  assert.ok(await page.locator('#checkoutModal').evaluate(n=>n.classList.contains('open')));
  await page.locator('#customerName').fill('اختبار واجهة');
  await page.locator('#customerPhone').fill('07800000000');
  await page.locator('#customerArea').selectOption({label:'ديالى — بعقوبة'});
  await page.locator('#checkoutForm button[type="submit"]').click();
  const openedUrl=await page.evaluate(()=>window.__openedUrls[window.__openedUrls.length-1]);
  assert.ok(openedUrl&&openedUrl.includes('wa.me/9647723098099'),'wrong branch routing: '+openedUrl);
  assert.ok(decodeURIComponent(openedUrl).includes('كومبلكس ماس برو'),'WhatsApp message is missing selected product');
  console.log('PASS product modal, image zoom, quantity, cart and WhatsApp routing');

  assert.deepEqual(errors,[],'browser JS errors: '+errors.join(' | '));
  console.log('PASS responsive widths: '+viewports.map(v=>v.width).join(', ')+'px');
  console.log('PASS day-first default, dark toggle, and theme persistence');
  console.log('PASS images: '+imageReport.length+' loaded with no fallback');
  console.log('PASS nav, filter, search, product modal, quantity, cart, and WhatsApp routing');
  console.log('SCREENSHOTS '+artifactDir);
  console.log('IMAGE_REPORT '+JSON.stringify(imageReport));
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
})().catch(error=>{console.error(error.stack||error);server.close();process.exitCode=1;});