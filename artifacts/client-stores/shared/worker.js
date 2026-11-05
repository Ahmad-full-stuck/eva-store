const SLUGS = new Set(["laya","njom","lna","scoop","mukhtar"]);
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
const PROFILES = {"laya":{"key":"laya","name":"BRAND_LAYA","monogram":"L","tagline":"عالم من الأناقة النسائية","eyebrow":"LAYA · WOMEN'S ACCESSORIES","heroTitle":"تفاصيل صغيرة تصنع حضوراً مختلفاً","heroText":"حقائب وأحذية نسائية بتصاميم تجمع الأناقة والعملية. اكتشفي التشكيلة وتواصلي معنا لتأكيد اللون والتوفر.","storyTitle":"أناقتك تبدأ من اختيارك","storyText":"LAYA مساحة للأناقة النسائية، تجمع الحقائب والأحذية في تجربة تسوق واضحة وسهلة. اختاري القطعة التي تناسب يومك، واستفسري عن التفاصيل قبل إتمام الطلب.","description":"حقائب وأحذية نسائية، مع دفع إلكتروني وتوصيل إلى جميع محافظات العراق.","note":"الدفع الإلكتروني متاح · التوصيل لجميع المحافظات","location":"التوصيل إلى جميع محافظات العراق","contactLabel":"واتساب LAYA","contactUrl":"https://wa.me/qr/ILWLP3ELRWYBM1","instagram":"https://www.instagram.com/b.r_laya/","contactMode":"copy","phones":[],"heroImage":"https://p16-seeyou-useast5.capcutcdn-us.com/tos-useast5-i-2zwwjm3azk-tx/0d6dbc27d94b4956a4967eff67a2ad7d~tplv-2zwwjm3azk-image.image","heroPosition":"center","theme":{"bg":"#f5f0e9","ink":"#302a26","surface":"#fffdf9","muted":"#877c73","accent":"#a77a5b","line":"#e7ddd1","hero":"#e9dfd4","photo":"#eee5db"},"categories":["الكل","حقائب","أحذية"],"products":[{"id":"laya-b1","name":"حقيبة يد كلاسيكية","category":"حقائب","description":"تصميم أنيق بحجم عملي ولمسات معدنية هادئة. اسألي عن الألوان والتوفر.","image":"https://p16-seeyou-useast5.capcutcdn-us.com/tos-useast5-i-2zwwjm3azk-tx/0d6dbc27d94b4956a4967eff67a2ad7d~tplv-2zwwjm3azk-image.image"},{"id":"laya-b2","name":"حقيبة يومية بلون هادئ","category":"حقائب","description":"حقيبة للاستخدام اليومي بمظهر بسيط يسهل تنسيقه مع إطلالات متعددة.","image":"https://lookzlike.com/cdn/shop/collections/womens-shoes-accessories-9114397.png?v=1752972930"},{"id":"laya-s1","name":"أحذية نسائية أنيقة","category":"أحذية","description":"نموذج عرض أولي لفئة الأحذية النسائية. المقاسات والألوان تؤكد عند التواصل.","image":"https://www.daily-goods.com/cdn/shop/articles/women-s-fashion-essentials-2025-handbags-footwear-accessories-daily-goods-create-image-for-this-blogs_c20672b8-026a-4ce5-9435-2e99f74a48a7.png?v=1770222174"},{"id":"laya-s2","name":"سنيكر نسائي يومي","category":"أحذية","description":"خيار يومي بطابع عملي. تواصلي معنا لمعرفة الموديلات والمقاسات المتاحة.","image":"https://www.claridgess.com/assets/uploads/product-featured-112.jpeg"}],"heroFit":"contain","productFit":"contain"},"njom":{"key":"njom","name":"مكتب النجوم للهواتف النقالة","monogram":"N","tagline":"هواتف · إكسسوارات · صيانة","eyebrow":"AL NJOOM · MOBILE CENTER","heroTitle":"كل ما يخص هاتفك، في مكان واحد","heroText":"بيع وشراء الهواتف النقالة، إكسسوارات، صيانة وبرمجة، وخدمة زين كاش. تواصل مع مكتب النجوم للاستفسار عن الموديل والتوفر.","storyTitle":"خبرة في الهاتف وما حوله","storyText":"مكتب النجوم للهواتف النقالة في البصرة، يجمع خدمات بيع وشراء الهواتف مع الإكسسوارات والصيانة والبرمجة. اسألنا عن الجهاز أو الخدمة التي تحتاجها.","description":"مكتب النجوم للهواتف النقالة في البصرة — بيع وشراء الهواتف والإكسسوارات والصيانة والبرمجة.","note":"بيع وشراء الهواتف · إكسسوارات · صيانة وبرمجة · زين كاش","location":"البصرة · الجزائر · قرب جامع الموسوي","contactLabel":"تواصل مع النجوم","contactUrl":"https://www.instagram.com/alnjom_center/","instagram":"https://www.instagram.com/alnjom_center/","facebook":"https://www.facebook.com/alnjoom8?mibextid=LQQJ4d","contactMode":"copy","phones":[{"label":"الاتصال بالمكتب","number":"+9647801234544"}],"heroImage":"https://shop-image.samsung.com.cn/goods/2023/02/13/63ea3f51e4b08db2edda4432.png","theme":{"bg":"#071827","ink":"#f4f8fc","surface":"#102337","muted":"#9db2c5","accent":"#61c3e5","line":"#294158","hero":"#0d263d","photo":"#e9eef3"},"categories":["الكل","هواتف","إكسسوارات","صيانة"],"products":[{"id":"njom-p1","name":"هواتف iPhone","category":"هواتف","description":"استفسر عن موديلات iPhone وسعات التخزين والألوان المتاحة قبل الشراء.","image":"https://buy.gazelle.com/cdn/shop/files/iPhone_11_Pro_-_Space_Gray_-_Angle-cropped_d738113c-3cd5-4b3a-85c1-c1352b651e4f.jpg?v=1757019462&width=1946"},{"id":"njom-p2","name":"هواتف Samsung","category":"هواتف","description":"مجموعة هواتف سامسونج. الموديل والسعة والسعر حسب المتوفر لدى المكتب.","image":"https://shop-image.samsung.com.cn/goods/2023/02/13/63ea3f51e4b08db2edda4432.png"},{"id":"njom-a1","name":"سماعات لاسلكية","category":"إكسسوارات","description":"اسأل عن السماعات المتوفرة والتوافق مع هاتفك.","image":"https://p.globalsources.com/IMAGES/PDT/B5987807955/TWS-Earbuds-Dual-Mic-TWS-earphones-ENC-TWS-Earbuds.jpg"},{"id":"njom-a2","name":"إكسسوارات وشواحن","category":"إكسسوارات","description":"إكسسوارات الهاتف وملحقات الشحن. النوع والتوافق يُؤكدان عند التواصل.","image":"https://www.flamingo.com.co/cdn/shop/files/6_142ce499-b7be-4e2c-9e92-83d4a89af1b1.png?v=1761857208&width=1000"},{"id":"njom-s1","name":"الصيانة والبرمجة","category":"صيانة","description":"استفسر عن خدمة الصيانة أو البرمجة المطلوبة قبل زيارة المكتب.","image":"https://static.wixstatic.com/media/23c426_b39414fc0133439c9edcdb722bd44180~mv2.jpg/v1/fill/w_948%2Ch_632%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/23c426_b39414fc0133439c9edcdb722bd44180~mv2.jpg"}],"heroFit":"contain","productFit":"contain"},"lna":{"key":"lna","name":"شركة لنا","monogram":"ل","tagline":"موبايلات · جملة ومفرد · أقساط","eyebrow":"LNA COMPANY · MOBILE CENTER","heroTitle":"خيارات أكثر، وخدمة أقرب","heroText":"موبايلات جملة ومفرد، أقساط مريحة، إكسسوارات وصيانة. تواصل مع قسم المبيعات أو الإكسسوارات مباشرة.","storyTitle":"شركة لنا — كل احتياجات الهاتف","storyText":"من شراء الموبايل إلى الإكسسوارات والصيانة، يجمع سنتر لنا احتياجاتك في مكان واحد. تتوفر خيارات الجملة والمفرد والأقساط، مع ضمان معتمد لمدة سنة وفق معلومات المتجر.","description":"شركة لنا — موبايلات جملة ومفرد، أقساط مريحة، إكسسوارات وصيانة في بغداد.","note":"جملة ومفرد · أقساط مريحة · ضمان معتمد لمدة سنة","location":"قرب جامع تكريتي · مجمع العذراء","contactLabel":"تواصل مع سنتر لنا","contactUrl":"https://www.instagram.com/lna_company/","instagram":"https://www.instagram.com/lna_company/","contactMode":"copy","phones":[{"label":"قسم المبيعات","number":"07703333130"},{"label":"قسم الإكسسوارات","number":"07703333430"}],"heroImage":"https://buy.gazelle.com/cdn/shop/files/iPhone_11_Pro_-_Space_Gray_-_Angle-cropped_d738113c-3cd5-4b3a-85c1-c1352b651e4f.jpg?v=1757019462&width=1946","theme":{"bg":"#f2f6fa","ink":"#10233b","surface":"#ffffff","muted":"#65788c","accent":"#17669b","line":"#d9e4ec","hero":"#e7f0f7","photo":"#e9f0f6"},"categories":["الكل","موبايلات","إكسسوارات","صيانة"],"products":[{"id":"lna-p1","name":"هواتف iPhone","category":"موبايلات","description":"استفسر عن موديلات iPhone والتخزين والأقساط المتاحة.","image":"https://buy.gazelle.com/cdn/shop/files/iPhone_11_Pro_-_Space_Gray_-_Angle-cropped_d738113c-3cd5-4b3a-85c1-c1352b651e4f.jpg?v=1757019462&width=1946"},{"id":"lna-p2","name":"هواتف Android","category":"موبايلات","description":"خيارات متنوعة من أجهزة Android. الموديلات والتوفر حسب المخزون.","image":"https://shop-image.samsung.com.cn/goods/2023/02/13/63ea3f51e4b08db2edda4432.png"},{"id":"lna-a1","name":"إكسسوارات الهاتف","category":"إكسسوارات","description":"إكسسوارات وملحقات للاستخدام اليومي. اسأل قسم الإكسسوارات عن التوافق.","image":"https://www.flamingo.com.co/cdn/shop/files/6_142ce499-b7be-4e2c-9e92-83d4a89af1b1.png?v=1761857208&width=1000"},{"id":"lna-a2","name":"سماعات لاسلكية","category":"إكسسوارات","description":"مجموعة عرض للسماعات اللاسلكية. الأنواع المتاحة تؤكد من المتجر.","image":"https://p.globalsources.com/IMAGES/PDT/B5987807955/TWS-Earbuds-Dual-Mic-TWS-earphones-ENC-TWS-Earbuds.jpg"},{"id":"lna-s1","name":"الصيانة وخدمات الهاتف","category":"صيانة","description":"تواصل مع فريق لنا لمعرفة خدمات الصيانة المتاحة.","image":"https://static.wixstatic.com/media/23c426_b39414fc0133439c9edcdb722bd44180~mv2.jpg/v1/fill/w_948%2Ch_632%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/23c426_b39414fc0133439c9edcdb722bd44180~mv2.jpg"}],"heroFit":"contain","productFit":"contain"},"scoop":{"key":"scoop","name":"سكوبر | SCOOPER","monogram":"S","tagline":"متجر ألبسة رجالي","eyebrow":"SCOOPER · MEN'S WEAR","heroTitle":"أسلوب واضح. حضور يترك أثره.","heroText":"ألبسة رجالية بإطلالات يومية وعملية. تصفح النماذج الأولية واسألنا عن الموديلات والمقاسات المتوفرة.","storyTitle":"SCOOPER — الألبسة الرجالية","storyText":"سكوبر متجر ألبسة رجالي في الغزالية. نعرض هنا نماذج أولية لتسهيل تصفح الأقسام، ويُؤكد اللون والمقاس والتوفر عبر فريق المتجر.","description":"سكوبر SCOOPER — متجر ألبسة رجالي في الغزالية، بغداد.","note":"أوقات العمل يومياً من 10 صباحاً إلى 11 مساءً","location":"بغداد · الغزالية · وسط شارع البدالة","hours":"10:00 صباحاً – 11:00 مساءً","contactLabel":"راسل سكوبر","contactUrl":"https://www.instagram.com/scooper2w/","instagram":"https://www.instagram.com/scooper2w/","contactMode":"copy","phones":[{"label":"اتصال 1","number":"07840303300"},{"label":"اتصال 2","number":"07722270709"}],"heroImage":"https://www.petermillar.com/dw/image/v2/BHFJ_PRD/on/demandware.static/-/Sites-PM-Library/default/dw47db8b8c/nav/2025/02-feb/new-right-2-3.jpg","theme":{"bg":"#111416","ink":"#f6f5f1","surface":"#1c2224","muted":"#a8adae","accent":"#b6ae91","line":"#394144","hero":"#202628","photo":"#e9e8e2"},"categories":["الكل","قمصان","تيشيرتات","إطلالات"],"products":[{"id":"scoop-c1","name":"قميص رجالي كلاسيكي","category":"قمصان","description":"نموذج عرض لقميص رجالي بقصة مرتبة. اسأل عن الألوان والمقاسات المتوفرة.","image":"https://karaku.co.kr/cdn/shop/files/KRK-GPD-GS1344-05.jpg?v=1761717533&width=1200"},{"id":"scoop-p1","name":"تيشيرت بولو","category":"تيشيرتات","description":"قطعة أساسية للإطلالة اليومية. الموديل والخامة والمقاس تؤكد عند التواصل.","image":"https://www.niamsports.com/cdn/shop/files/NM12043_Bobby_Light_Blue_Flat.png?v=1773855887&width=1500"},{"id":"scoop-l1","name":"إطلالة كاجوال","category":"إطلالات","description":"تنسيق رجالي يومي كنموذج للعرض. اسأل عن القطع المتوفرة بشكل منفصل.","image":"https://witcdn.sarar.com/polo-yaka-kisa-kol-pamuklu-taba-triko-20087-polo-yaka-tisort-sarar-56589-20-O.jpg"},{"id":"scoop-l2","name":"إطلالة رجالية داكنة","category":"إطلالات","description":"نموذج تنسيق يجمع القطع الداكنة. تفاصيل المنتجات الفعلية عند الاستفسار.","image":"https://cdn.hemden.de/media/image/c8/56/4c/2210-609_b2c_4_1600.jpg"}],"heroFit":"cover","productFit":"contain"},"mukhtar":{"key":"mukhtar","name":"MUKHTAR | مُختار","monogram":"M","tagline":"الرواية بدأت للتو","eyebrow":"MUKHTAR · THE STORY CONTINUES","heroTitle":"الروايةُ بدأت للتّو","heroText":"إطلالات رجالية مختارة بتفاصيل هادئة وحضور معاصر. استكشف النماذج واسأل عن الموديلات والمقاسات المتاحة.","storyTitle":"MUKHTAR — الرواية بدأت للتو","storyText":"مُختار علامة للألبسة الرجالية. صُممت هذه الواجهة لتكون نقطة وصول واضحة للمتجر، مع عرض أولي للأقسام ووسائل التواصل والفرع.","description":"MUKHTAR مُختار — ألبسة رجالية، الفرع الأول في بغداد الحرية، ڤينيسيا مول.","note":"الفرع الأول · بغداد الحرية – ڤينيسيا مول","location":"بغداد · الحرية · ڤينيسيا مول","contactLabel":"تواصل مع مُختار","contactUrl":"https://www.instagram.com/6f_v/","instagram":"https://www.instagram.com/6f_v/","contactMode":"copy","phones":[{"label":"استفسار","number":"07827266656"}],"heroImage":"https://media.falabella.com/falabellaCO/883446850_1/w%3D1500%2Ch%3D1500%2Cfit%3Dcover","theme":{"bg":"#f0ede6","ink":"#252a27","surface":"#fbf9f4","muted":"#777c75","accent":"#8b765d","line":"#ded8cc","hero":"#e4e0d6","photo":"#e8e5dd"},"categories":["الكل","قمصان","بولو","إطلالات"],"products":[{"id":"muk-c1","name":"قميص رجالي بتفصيل هادئ","category":"قمصان","description":"نموذج أولي لقميص رجالي بتصميم مرتب. التوفر والمقاسات تؤكد من الفرع.","image":"https://cdn.hemden.de/media/image/c8/56/4c/2210-609_b2c_4_1600.jpg"},{"id":"muk-p1","name":"بولو رجالي","category":"بولو","description":"قطعة بولو ضمن نماذج العرض. اسأل عن الألوان والمقاسات المتوفرة.","image":"https://www.niamsports.com/cdn/shop/files/NM12043_Bobby_Light_Blue_Flat.png?v=1773855887&width=1500"},{"id":"muk-l1","name":"إطلالة عصرية","category":"إطلالات","description":"تنسيق رجالي معاصر كنموذج للعرض. تفاصيل القطع المتوفرة لدى المتجر.","image":"https://witcdn.sarar.com/polo-yaka-kisa-kol-pamuklu-taba-triko-20087-polo-yaka-tisort-sarar-56589-20-O.jpg"},{"id":"muk-l2","name":"إطلالة يومية راقية","category":"إطلالات","description":"اقتراح تنسيق يومي. الموديلات والألوان والأسعار تؤكد عند الاستفسار.","image":"https://karaku.co.kr/cdn/shop/files/KRK-GPD-GS1344-05.jpg?v=1761717533&width=1200"}],"heroFit":"cover","productFit":"contain"}};
const profileFor = (slug) => PROFILES[slug] || null;
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
