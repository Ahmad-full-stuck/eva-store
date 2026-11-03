import type { Category, Product, ProductFaq, SiteRoute } from '@/types'
import rawCategories from '../../../../data/categories.json'
import rawProducts from '../../../../data/products.json'
import { sanitizeCategories, sanitizeProducts } from '@/lib/sanitize'

const isHidden = (value: unknown): boolean =>
  Boolean(value) && typeof value === 'object' && (value as { hidden?: unknown }).hidden === true

export const fallbackCategories: Category[] = sanitizeCategories(rawCategories)

export const fallbackProducts: Product[] = sanitizeProducts((rawProducts as unknown[]).filter((item) => !isHidden(item)))

export const fallbackRoutes: SiteRoute[] = [
  { id: 'home', label: 'الرئيسية', path: '/', header: true },
  { id: 'catalog', label: 'الأجهزة', path: '/catalog', header: true },
  { id: 'new', label: 'وصل حديثاً', path: '/catalog', header: true },
  { id: 'favorites', label: 'المفضلة', path: '/favorites', header: false },
  { id: 'about', label: 'من نحن', path: '/about', header: true },
  { id: 'guide', label: 'دليل الأجهزة', path: '/fabric-guide', header: true },
  { id: 'contact', label: 'تواصلي معنا', path: '/contact', header: false },
  { id: 'tracking', label: 'تتبع الطلب', path: '/order-tracking', header: false },
  { id: 'policies', label: 'السياسات', path: '/policies', header: false },
]

export const governorates = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'الأنبار', 'ديالى',
  'كركوك', 'صلاح الدين', 'واسط', 'بابل', 'ذي قار', 'ميسان', 'المثنى', 'القادسية', 'دهوك', 'السليمانية',
]

export const guideQuestions: ProductFaq[] = [
  { question: 'كيف أختار الهاتف المناسب؟', answer: 'ابدأ من استخدامك وميزانيتك، ثم قارن المعالج والسعة والذاكرة والكاميرا والبطارية.' },
  { question: 'ما السعة التخزينية التي أحتاجها؟', answer: 'اختر السعة وفق عدد التطبيقات والصور ومقاطع الفيديو والملفات التي تحتفظ بها.' },
  { question: 'ما أهمية RAM؟', answer: 'تؤثر الذاكرة العشوائية في تعدد المهام وسلاسة التنقل بين التطبيقات، وتختلف الحاجة حسب استخدامك.' },
  { question: 'هل كل نسخة تدعم 5G؟', answer: 'قد تختلف الشبكات حسب النسخة والمنطقة، لذلك تأكد من رقم الموديل ومواصفاته قبل الشراء.' },
  { question: 'ماذا أراجع قبل تأكيد الطلب؟', answer: 'تأكد من السعة واللون وحالة الجهاز والملحقات والضمان والسعر النهائي.' },
]

export const trustItems = [
  { title: 'مواصفات واضحة', description: 'تفاصيل كل جهاز', icon: 'check' },
  { title: 'خيارات متعددة', description: 'هواتف وأجهزة وإكسسوارات', icon: 'layers' },
  { title: 'طلب منظم', description: 'اختياراتك في مكان واحد', icon: 'shopping-bag' },
  { title: 'تواصل مباشر', description: 'عبر حساب الشركة الرسمي', icon: 'message' },
] as const

export const homeStory = {
  title: 'تقنية تستحق اختياراً واثقاً',
  text: 'رتاج العربي تجمع الهواتف الذكية والأجهزة والإكسسوارات في تجربة رقمية منظمة، مع تفاصيل تساعدك على المقارنة قبل إرسال طلبك.',
}

export interface QuickGuideAnswer {
  question: string
  answers: string[]
}

export const quickGuideAnswers: QuickGuideAnswer[] = [
  { question: 'كيف أختار المعالج؟', answers: ['حدّد استخدامك الأساسي أولاً.', 'قارن أداء المعالج مع فئة الجهاز.', 'ابحث عن مراجعات مستقلة عند المقارنة.'] },
  { question: 'كم مساحة التخزين المناسبة؟', answers: ['128GB للاستخدام المعتدل عند ملاءمتها لاحتياجك.', '256GB أو أكثر لمن يحتفظ بصور وفيديوهات كثيرة.', 'تأكد من السعة الفعلية للنسخة المعروضة.'] },
  { question: 'كيف أقارن الكاميرات؟', answers: ['لا تعتمد على عدد الميجابكسل وحده.', 'راجع جودة التصوير الليلي والتثبيت والفيديو.', 'قارن عينات صور ملتقطة بالجهاز نفسه.'] },
  { question: 'ما الذي أراجعه في البطارية؟', answers: ['قارن سعة البطارية وكفاءة المعالج.', 'تأكد من قدرة الشحن وتوافق الشاحن.', 'راجع حالة البطارية في الأجهزة المستعملة.'] },
  { question: 'هل أحتاج إلى 5G؟', answers: ['تحقق من دعم النسخة للشبكات المحلية.', 'تأكد من توافق رقم الموديل مع المنطقة.', 'قد تختلف مواصفات الشبكة حسب الإصدار.'] },
  { question: 'ماذا أتأكد منه قبل الشراء؟', answers: ['حالة الجهاز جديد أو مستعمل.', 'السعة واللون والملحقات الأصلية.', 'السعر النهائي وشروط الضمان والاستبدال.'] },
]
