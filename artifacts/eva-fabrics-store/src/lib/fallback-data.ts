import type { Category, Product, ProductFaq, SiteRoute } from '@/types'
import rawCategories from '../../../../data/categories.json'
import rawProducts from '../../../../data/products.json'
import { sanitizeCategories, sanitizeProducts } from '@/lib/sanitize'

const fabricImages = ['fabrics/hero.jpg', 'fabrics/rose.jpg', 'fabrics/blue.jpg', 'fabrics/emerald.jpg']

export const fallbackCategories: Category[] = sanitizeCategories(rawCategories)

export const fallbackProducts: Product[] = sanitizeProducts(rawProducts)

export const fallbackRoutes: SiteRoute[] = [
  { id: 'home', label: 'الرئيسية', path: '/', header: true },
  { id: 'catalog', label: 'الأقمشة', path: '/catalog', header: true },
  { id: 'new', label: 'وصل حديثاً', path: '/catalog?sort=newest', header: true },
  { id: 'favorites', label: 'المفضلة', path: '/favorites', header: false },
  { id: 'about', label: 'من نحن', path: '/about', header: true },
  { id: 'guide', label: 'دليل الأقمشة', path: '/fabric-guide', header: true },
  { id: 'contact', label: 'تواصلي معنا', path: '/contact', header: false },
  { id: 'tracking', label: 'تتبع الطلب', path: '/order-tracking', header: false },
  { id: 'policies', label: 'السياسات', path: '/policies', header: false },
]

export const governorates = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'الأنبار', 'ديالى',
  'كركوك', 'صلاح الدين', 'واسط', 'بابل', 'ذي قار', 'ميسان', 'المثنى', 'القادسية', 'دهوك', 'السليمانية',
]

export const guideQuestions: ProductFaq[] = [
  { question: 'كيف أختار القماش المناسب؟', answer: 'ابدئي من الاستخدام: القماش اليومي يحتاج خامة خفيفة ومريحة، بينما المناسبات قد تحتاج وزناً وثباتاً ولمعة. راجعي المرونة والشفافية والعرض قبل الشراء.' },
  { question: 'ما الفرق بين المطاطي وغير المطاطي؟', answer: 'المطاطي يحتوي على نسبة إيلاستان أو سبانديكس، فيتمدد ويعود إلى شكله. غير المطاطي أكثر ثباتاً ومناسب للقطع ذات البنية الواضحة. التسمية في المتجر تعتمد على المرونة الفعلية للتصميم.' },
  { question: 'كيف أعرف العرض المناسب؟', answer: 'العرض هو قياس القماش من حافة إلى حافة، وهو مكتوب في مواصفات كل منتج. كلما زاد العرض قل القماش المطلوب للقطعة الواحدة.' },
  { question: 'كيف أحدد الكمية؟', answer: 'للقطعة البسيجة غالباً تحتاجين بين 2 و2.5 متر، وللعباءة بين 3 و4 أمتار. أضيفي هامشاً بسيطاً للقص والخياطة، ويمكن الطلب بنصف متر.' },
  { question: 'كيف أقرأ وصف اللون؟', answer: 'الصور تمثل نموذجاً بصرياً للخامة. قارني اللون مع الإضاءة المحيطة والقطع المشابهة، وتواصلي معنا إذا كان اللون حساساً لمشروعك.' },
]

export const trustItems = [
  { title: 'توصيل لكل العراق', description: 'جميع المحافظات', icon: 'truck' },
  { title: 'توصيل ٥ آلاف دينار', description: 'رسوم ثابتة', icon: 'wallet' },
  { title: 'دعم عبر واتساب', description: 'قبل وبعد الطلب', icon: 'message' },
  { title: 'اختيار واعٍ', description: 'مواصفات واضحة', icon: 'check' },
] as const

export const homeStory = {
  title: 'أقمشة تستحق الاختيار الواثق',
  text: 'إيفا ستور مساحة عراقية تجمع بين تشكيلة متنوعة وشرح واضح للّمس والامتداد واللون، لتسهيل قرارك قبل طلب المتر.',
}

export interface QuickGuideAnswer {
  question: string
  answers: string[]
}

export const quickGuideAnswers: QuickGuideAnswer[] = [
  {
    question: 'كم متر أحتاج لفستان؟',
    answers: [
      'فستان بسيط بدون أكمام: بين ٢ و٢٫٥ متر.',
      'فستان بأكمام أو بطانة: ٣ أمتار كبداية آمنة.',
      'القماش عريض ١٥٠ سم يقلّل الكمية نصف متر تقريباً.',
    ],
  },
  {
    question: 'ما الفرق بين الكريب والتويل؟',
    answers: [
      'الكريب سطحه مطفي بملمس حبيبي خفيف ويستقيم بسرعة.',
      'التويل نسيجه قطري أوضح وأثبت في البنية، وأنسب للبناطيل.',
      'للّباس اليومي الكريب أهدأ، وللّباس الرسمي التويل أنظف.',
    ],
  },
  {
    question: 'هل أحتاج إلى بطانة؟',
    answers: [
      'إذا كان حقل الشفافية «شفاف» أو «نصف شفاف» فنعم.',
      'الأقمشة الفاتحة والخفيفة تحتاج بطانة دائماً.',
      'المخمل والكريب الثقيل لا يحتاجان بطانة.',
    ],
  },
  {
    question: 'كيف أختبر المرونة قبل الشراء؟',
    answers: [
      'اسحبي القماش بين إصبعين: المطاطي يعود إلى مكانه فوراً.',
      'المرونة الخفيفة تعود ببطء، وغير المطاطي يقاوم السحب أصلاً.',
      'راجع حقل «المرونة» في صفحة المنتج قبل تأكيد الطلب.',
    ],
  },
  {
    question: 'كم متراً أحتاج لعباءة؟',
    answers: [
      'العباءة المستقيمة: بين ٣ و٤ أمتار.',
      'الأكمام الواسعة أو التراكيب: أضيفي نصف متر.',
      'احسبي هامش قص ١٠ سم دائماً قبل تأكيد الكمية.',
    ],
  },
  {
    question: 'كيف أعتني بالقماش المطرز؟',
    answers: [
      'تنظيف جاف أو غسيل يدوي بماء فاتر مع قلب القطعة.',
      'تجنّبي المجفف وخطافات الأثاث لحماية التطريز.',
      'جففيه مفروداً بعيداً عن الشمس المباشرة.',
    ],
  },
]

export { fabricImages }
