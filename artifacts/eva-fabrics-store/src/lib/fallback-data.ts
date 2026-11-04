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
  { id: 'guide', label: 'دليل الأجهزة', path: '/device-guide', header: true },
  { id: 'contact', label: 'تواصل معنا', path: '/contact', header: false },
  { id: 'tracking', label: 'تتبع الطلب', path: '/order-tracking', header: false },
  { id: 'policies', label: 'السياسات', path: '/policies', header: false },
]

export const governorates = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'الأنبار', 'ديالى',
  'كركوك', 'صلاح الدين', 'واسط', 'بابل', 'ذي قار', 'ميسان', 'المثنى', 'القادسية', 'دهوك', 'السليمانية',
]

export const guideQuestions: ProductFaq[] = [
  { question: 'كيف أختار كاميرا المراقبة المناسبة؟', answer: 'ابدأ بتحديد مكان التركيب، ثم راجع طريقة الاتصال والدقة والتخزين والميزات المدعومة في موديل الكاميرا نفسه.' },
  { question: 'ما الفرق بين الكاميرا الداخلية والخارجية؟', answer: 'الاختلاف يتعلق بظروف الاستخدام والحماية من العوامل الخارجية. لا تركّب كاميرا داخلية في الخارج ما لم يذكر وصف الموديل أنها مناسبة لذلك.' },
  { question: 'هل كل الكاميرات تعمل عبر Wi‑Fi؟', answer: 'لا. بعض الموديلات لاسلكية، وأخرى تحتاج اتصالاً سلكياً أو جهاز تسجيل متوافقاً. راجع تفاصيل الجهاز قبل الاختيار.' },
  { question: 'هل التخزين مشمول مع الكاميرا؟', answer: 'قد تحتاج إلى بطاقة ذاكرة أو جهاز NVR أو قرص صلب منفصل. تحقق من محتويات المنتج ونوع التخزين المدعوم.' },
  { question: 'هل يمكن ربط كاميرات مختلفة معاً؟', answer: 'يعتمد ذلك على نظام التسجيل وطريقة الاتصال والتوافق بين الموديلات. اسألنا عن الأجهزة المحددة قبل شراء نظام متكامل.' },
]

export const trustItems = [
  { title: 'تفاصيل حسب الموديل', description: 'راجع مواصفات الجهاز نفسه', icon: 'check' },
  { title: 'تأكيد التوفر', description: 'قبل تثبيت الطلب', icon: 'message' },
  { title: 'مساعدة في التوافق', description: 'الكاميرات وأجهزة التسجيل', icon: 'message' },
  { title: 'اختيار حسب المكان', description: 'استخدام داخلي أو خارجي', icon: 'check' },
] as const

export const homeStory = {
  title: 'حلول مراقبة واضحة لاختيار أكثر اطمئناناً',
  text: 'تقدم لَمْحة أجهزة مراقبة وحماية ذكية مع معلومات تساعدك على مقارنة الموديلات وفهم متطلبات الاتصال والتخزين قبل الطلب.',
}

export interface QuickGuideAnswer {
  question: string
  answers: string[]
}

export const quickGuideAnswers: QuickGuideAnswer[] = [
  { question: 'أين سأركّب الكاميرا؟', answers: ['حدّد إن كان المكان داخلياً أو خارجياً.', 'راجع ملاءمة الموديل لظروف المكان.', 'انتبه إلى مجال الرؤية وموقع الطاقة والاتصال.'] },
  { question: 'كيف تتصل الكاميرا؟', answers: ['تحقق من دعم Wi‑Fi أو الاتصال السلكي.', 'تأكد من توفر الشبكة والطاقة قرب مكان التركيب.', 'راجع التوافق مع جهاز التسجيل إن كنت تستخدمه.'] },
  { question: 'أين تُحفظ التسجيلات؟', answers: ['بعض الموديلات تدعم بطاقة ذاكرة.', 'قد يتطلب النظام جهاز NVR وقرصاً صلباً.', 'تحقق مما إذا كانت وسيلة التخزين مرفقة أو منفصلة.'] },
  { question: 'ما الميزات التي أحتاجها؟', answers: ['راجع الدقة وزاوية الرؤية حسب الموديل.', 'تحقق من الرؤية الليلية والتنبيه بالحركة إن كانت مهمة لك.', 'الصوت الثنائي والميزات الإضافية ليست متاحة في كل موديل.'] },
]
