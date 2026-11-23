import type { Category, Product, ProductFaq, SiteRoute } from '@/types'
import rawCategories from '../../../../golden-data/categories.json'
import rawProducts from '../../../../golden-data/products.json'
import { sanitizeCategories, sanitizeProducts } from '@/lib/sanitize'

export const fallbackCategories: Category[] = sanitizeCategories(rawCategories)
export const fallbackProducts: Product[] = sanitizeProducts(rawProducts as unknown[])
export const fallbackRoutes: SiteRoute[] = [
 { id:'home', label:'الرئيسية', path:'/', header:true },
 { id:'catalog', label:'المنتجات', path:'/catalog', header:true },
 { id:'new', label:'وصل حديثاً', path:'/catalog?sort=newest', header:false },
 { id:'favorites', label:'المفضلة', path:'/favorites', header:false },
 { id:'about', label:'من نحن', path:'/about', header:true },
 { id:'guide', label:'دليل الجمال', path:'/fabric-guide', header:true },
 { id:'contact', label:'تواصلي معنا', path:'/contact', header:true },
 { id:'tracking', label:'تتبع الطلب', path:'/order-tracking', header:false },
 { id:'policies', label:'السياسات', path:'/policies', header:false },
]
export const governorates = ['بغداد','البصرة','نينوى','أربيل','النجف','كربلاء','الأنبار','ديالى','كركوك','صلاح الدين','واسط','بابل','ذي قار','ميسان','المثنى','القادسية','دهوك','السليمانية']
export const guideQuestions: ProductFaq[] = [
 {question:'كيف أختار المنتج المناسب؟',answer:'راجعي فئة المنتج ووصفه والمكونات وطريقة الاستخدام، واسألي المتجر عن أي تفصيل غير واضح.'},
 {question:'كيف أختار درجة المكياج؟',answer:'قارني صور الخيارات المتاحة واطلبي تأكيد الدرجة من المتجر قبل إتمام الطلب.'},
 {question:'ما الذي أراجعه في منتجات العناية؟',answer:'اقرئي قائمة المكونات والتحذيرات وتعليمات الاستخدام، وتحققي من ملاءمتها لاحتياجك.'},
 {question:'كيف أعرف حجم العبوة؟',answer:'يُضاف الحجم الفعلي ضمن تفاصيل المنتج عند اعتماد بياناته.'},
 {question:'هل المنتج متوفر؟',answer:'يتغير التوفر حسب المخزون؛ يؤكده المتجر عند مراجعة طلبك.'},
]
export const trustItems = [
 {title:'تفاصيل واضحة',description:'معلومات المنتج قبل الطلب',icon:'check'},
 {title:'فئات مرتبة',description:'مكياج وعناية وعطور',icon:'sparkles'},
 {title:'سلة منظمة',description:'اجمعي اختياراتك بسهولة',icon:'wallet'},
 {title:'تأكيد المتجر',description:'السعر والتوفر قبل التجهيز',icon:'message'},
] as const
export const homeStory = {title:'الجمال في تفاصيله',text:'Golden Cosmetics تجربة تسوق رقمية تجمع المكياج والعناية والعطور ضمن فئات واضحة وخطوات طلب بسيطة.'}
export interface QuickGuideAnswer {question:string;answers:string[]}
export const quickGuideAnswers: QuickGuideAnswer[] = [
 {question:'كيف أختار منتج العناية؟',answers:['راجعي المكونات وتعليمات العبوة.','تحققي من ملاءمته لاحتياجك.','اسألي المتجر عن أي تفصيل غير موضح.']},
 {question:'كيف أختار درجة المكياج؟',answers:['قارني الخيارات المتاحة في الصور.','راجعي وصف الدرجة واللون.','أكدي الخيار مع المتجر قبل الطلب.']},
 {question:'ما الذي أراجعه قبل شراء العطر؟',answers:['اطلبي وصف الرائحة والمكونات المتاحة.','تأكدي من حجم العبوة.','راجعي السعر والتوفر قبل التأكيد.']},
 {question:'كيف أستخدم المنتج؟',answers:['اتبعي التعليمات المكتوبة على العبوة.','لا تستخدمي المنتج عند وجود تحذير لا يناسبك.','تواصلي مع المتجر عند الحاجة للتوضيح.']},
 {question:'كيف أتأكد من تفاصيل الطلب؟',answers:['راجعي الاسم والكمية والخيارات.','أدخلي رقم الهاتف والعنوان بدقة.','انتظري تأكيد المتجر للسعر والتوفر.']},
]
