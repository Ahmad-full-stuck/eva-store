export type BrandCategory = { id: string; label: string; description: string; icon: string }
export type StoreBrand = {
  key: string; mark: string; kicker: string; title: string; description: string;
  artLabel: string; artTitle: string; categories: BrandCategory[];
  features: { title: string; description: string; icon: string }[];
  catalogTitle: string; catalogIntro: string; catalogAction: string;
  specLabels: { composition:string; width:string; weight:string; stretch:string; opacity:string; finish:string; care:string; use:string };
}
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
  }
}
export const getStoreBrand=(key?:string):StoreBrand=>STORE_BRANDS[key||'']||STORE_BRANDS.laya
