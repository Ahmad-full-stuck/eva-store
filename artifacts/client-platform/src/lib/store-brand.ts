export type BrandCategory = { id: string; label: string; description: string; icon: string }
export type StoreBrand = {
  key: string; mark: string; kicker: string; title: string; description: string;
  artLabel: string; artTitle: string; categories: BrandCategory[];
  features: { title: string; description: string; icon: string }[];
  catalogTitle: string; catalogIntro: string; catalogAction: string;
  specLabels: { composition:string; width:string; weight:string; stretch:string; opacity:string; finish:string; care:string; use:string };
}
export const VERTICAL_TENANT_KEYS = new Set([
  'hayder-taif',
  'apple-center-amiriya',
  'almass-mobile',
  'alawhad-mobile',
  'aalam-alqalaa',
  'nineteen89-rest',
  'alsifa-company',
  'sham-couture',
  'fink-factory',
  'apple-store-98h',
  'center-alsaa',
  'morvo-handmade',
  'mustafa-store',
  'rg-team-iq3','rg-team-iq','ironman-babel','az-supps',
  'almass-mobile','mobaelk','apple-center-amiriya','a-center-kirkuk',
  'accessories-iq','shams-golden1','kn-fashion-woman','razan-accessories2'
])

export const STORE_BRANDS: Record<string, StoreBrand> = {
  laya: {
    key:'laya',mark:'L',kicker:'BRAND LAYA  /  WOMEN’S COLLECTION',
    title:'أناقتك تبدأ من التفاصيل',
    description:'حقائب وأحذية نسائية تجمع بين الذوق العملي والحضور الأنيق. استفسري عن الموديلات والألوان المتاحة مباشرة من LAYA.',
    artLabel:'THE ART OF DETAILS',artTitle:'A QUIETER KIND OF LUXURY',
    categories:[
      {id:'حقائب',label:'الحقائب',description:'اختيارات تكمل إطلالتك اليومية والمميزة',icon:'bag'},
      {id:'أحذية',label:'الأحذية',description:'تفاصيل أنيقة للراحة والحضور',icon:'shoe'}
    ],
    features:[
      {title:'توصيل لكل العراق',description:'التوصيل متاح إلى جميع المحافظات',icon:'truck'},
      {title:'دفع إلكتروني',description:'تأكيد طريقة الدفع قبل إتمام الطلب',icon:'credit'},
      {title:'تأكيد التفاصيل',description:'اسألي عن اللون والموديل المتوفر قبل الطلب',icon:'check'}
    ],
    catalogTitle:'تشكيلة LAYA',catalogIntro:'للاطلاع على الحقائب والأحذية المتوفرة حالياً، تواصلي مع فريق LAYA ليشاركك الصور والتفاصيل المعتمدة.',catalogAction:'اطلبي صور التشكيلة المتوفرة',
    specLabels:{"composition":"الخامة","width":"المقاس","weight":"الوزن","stretch":"اللون","opacity":"التفاصيل الداخلية","finish":"الإغلاق","care":"العناية","use":"التنسيق"}
  },
  njom: {
    key:'njom',mark:'N',kicker:'ALNJOOM  /  MOBILE CENTER',
    title:'كل ما يحتاجه هاتفك في مكان واحد',
    description:'مكتب النجوم لبيع وشراء الهواتف، والإكسسوارات، وخدمات الصيانة والبرمجة. استفسر عن الجهاز أو الخدمة قبل زيارتك.',
    artLabel:'DEVICES  ·  ACCESSORIES  ·  SERVICE',artTitle:'YOUR PHONE, WELL TAKEN CARE OF',
    categories:[
      {id:'هواتف',label:'الهواتف',description:'بيع وشراء الأجهزة والاستفسار عن الموديلات',icon:'phone'},
      {id:'إكسسوارات',label:'الإكسسوارات',description:'مستلزمات واستخدامات يومية للهاتف',icon:'accessory'},
      {id:'صيانة',label:'الصيانة والبرمجة',description:'خدمات فنية وبرمجية للأجهزة',icon:'repair'}
    ],
    features:[
      {title:'بيع وشراء',description:'استفسر عن الأجهزة الجديدة والمستعملة',icon:'phone'},
      {title:'زين كاش',description:'وسيلة دفع متاحة لدى المكتب',icon:'credit'},
      {title:'موقع واضح',description:'البصرة – الجزائر، قرب جامع الموسوي',icon:'pin'}
    ],
    catalogTitle:'الأجهزة والخدمات',catalogIntro:'تختلف الأجهزة والموديلات والتوفر. تواصل مع مكتب النجوم لمعرفة الموجود فعلياً والسعر الحالي.',catalogAction:'استفسر عن الأجهزة المتوفرة',
    specLabels:{"composition":"الشركة المصنعة","width":"سعة التخزين","weight":"الذاكرة","stretch":"الشبكة","opacity":"حالة الجهاز","finish":"المزايا","care":"الضمان","use":"التفاصيل"}
  },
  lna: {
    key:'lna',mark:'ل',kicker:'LNA COMPANY  /  MOBILE & TECHNOLOGY',
    title:'اختيار هاتفك يبدأ من جهة موثوقة',
    description:'شركة لنا للهواتف بالجملة والمفرد، والأقساط، والإكسسوارات، والصيانة. اسأل عن الموديل والسعر وخيارات الضمان قبل الشراء.',
    artLabel:'MOBILE  ·  ACCESSORIES  ·  CARE',artTitle:'TECHNOLOGY, MADE CLEAR',
    categories:[
      {id:'موبايلات',label:'الموبايلات',description:'خيارات الهواتف بالجملة والمفرد',icon:'phone'},
      {id:'إكسسوارات',label:'الإكسسوارات',description:'إضافات ومستلزمات الهواتف',icon:'accessory'},
      {id:'صيانة',label:'الصيانة',description:'خدمات صيانة للأجهزة',icon:'repair'}
    ],
    features:[
      {title:'جملة ومفرد',description:'خيارات شراء تناسب الأفراد والتجار',icon:'store'},
      {title:'خيارات أقساط',description:'استفسر عن شروط الأقساط المتاحة',icon:'installment'},
      {title:'ضمان معتمد سنة',description:'ضمان لمدة سنة وفق شروط الوكيل',icon:'warranty'}
    ],
    catalogTitle:'منتجات وخدمات شركة لنا',catalogIntro:'لأن الأسعار والتوفر يتغيران حسب الموديل، اطلب القائمة الحالية من فريق المبيعات أو الإكسسوارات.',catalogAction:'تواصل مع المبيعات',
    specLabels:{"composition":"الشركة المصنعة","width":"سعة التخزين","weight":"الذاكرة","stretch":"الشبكة","opacity":"حالة الجهاز","finish":"المزايا","care":"الضمان","use":"التفاصيل"}
  },
  scoop: {
    key:'scoop',mark:'S',kicker:'SCOOPER  /  MEN’S WEAR',
    title:'أسلوب واضح. حضور يترك أثره.',
    description:'ملابس رجالية بإطلالات يومية وعملية. اختر القسم الذي تبحث عنه واسأل فريق SCOOPER عن المقاسات والقطع المتاحة.',
    artLabel:'SCOOPER MEN’S WEAR',artTitle:'BUILT AROUND YOUR STYLE',
    categories:[
      {id:'قمصان',label:'القمصان',description:'قطع أساسية لإطلالة مرتبة',icon:'shirt'},
      {id:'تيشيرتات',label:'التيشيرتات',description:'خيارات يومية سهلة التنسيق',icon:'shirt'},
      {id:'إطلالات',label:'الإطلالات',description:'نسّق أكثر من قطعة بأسلوبك',icon:'style'}
    ],
    features:[
      {title:'ملابس رجالية',description:'تشكيلة مخصصة لإطلالات الرجال',icon:'shirt'},
      {title:'زيارة المتجر',description:'الغزالية – وسط شارع البدالة',icon:'pin'},
      {title:'أوقات العمل',description:'يومياً من 10 صباحاً إلى 11 مساءً',icon:'clock'}
    ],
    catalogTitle:'تشكيلة SCOOPER',catalogIntro:'للحصول على صور القطع والمقاسات المتوفرة فعلياً، تواصل مع المتجر قبل الزيارة.',catalogAction:'استفسر عن المقاسات والقطع',
    specLabels:{"composition":"الخامة","width":"المقاس","weight":"سماكة القماش","stretch":"اللون","opacity":"تفاصيل القطعة","finish":"القصة والتصميم","care":"العناية","use":"التنسيق"}
  },
  mukhtar: {
    key:'mukhtar',mark:'M',kicker:'MUKHTAR  /  MEN’S COLLECTION',
    title:'الرواية بدأت للتو',
    description:'مساحة للأزياء الرجالية بقطع سهلة التنسيق وتفاصيل مدروسة. تواصل مع MUKHTAR لمعرفة التشكيلة والمقاسات المتاحة.',
    artLabel:'MUKHTAR  ·  THE STORY CONTINUES',artTitle:'A NEW CHAPTER IN YOUR STYLE',
    categories:[
      {id:'قمصان',label:'القمصان',description:'أساسيات الإطلالة الرجالية',icon:'shirt'},
      {id:'بولو',label:'البولو',description:'إطلالة مرتبة بطابع يومي',icon:'polo'},
      {id:'إطلالات',label:'الإطلالات',description:'تنسيقات تجمع القطع معاً',icon:'style'}
    ],
    features:[
      {title:'أزياء رجالية',description:'تشكيلة للستايل اليومي والمرتب',icon:'shirt'},
      {title:'موقع المتجر',description:'بغداد – الحرية، ڤينيسيا مول',icon:'pin'},
      {title:'تواصل مباشر',description:'استفسر عن القياسات والقطع المتاحة',icon:'check'}
    ],
    catalogTitle:'الفصل الجديد من MUKHTAR',catalogIntro:'اكتشف القطع المتاحة حالياً عبر التواصل مع المتجر، مع تأكيد القياس والتفاصيل قبل الزيارة.',catalogAction:'اسأل عن التشكيلة',
    specLabels:{"composition":"الخامة","width":"المقاس","weight":"سماكة القماش","stretch":"اللون","opacity":"تفاصيل القطعة","finish":"القصة والتصميم","care":"العناية","use":"التنسيق"}
  },
  "hayder-taif": {"key":"hayder-taif","mark":"HT","kicker":"أقمشة حيدر طائف","title":"الخامة التي تختارها تصنع الفرق","description":"اكتشف الأقمشة الرجالية والنسائية وأقمشة المناسبات والمنزل مع معلومات عن الملمس والعرض واللون والاستخدام.","artLabel":"أقمشة حيدر طائف","artTitle":"خامات وأقمشة","categories":[{"id":"أقمشة رجالية","label":"أقمشة رجالية","description":"تصفح أقمشة رجالية وتفاصيل المجموعة","icon":"fabric"},{"id":"أقمشة نسائية","label":"أقمشة نسائية","description":"تصفح أقمشة نسائية وتفاصيل المجموعة","icon":"fabric"},{"id":"أقمشة مناسبات","label":"أقمشة مناسبات","description":"تصفح أقمشة مناسبات وتفاصيل المجموعة","icon":"fabric"},{"id":"أقمشة منزلية","label":"أقمشة منزلية","description":"تصفح أقمشة منزلية وتفاصيل المجموعة","icon":"fabric"}],"features":[{"title":"اختيار الخامة","description":"تعرف على نوع القماش وملمسه","icon":"check"},{"title":"تفاصيل المتر","description":"عرض اللون والمقاس والسعر بوضوح","icon":"check"},{"title":"تواصل مباشر","description":"استفسر عن الألوان والكميات المتاحة","icon":"pin"}],"catalogTitle":"تشكيلة أقمشة حيدر طائف","catalogIntro":"نموذج عرض أولي مخصص لـ أقمشة حيدر طائف. الصور والأسماء والأسعار أمثلة تصميمية قابلة للاستبدال بالبيانات المعتمدة من صاحب النشاط.","catalogAction":"استكشف التشكيلة","specLabels":{"composition":"الخامة","width":"عرض القماش","weight":"الوزن","stretch":"اللون","opacity":"الكثافة","finish":"الملمس والنقشة","care":"العناية","use":"الاستخدام"}},
  "apple-center-amiriya": {"key":"apple-center-amiriya","mark":"AC","kicker":"APPLE CENTER العامرية","title":"اعرف جهازك قبل أن تختاره","description":"استعرض أجهزة آيفون وأجهزة أبل والإكسسوارات مع مساحة واضحة للموديل والسعة وحالة الجهاز والفحص والضمان.","artLabel":"APPLE CENTER العامرية","artTitle":"أجهزة آيفون وإكسسوارات","categories":[{"id":"هواتف آيفون","label":"هواتف آيفون","description":"تصفح هواتف آيفون وتفاصيل المجموعة","icon":"phone"},{"id":"أجهزة أبل","label":"أجهزة أبل","description":"تصفح أجهزة أبل وتفاصيل المجموعة","icon":"tablet"},{"id":"إكسسوارات","label":"إكسسوارات","description":"تصفح إكسسوارات وتفاصيل المجموعة","icon":"accessory"}],"features":[{"title":"تفاصيل الجهاز","description":"السعة والحالة والمواصفات في صفحة واحدة","icon":"phone"},{"title":"الفحص والضمان","description":"مساحة واضحة لشرح الفحص وشروط الضمان","icon":"check"},{"title":"تواصل مباشر","description":"اسأل عن الجهاز قبل زيارة المركز","icon":"pin"}],"catalogTitle":"تشكيلة Apple Center العامرية","catalogIntro":"نموذج عرض أولي مخصص لـ Apple Center العامرية. الصور والأسماء والأسعار أمثلة تصميمية قابلة للاستبدال بالبيانات المعتمدة من صاحب النشاط.","catalogAction":"استكشف التشكيلة","specLabels":{"composition":"الشركة المصنعة","width":"السعة والموديل","weight":"الذاكرة","stretch":"اللون","opacity":"حالة الجهاز","finish":"المزايا والفحص","care":"الضمان والاستبدال","use":"تفاصيل الجهاز"}},
  "almass-mobile": {"key":"almass-mobile","mark":"◇","kicker":"الماس ستور","title":"كل التقنية في مساحة واحدة","description":"كتالوج تقني يجمع الهواتف والأجهزة اللوحية والصوتيات والأجهزة الذكية وملحقات الشحن بتجربة منظمة.","artLabel":"الماس ستور","artTitle":"هواتف وإلكترونيات","categories":[{"id":"هواتف وأجهزة لوحية","label":"هواتف وأجهزة لوحية","description":"تصفح هواتف وأجهزة لوحية وتفاصيل المجموعة","icon":"phone"},{"id":"صوتيات","label":"صوتيات","description":"تصفح صوتيات وتفاصيل المجموعة","icon":"audio"},{"id":"أجهزة ذكية","label":"أجهزة ذكية","description":"تصفح أجهزة ذكية وتفاصيل المجموعة","icon":"smartwatch"},{"id":"ملحقات وشحن","label":"ملحقات وشحن","description":"تصفح ملحقات وشحن وتفاصيل المجموعة","icon":"accessory"}],"features":[{"title":"كتالوج تقني","description":"جمع الفئات والأجهزة في مكان واحد","icon":"phone"},{"title":"مواصفات أوضح","description":"التفاصيل والمقارنة قبل الاستفسار","icon":"check"},{"title":"التواصل والمبيعات","description":"الوصول السريع لفريق المتجر","icon":"pin"}],"catalogTitle":"تشكيلة الماس ستور","catalogIntro":"نموذج عرض أولي مخصص لـ الماس ستور. الصور والأسماء والأسعار أمثلة تصميمية قابلة للاستبدال بالبيانات المعتمدة من صاحب النشاط.","catalogAction":"استكشف التشكيلة","specLabels":{"composition":"العلامة التجارية","width":"الموديل والسعة","weight":"الأداء","stretch":"اللون","opacity":"الحالة","finish":"المزايا","care":"الضمان","use":"التوافق"}},
  "alawhad-mobile": {"key":"alawhad-mobile","mark":"O","kicker":"الأوحد للهواتف النقالة","title":"اختيارك يبدأ من التفاصيل","description":"واجهة عملية للهواتف والإكسسوارات والصوتيات تساعد الزبون على تصفح الخيارات ومراجعة تفاصيل الجهاز.","artLabel":"الأوحد للهواتف النقالة","artTitle":"هواتف وإكسسوارات","categories":[{"id":"هواتف","label":"هواتف","description":"تصفح هواتف وتفاصيل المجموعة","icon":"phone"},{"id":"إكسسوارات","label":"إكسسوارات","description":"تصفح إكسسوارات وتفاصيل المجموعة","icon":"accessory"},{"id":"صوتيات","label":"صوتيات","description":"تصفح صوتيات وتفاصيل المجموعة","icon":"audio"}],"features":[{"title":"كتالوج الهواتف","description":"تصفح الأجهزة بحسب القسم","icon":"phone"},{"title":"مقارنة التفاصيل","description":"السعة والحالة واللون في صفحة المنتج","icon":"check"},{"title":"معلومات الزيارة","description":"الموقع وأوقات العمل والتواصل","icon":"pin"}],"catalogTitle":"تشكيلة الأوحد للهواتف النقالة","catalogIntro":"نموذج عرض أولي مخصص لـ الأوحد للهواتف النقالة. الصور والأسماء والأسعار أمثلة تصميمية قابلة للاستبدال بالبيانات المعتمدة من صاحب النشاط.","catalogAction":"استكشف التشكيلة","specLabels":{"composition":"الشركة المصنعة","width":"السعة","weight":"الذاكرة","stretch":"اللون","opacity":"حالة الجهاز","finish":"المزايا","care":"الضمان","use":"التوافق"}},
  "aalam-alqalaa": {"key":"aalam-alqalaa","mark":"CW","kicker":"CASTLE WORLD  ·  عالم القلعة","title":"تقنية تثق بها… واختيار أسهل","description":"من الهواتف والأجهزة الذكية إلى الصوتيات والطاقة والملحقات، اكتشف مجموعة عالم القلعة وتواصل لتأكيد السعر والتوفر.","artLabel":"CASTLE WORLD  /  SINCE 2004","artTitle":"أجهزة أصلية · ضمان واضح","categories":[{"id":"الهواتف والأجهزة اللوحية","label":"الهواتف والأجهزة اللوحية","description":"هواتف وأجهزة لوحية وملحقاتها","icon":"phone"},{"id":"الكمبيوتر ومستلزماته","label":"الكمبيوتر ومستلزماته","description":"حواسيب وشبكات وملحقات","icon":"computer"},{"id":"الأجهزة القابلة للارتداء","label":"الساعات والأجهزة القابلة للارتداء","description":"ساعات ذكية وأساور وملحقاتها","icon":"smartwatch"},{"id":"الصوتيات","label":"الصوتيات","description":"سماعات ومكبرات صوت وميكروفونات","icon":"audio"},{"id":"الطاقة والشحن","label":"الطاقة والشحن","description":"بنوك طاقة وشواحن وكيابل","icon":"power"},{"id":"المنزل والحياة الذكية","label":"المنزل والحياة الذكية","description":"أجهزة منزلية ومنتجات ذكية","icon":"home"},{"id":"إلكترونيات السيارة والتنقل","label":"إلكترونيات السيارة والتنقل","description":"كاميرات سيارة وملحقات وتنقل ذكي","icon":"car"}],"features":[{"title":"منذ 2004","description":"خبرة في الأجهزة الإلكترونية والملحقات","icon":"check"},{"title":"ضمان ذهبي","description":"سنة استبدال بجهاز جديد عند وجود خلل مصنعي وفق الشروط","icon":"warranty"},{"title":"خدمة لكل العراق","description":"خمسة فروع في بغداد وتوصيل للمحافظات","icon":"truck"},{"title":"مسابقات وهدايا أسبوعية","description":"تابع حساب عالم القلعة لمعرفة الجديد","icon":"gift"}],"catalogTitle":"تشكيلة عالم القلعة","catalogIntro":"تصفح الهواتف والأجهزة الذكية والصوتيات والشحن والملحقات. السعر والتوفر النهائيان يؤكدان مع فريق المتجر.","catalogAction":"اكتشف المنتجات","specLabels":{"composition":"العلامة التجارية","width":"الموديل","weight":"المواصفات والسعة","stretch":"اللون","opacity":"الحالة","finish":"المزايا","care":"الضمان","use":"التوافق"}},
  "nineteen89-rest": {"key":"nineteen89-rest","mark":"89","kicker":"1989 RESTAURANT","title":"لقمتك المفضلة تبدأ من هنا","description":"منيو مصور للبرغر والساندويشات والأطباق الجانبية ووجبات الدجاج مع عرض واضح للأصناف والتفاصيل.","artLabel":"1989 RESTAURANT","artTitle":"برغر وسندويشات","categories":[{"id":"برغر","label":"برغر","description":"تصفح برغر وتفاصيل المجموعة","icon":"burger"},{"id":"ساندويشات","label":"ساندويشات","description":"تصفح ساندويشات وتفاصيل المجموعة","icon":"sandwich"},{"id":"أطباق جانبية","label":"أطباق جانبية","description":"تصفح أطباق جانبية وتفاصيل المجموعة","icon":"food"},{"id":"وجبات دجاج","label":"وجبات دجاج","description":"تصفح وجبات دجاج وتفاصيل المجموعة","icon":"food"}],"features":[{"title":"منيو مصور","description":"صورة وتفاصيل لكل صنف","icon":"food"},{"title":"اختيار أسهل","description":"الأصناف مرتبة بحسب الفئة","icon":"check"},{"title":"التواصل والطلب","description":"طريقة مباشرة للاستفسار عن الطلب","icon":"pin"}],"catalogTitle":"تشكيلة 1989 Restaurant","catalogIntro":"نموذج عرض أولي مخصص لـ 1989 Restaurant. الصور والأسماء والأسعار أمثلة تصميمية قابلة للاستبدال بالبيانات المعتمدة من صاحب النشاط.","catalogAction":"استكشف التشكيلة","specLabels":{"composition":"المكونات","width":"حجم الوجبة","weight":"الوزن","stretch":"الخيارات","opacity":"مسببات الحساسية","finish":"طريقة التقديم","care":"تعليمات الحفظ","use":"ملاحظات الطلب"}},
  "alsifa-company": {"key":"alsifa-company","mark":"S","kicker":"شركة إخوان الصفا","title":"مواد المشروع من مصدر واحد","description":"كتالوج منظم للمواد الإنشائية والمواد الصحية والأصباغ ومستلزمات التركيب لعرض المواصفات والمقاسات والكميات.","artLabel":"شركة إخوان الصفا","artTitle":"مواد إنشائية وصحية وأصباغ","categories":[{"id":"مواد إنشائية","label":"مواد إنشائية","description":"تصفح مواد إنشائية وتفاصيل المجموعة","icon":"construction"},{"id":"مواد صحية","label":"مواد صحية","description":"تصفح مواد صحية وتفاصيل المجموعة","icon":"sanitary"},{"id":"أصباغ ودهانات","label":"أصباغ ودهانات","description":"تصفح أصباغ ودهانات وتفاصيل المجموعة","icon":"paint"},{"id":"مستلزمات تركيب","label":"مستلزمات تركيب","description":"تصفح مستلزمات تركيب وتفاصيل المجموعة","icon":"tools"}],"features":[{"title":"تصنيف المنتجات","description":"الوصول إلى نوع المادة بسرعة","icon":"construction"},{"title":"المواصفات والمقاسات","description":"معلومات منظمة قبل الشراء","icon":"check"},{"title":"استفسار المشاريع","description":"تسهيل طلب الأسعار والكميات","icon":"pin"}],"catalogTitle":"تشكيلة شركة إخوان الصفا","catalogIntro":"نموذج عرض أولي مخصص لـ شركة إخوان الصفا. الصور والأسماء والأسعار أمثلة تصميمية قابلة للاستبدال بالبيانات المعتمدة من صاحب النشاط.","catalogAction":"استكشف التشكيلة","specLabels":{"composition":"الخامة أو التركيب","width":"المقاس","weight":"الوزن","stretch":"اللون أو التشطيب","opacity":"المواصفات","finish":"الملحقات","care":"التنظيف والصيانة","use":"مجال الاستخدام"}},
  "sham-couture": {"key":"sham-couture","mark":"SC","kicker":"SHAM COUTURE","title":"أناقة تُروى بالتفاصيل","description":"مساحة أزياء تحريرية للفساتين والعبايات والأطقم والإكسسوارات تبرز الصور والخامات والقصّات والمقاسات.","artLabel":"SHAM COUTURE","artTitle":"أزياء وتصاميم Couture","categories":[{"id":"فساتين","label":"فساتين","description":"تصفح فساتين وتفاصيل المجموعة","icon":"dress"},{"id":"عبايات","label":"عبايات","description":"تصفح عبايات وتفاصيل المجموعة","icon":"abaya"},{"id":"أطقم وإطلالات","label":"أطقم وإطلالات","description":"تصفح أطقم وإطلالات وتفاصيل المجموعة","icon":"fashion"},{"id":"إكسسوارات","label":"إكسسوارات","description":"تصفح إكسسوارات وتفاصيل المجموعة","icon":"accessory"}],"features":[{"title":"عرض التصاميم","description":"صور مرتبة لكل تصميم","icon":"fashion"},{"title":"المقاسات والتفاصيل","description":"توضيح الخامة والقياس واللون","icon":"check"},{"title":"تواصل مباشر","description":"استفسري عن التصميم المتوفر","icon":"pin"}],"catalogTitle":"تشكيلة SHAM Couture","catalogIntro":"نموذج عرض أولي مخصص لـ SHAM Couture. الصور والأسماء والأسعار أمثلة تصميمية قابلة للاستبدال بالبيانات المعتمدة من صاحب النشاط.","catalogAction":"استكشف التشكيلة","specLabels":{"composition":"الخامة","width":"المقاس","weight":"سماكة القماش","stretch":"اللون","opacity":"تفاصيل التصميم","finish":"القصة والتطريز","care":"العناية والغسيل","use":"المناسبة والتنسيق"}},
  "fink-factory": {"key":"fink-factory","mark":"F","kicker":"FINK FACTORY","title":"الفن يأخذ مساحته الخاصة","description":"معرض بصري للمنحوتات والقطع الفنية والأعمال الجدارية والتنفيذ الخاص يبرز الخامة والأبعاد والتشطيب.","artLabel":"FINK FACTORY","artTitle":"منحوتات وقطع فنية","categories":[{"id":"منحوتات فنية","label":"منحوتات فنية","description":"تصفح منحوتات فنية وتفاصيل المجموعة","icon":"sculpture"},{"id":"قطع ديكور","label":"قطع ديكور","description":"تصفح قطع ديكور وتفاصيل المجموعة","icon":"decor"},{"id":"أعمال جدارية","label":"أعمال جدارية","description":"تصفح أعمال جدارية وتفاصيل المجموعة","icon":"wall"},{"id":"تنفيذ خاص","label":"تنفيذ خاص","description":"تصفح تنفيذ خاص وتفاصيل المجموعة","icon":"custom"}],"features":[{"title":"معرض الأعمال","description":"عرض بصري لكل منحوتة","icon":"sculpture"},{"title":"تفاصيل الخامة","description":"الأبعاد والخامة والتشطيب","icon":"check"},{"title":"الأعمال الخاصة","description":"استقبال الاستفسارات عن التنفيذ","icon":"pin"}],"catalogTitle":"تشكيلة FINK Factory","catalogIntro":"نموذج عرض أولي مخصص لـ FINK Factory. الصور والأسماء والأسعار أمثلة تصميمية قابلة للاستبدال بالبيانات المعتمدة من صاحب النشاط.","catalogAction":"استكشف التشكيلة","specLabels":{"composition":"الخامة","width":"الأبعاد","weight":"الوزن","stretch":"الألوان","opacity":"أسلوب العمل","finish":"التشطيب","care":"العناية","use":"المكان المقترح"}},
  "apple-store-98h": {"key":"apple-store-98h","mark":"A","kicker":"مركز ابل ستور","title":"التقنية بأوضح تفاصيلها","description":"استعرض أجهزة آيفون وآيباد وساعات أبل والسماعات والإكسسوارات في واجهة هادئة تركز على الموديل والمواصفات.","artLabel":"مركز ابل ستور","artTitle":"أجهزة أبل والهواتف والإكسسوارات","categories":[{"id":"هواتف آيفون","label":"هواتف آيفون","description":"تصفح هواتف آيفون وتفاصيل المجموعة","icon":"phone"},{"id":"أجهزة آيباد","label":"أجهزة آيباد","description":"تصفح أجهزة آيباد وتفاصيل المجموعة","icon":"tablet"},{"id":"إكسسوارات أبل","label":"إكسسوارات أبل","description":"تصفح إكسسوارات أبل وتفاصيل المجموعة","icon":"accessory"},{"id":"ساعات وسماعات","label":"ساعات وسماعات","description":"تصفح ساعات وسماعات وتفاصيل المجموعة","icon":"audio"}],"features":[{"title":"الأجهزة والموديلات","description":"قائمة مرتبة وسهلة المقارنة","icon":"phone"},{"title":"الفحص والضمان","description":"عرض حالة الجهاز والضمان بوضوح","icon":"warranty"},{"title":"خيارات المبادلة","description":"مساحة لشرح مبادلة الأجهزة","icon":"check"}],"catalogTitle":"تشكيلة مركز ابل ستور","catalogIntro":"نموذج عرض أولي مخصص لـ مركز ابل ستور. الصور والأسماء والأسعار أمثلة تصميمية قابلة للاستبدال بالبيانات المعتمدة من صاحب النشاط.","catalogAction":"استكشف التشكيلة","specLabels":{"composition":"الشركة المصنعة","width":"السعة","weight":"الذاكرة","stretch":"اللون","opacity":"حالة الجهاز","finish":"الفحص والملحقات","care":"الضمان","use":"تفاصيل الجهاز"}},
  "center-alsaa": {"key":"center-alsaa","mark":"S","kicker":"مركز الساعة","title":"تفاصيل ترافق وقتك","description":"واجهة بوتيك تجمع الساعات والأجهزة والإكسسوارات بصور واضحة وتفاصيل سهلة الوصول لكل منتج.","artLabel":"مركز الساعة","artTitle":"أجهزة وإكسسوارات","categories":[{"id":"أجهزة","label":"أجهزة","description":"تصفح أجهزة وتفاصيل المجموعة","icon":"phone"},{"id":"إكسسوارات","label":"إكسسوارات","description":"تصفح إكسسوارات وتفاصيل المجموعة","icon":"accessory"},{"id":"ساعات ذكية","label":"ساعات ذكية","description":"تصفح ساعات ذكية وتفاصيل المجموعة","icon":"smartwatch"}],"features":[{"title":"كتالوج منظم","description":"تقسيم المنتجات بحسب الفئة","icon":"check"},{"title":"تفاصيل المنتج","description":"عرض المواصفات والصور","icon":"phone"},{"title":"تواصل مع المركز","description":"استفسار مباشر عن المتوفر","icon":"pin"}],"catalogTitle":"تشكيلة مركز الساعة","catalogIntro":"نموذج عرض أولي مخصص لـ مركز الساعة. الصور والأسماء والأسعار أمثلة تصميمية قابلة للاستبدال بالبيانات المعتمدة من صاحب النشاط.","catalogAction":"استكشف التشكيلة","specLabels":{"composition":"العلامة التجارية","width":"الموديل","weight":"المواصفات","stretch":"اللون","opacity":"حالة المنتج","finish":"المزايا","care":"الضمان","use":"التوافق"}},
  "morvo-handmade": {"key":"morvo-handmade","mark":"M","kicker":"MORVO HANDMADE","title":"أشياء تحمل أثر اليد","description":"معرض دافئ للقطع اليدوية والديكور والهدايا والإكسسوارات والطلبات الخاصة يبرز الخامة والتشطيب والتفاصيل.","artLabel":"MORVO HANDMADE","artTitle":"منتجات وقطع يدوية","categories":[{"id":"قطع يدوية","label":"قطع يدوية","description":"تصفح قطع يدوية وتفاصيل المجموعة","icon":"handmade"},{"id":"ديكور وهدايا","label":"ديكور وهدايا","description":"تصفح ديكور وهدايا وتفاصيل المجموعة","icon":"gift"},{"id":"إكسسوارات","label":"إكسسوارات","description":"تصفح إكسسوارات وتفاصيل المجموعة","icon":"accessory"},{"id":"طلبات خاصة","label":"طلبات خاصة","description":"تصفح طلبات خاصة وتفاصيل المجموعة","icon":"custom"}],"features":[{"title":"عرض القطع","description":"معرض لكل قطعة وتفاصيلها","icon":"handmade"},{"title":"العمل اليدوي","description":"إظهار الخامة والتشطيب","icon":"check"},{"title":"طلبات خاصة","description":"تواصل حول القطع المخصصة","icon":"pin"}],"catalogTitle":"تشكيلة MORVO Handmade","catalogIntro":"نموذج عرض أولي مخصص لـ MORVO Handmade. الصور والأسماء والأسعار أمثلة تصميمية قابلة للاستبدال بالبيانات المعتمدة من صاحب النشاط.","catalogAction":"استكشف التشكيلة","specLabels":{"composition":"الخامة","width":"الأبعاد","weight":"الوزن","stretch":"اللون","opacity":"تفاصيل القطعة","finish":"التشطيب اليدوي","care":"العناية","use":"طريقة الاستخدام"}},
  "mustafa-store": {"key":"mustafa-store","mark":"M","kicker":"مركز مصطفى ستور · الموصل","title":"تقنية تختارها بثقة ووضوح","description":"هواتف وأجهزة وإكسسوارات وخدمات صيانة في مكان واحد. تصفح الخيارات وتواصل مع المركز لتأكيد الموديل والسعر والتوفر وخيارات الأقساط.","artLabel":"MUSTAFA STORE · MOBILE & CARE","artTitle":"SMARTER CHOICES. BETTER CARE.","categories":[{"id":"هواتف آيفون","label":"هواتف آيفون","description":"الموديلات والسعات والتفاصيل","icon":"phone"},{"id":"هواتف أندرويد","label":"هواتف أندرويد","description":"استكشف خيارات أجهزة أندرويد","icon":"phone"},{"id":"إكسسوارات وحماية","label":"إكسسوارات وحماية","description":"ملحقات وحماية وتغذية الطاقة","icon":"accessory"},{"id":"صوتيات وأجهزة ذكية","label":"الصوتيات والأجهزة الذكية","description":"سماعات وملحقات الاستخدام اليومي","icon":"audio"}],"features":[{"title":"بيع وشراء الهواتف","description":"استفسر عن خيارات الأجهزة الجديدة والمستعملة","icon":"phone"},{"title":"صيانة وعناية","description":"تواصل لمعرفة خدمات الصيانة المتاحة","icon":"repair"},{"title":"خيارات الأقساط","description":"اسأل عن الشروط والتفاصيل المعتمدة لدى المركز","icon":"check"}],"catalogTitle":"أجهزة وإكسسوارات مصطفى ستور","catalogIntro":"هذه معاينة أولية؛ أسماء المنتجات وصورها توضيحية. تواصل مع المركز لتأكيد الموديل والسعة والحالة والسعر والتوفر الفعلي.","catalogAction":"استفسر عن الجهاز المتوفر","specLabels":{"composition":"العلامة التجارية","width":"الموديل والسعة","weight":"الذاكرة والتخزين","stretch":"اللون","opacity":"حالة الجهاز","finish":"المزايا والفحص","care":"الضمان والشروط","use":"التوافق والتفاصيل"}}
}

type ProspectBrandConfig = {
  key: string; mark: string; kicker: string; title: string; description: string;
  artLabel: string; artTitle: string;
  categories: Array<[string,string,string]>;
  features: Array<[string,string,string]>;
  catalogTitle: string; catalogIntro: string; catalogAction: string;
  specLabels: StoreBrand['specLabels'];
}
const makeProspectBrand = (config: ProspectBrandConfig): StoreBrand => ({
  key: config.key, mark: config.mark, kicker: config.kicker,
  title: config.title, description: config.description,
  artLabel: config.artLabel, artTitle: config.artTitle,
  categories: config.categories.map(([label,description,icon]) => ({id:label,label,description,icon})),
  features: config.features.map(([title,description,icon]) => ({title,description,icon})),
  catalogTitle: config.catalogTitle, catalogIntro: config.catalogIntro, catalogAction: config.catalogAction,
  specLabels: config.specLabels,
})
const commonTechSpecs: StoreBrand['specLabels'] = {
  composition:'الشركة المصنعة',width:'الموديل',weight:'الذاكرة والسعة',stretch:'اللون',
  opacity:'الحالة',finish:'المميزات',care:'الضمان',use:'التوافق والتفاصيل'
}
const commonFashionSpecs: StoreBrand['specLabels'] = {
  composition:'الخامة',width:'المقاس',weight:'القياسات',stretch:'اللون',
  opacity:'تفاصيل القطعة',finish:'التصميم والتشطيب',care:'العناية',use:'التنسيق'
}
const commonAccessorySpecs: StoreBrand['specLabels'] = {
  composition:'الخامة',width:'المقاس أو الطول',weight:'الوزن',stretch:'اللون',
  opacity:'تفاصيل القطعة',finish:'التشطيب',care:'العناية',use:'الاستخدام'
}
const commonSupplementSpecs: StoreBrand['specLabels'] = {
  composition:'المكونات',width:'وزن العبوة',weight:'عدد الحصص',stretch:'النكهة',
  opacity:'معلومات الملصق',finish:'الشركة المصنعة',care:'تعليمات الاستخدام',use:'تفاصيل المنتج'
}
const PROSPECT_STORE_BRANDS: Record<string, StoreBrand> = {
  'rg-team-iq3': makeProspectBrand({
    key:'rg-team-iq3',mark:'RG',kicker:'RG TEAM · SPORTS NUTRITION',
    title:'اختياراتك الرياضية في مكان واحد',
    description:'تصفح البروتين والكرياتين ومنتجات ما قبل التمرين والملحقات الرياضية ضمن أقسام واضحة.',
    artLabel:'SPORTS NUTRITION',artTitle:'YOUR TRAINING ESSENTIALS',
    categories:[
      ['بروتين','مساحيق البروتين والأحجام والنكهات','custom'],
      ['كرياتين','منتجات الكرياتين وتفاصيل العبوة','custom'],
      ['قبل التمرين','منتجات ما قبل التمرين ومعلوماتها','custom'],
      ['قوارير رياضية','قوارير وأدوات حمل المشروبات','accessory']
    ],
    features:[
      ['تفاصيل العبوة','راجع الوزن والمكونات على الملصق','check'],
      ['اختيارات واضحة','كل فئة في مكانها','package'],
      ['تأكيد التوفر','السعر والنكهة يؤكدان مع المتجر','message']
    ],
    catalogTitle:'منتجات RG Team',catalogIntro:'تصفح فئات التغذية الرياضية والملحقات. الأسعار والأحجام والنكهات تعتمد من المتجر قبل الطلب.',catalogAction:'استفسر عن المنتجات',
    specLabels:commonSupplementSpecs
  }),
  'rg-team-iq': makeProspectBrand({
    key:'rg-team-iq',mark:'RG',kicker:'RG TEAM · SPORTS NUTRITION',
    title:'اختياراتك الرياضية في مكان واحد',
    description:'تصفح البروتين والكرياتين ومنتجات ما قبل التمرين والملحقات الرياضية ضمن أقسام واضحة.',
    artLabel:'SPORTS NUTRITION',artTitle:'YOUR TRAINING ESSENTIALS',
    categories:[
      ['بروتين','مساحيق البروتين والأحجام والنكهات','custom'],
      ['كرياتين','منتجات الكرياتين وتفاصيل العبوة','custom'],
      ['قبل التمرين','منتجات ما قبل التمرين ومعلوماتها','custom'],
      ['قوارير رياضية','قوارير وأدوات حمل المشروبات','accessory']
    ],
    features:[
      ['تفاصيل العبوة','راجع الوزن والمكونات على الملصق','check'],
      ['اختيارات واضحة','كل فئة في مكانها','package'],
      ['تأكيد التوفر','السعر والنكهة يؤكدان مع المتجر','message']
    ],
    catalogTitle:'منتجات RG Team',catalogIntro:'تصفح فئات التغذية الرياضية والملحقات. الأسعار والأحجام والنكهات تعتمد من المتجر قبل الطلب.',catalogAction:'استفسر عن المنتجات',
    specLabels:commonSupplementSpecs
  }),
  'ironman-babel': makeProspectBrand({
    key:'ironman-babel',mark:'IM',kicker:'IRONMAN BABEL · SPORTS NUTRITION',
    title:'جهّز احتياجاتك الرياضية بسهولة',
    description:'مساحة مرتبة لاستكشاف البروتين والكرياتين ومنتجات ما قبل التمرين والقوارير الرياضية.',
    artLabel:'TRAINING ESSENTIALS',artTitle:'BUILT AROUND YOUR ROUTINE',
    categories:[
      ['بروتين','منتجات البروتين وأحجام العبوات','custom'],
      ['كرياتين','الكرياتين وتفاصيل العبوة','custom'],
      ['قبل التمرين','منتجات ما قبل التمرين','custom'],
      ['قوارير رياضية','قوارير وأدوات رياضية','accessory']
    ],
    features:[
      ['فئات مرتبة','تنقل مباشر بين أنواع المنتجات','layers'],
      ['معلومات المنتج','تفاصيل العبوة قبل الاختيار','info'],
      ['تأكيد مباشر','السعر والتوفر من المتجر','message']
    ],
    catalogTitle:'تشكيلة Ironman Babel',catalogIntro:'تصفح فئات المكملات والملحقات الرياضية، وتأكد من المنتج والحجم المتاح قبل الشراء.',catalogAction:'استفسر عن التوفر',
    specLabels:commonSupplementSpecs
  }),
  'az-supps': makeProspectBrand({
    key:'az-supps',mark:'AZ',kicker:'AZ SUPPS · SUPPLEMENTS',
    title:'مكملاتك بتفاصيل أوضح',
    description:'اكتشف فئات البروتين والكرياتين والفيتامينات وأوميغا 3، مع معلومات العبوة بشكل منظم.',
    artLabel:'SUPPLEMENT COLLECTION',artTitle:'CLEAR PRODUCT DETAILS',
    categories:[
      ['بروتين','مساحيق البروتين والأحجام','custom'],
      ['كرياتين','منتجات الكرياتين','custom'],
      ['فيتامينات متعددة','مكملات الفيتامينات ومعلومات الملصق','custom'],
      ['أوميغا 3','مكملات زيت السمك وتفاصيل العبوة','custom']
    ],
    features:[
      ['معلومات العبوة','المكونات والوزن حسب الملصق','info'],
      ['عرض منظم','الفئات والمنتجات مرتبة','layers'],
      ['قبل الطلب','تأكد من التركيبة والتوفر','check']
    ],
    catalogTitle:'منتجات AZ Supps',catalogIntro:'تصفح الفئات، وراجع المكونات وعدد الحصص وتعليمات الشركة المصنعة على العبوة.',catalogAction:'استفسر عن المنتج',
    specLabels:commonSupplementSpecs
  }),
  'almass-mobile': makeProspectBrand({
    key:'almass-mobile',mark:'A',kicker:'ALMASS STORE · MOBILE & TECH',
    title:'أجهزتك وملحقاتك في مكان واحد',
    description:'تصفح هواتف iPhone وSamsung وأجهزة iPad والسماعات وملحقات الشحن ضمن تجربة واضحة.',
    artLabel:'MOBILE · DEVICES · ACCESSORIES',artTitle:'TECHNOLOGY MADE SIMPLE',
    categories:[
      ['هواتف iPhone','أجهزة iPhone وإصداراتها','phone'],
      ['هواتف Samsung','هواتف Samsung Galaxy','phone'],
      ['أجهزة iPad','الأجهزة اللوحية من Apple','tablet'],
      ['سماعات وصوتيات','سماعات لاسلكية وصوتيات','audio'],
      ['شواحن وباور بانك','الشواحن وبنوك الطاقة والكوابل','power']
    ],
    features:[
      ['حسب الموديل','اختر الجهاز ثم راجع الإصدار','phone'],
      ['مواصفات واضحة','السعة واللون والتوافق','info'],
      ['تأكيد قبل الشراء','السعر والتوفر والضمان مع المتجر','check']
    ],
    catalogTitle:'أجهزة وإكسسوارات الماس',catalogIntro:'استكشف الهواتف والأجهزة والسماعات والشواحن، وتأكد من الموديل والسعة والتوفر قبل الطلب.',catalogAction:'استفسر عن جهاز',
    specLabels:commonTechSpecs
  }),
  'mobaelk': makeProspectBrand({
    key:'mobaelk',mark:'M',kicker:'MOBAELK · MOBILE CENTER',
    title:'كل ما تحتاجه لهاتفك',
    description:'تصفح الهواتف والأجهزة اللوحية والسماعات وملحقات الشحن في أقسام سهلة الوصول.',
    artLabel:'MOBILE · AUDIO · ACCESSORIES',artTitle:'YOUR EVERYDAY TECH',
    categories:[
      ['هواتف iPhone','هواتف iPhone وإصداراتها','phone'],
      ['هواتف Samsung','هواتف Samsung Galaxy','phone'],
      ['أجهزة iPad','الأجهزة اللوحية','tablet'],
      ['سماعات وصوتيات','السماعات والصوتيات','audio'],
      ['شواحن وباور بانك','الشواحن والباور بانك','power']
    ],
    features:[
      ['اعرف الموديل','تفاصيل الجهاز قبل الاختيار','phone'],
      ['ملحقات أساسية','الشحن والصوتيات في أقسام مستقلة','plug'],
      ['تأكيد السعر','اسأل عن التوفر والسعر الحالي','message']
    ],
    catalogTitle:'أجهزة وملحقات موبايلي يمي',catalogIntro:'اختر فئة الجهاز أو الملحق، ثم تواصل لتأكيد الموديل والسعة والسعر والتوفر.',catalogAction:'اسأل عن جهاز',
    specLabels:commonTechSpecs
  }),
  'apple-center-amiriya': makeProspectBrand({
    key:'apple-center-amiriya',mark:'',kicker:'APPLE CENTER · AL AMIRIYA',
    title:'اكتشف عالم Apple',
    description:'استعرض أجهزة iPhone وiPad وMac وApple Watch وAirPods ضمن واجهة منظمة.',
    artLabel:'APPLE DEVICES',artTitle:'A CONNECTED DEVICE EXPERIENCE',
    categories:[
      ['هواتف iPhone','أجهزة iPhone','phone'],
      ['أجهزة iPad','أجهزة iPad اللوحية','tablet'],
      ['أجهزة Mac','أجهزة MacBook','computer'],
      ['Apple Watch','الساعات الذكية','watch'],
      ['AirPods وملحقات','السماعات والملحقات','audio']
    ],
    features:[
      ['حسب الإصدار','راجع الجيل والموديل','info'],
      ['السعة واللون','اختر المواصفات المتاحة','check'],
      ['تأكيد الضمان','الضمان حسب شروط المركز','shield']
    ],
    catalogTitle:'أجهزة Apple',catalogIntro:'تصفح فئات أجهزة Apple، وتأكد من الإصدار والسعة واللون والضمان قبل الطلب.',catalogAction:'استفسر عن جهاز',
    specLabels:commonTechSpecs
  }),
  'mustafa-store': makeProspectBrand({
    key:'mustafa-store',mark:'M',kicker:'MUSTAFA CENTER · MOSUL',
    title:'هواتف وأجهزة وخدمات في مكان واحد',
    description:'تصفح الهواتف والأجهزة اللوحية والسماعات، واستكشف خدمات الصيانة المتاحة من المركز.',
    artLabel:'MOBILE · ACCESSORIES · SERVICE',artTitle:'TECH SUPPORT FOR EVERYDAY LIFE',
    categories:[
      ['هواتف iPhone','هواتف iPhone','phone'],
      ['هواتف Android','هواتف Android','phone'],
      ['أجهزة لوحية','أجهزة لوحية','tablet'],
      ['سماعات وصوتيات','السماعات والصوتيات','audio'],
      ['خدمات الصيانة','خدمات صيانة الهواتف','repair']
    ],
    features:[
      ['هواتف وأجهزة','استكشف الفئات المتاحة','phone'],
      ['صيانة الهواتف','اسأل عن نوع الخدمة','repair'],
      ['تأكيد السعر','السعر والتوفر بعد الاستفسار','message']
    ],
    catalogTitle:'الأجهزة والخدمات',catalogIntro:'تصفح الهواتف والأجهزة والملحقات، واستفسر عن خدمة الصيانة المناسبة.',catalogAction:'تواصل مع المركز',
    specLabels:commonTechSpecs
  }),
  'a-center-kirkuk': makeProspectBrand({
    key:'a-center-kirkuk',mark:'A',kicker:'A CENTER · KIRKUK',
    title:'خيارات التقنية بواجهة أسهل',
    description:'استكشف الهواتف والأجهزة اللوحية والسماعات وملحقات الشحن ضمن تصنيفات واضحة.',
    artLabel:'TECHNOLOGY · MOBILE · ACCESSORIES',artTitle:'THE RIGHT DEVICE, CLEARLY',
    categories:[
      ['هواتف iPhone','أجهزة iPhone','phone'],
      ['هواتف Samsung','هواتف Samsung Galaxy','phone'],
      ['أجهزة iPad','الأجهزة اللوحية','tablet'],
      ['سماعات وصوتيات','السماعات والصوتيات','audio'],
      ['شواحن وباور بانك','الشحن والباور بانك','power']
    ],
    features:[
      ['اختيار أسرع','ابدأ من فئة الجهاز','phone'],
      ['تفاصيل الجهاز','الموديل والسعة واللون','info'],
      ['استفسار مباشر','تحقق من السعر والتوفر','message']
    ],
    catalogTitle:'أجهزة وملحقات A Center',catalogIntro:'تصفح الهواتف والأجهزة والسماعات والشواحن، وتأكد من تفاصيل الموديل قبل الطلب.',catalogAction:'استفسر عن جهاز',
    specLabels:commonTechSpecs
  }),
  'accessories-iq': makeProspectBrand({
    key:'accessories-iq',mark:'D',kicker:'DIAMOND ACCESSORIES',
    title:'تفاصيل تكمل أناقتك',
    description:'اكتشفي الأحذية والحقائب والقلائد ضمن أقسام بسيطة وصور واضحة.',
    artLabel:'ACCESSORIES & STYLE',artTitle:'THE DETAILS THAT COMPLETE YOU',
    categories:[
      ['أحذية نسائية','أحذية وموديلات نسائية','shoe'],
      ['حقائب','حقائب تكمل الإطلالة','bag'],
      ['قلائد وسلاسل','قطع ناعمة للهدايا والإطلالات','custom']
    ],
    features:[
      ['المقاس واللون','راجعي المقاسات والألوان','check'],
      ['تفاصيل القطعة','صورة ووصف لكل منتج','info'],
      ['تأكيد الطلب','التوفر والسعر مع المتجر','message']
    ],
    catalogTitle:'تشكيلة Diamond Accessories',catalogIntro:'تصفحي الأحذية والحقائب والقلائد، وتأكدي من المقاس واللون والتفاصيل قبل الطلب.',catalogAction:'اسألي عن قطعة',
    specLabels:commonFashionSpecs
  }),
  'shams-golden1': makeProspectBrand({
    key:'shams-golden1',mark:'S',kicker:'SHAMS GOLDEN · ACCESSORIES',
    title:'لمسة تكمّل إطلالتك',
    description:'تصفحي القلائد والأقراط والأساور والساعات وإكسسوارات الشعر ضمن تشكيلة مرتبة.',
    artLabel:'JEWELRY & ACCESSORIES',artTitle:'A SOFTER KIND OF GOLD',
    categories:[
      ['قلائد وسلاسل','قلائد وسلاسل بتفاصيل مختلفة','custom'],
      ['أقراط','أقراط يومية ومناسبات','custom'],
      ['أساور وخواتم','قطع متناسقة وتفاصيل ناعمة','custom'],
      ['ساعات','ساعات نسائية','watch'],
      ['إكسسوارات شعر','ربطات ومشابك شعر','accessory']
    ],
    features:[
      ['تفاصيل القطعة','الخامة والمقاس حسب المنتج','info'],
      ['تشكيلة متنوعة','الأقسام مرتبة حسب النوع','layers'],
      ['تأكيد التوفر','اللون والسعر قبل الطلب','check']
    ],
    catalogTitle:'إكسسوارات شمس',catalogIntro:'اختاري نوع القطعة من الأقسام، ثم راجعي التفاصيل واللون والتوفر قبل الطلب.',catalogAction:'استفسري عن قطعة',
    specLabels:commonAccessorySpecs
  }),
  'kn-fashion-woman': makeProspectBrand({
    key:'kn-fashion-woman',mark:'KN',kicker:'KN FASHION WOMAN',
    title:'أناقتك تبدأ من اختيارك',
    description:'اكتشفي الفساتين والأطقم والملابس اليومية والحقائب والأحذية ضمن تصفح واضح.',
    artLabel:'WOMENSWEAR COLLECTION',artTitle:'STYLE IN EVERY DETAIL',
    categories:[
      ['فساتين','فساتين للمناسبات والإطلالات اليومية','dress'],
      ['أطقم نسائية','أطقم بتنسيقات متكاملة','fashion'],
      ['ملابس يومية','قطع عملية للاستخدام اليومي','fashion'],
      ['حقائب','حقائب نسائية','bag'],
      ['أحذية','أحذية تكمل الإطلالة','shoe']
    ],
    features:[
      ['المقاسات','راجعي المقاس قبل الطلب','check'],
      ['الألوان','تأكدي من اللون المتوفر','palette'],
      ['اختيارات مرتبة','تصفح حسب نوع القطعة','layers']
    ],
    catalogTitle:'تشكيلة KN Fashion Woman',catalogIntro:'تصفحي الفساتين والأطقم والملابس اليومية والحقائب والأحذية، ثم أكدي المقاس واللون مع المتجر.',catalogAction:'اسألي عن التشكيلة',
    specLabels:commonFashionSpecs
  }),
  'razan-accessories2': makeProspectBrand({
    key:'razan-accessories2',mark:'R',kicker:'RAZAN ACCESSORIES',
    title:'اختاري التفاصيل التي تشبهك',
    description:'تصفحي القلائد والأقراط والساعات والحقائب والأطقم ضمن أقسام سهلة وواضحة.',
    artLabel:'JEWELRY & DAILY ACCESSORIES',artTitle:'SMALL DETAILS, PERSONAL STYLE',
    categories:[
      ['قلائد وسلاسل','قلائد وسلاسل نسائية','custom'],
      ['أقراط','أقراط يومية ومناسبات','custom'],
      ['ساعات','ساعات نسائية','watch'],
      ['حقائب','حقائب وإكسسوارات نسائية','bag'],
      ['أساور وخواتم','أساور وخواتم بتفاصيل مختلفة','custom']
    ],
    features:[
      ['اختيار القطعة','انتقلي مباشرة للقسم المطلوب','layers'],
      ['صور وتفاصيل','راجعي كل قطعة قبل الاختيار','info'],
      ['تأكيد التوفر','السعر واللون مع المتجر','check']
    ],
    catalogTitle:'تشكيلة رزان للإكسسوارات',catalogIntro:'تصفحي القلائد والأقراط والساعات والحقائب والأساور والخواتم، وتأكدي من التفاصيل قبل الطلب.',catalogAction:'استفسري عن قطعة',
    specLabels:commonAccessorySpecs
  }),
}

export const getStoreBrand=(key?:string):StoreBrand=>PROSPECT_STORE_BRANDS[key||'']||STORE_BRANDS[key||'']||STORE_BRANDS.laya
