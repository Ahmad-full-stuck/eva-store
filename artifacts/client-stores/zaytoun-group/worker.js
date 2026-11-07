let zaytounSeeded=false;
const SLUGS = new Set(["laya","njom","lna","scoop","mukhtar","zaytoun-group"]);
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
const PROFILES = {"laya":{"key":"laya","name":"BRAND_LAYA","monogram":"L","tagline":"عالم من الأناقة النسائية","eyebrow":"LAYA · WOMEN'S COLLECTION","heroTitle":"أناقة تكتمل من أول تفصيلة","heroText":"اكتشفي الحقائب والأحذية النسائية ضمن تجربة بصرية مرتبة، بتفاصيل تساعدك على اختيار القطعة التي تشبه أسلوبك.","storyTitle":"تفاصيل تختارينها لتشبهك","storyText":"مجموعة افتراضية من الحقائب والأحذية لتوضيح شكل العرض وطريقة تصفح التشكيلة. تُستبدل الصور والبيانات بالنماذج المعتمدة من LAYA عند التنفيذ.","description":"تصور متجر LAYA للحقائب والأحذية النسائية — جميع المنتجات والأسعار في هذه العينة افتراضية.","note":"صور ومنتجات وأسعار تجريبية لأغراض العرض فقط","location":"التوصيل إلى جميع محافظات العراق","contactLabel":"واتساب LAYA","contactUrl":"https://wa.me/qr/ILWLP3ELRWYBM1","instagram":"https://www.instagram.com/b.r_laya/","contactMode":"copy","phones":[],"heroImage":"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1100&q=85","heroPosition":"center","theme":{"bg":"#f5f0e9","ink":"#302a26","surface":"#fffdf9","muted":"#877c73","accent":"#a77a5b","line":"#e7ddd1","hero":"#e9dfd4","photo":"#eee5db"},"categories":["الكل","حقائب","أحذية"],"products":[{"id":"laya-bag-01","name":"حقيبة كتف كلاسيكية","category":"حقائب","price":65000,"image":"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1100&q=85","https://milvertons.com/cdn/shop/articles/italian-shoe-and-bag-sets-crafted-for-enduring-elegance-3293135.webp?v=1761648944"],"description":"حقيبة كتف بتصميم هادئ ومساحة عملية للاستخدام اليومي. نموذج بصري افتراضي قابل للاستبدال بصور LAYA الأصلية.","specs":{"composition":"جلد صناعي بملمس ناعم","width":"متوسط","weight":"خفيفة","stretch":"بيج","opacity":"جيب داخلي","finish":"إغلاق مغناطيسي","care":"تنظيف بقطعة قماش ناعمة","use":"إطلالات يومية ومناسبات بسيطة"},"colors":[{"id":"sand","name":"بيج","hex":"#c8b49d","available":true,"stockMeters":8},{"id":"black","name":"أسود","hex":"#222222","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":78000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"laya-bag-02","name":"حقيبة يد بلون عاجي","category":"حقائب","price":72000,"image":"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1100&q=85","https://cdn.youcan.shop/stores/36a3662f8809b0cf8530224a438f9a93/products/JUXBGKpNVRQg27wBEsCzVQVocEQ7KpdPxz2r10sZ.jpg"],"description":"حقيبة يد أنيقة بدرجة عاجية وتفاصيل معدنية بسيطة، مع مساحة مناسبة للأغراض الأساسية.","specs":{"composition":"خامة صناعية فاخرة","width":"متوسط","weight":"خفيفة","stretch":"عاجي","opacity":"حجرة رئيسية","finish":"قفل علوي","care":"تُحفظ بعيداً عن الرطوبة","use":"العمل والخروج اليومي"},"colors":[{"id":"ivory","name":"عاجي","hex":"#e9dfcf","available":true,"stockMeters":8},{"id":"taupe","name":"تاوب","hex":"#8c7769","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":85000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"laya-bag-03","name":"حقيبة Mini Chain","category":"حقائب","price":48000,"image":"https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1100&q=85","images":["https://www.merojutta.com/cdn/shop/collections/trending-bags-and-shoes.png?v=1776805845&width=1248","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1100&q=85"],"description":"حقيبة صغيرة بحزام سلسلة، مناسبة عندما تحتاجين قطعة خفيفة تكمل الإطلالة دون ازدحام.","specs":{"composition":"جلد صناعي","width":"صغير","weight":"خفيفة جداً","stretch":"بني","opacity":"مساحة للأغراض الأساسية","finish":"سلسلة كتف","care":"مسح لطيف عند الحاجة","use":"السهرات والإطلالات الخفيفة"},"colors":[{"id":"brown","name":"بني","hex":"#7a4b35","available":true,"stockMeters":8},{"id":"cream","name":"كريمي","hex":"#e6d8c8","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":59000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"laya-shoe-01","name":"حذاء كلاسيكي بكعب متوسط","category":"أحذية","price":58000,"image":"https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1100&q=85","images":["https://milvertons.com/cdn/shop/articles/italian-shoe-and-bag-sets-crafted-for-enduring-elegance-3293135.webp?v=1761648944","https://www.merojutta.com/cdn/shop/collections/trending-bags-and-shoes.png?v=1776805845&width=1248"],"description":"حذاء نسائي بكعب متوسط وتصميم أنيق، مثال لطريقة عرض الأحذية مع تفاصيل المقاس واللون.","specs":{"composition":"جلد صناعي","width":"مقاسات 36–40","weight":"خفيف","stretch":"بيج","opacity":"مقدمة مغلقة","finish":"كعب متوسط","care":"تنظيف جاف ولطيف","use":"العمل والمناسبات"},"colors":[{"id":"nude","name":"نيود","hex":"#c7a58e","available":true,"stockMeters":8},{"id":"black","name":"أسود","hex":"#202020","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":69000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"laya-shoe-02","name":"حذاء يومي أنيق","category":"أحذية","price":52000,"image":"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1100&q=85","https://www.merojutta.com/cdn/shop/collections/trending-bags-and-shoes.png?v=1776805845&width=1248"],"description":"حذاء يومي مريح بطابع رياضي ناعم، يعرض نموذجاً لتنوع قسم الأحذية.","specs":{"composition":"نسيج وجلد صناعي","width":"مقاسات 36–40","weight":"خفيف","stretch":"أبيض","opacity":"رباط أمامي","finish":"نعل مرن","care":"تنظيف موضعي","use":"المشاوير اليومية"},"colors":[{"id":"white","name":"أبيض","hex":"#f5f2ec","available":true,"stockMeters":8},{"id":"black","name":"أسود","hex":"#252525","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":62000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"laya-bag-04","name":"حقيبة Tote واسعة","category":"حقائب","price":79000,"image":"https://milvertons.com/cdn/shop/articles/italian-shoe-and-bag-sets-crafted-for-enduring-elegance-3293135.webp?v=1761648944","images":["https://www.merojutta.com/cdn/shop/collections/trending-bags-and-shoes.png?v=1776805845&width=1248","https://cdn.youcan.shop/stores/36a3662f8809b0cf8530224a438f9a93/products/JUXBGKpNVRQg27wBEsCzVQVocEQ7KpdPxz2r10sZ.jpg"],"description":"حقيبة واسعة بتصميم عملي، مناسبة للعمل والتنقل وحمل الاحتياجات اليومية.","specs":{"composition":"خامة متينة","width":"واسع","weight":"متوسط","stretch":"جملي","opacity":"مساحة داخلية واسعة","finish":"مقابض مزدوجة","care":"تُحفظ بشكل قائم","use":"العمل والسفر الخفيف"},"colors":[{"id":"camel","name":"جملي","hex":"#9b6f4b","available":true,"stockMeters":8},{"id":"black","name":"أسود","hex":"#222222","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":92000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"}],"heroFit":"contain","productFit":"contain","heroSlides":["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1100&q=85","https://milvertons.com/cdn/shop/articles/italian-shoe-and-bag-sets-crafted-for-enduring-elegance-3293135.webp?v=1761648944","https://www.merojutta.com/cdn/shop/collections/trending-bags-and-shoes.png?v=1776805845&width=1248"],"demoNotice":"هذه عينة تصميمية — المنتجات والأسعار والصور ليست مخزوناً فعلياً","demoMode":true},"njom":{"key":"njom","name":"مكتب النجوم للهواتف النقالة","monogram":"N","tagline":"هواتف · إكسسوارات · صيانة","eyebrow":"AL NJOOM · MOBILE CENTER","heroTitle":"كل ما يخص هاتفك، بخطوة أوضح","heroText":"استكشف الأجهزة والإكسسوارات والخدمات التقنية في واجهة واحدة، واعرف ما تحتاجه قبل التواصل أو زيارة المكتب.","storyTitle":"وجهتك للأجهزة وما بعدها","storyText":"تصور أولي يجمع أقسام الهواتف والإكسسوارات والصيانة والبرمجة. المنتجات الظاهرة افتراضية وتُستبدل بقائمة الأجهزة والخدمات المعتمدة لدى مكتب النجوم.","description":"تصور مكتب النجوم لبيع وشراء الهواتف والإكسسوارات والصيانة والبرمجة في البصرة.","note":"منتجات وصور وأسعار تجريبية — التوفر الفعلي يؤكده المكتب","location":"البصرة · الجزائر · قرب جامع الموسوي","contactLabel":"تواصل مع النجوم","contactUrl":"https://www.instagram.com/alnjom_center/","instagram":"https://www.instagram.com/alnjom_center/","facebook":"https://www.facebook.com/alnjoom8?mibextid=LQQJ4d","contactMode":"copy","phones":[{"label":"الاتصال بالمكتب","number":"+9647801234544"}],"heroImage":"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1100&q=85","theme":{"bg":"#071827","ink":"#f4f8fc","surface":"#102337","muted":"#9db2c5","accent":"#61c3e5","line":"#294158","hero":"#0d263d","photo":"#e9eef3"},"categories":["الكل","هواتف","إكسسوارات","صيانة"],"products":[{"id":"njom-phone-01","name":"iPhone 15 Pro · 256GB","category":"هواتف","price":850000,"image":"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1100&q=85","https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1100&q=85"],"description":"نموذج هاتف رائد لعرض طريقة تقديم المواصفات والسعة والصور المتعددة. الاسم والسعر توضيحيان فقط.","specs":{"composition":"Apple","width":"256GB","weight":"8GB RAM","stretch":"5G","opacity":"نموذج توضيحي","finish":"Pro · 3 كاميرات","care":"الضمان يحدد من المكتب","use":"يُستبدل بالموديل المتوفر"},"colors":[{"id":"natural","name":"تيتانيوم طبيعي","hex":"#aaa69d","available":true,"stockMeters":8},{"id":"black","name":"تيتانيوم أسود","hex":"#343434","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":920000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"njom-phone-02","name":"Samsung Galaxy A55 · 5G","category":"هواتف","price":365000,"image":"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1100&q=85","https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1100&q=85"],"description":"نموذج لجهاز من الفئة المتوسطة مع إبراز الشبكة والتصميم والسعة عند إدخال بيانات الجهاز الحقيقي.","specs":{"composition":"Samsung","width":"256GB","weight":"8GB RAM","stretch":"5G","opacity":"جديد — نموذج عرض","finish":"شاشة AMOLED","care":"تُحدد شروط الضمان","use":"بديل تجريبي للموديلات المتاحة"},"colors":[{"id":"blue","name":"أزرق","hex":"#5d7897","available":true,"stockMeters":8},{"id":"black","name":"أسود","hex":"#252525","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":399000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"njom-phone-03","name":"iPhone 13 · 128GB","category":"هواتف","price":435000,"image":"https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1100&q=85","https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1100&q=85"],"description":"مثال لقائمة بيع وشراء الأجهزة، مع مساحة لإيضاح حالة الجهاز والفحص والملحقات عند اعتماد البيانات الحقيقية.","specs":{"composition":"Apple","width":"128GB","weight":"4GB RAM","stretch":"4G / 5G","opacity":"مستعمل — مثال فقط","finish":"كاميرتان","care":"الفحص والضمان حسب اتفاق المكتب","use":"حالة الجهاز تُثبت عند الإدراج"},"colors":[{"id":"midnight","name":"منتصف الليل","hex":"#242424","available":true,"stockMeters":8},{"id":"starlight","name":"نجمي","hex":"#ded6c8","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":470000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"njom-acc-01","name":"سماعات لاسلكية","category":"إكسسوارات","price":42000,"image":"https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1100&q=85","https://urbansupplyplus.com/cdn/shop/collections/864fb4b7-16ba-47e8-af6b-34adc0edb37b.png?v=1764522364"],"description":"سماعات لاسلكية كنموذج لقسم الإكسسوارات مع عرض صور المنتج والتوافق والتفاصيل.","specs":{"composition":"سماعات Bluetooth","width":"داخل الأذن","weight":"خفيفة","stretch":"أسود","opacity":"علبة شحن","finish":"تحكم باللمس","care":"تُحفظ في العلبة","use":"هواتف iOS وAndroid"},"colors":[{"id":"black","name":"أسود","hex":"#242424","available":true,"stockMeters":8},{"id":"white","name":"أبيض","hex":"#f2f2ee","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":50000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"njom-acc-02","name":"شاحن سريع USB‑C","category":"إكسسوارات","price":28000,"image":"https://urbansupplyplus.com/cdn/shop/collections/864fb4b7-16ba-47e8-af6b-34adc0edb37b.png?v=1764522364","images":["https://images.unsplash.com/flagged/photo-1594344141311-8ea00ba55612?auto=format&fit=crop&fm=jpg&w=1100&q=85","https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1100&q=85"],"description":"نموذج شاحن سريع مع توضيح نوع المنفذ والقدرة والتوافق بعد اعتماد مواصفات القطعة الفعلية.","specs":{"composition":"شاحن USB‑C","width":"20W","weight":"مدمج","stretch":"أبيض","opacity":"منفذ واحد","finish":"حماية من الحرارة","care":"استخدم كابل مناسب","use":"أجهزة متوافقة مع USB‑C"},"colors":[{"id":"white","name":"أبيض","hex":"#f2f2ee","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":35000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"njom-service-01","name":"فحص وتشخيص الهاتف","category":"صيانة","price":0,"image":"https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1100&q=85","images":["https://urbansupplyplus.com/cdn/shop/collections/864fb4b7-16ba-47e8-af6b-34adc0edb37b.png?v=1764522364","https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1100&q=85"],"description":"بطاقة خدمة توضيحية لعرض قسم الصيانة والبرمجة. تُضاف تفاصيل الخدمة والتكلفة الحقيقية من إدارة المكتب.","specs":{"composition":"خدمة فنية","width":"حسب الجهاز","weight":"فحص أولي","stretch":"حسب العطل","opacity":"موعد بالتواصل","finish":"تشخيص قبل الإصلاح","care":"تأكيد التكلفة قبل التنفيذ","use":"صيانة وبرمجة الأجهزة"},"colors":[{"id":"service","name":"حسب الموعد","hex":"#61c3e5","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":0,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"}],"heroFit":"contain","productFit":"contain","heroSlides":["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1100&q=85","https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1100&q=85","https://urbansupplyplus.com/cdn/shop/collections/864fb4b7-16ba-47e8-af6b-34adc0edb37b.png?v=1764522364"],"demoNotice":"عينة عرض فقط — الأجهزة والأسعار والصور لا تمثل مخزون المكتب","demoMode":true},"lna":{"key":"lna","name":"شركة لنا","monogram":"ل","tagline":"موبايلات · جملة ومفرد · أقساط","eyebrow":"LNA COMPANY · MOBILE & TECHNOLOGY","heroTitle":"خيارات تقنية أوضح للأفراد والتجار","heroText":"تصفح نماذج الهواتف والإكسسوارات، واستكشف كيف يمكن تنظيم أقسام الجملة والمفرد والأقساط والصيانة داخل واجهة واحدة.","storyTitle":"من اختيار الجهاز إلى ما يحتاجه","storyText":"واجهة تجريبية لعرض منتجات شركة لنا وخدماتها، مع أمثلة منفصلة للأجهزة والإكسسوارات والصيانة. الأسعار والموديلات هنا توضيحية وليست عروضاً معتمدة.","description":"تصور إلكتروني لشركة لنا للهواتف بالجملة والمفرد والأقساط والإكسسوارات والصيانة.","note":"نماذج تجريبية فقط — الأسعار والتوفر وشروط الأقساط تُعتمد من الشركة","location":"قرب جامع تكريتي · مجمع العذراء","contactLabel":"تواصل مع سنتر لنا","contactUrl":"https://www.instagram.com/lna_company/","instagram":"https://www.instagram.com/lna_company/","contactMode":"copy","phones":[{"label":"قسم المبيعات","number":"07703333130"},{"label":"قسم الإكسسوارات","number":"07703333430"}],"heroImage":"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1100&q=85","theme":{"bg":"#f2f6fa","ink":"#10233b","surface":"#ffffff","muted":"#65788c","accent":"#17669b","line":"#d9e4ec","hero":"#e7f0f7","photo":"#e9f0f6"},"categories":["الكل","موبايلات","إكسسوارات","صيانة"],"products":[{"id":"lna-phone-01","name":"iPhone 16 · 128GB","category":"موبايلات","price":1250000,"image":"https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1100&q=85","https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1100&q=85"],"description":"مثال عرض لهاتف آيفون مع إبراز السعة والمواصفات وخيارات الضمان بعد ربطها ببيانات شركة لنا.","specs":{"composition":"Apple","width":"128GB","weight":"8GB RAM","stretch":"5G","opacity":"نموذج جديد","finish":"كاميرا متقدمة","care":"ضمان الوكيل وفق الشروط عند التنفيذ","use":"سعر وسعة توضيحيان"},"colors":[{"id":"ultramarine","name":"أزرق","hex":"#34567f","available":true,"stockMeters":8},{"id":"black","name":"أسود","hex":"#262626","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":1320000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"lna-phone-02","name":"Samsung Galaxy S24 FE · 256GB","category":"موبايلات","price":675000,"image":"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1100&q=85","https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1100&q=85"],"description":"نموذج لجهاز سامسونج يوضح إمكانية مقارنة الخيارات حسب الموديل والسعة والفئة.","specs":{"composition":"Samsung","width":"256GB","weight":"8GB RAM","stretch":"5G","opacity":"نموذج عرض","finish":"شاشة Dynamic AMOLED","care":"تفاصيل الضمان تعتمد من الشركة","use":"للعمل والاستخدام اليومي"},"colors":[{"id":"graphite","name":"رمادي","hex":"#575b60","available":true,"stockMeters":8},{"id":"violet","name":"بنفسجي","hex":"#746b82","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":720000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"lna-phone-03","name":"Redmi Note 14 Pro · 256GB","category":"موبايلات","price":395000,"image":"https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1100&q=85","https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1100&q=85"],"description":"مثال لهاتف من فئة اقتصادية متقدمة، مع حقول للسعة والذاكرة واللون.","specs":{"composition":"Xiaomi","width":"256GB","weight":"8GB RAM","stretch":"5G","opacity":"نموذج عرض","finish":"كاميرا عالية الدقة","care":"الضمان حسب الوكيل","use":"قيمة توضيحية فقط"},"colors":[{"id":"black","name":"أسود","hex":"#252525","available":true,"stockMeters":8},{"id":"green","name":"أخضر","hex":"#68786c","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":425000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"lna-acc-01","name":"سماعات لاسلكية Pro","category":"إكسسوارات","price":89000,"image":"https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1100&q=85","https://urbansupplyplus.com/cdn/shop/collections/864fb4b7-16ba-47e8-af6b-34adc0edb37b.png?v=1764522364"],"description":"نموذج لإكسسوار تقني يعرض الصور والتوافق والخصائص ضمن قسم مستقل.","specs":{"composition":"سماعات لاسلكية","width":"داخل الأذن","weight":"خفيفة","stretch":"أبيض","opacity":"علبة شحن","finish":"عزل ضوضاء — مثال","care":"حفظها داخل العلبة","use":"أجهزة متوافقة"},"colors":[{"id":"white","name":"أبيض","hex":"#eeeeea","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":99000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"lna-acc-02","name":"شاحن جداري سريع 30W","category":"إكسسوارات","price":32000,"image":"https://urbansupplyplus.com/cdn/shop/collections/864fb4b7-16ba-47e8-af6b-34adc0edb37b.png?v=1764522364","images":["https://images.unsplash.com/flagged/photo-1594344141311-8ea00ba55612?auto=format&fit=crop&fm=jpg&w=1100&q=85","https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1100&q=85"],"description":"مثال لشاحن جداري مع منفذ حديث ومعلومات واضحة عن القدرة والتوافق.","specs":{"composition":"شاحن جداري","width":"30W","weight":"خفيف","stretch":"أبيض","opacity":"USB‑C","finish":"حماية متعددة","care":"تجنب الرطوبة","use":"الهواتف والأجهزة المتوافقة"},"colors":[{"id":"white","name":"أبيض","hex":"#f5f5f2","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":38000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"lna-service-01","name":"طلب صيانة أو فحص","category":"صيانة","price":0,"image":"https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1100&q=85","images":["https://urbansupplyplus.com/cdn/shop/collections/864fb4b7-16ba-47e8-af6b-34adc0edb37b.png?v=1764522364","https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1100&q=85"],"description":"بطاقة خدمة لتوضيح طريقة استقبال استفسارات الصيانة وربطها بالقسم المناسب.","specs":{"composition":"خدمة صيانة","width":"حسب الجهاز","weight":"فحص أولي","stretch":"حسب الحالة","opacity":"بموعد","finish":"تأكيد قبل التنفيذ","care":"تقدير التكلفة من الفريق","use":"صيانة وتشخيص"},"colors":[{"id":"service","name":"تواصل مع القسم","hex":"#17669b","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":0,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"}],"heroFit":"contain","productFit":"contain","heroSlides":["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1100&q=85","https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1100&q=85","https://images.unsplash.com/flagged/photo-1594344141311-8ea00ba55612?auto=format&fit=crop&fm=jpg&w=1100&q=85"],"demoNotice":"الأسعار والموديلات والصور تجريبية — راجع الشركة للتفاصيل الفعلية","demoMode":true},"scoop":{"key":"scoop","name":"سكوبر | SCOOPER","monogram":"S","tagline":"أسلوب رجالي يومي بطابع معاصر","eyebrow":"SCOOPER · MEN'S WEAR","heroTitle":"أسلوب واضح. قطع تختارها بثقة.","heroText":"اكتشف القمصان والتيشيرتات والإطلالات الرجالية ضمن كتالوج مصور يسهّل عليك اختيار القطعة والمقاس قبل زيارة المتجر.","storyTitle":"كل قطعة لها مكانها في إطلالتك","storyText":"تصور تجريبي لمتجر SCOOPER، يعرض نماذج للقمصان والتيشيرتات والإطلالات. تُستبدل الصور والأسعار والمقاسات بالمنتجات الحقيقية المعتمدة من المتجر.","description":"تصور متجر SCOOPER للألبسة الرجالية في الغزالية — بغداد.","note":"صور وأسعار ومقاسات تجريبية — ليست مخزوناً فعلياً","location":"بغداد · الغزالية · وسط شارع البدالة","hours":"10:00 صباحاً – 11:00 مساءً","contactLabel":"راسل سكوبر","contactUrl":"https://www.instagram.com/scooper2w/","instagram":"https://www.instagram.com/scooper2w/","contactMode":"copy","phones":[{"label":"اتصال 1","number":"07840303300"},{"label":"اتصال 2","number":"07722270709"}],"heroImage":"https://200brands.com/cdn/shop/files/rn-image_picker_lib_temp_2c343095-0312-4795-8e4e-caef4a4988fc_600x.png?v=1775288870","theme":{"bg":"#F5F2EC","ink":"#26343B","surface":"#FFFEFB","muted":"#77817F","accent":"#927552","line":"#E5DED3","hero":"#EEE7DC","photo":"#ECE7E0","surfaceStrong":"#FFFFFF","lineStrong":"#D5CABC","accentDark":"#725B3D","accentSoft":"#F2EADF","accentTint":"#E8DDCE","warm":"#B68B5B","highlight":"#DCCCB5","dark":"#D8CFC2","success":"#617A68"},"categories":["الكل","قمصان","تيشيرتات","إطلالات"],"products":[{"id":"scoop-shirt-01","name":"قميص Oxford يومي","category":"قمصان","price":45000,"image":"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1100&q=85","images":["https://thelondongentlemen.com/cdn/shop/files/ChatGPT_Image_Apr_16_2026_03_41_51_PM_92ee7286-b074-427f-b8d6-07907414a71b.png?v=1776336381&width=1024","https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1100&q=85"],"description":"قميص يومي بقصة مرتبة، نموذج لعرض ألوان القمصان وتفاصيلها ومقاساتها.","specs":{"composition":"قطن مخلوط","width":"S – XXL","weight":"متوسط","stretch":"أبيض","opacity":"قماش متوسط الكثافة","finish":"ياقة كلاسيكية وأزرار","care":"غسيل بارد","use":"العمل والإطلالات اليومية"},"colors":[{"id":"white","name":"أبيض","hex":"#f4f0e8","available":true,"stockMeters":8},{"id":"blue","name":"أزرق فاتح","hex":"#a9c2d2","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":52000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"scoop-tee-01","name":"تيشيرت قطن ثقيل","category":"تيشيرتات","price":28000,"image":"https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=1100&q=85","https://classybystyle.com/cdn/shop/products/O1CN01yXwlm326XMxjyVc2Z__3893227671-0-cib.jpg?v=1652881251"],"description":"تيشيرت أساسي بقماش أثقل وقصة مريحة، مثال لعرض الأساسيات اليومية.","specs":{"composition":"قطن","width":"S – XXL","weight":"ثقيل نسبياً","stretch":"أسود","opacity":"غير شفاف","finish":"ياقة دائرية","care":"غسيل مقلوب","use":"الكاجوال اليومي"},"colors":[{"id":"black","name":"أسود","hex":"#222222","available":true,"stockMeters":8},{"id":"white","name":"أبيض","hex":"#f5f3ee","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":32000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"scoop-polo-01","name":"بولو كلاسيكي","category":"تيشيرتات","price":39000,"image":"https://thelondongentlemen.com/cdn/shop/files/ChatGPT_Image_Apr_16_2026_03_41_51_PM_92ee7286-b074-427f-b8d6-07907414a71b.png?v=1776336381&width=1024","images":["https://classybystyle.com/cdn/shop/products/O1CN01yXwlm326XMxjyVc2Z__3893227671-0-cib.jpg?v=1652881251","https://200brands.com/cdn/shop/files/rn-image_picker_lib_temp_2c343095-0312-4795-8e4e-caef4a4988fc_600x.png?v=1775288870"],"description":"قطعة بولو سهلة التنسيق، تعرض في المتجر مع خيارات اللون والمقاس.","specs":{"composition":"قطن بيكيه","width":"M – XXL","weight":"متوسط","stretch":"خمري","opacity":"ياقة وأزرار","finish":"حواف مضلعة","care":"غسيل لطيف","use":"كاجوال مرتب"},"colors":[{"id":"red","name":"أحمر داكن","hex":"#843d3c","available":true,"stockMeters":8},{"id":"navy","name":"كحلي","hex":"#24364b","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":45000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"scoop-look-01","name":"إطلالة قميص وبنطال","category":"إطلالات","price":79000,"image":"https://200brands.com/cdn/shop/files/rn-image_picker_lib_temp_2c343095-0312-4795-8e4e-caef4a4988fc_600x.png?v=1775288870","images":["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1100&q=85","https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1100&q=85"],"description":"تنسيق افتراضي يوضح كيف يمكن عرض أكثر من قطعة ضمن إطلالة واحدة.","specs":{"composition":"قميص وبنطال","width":"مقاسات متعددة","weight":"متوسط","stretch":"أزرق ورمادي","opacity":"قطعتان منفصلتان","finish":"تنسيق جاهز","care":"حسب تعليمات كل قطعة","use":"إطلالة شبه رسمية"},"colors":[{"id":"blue","name":"أزرق","hex":"#4d667e","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":88000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"scoop-pants-01","name":"بنطال Chino","category":"إطلالات","price":42000,"image":"https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1100&q=85","https://200brands.com/cdn/shop/files/rn-image_picker_lib_temp_2c343095-0312-4795-8e4e-caef4a4988fc_600x.png?v=1775288870"],"description":"بنطال تشينو بقصة مستقيمة كمثال على إضافة قسم البنطال والإطلالات.","specs":{"composition":"قطن مع إيلاستين","width":"30 – 38","weight":"متوسط","stretch":"بيج","opacity":"قصة مستقيمة","finish":"جيب جانبي وخلفي","care":"غسيل بارد","use":"يومي وشبه رسمي"},"colors":[{"id":"sand","name":"رملي","hex":"#c9b99f","available":true,"stockMeters":8},{"id":"navy","name":"كحلي","hex":"#25354b","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":49000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"scoop-jacket-01","name":"جاكيت خفيف","category":"إطلالات","price":68000,"image":"https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1100&q=85","https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1100&q=85"],"description":"قطعة خارجية خفيفة لعرض تشكيلة موسمية ضمن المتجر.","specs":{"composition":"قماش مقاوم للهواء","width":"M – XXL","weight":"خفيف","stretch":"زيتي","opacity":"بطانة خفيفة","finish":"سحاب أمامي","care":"تنظيف حسب الملصق","use":"الموسم المعتدل"},"colors":[{"id":"olive","name":"زيتي","hex":"#59634d","available":true,"stockMeters":8},{"id":"black","name":"أسود","hex":"#222222","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":75000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"}],"heroFit":"cover","productFit":"contain","heroSlides":["https://200brands.com/cdn/shop/files/rn-image_picker_lib_temp_2c343095-0312-4795-8e4e-caef4a4988fc_600x.png?v=1775288870","https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1100&q=85","https://thelondongentlemen.com/cdn/shop/files/ChatGPT_Image_Apr_16_2026_03_41_51_PM_92ee7286-b074-427f-b8d6-07907414a71b.png?v=1776336381&width=1024"],"demoNotice":"هذه نماذج عرض وليست قطعاً مؤكدة التوفر أو الأسعار","demoMode":true},"mukhtar":{"key":"mukhtar","name":"MUKHTAR | مُختار","monogram":"M","tagline":"الرواية بدأت للتو","eyebrow":"MUKHTAR · MEN'S COLLECTION","heroTitle":"الرواية تبدأ من اختيارك","heroText":"اكتشف قطعاً رجالية مختارة بتفاصيل هادئة، من القمصان والبولو إلى الإطلالات المتكاملة.","storyTitle":"فصل جديد في أسلوب مُختار","storyText":"تصور بصري تجريبي لعلامة MUKHTAR، يقدم أمثلة للأزياء الرجالية بطريقة تحريرية راقية. كل المنتجات والأسعار والصور قابلة للاستبدال بمواد العلامة الفعلية.","description":"تصور متجر MUKHTAR للأزياء الرجالية — الفرع الأول في ڤينيسيا مول، بغداد.","note":"هذه تشكيلة وصور وأسعار تجريبية وليست عروضاً معتمدة","location":"بغداد · الحرية · ڤينيسيا مول","contactLabel":"تواصل مع مُختار","contactUrl":"https://www.instagram.com/6f_v/","instagram":"https://www.instagram.com/6f_v/","contactMode":"copy","phones":[{"label":"استفسار","number":"07827266656"}],"heroImage":"https://classybystyle.com/cdn/shop/products/O1CN01yXwlm326XMxjyVc2Z__3893227671-0-cib.jpg?v=1652881251","theme":{"bg":"#f0ede6","ink":"#252a27","surface":"#fbf9f4","muted":"#777c75","accent":"#8b765d","line":"#ded8cc","hero":"#e4e0d6","photo":"#e8e5dd"},"categories":["الكل","قمصان","بولو","إطلالات"],"products":[{"id":"mukhtar-shirt-01","name":"قميص Linen بألوان هادئة","category":"قمصان","price":59000,"image":"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1100&q=85","https://thelondongentlemen.com/cdn/shop/files/ChatGPT_Image_Apr_16_2026_03_41_51_PM_92ee7286-b074-427f-b8d6-07907414a71b.png?v=1776336381&width=1024"],"description":"قميص بقوام خفيف ولمسة طبيعية، مثال لقطعة يمكن تقديمها ضمن قصة تحريرية أنيقة.","specs":{"composition":"كتان مخلوط","width":"M – XXL","weight":"خفيف","stretch":"رملي","opacity":"ملمس طبيعي","finish":"ياقة مفتوحة","care":"غسيل لطيف وتجفيف ظل","use":"صيفي وSmart Casual"},"colors":[{"id":"sand","name":"رملي","hex":"#c8b89d","available":true,"stockMeters":8},{"id":"white","name":"عاجي","hex":"#eee9df","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":65000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"mukhtar-polo-01","name":"Polo Knit راقٍ","category":"بولو","price":48000,"image":"https://classybystyle.com/cdn/shop/products/O1CN01yXwlm326XMxjyVc2Z__3893227671-0-cib.jpg?v=1652881251","images":["https://thelondongentlemen.com/cdn/shop/files/ChatGPT_Image_Apr_16_2026_03_41_51_PM_92ee7286-b074-427f-b8d6-07907414a71b.png?v=1776336381&width=1024","https://200brands.com/cdn/shop/files/rn-image_picker_lib_temp_2c343095-0312-4795-8e4e-caef4a4988fc_600x.png?v=1775288870"],"description":"بولو محبوك بتفاصيل نظيفة، نموذج لعرض القطع الأساسية ذات الطابع الراقي.","specs":{"composition":"قطن محبوك","width":"M – XL","weight":"متوسط","stretch":"كحلي","opacity":"نسيج محبوك","finish":"ياقة وأزرار قصيرة","care":"غسيل بارد","use":"إطلالة يومية راقية"},"colors":[{"id":"navy","name":"كحلي","hex":"#273448","available":true,"stockMeters":8},{"id":"wine","name":"عنابي","hex":"#63383e","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":55000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"mukhtar-overshirt-01","name":"Overshirt بقصة مستقيمة","category":"قمصان","price":68000,"image":"https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1100&q=85","https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1100&q=85"],"description":"قميص خارجي متعدد التنسيق، يصلح كطبقة خفيفة فوق التيشيرت.","specs":{"composition":"قطن ثقيل","width":"M – XXL","weight":"متوسط إلى ثقيل","stretch":"زيتي","opacity":"جيبان أماميان","finish":"أزرار أمامية","care":"غسيل لطيف","use":"طبقات وإطلالات معاصرة"},"colors":[{"id":"olive","name":"زيتي","hex":"#65705a","available":true,"stockMeters":8},{"id":"taupe","name":"تاوب","hex":"#8b8174","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":74000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"mukhtar-look-01","name":"إطلالة Smart Casual","category":"إطلالات","price":105000,"image":"https://200brands.com/cdn/shop/files/rn-image_picker_lib_temp_2c343095-0312-4795-8e4e-caef4a4988fc_600x.png?v=1775288870","images":["https://thelondongentlemen.com/cdn/shop/files/ChatGPT_Image_Apr_16_2026_03_41_51_PM_92ee7286-b074-427f-b8d6-07907414a71b.png?v=1776336381&width=1024","https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1100&q=85"],"description":"تنسيق تخيلي يوضح إمكانية جمع القميص والبنطال والحذاء في اقتراح إطلالة واحدة.","specs":{"composition":"قميص وبنطال","width":"مقاسات متعددة","weight":"متوسط","stretch":"درجات محايدة","opacity":"عدة قطع","finish":"تنسيق جاهز","care":"حسب خامة كل قطعة","use":"مناسبات غير رسمية"},"colors":[{"id":"neutral","name":"محايد","hex":"#b9aa93","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":118000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"mukhtar-tee-01","name":"تيشيرت Premium","category":"بولو","price":35000,"image":"https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=1100&q=85","https://classybystyle.com/cdn/shop/products/O1CN01yXwlm326XMxjyVc2Z__3893227671-0-cib.jpg?v=1652881251"],"description":"تيشيرت بخامة كثيفة وقصة نظيفة، نموذج للأساسيات الراقية.","specs":{"composition":"قطن ثقيل","width":"S – XL","weight":"ثقيل","stretch":"فحمي","opacity":"غير شفاف","finish":"ياقة مضلعة","care":"غسيل مقلوب","use":"تنسيق تحت القمصان الخارجية"},"colors":[{"id":"charcoal","name":"فحمي","hex":"#343434","available":true,"stockMeters":8},{"id":"white","name":"أبيض","hex":"#f4f1e9","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":42000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"},{"id":"mukhtar-trouser-01","name":"بنطال Tailored","category":"إطلالات","price":62000,"image":"https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=1100&q=85","images":["https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1100&q=85","https://200brands.com/cdn/shop/files/rn-image_picker_lib_temp_2c343095-0312-4795-8e4e-caef4a4988fc_600x.png?v=1775288870"],"description":"بنطال بقصة مرتبة لإكمال الإطلالات الرسمية الخفيفة.","specs":{"composition":"قطن وفيسكوز","width":"30 – 38","weight":"متوسط","stretch":"فحمي","opacity":"قصة مستقيمة","finish":"إغلاق مخفي","care":"تنظيف حسب الملصق","use":"Smart Casual"},"colors":[{"id":"charcoal","name":"فحمي","hex":"#393b3d","available":true,"stockMeters":8},{"id":"sand","name":"رملي","hex":"#b8a991","available":true,"stockMeters":8}],"colorsEnabled":true,"stockMeters":8,"isNew":false,"isFeatured":true,"compareAtPrice":69000,"faqs":[{"question":"هل هذه المنتجات متوفرة فعلياً؟","answer":"لا، هذه منتجات وصور وأسعار افتراضية أُضيفت لغرض عرض التصميم وتجربة وظائف المتجر فقط."},{"question":"هل السعر المعروض معتمد؟","answer":"السعر توضيحي وغير معتمد. يُستبدل بسعر العلامة الفعلي بعد موافقة الإدارة."}],"createdAt":"2026-11-06"}],"heroFit":"cover","productFit":"contain","heroSlides":["https://classybystyle.com/cdn/shop/products/O1CN01yXwlm326XMxjyVc2Z__3893227671-0-cib.jpg?v=1652881251","https://thelondongentlemen.com/cdn/shop/files/ChatGPT_Image_Apr_16_2026_03_41_51_PM_92ee7286-b074-427f-b8d6-07907414a71b.png?v=1776336381&width=1024","https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1100&q=85"],"demoNotice":"صور وأسعار ونماذج افتراضية لأغراض التصميم فقط","demoMode":true},"zaytoun-group":{"key":"zaytoun-group","name":"زيتون كروب","monogram":"ز","tagline":"ZAYTOUN GROUP · مكملات رياضية","eyebrow":"ZAYTOUN GROUP · SPORTS NUTRITION","heroTitle":"مكملاتك الرياضية، بتفاصيل أوضح","heroText":"تصفح منتجات المكملات الرياضية، تعرّف على نوع العبوة وتفاصيلها، ثم أرسل طلبك إلى زيتون كروب. يؤكد الفرع السعر والنكهة والتوفر قبل اعتماد الطلب.","storyTitle":"من اختيار المنتج إلى تأكيد الطلب","storyText":"جمعنا المنتجات والتفاصيل ووسائل التواصل في تجربة واحدة. اختر المنتج والكمية، ثم أدخل بيانات التواصل حتى يتمكن فريق زيتون كروب من تأكيد الإصدار والسعر والتوفر وطريقة التوصيل.","description":"زيتون كروب للمكملات الرياضية والتغذية الرياضية. تواصل مع فروع بغداد – الكرخ / أبو غريب وديالى – بعقوبة للاستفسار عن المنتجات والأسعار والتوفر.","note":"يتم تأكيد السعر والعبوة والنكهة والتوفر مع الفرع قبل اعتماد الطلب.","location":"بغداد – الكرخ / أبو غريب · ديالى – بعقوبة","contactLabel":"واتساب زيتون كروب","contactUrl":"https://wa.me/9647822836669?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%86%D8%AA%D8%AC","instagram":"https://www.instagram.com/zaytoun.group/","facebook":"https://www.facebook.com/ZG.GROUP","phones":[{"label":"فرع بغداد – الكرخ / أبو غريب","number":"+9647822836669"},{"label":"فرع ديالى – بعقوبة","number":"+9647723098099"}],"heroImage":"/media/zaytoun/mass-pro?width=1200","heroPosition":"center","heroSlides":["/media/zaytoun/mass-pro?width=1200","/media/zaytoun/creatine?width=1200","/media/zaytoun/carb-x?width=1200"],"theme":{"bg":"#f4f7f2","surface":"#ffffff","surfaceStrong":"#ffffff","ink":"#1d3029","muted":"#6c7c70","line":"#dfe8dd","lineStrong":"#c7d6c5","accent":"#47754e","accentDark":"#2d5738","accentSoft":"#edf4eb","accentTint":"#dcebd9","warm":"#b28f50","highlight":"#e8dfc8","dark":"#1c3425","success":"#4e8057"},"categories":["الكل","زيادة الوزن والبروتين","الكرياتين","الطاقة والكارب","الأحماض الأمينية"],"products":[{"id":"mass-pro","slug":"mass-pro","name":"YAVA LABS · Complex Mass Pro 6KG","type":"مكمل رياضي","category":"زيادة الوزن والبروتين","price":0,"image":"/media/zaytoun/mass-pro","images":["/media/zaytoun/mass-pro"],"description":"عبوة Complex Mass Pro من YAVA LABS بحجم 6 كغم. تحقق من النكهة والإصدار المتوفر لدى فرع زيتون كروب قبل الطلب.","specs":{"composition":"راجع المكونات والملصق الغذائي على العبوة قبل الاستخدام.","width":"6 كغم","weight":"6 كغم","stretch":"النكهة والإصدار يؤكدهما الفرع","opacity":"تفاصيل المنتج حسب الشركة المصنعة","finish":"Complex Mass Pro","care":"اتبع تعليمات التخزين والاستخدام المطبوعة على العبوة","use":"استخدم المنتج وفق تعليمات الشركة المصنعة، واستشر مختصاً عند الحاجة"},"colors":[{"id":"default","name":"الإصدار / النكهة حسب المتوفر","hex":"#52754e","available":true,"stockMeters":999}],"colorsEnabled":true,"stockMeters":999,"isNew":false,"isFeatured":true,"faqs":[{"question":"هل السعر والتوفر مؤكد؟","answer":"يؤكد فرع زيتون كروب السعر والعبوة والنكهة والتوفر قبل اعتماد الطلب."},{"question":"كيف أتأكد من تفاصيل المنتج؟","answer":"تواصل مع الفرع لطلب تفاصيل الإصدار والملصق الغذائي قبل الشراء."}],"createdAt":"2026-11-07"},{"id":"creatine","slug":"creatine","name":"Applied Nutrition · Creatine Monohydrate","type":"مكمل رياضي","category":"الكرياتين","price":0,"image":"/media/zaytoun/creatine","images":["/media/zaytoun/creatine"],"description":"كرياتين مونوهيدرات من Applied Nutrition. اسأل الفرع عن حجم العبوة والنكهة والإصدار الموجود حالياً.","specs":{"composition":"راجع المكونات والملصق الغذائي على العبوة قبل الاستخدام.","width":"حجم العبوة بحسب الإصدار المعروض","weight":"يظهر الوزن الصافي على العبوة","stretch":"النكهة والإصدار يؤكدهما الفرع","opacity":"تفاصيل المنتج حسب الشركة المصنعة","finish":"Creatine Monohydrate","care":"اتبع تعليمات التخزين والاستخدام المطبوعة على العبوة","use":"استخدم المنتج وفق تعليمات الشركة المصنعة، واستشر مختصاً عند الحاجة"},"colors":[{"id":"default","name":"الإصدار / النكهة حسب المتوفر","hex":"#52754e","available":true,"stockMeters":999}],"colorsEnabled":true,"stockMeters":999,"isNew":false,"isFeatured":true,"faqs":[{"question":"هل السعر والتوفر مؤكد؟","answer":"يؤكد فرع زيتون كروب السعر والعبوة والنكهة والتوفر قبل اعتماد الطلب."},{"question":"كيف أتأكد من تفاصيل المنتج؟","answer":"تواصل مع الفرع لطلب تفاصيل الإصدار والملصق الغذائي قبل الشراء."}],"createdAt":"2026-11-07"},{"id":"carb-x","slug":"carb-x","name":"Applied Nutrition · Carb-X","type":"مكمل رياضي","category":"الطاقة والكارب","price":0,"image":"/media/zaytoun/carb-x","images":["/media/zaytoun/carb-x"],"description":"Carb-X من Applied Nutrition. راجع تفاصيل التركيبة والعبوة، وتأكد من النكهة المتاحة لدى الفرع.","specs":{"composition":"راجع المكونات والملصق الغذائي على العبوة قبل الاستخدام.","width":"حجم العبوة بحسب الإصدار المعروض","weight":"يظهر الوزن الصافي على العبوة","stretch":"النكهة والإصدار يؤكدهما الفرع","opacity":"تفاصيل المنتج حسب الشركة المصنعة","finish":"Carb-X","care":"اتبع تعليمات التخزين والاستخدام المطبوعة على العبوة","use":"استخدم المنتج وفق تعليمات الشركة المصنعة، واستشر مختصاً عند الحاجة"},"colors":[{"id":"default","name":"الإصدار / النكهة حسب المتوفر","hex":"#52754e","available":true,"stockMeters":999}],"colorsEnabled":true,"stockMeters":999,"isNew":false,"isFeatured":true,"faqs":[{"question":"هل السعر والتوفر مؤكد؟","answer":"يؤكد فرع زيتون كروب السعر والعبوة والنكهة والتوفر قبل اعتماد الطلب."},{"question":"كيف أتأكد من تفاصيل المنتج؟","answer":"تواصل مع الفرع لطلب تفاصيل الإصدار والملصق الغذائي قبل الشراء."}],"createdAt":"2026-11-07"},{"id":"critical-mass","slug":"critical-mass","name":"Applied Nutrition · Critical Mass 6KG","type":"مكمل رياضي","category":"زيادة الوزن والبروتين","price":0,"image":"/media/zaytoun/critical-mass","images":["/media/zaytoun/critical-mass"],"description":"Critical Mass من Applied Nutrition بحجم 6 كغم وفق تسمية العبوة. اسأل الفرع عن النكهة والإصدار الحالي.","specs":{"composition":"راجع المكونات والملصق الغذائي على العبوة قبل الاستخدام.","width":"6 كغم","weight":"6 كغم","stretch":"النكهة والإصدار يؤكدهما الفرع","opacity":"تفاصيل المنتج حسب الشركة المصنعة","finish":"Critical Mass","care":"اتبع تعليمات التخزين والاستخدام المطبوعة على العبوة","use":"استخدم المنتج وفق تعليمات الشركة المصنعة، واستشر مختصاً عند الحاجة"},"colors":[{"id":"default","name":"الإصدار / النكهة حسب المتوفر","hex":"#52754e","available":true,"stockMeters":999}],"colorsEnabled":true,"stockMeters":999,"isNew":false,"isFeatured":true,"faqs":[{"question":"هل السعر والتوفر مؤكد؟","answer":"يؤكد فرع زيتون كروب السعر والعبوة والنكهة والتوفر قبل اعتماد الطلب."},{"question":"كيف أتأكد من تفاصيل المنتج؟","answer":"تواصل مع الفرع لطلب تفاصيل الإصدار والملصق الغذائي قبل الشراء."}],"createdAt":"2026-11-07"},{"id":"glutamine","slug":"glutamine","name":"Applied Nutrition · L-Glutamine","type":"مكمل رياضي","category":"الأحماض الأمينية","price":0,"image":"/media/zaytoun/glutamine","images":["/media/zaytoun/glutamine"],"description":"L-Glutamine من Applied Nutrition. يحدد الفرع حجم العبوة والإصدار المتوفر قبل إتمام الطلب.","specs":{"composition":"راجع المكونات والملصق الغذائي على العبوة قبل الاستخدام.","width":"حجم العبوة بحسب الإصدار المعروض","weight":"يظهر الوزن الصافي على العبوة","stretch":"النكهة والإصدار يؤكدهما الفرع","opacity":"تفاصيل المنتج حسب الشركة المصنعة","finish":"L-Glutamine","care":"اتبع تعليمات التخزين والاستخدام المطبوعة على العبوة","use":"استخدم المنتج وفق تعليمات الشركة المصنعة، واستشر مختصاً عند الحاجة"},"colors":[{"id":"default","name":"الإصدار / النكهة حسب المتوفر","hex":"#52754e","available":true,"stockMeters":999}],"colorsEnabled":true,"stockMeters":999,"isNew":false,"isFeatured":true,"faqs":[{"question":"هل السعر والتوفر مؤكد؟","answer":"يؤكد فرع زيتون كروب السعر والعبوة والنكهة والتوفر قبل اعتماد الطلب."},{"question":"كيف أتأكد من تفاصيل المنتج؟","answer":"تواصل مع الفرع لطلب تفاصيل الإصدار والملصق الغذائي قبل الشراء."}],"createdAt":"2026-11-07"},{"id":"abe","slug":"abe","name":"Applied Nutrition · ABE Ultimate Pre-Workout","type":"مكمل رياضي","category":"الطاقة والكارب","price":0,"image":"/media/zaytoun/abe","images":["/media/zaytoun/abe"],"description":"ABE Ultimate Pre-Workout من Applied Nutrition. تأكد من النكهة وحجم العبوة وتعليمات الشركة المصنعة مع الفرع.","specs":{"composition":"راجع المكونات والملصق الغذائي على العبوة قبل الاستخدام.","width":"حجم العبوة بحسب الإصدار المعروض","weight":"يظهر الوزن الصافي على العبوة","stretch":"النكهة والإصدار يؤكدهما الفرع","opacity":"تفاصيل المنتج حسب الشركة المصنعة","finish":"ABE Ultimate Pre-Workout","care":"اتبع تعليمات التخزين والاستخدام المطبوعة على العبوة","use":"استخدم المنتج وفق تعليمات الشركة المصنعة، واستشر مختصاً عند الحاجة"},"colors":[{"id":"default","name":"الإصدار / النكهة حسب المتوفر","hex":"#52754e","available":true,"stockMeters":999}],"colorsEnabled":true,"stockMeters":999,"isNew":false,"isFeatured":true,"faqs":[{"question":"هل السعر والتوفر مؤكد؟","answer":"يؤكد فرع زيتون كروب السعر والعبوة والنكهة والتوفر قبل اعتماد الطلب."},{"question":"كيف أتأكد من تفاصيل المنتج؟","answer":"تواصل مع الفرع لطلب تفاصيل الإصدار والملصق الغذائي قبل الشراء."}],"createdAt":"2026-11-07"}]}};
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
    const stock = Math.max(0, Number(item.stockMeters ?? 8) || 0);
    const colors = Array.isArray(item.colors) && item.colors.length
      ? item.colors.map((color,index) => ({
          id:String(color.id || "color-" + (index + 1)),
          name:String(color.name || "لون " + (index + 1)),
          hex:String(color.hex || "#9b8060"),
          available:color.available !== false,
          stockMeters:Math.max(0,Number(color.stockMeters ?? stock) || 0)
        }))
      : [{id:"default",name:"أساسي",hex:"#b4a08a",available:true,stockMeters:stock}];
    const suppliedSpecs = item.specs && typeof item.specs === "object" ? item.specs : {};
    map.set(id, {
      id, slug:id, name:String(item.name || "منتج"), type:category, categoryId:category,
      description:String(item.description || ""),
      price:Math.max(0,Number(item.price) || 0),
      ...(Number(item.compareAtPrice) > 0 ? {compareAtPrice:Number(item.compareAtPrice)} : {}),
      image, images:Array.isArray(item.images) ? [...new Set([image,...item.images].filter(Boolean))] : [image].filter(Boolean),
      colors, colorsEnabled:item.colorsEnabled !== false,
      specs:{
        composition:String(suppliedSpecs.composition || "تُؤكد التفاصيل مع المتجر"),
        width:String(suppliedSpecs.width || "حسب المنتج"),
        weight:String(suppliedSpecs.weight || "حسب المنتج"),
        stretch:String(suppliedSpecs.stretch || "غير محدد"),
        isStretch:Boolean(suppliedSpecs.isStretch || false),
        opacity:String(suppliedSpecs.opacity || "حسب المنتج"),
        finish:String(suppliedSpecs.finish || "حسب المنتج"),
        care:String(suppliedSpecs.care || "راجع إرشادات العناية الخاصة بالمنتج"),
        use:String(suppliedSpecs.use || item.description || "راجع تفاصيل المنتج مع المتجر")
      },
      faqs:Array.isArray(item.faqs) ? item.faqs : [],
      isNew:Boolean(item.isNew), isFeatured:item.isFeatured !== false,
      stockMeters:stock, createdAt:String(item.createdAt || "2026-11-06")
    });
  }
  for (const item of overrides) {
    if (!item || typeof item !== "object") continue;
    const id = String(item.id || item.slug || "");
    if (id) map.set(id,item);
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
    tenantKey:p.key || "", shopName:p.name, shortName:p.name, monogram:p.monogram || "", tagline:p.tagline || "",
    phone:primaryPhone, whatsapp:primaryPhone, instagram:p.instagram || "",
    contactUrl:p.contactUrl || p.instagram || "",
    location:p.location || "", hours:p.hours || "",
    announcementRight:p.location || "تواصل مباشر مع المتجر",
    announcementLeft:p.demoNotice || p.note || "تأكد من تفاصيل المنتج قبل الطلب",
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
    heroSlides:Array.isArray(p.heroSlides) && p.heroSlides.length ? p.heroSlides : (p.heroImage ? [p.heroImage] : []),
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

const ZAYTOUN_BRAND={"key":"zaytoun-group","mark":"ز","kicker":"ZAYTOUN GROUP  /  SPORTS NUTRITION","title":"اختيارات رياضية تبدأ من التفاصيل","description":"تصفح المكملات الرياضية والعبوات المتاحة، وراجع تفاصيل المنتج قبل التواصل مع زيتون كروب لتأكيد السعر والنكهة والتوفر.","artLabel":"ZAYTOUN GROUP  ·  SPORTS NUTRITION","artTitle":"TRAIN · FUEL · RECOVER","categories":[{"id":"زيادة الوزن والبروتين","label":"البروتين وزيادة الوزن","description":"مساحيق البروتين والخلطات عالية السعرات","icon":"store"},{"id":"الكرياتين","label":"الكرياتين","description":"منتجات الكرياتين من العلامات الرياضية","icon":"check"},{"id":"الطاقة والكارب","label":"الطاقة والكارب","description":"منتجات الكارب وما قبل التمرين","icon":"truck"},{"id":"الأحماض الأمينية","label":"الأحماض الأمينية","description":"منتجات الأحماض الأمينية والمكملات","icon":"warranty"}],"features":[{"title":"تفاصيل أوضح","description":"راجع نوع المنتج وحجم العبوة والملصق الغذائي","icon":"check"},{"title":"تأكيد مباشر","description":"اسأل الفرع عن النكهة والسعر والتوفر قبل الطلب","icon":"store"},{"title":"خدمة المحافظات","description":"تأكد من مناطق ورسوم التوصيل مع الفرع","icon":"truck"}],"catalogTitle":"منتجات زيتون كروب","catalogIntro":"تصفح التشكيلة، واختر المنتج والكمية، ثم تواصل مع الفرع لتأكيد الإصدار والسعر والتوفر.","catalogAction":"استفسر عن المنتجات المتاحة","specLabels":{"composition":"المكونات","width":"حجم العبوة","weight":"الوزن الصافي","stretch":"النكهة","opacity":"تفاصيل المنتج","finish":"النوع","care":"تعليمات العبوة","use":"ملاحظات الاستخدام"}};
const ZAYTOUN_CSS="\n.tenant-store--zaytoun-group .tenant-hero__art{color:#f6f8f2;background:#2f543d}\n.tenant-store--zaytoun-group .tenant-art__icon{color:#d9c58d;border-radius:50%;background:rgba(255,255,255,.06)}\n.tenant-store--zaytoun-group .tenant-art__halo{border-color:rgba(217,197,141,.44)}\n.tenant-store--zaytoun-group .tenant-demo-note__mark{background:#e7efe3;color:#355b3e}\n.tenant-store--zaytoun-group .tenant-kicker{color:#507653}\n.tenant-store--zaytoun-group .tenant-button--primary{background:#47754e;border-color:#47754e}\n.tenant-store--zaytoun-group .tenant-category-icon{color:#47754e;background:#eef4eb}\n.tenant-store--zaytoun-group .tenant-section-heading h2{color:#203528}\n.tenant-store--zaytoun-group .tenant-contact-band{background:#244832}\n";
const ZAYTOUN_MEDIA={"mass-pro":"https://www.housenutrition.tn/storage/uploads/products/images/yava_complex_mass_pro_6kg_cookies%20%281%29.webp-69c258f9199ca.webp","creatine":"https://appliednutrition.uk/cdn/shop/files/Creatine_Monohydrate_Professional_500g.webp?v=1781656999&width=1445","carb-x":"https://fuelsupplements.com/cdn/shop/files/Carb-X_1.2kg_-_Unflavoured.png?v=1764960528&width=1214","critical-mass":"https://www.couz-nutri.com/cdn/shop/files/Applied_Nutrition_Original_Critical_Mass_Chocolate.png?v=1721894824","glutamine":"https://mega-mass.ua/images/detailed/26/71vckrxqsUL._AC_SL1500_.jpg","abe":"https://ecombe.nahdionline.com/media/catalog/product/1/0/103518611_aef4539334e238e8a_60349.jpg?bg-color=255%2C255%2C255&canvas=1050%2C1050&fit=bounds&height=1050&optimize=high&width=1050"};
const mediaResponse=async(request,id)=>{
 const original=ZAYTOUN_MEDIA[id];if(!original)return text("Image not found",404);
 const url=new URL(request.url),rw=Number(url.searchParams.get("width"))||640,width=rw>=1100?1200:rw>=700?900:640;
 const accept=request.headers.get("accept")||"",format=/image\/avif/.test(accept)?"avif":(/image\/webp/.test(accept)?"webp":"jpeg");
 const keyUrl=new URL(request.url);keyUrl.searchParams.set("__zaytoun_img_v","4");keyUrl.searchParams.set("width",String(width));keyUrl.searchParams.set("format",format);
 const key=new Request(keyUrl.toString(),{method:"GET"}),cached=await caches.default.match(key);if(cached)return cached;
 let response;const image={width,fit:"scale-down",quality:78,format};
 try{response=await fetch(original,{cf:{image}});if(!response.ok||!(response.headers.get("content-type")||"").startsWith("image/"))response=await fetch(original)}
 catch(_){try{response=await fetch(original)}catch{return text("Image temporarily unavailable",502)}}
 if(!response.ok)return text("Image temporarily unavailable",502);
 const headers=new Headers(response.headers);headers.set("cache-control","public,max-age=604800,s-maxage=604800,stale-while-revalidate=2592000");headers.set("x-content-type-options","nosniff");headers.set("access-control-allow-origin","*");
 const out=new Response(response.body,{status:response.status,headers});await caches.default.put(key,out.clone()).catch(()=>false);return out;
};
const staticAsset=async(request,env)=>{
 const url=new URL(request.url),mediaMatch=url.pathname.match(/^\/media\/zaytoun\/([a-z0-9-]+)$/);
 if(mediaMatch)return mediaResponse(request,mediaMatch[1]);
 if(!env.STATIC)return text("Store assets are not configured",503);
 const cacheUrl=new URL(request.url);cacheUrl.searchParams.set("__zaytoun_assets_v","4");
 const cacheKey=new Request(cacheUrl.toString(),{method:"GET"});
 if(request.method==="GET"){const hit=await caches.default.match(cacheKey);if(hit)return hit;}
 const upstreamUrl=new URL(url.pathname+url.search,"https://laya.eva-store.workers.dev");
 let upstream;try{upstream=await env.STATIC.fetch(new Request(upstreamUrl.toString(),{method:request.method,headers:request.headers}))}
 catch(_){return text("Storefront assets temporarily unavailable",502)}
 if(!upstream.ok)return upstream;
 let body=upstream.body,contentType=upstream.headers.get("content-type")||"",path=url.pathname;
 if(request.method==="GET"&&path.endsWith(".js")&&path.includes("/assets/index-")){
  let js=await upstream.text(),marker='}}},eu=r=>xm[r||""]||xm.laya,vm=';
  if(js.includes(marker))js=js.replace(marker,'}},"zaytoun-group":'+JSON.stringify(ZAYTOUN_BRAND)+'},eu=r=>xm[r||""]||xm.laya,vm=');
  js=js.replace('y=eu(h.tenantKey||p),b=y.key==="laya"?nn:y.key==="njom"||y.key==="lna"?ig:ji,j=','y=eu(h.tenantKey||p),b=y.key==="laya"?nn:y.key==="njom"||y.key==="lna"?ig:y.key==="zaytoun-group"?f1:ji,j=');
  js=js.replaceAll("معاينة تجريبية مخصصة لـ ","مرحباً بك في ");
  js=js.replaceAll("نموذج عرض قابل للتخصيص بهوية العلامة","تواصل مع الفرع لتأكيد السعر والتوفر");
  body=js;contentType="application/javascript; charset=utf-8";
 }else if(request.method==="GET"&&path.endsWith(".css")&&path.includes("/assets/index-")){
  body=(await upstream.text())+"\n"+ZAYTOUN_CSS;contentType="text/css; charset=utf-8";
 }else if(request.method==="GET"&&(path==="/"||path==="/index.html")){
  let html=await upstream.text();
  html=html.replace(/<title>[^<]*<\/title>/,"<title>زيتون كروب | ZAYTOUN GROUP</title>");
  html=html.replace(/<meta name="description" content="[^"]*"\s*\/?>/,'<meta name="description" content="متجر زيتون كروب للمكملات الرياضية. تصفح المنتجات وتواصل مع الفروع لتأكيد السعر والتوفر." />');
  body=html;contentType="text/html; charset=utf-8";
 }
 const headers=new Headers(upstream.headers);headers.set("content-type",contentType);
 headers.set("cache-control",path.includes("/assets/")||path.includes("/fonts/")?"public,max-age=31536000,immutable":"public,max-age=300,s-maxage=300,stale-while-revalidate=1800");
 headers.set("x-content-type-options","nosniff");headers.set("x-zaytoun-platform","eva-store-client-platform");
 const out=new Response(body,{status:upstream.status,headers});if(request.method==="GET")await caches.default.put(cacheKey,out.clone()).catch(()=>false);return out;
};

export default { async fetch(request,env) {
  const url = new URL(request.url);
  const slug = url.hostname.split(".")[0];
  if (!SLUGS.has(slug)) return text("Unknown storefront",404);
  const path = url.pathname;
  if(slug==="zaytoun-group"&&!zaytounSeeded){
    const existing=await env.ORDERS.get("zaytoun-group:content");
    if(!existing){
      await env.ORDERS.put("zaytoun-group:content","{\"tenantKey\":\"zaytoun-group\",\"shopName\":\"زيتون كروب\",\"shortName\":\"زيتون كروب\",\"monogram\":\"ز\",\"tagline\":\"مكملات رياضية · تغذية رياضية\",\"phone\":\"+9647822836669\",\"whatsapp\":\"+9647822836669\",\"instagram\":\"https://www.instagram.com/zaytoun.group/\",\"contactUrl\":\"https://wa.me/9647822836669?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%86%D8%AA%D8%AC\",\"location\":\"بغداد – الكرخ / أبو غريب · ديالى – بعقوبة\",\"announcementRight\":\"بغداد – أبو غريب · ديالى – بعقوبة\",\"announcementLeft\":\"يتم تأكيد السعر والعبوة والنكهة والتوفر مع الفرع قبل اعتماد الطلب.\",\"aboutTitle\":\"من اختيار المنتج إلى تأكيد الطلب\",\"aboutText\":\"جمعنا المنتجات والتفاصيل ووسائل التواصل في تجربة واحدة. اختر المنتج والكمية، ثم أدخل بيانات التواصل حتى يتمكن فريق زيتون كروب من تأكيد الإصدار والسعر والتوفر وطريقة التوصيل.\",\"contactTitle\":\"تحتاج مساعدة في اختيار المنتج؟\",\"contactText\":\"تواصل مع فرع زيتون كروب للاستفسار عن العبوة والنكهة والسعر والتوفر.\",\"heroEyebrow\":\"ZAYTOUN GROUP · SPORTS NUTRITION\",\"heroTitle\":\"مكملاتك الرياضية، بتفاصيل أوضح\",\"heroText\":\"تصفح منتجات المكملات الرياضية، تعرّف على نوع العبوة وتفاصيلها، ثم أرسل طلبك إلى زيتون كروب. يؤكد الفرع السعر والنكهة والتوفر قبل اعتماد الطلب.\",\"heroNote\":\"تأكيد السعر والتوفر مع الفرع\",\"heroNoteAlt\":\"تواصل مباشر مع زيتون كروب\",\"heroSlides\":[\"/media/zaytoun/mass-pro?width=1200\",\"/media/zaytoun/creatine?width=1200\",\"/media/zaytoun/carb-x?width=1200\"],\"hiddenSections\":[\"discovery\",\"guide\",\"newsletter\"],\"categoriesEyebrow\":\"تصفح حسب القسم\",\"categoriesTitle\":\"أقسام زيتون كروب\",\"newEyebrow\":\"تشكيلة مختارة\",\"newTitle\":\"منتجات المكملات الرياضية\",\"newDesc\":\"تصفح المنتجات واسأل الفرع عن الإصدار المتاح\",\"guideEyebrow\":\"قبل إتمام الطلب\",\"guideTitle\":\"اختر المنتج|وتأكد من التفاصيل\",\"guideText\":\"تأكد من حجم العبوة والنكهة وتعليمات الشركة المصنعة، ثم أكد السعر والتوفر مع الفرع.\",\"guideCta\":\"تصفح المنتجات\",\"newsletterEyebrow\":\"تواصل مباشر\",\"newsletterTitle\":\"اسأل فريق زيتون كروب\",\"newsletterText\":\"تواصل مع أحد الفروع للاستفسار عن المنتجات والتوفر وخيارات التوصيل.\",\"promoPill\":\"زيتون كروب\",\"promoLead\":\"تفاصيل أوضح\",\"promoText\":\"اسأل عن السعر والعبوة والنكهة قبل الطلب\",\"emailOrdersTo\":\"\",\"emailFromName\":\"زيتون كروب\",\"emailFrom\":\"\",\"emailSubjectOrder\":\"طلب جديد من زيتون كروب #{orderNumber}\",\"emailTemplateOrder\":\"\",\"emailProvider\":\"mailto\",\"emailFormSubmitAction\":\"\",\"catalogLabel\":\"المكملات\",\"quantityUnit\":\"عبوة\",\"quantityUnitEn\":\"pack\",\"storyImage\":\"/media/zaytoun/mass-pro?width=1200\",\"deliveryNote\":\"تُؤكد رسوم ومناطق التوصيل مع الفرع\",\"paymentNote\":\"تُؤكد طريقة الدفع مع الفرع\",\"theme\":{\"bg\":\"#f4f7f2\",\"surface\":\"#ffffff\",\"surfaceStrong\":\"#ffffff\",\"ink\":\"#1d3029\",\"muted\":\"#6c7c70\",\"line\":\"#dfe8dd\",\"lineStrong\":\"#c7d6c5\",\"accent\":\"#47754e\",\"accentDark\":\"#2d5738\",\"accentSoft\":\"#edf4eb\",\"accentTint\":\"#dcebd9\",\"warm\":\"#b28f50\",\"highlight\":\"#e8dfc8\",\"dark\":\"#1c3425\",\"success\":\"#4e8057\"}}");
      await env.ORDERS.put("zaytoun-group:settings","{\"colorsEnabled\":true,\"freeDeliveryFrom\":0,\"deliveryFee\":0}");
      await env.ORDERS.put("zaytoun-group:products","{\"overrides\":[],\"removed\":[]}");
      await env.ORDERS.put("zaytoun-group:admins","[{\"id\":\"owner\",\"username\":\"admin\",\"display_name\":\"مدير زيتون كروب\",\"created_at\":\"2026-11-07T18:05:32.619Z\",\"passwordHash\":null}]");
    }
    zaytounSeeded=true;
  }

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
    if (profile.demoMode) return json({error:"هذه عينة تجريبية؛ لا يتم تسجيل طلبات فعلية أو جمع بيانات شراء من خلالها."},409);
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
        store:slug, status:"new", created_at:new Date().toISOString(), createdAt:new Date().toISOString(),
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
      const expected = await env.ORDERS.get(slug + ":admin-pin") || env.ADMIN_PIN || "2468";
      let authorized=String(body.pin||"")===expected;
      if(!authorized&&body.username&&body.password){
        const rows=await readKV(env,slug,"admins",[]);
        const row=rows.find(item=>item.username===String(body.username).trim().toLowerCase()&&item.passwordHash);
        if(row){
          const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(String(body.password)));
          const candidate=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
          authorized=candidate===row.passwordHash;
        }
      }
      if(!authorized)return json({error:"بيانات الدخول غير صحيحة"},401);
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

    if(path==="/api/admin/admins"&&request.method==="GET"){
      const rows=await readKV(env,slug,"admins",[{id:"owner",username:"admin",display_name:"مدير زيتون كروب",created_at:new Date().toISOString(),passwordHash:null}]);
      return jsonData(rows.map(({passwordHash,...row})=>row),200);
    }
    if(path==="/api/admin/admins"&&request.method==="POST"){
      const body=await request.json(),username=String(body.username||"").trim().toLowerCase(),password=String(body.password||""),display_name=String(body.displayName||"").trim().slice(0,80);
      if(!/^[a-z0-9._-]{3,32}$/.test(username)||password.length<6)return json({error:"اسم المستخدم أو كلمة المرور غير صالحة"},400);
      const rows=await readKV(env,slug,"admins",[{id:"owner",username:"admin",display_name:"مدير زيتون كروب",created_at:new Date().toISOString(),passwordHash:null}]);
      if(rows.some(row=>row.username===username))return json({error:"اسم المستخدم مستخدم مسبقاً"},409);
      const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(password));
      const passwordHash=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
      const row={id:crypto.randomUUID(),username,display_name,created_at:new Date().toISOString(),passwordHash};
      await writeKV(env,slug,"admins",[...rows,row]);
      return json({data:{id:row.id,username,display_name,created_at:row.created_at}},201);
    }
    const accountMatch=path.match(/^\/api\/admin\/admins\/([^/]+)$/);
    if(accountMatch){
      const rows=await readKV(env,slug,"admins",[{id:"owner",username:"admin",display_name:"مدير زيتون كروب",created_at:new Date().toISOString(),passwordHash:null}]);
      const index=rows.findIndex(row=>row.id===decodeURIComponent(accountMatch[1]));
      if(index<0)return json({error:"حساب المدير غير موجود"},404);
      if(request.method==="DELETE"){
        if(rows.length<=1||rows[index].id==="owner")return json({error:"لا يمكن حذف المدير الرئيسي أو آخر حساب"},400);
        rows.splice(index,1);await writeKV(env,slug,"admins",rows);return json({data:{deleted:true}},200);
      }
      if(request.method==="PATCH"){
        const body=await request.json(),password=String(body.password||"");
        if(password.length<6)return json({error:"كلمة المرور يجب أن تكون 6 أحرف على الأقل"},400);
        const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(password));
        rows[index].passwordHash=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
        await writeKV(env,slug,"admins",rows);return json({data:{updated:true}},200);
      }
    }
    if(path==="/api/admin/push"&&request.method==="GET")return jsonData({enabled:false,count:0},200);
    if(path==="/api/admin/push/subscribe"&&request.method==="POST")return jsonData({enabled:false,saved:false},200);
    if(path==="/api/admin/push/unsubscribe"&&request.method==="POST")return jsonData({enabled:false,removed:false},200);
    if(path==="/api/admin/push/test"&&request.method==="POST")return jsonData({sent:0,total:0},200);
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
  return staticAsset(request,env);
} };
