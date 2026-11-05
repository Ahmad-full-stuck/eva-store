import type { Category, ProductFaq, SiteRoute } from '@/types'

export const fallbackCategories: Category[] = [
  { id: 'featured', slug: 'featured', name: 'مختاراتنا', description: 'تشكيلة منتقاة بعناية', image: '', accent: '#a77a5b' },
  { id: 'new', slug: 'new', name: 'وصل حديثاً', description: 'أحدث إضافات المتجر', image: '', accent: '#8b765d' },
  { id: 'essentials', slug: 'essentials', name: 'الأساسيات', description: 'اختيارات للاستخدام اليومي', image: '', accent: '#687b85' },
]

export const fallbackProducts = []

export const fallbackRoutes: SiteRoute[] = [
  { id: 'home', label: 'الرئيسية', path: '/', header: true },
  { id: 'catalog', label: 'المنتجات', path: '/catalog', header: true },
  { id: 'new', label: 'وصل حديثاً', path: '/catalog?sort=newest', header: true },
  { id: 'favorites', label: 'المفضلة', path: '/favorites', header: false },
  { id: 'about', label: 'من نحن', path: '/about', header: true },
  { id: 'contact', label: 'تواصل معنا', path: '/contact', header: true },
  { id: 'tracking', label: 'تتبع الطلب', path: '/order-tracking', header: false },
  { id: 'policies', label: 'السياسات', path: '/policies', header: false },
]

export const governorates = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'الأنبار', 'ديالى',
  'كركوك', 'صلاح الدين', 'واسط', 'بابل', 'ذي قار', 'ميسان', 'المثنى', 'القادسية', 'دهوك', 'السليمانية',
]

export const guideQuestions: ProductFaq[] = [
  { question: 'كيف أختار المنتج المناسب؟', answer: 'ابدأ من الاستخدام الذي تحتاجه، ثم قارن الصور والتفاصيل والمقاسات قبل تأكيد الطلب.' },
  { question: 'هل الصور تمثل الموديل نفسه؟', answer: 'تعرض هذه النسخة نماذج أولية توضيحية. يؤكد المتجر الموديل الفعلي واللون والتوفر قبل إتمام الشراء.' },
  { question: 'كيف أتأكد من المقاس أو التوافق؟', answer: 'راجع التفاصيل المكتوبة ثم تواصل مع المتجر لتأكيد المقاس أو التوافق مع احتياجك.' },
  { question: 'هل يمكن تعديل الطلب؟', answer: 'يمكن إرسال ملاحظة مع الطلب، وسيتواصل المتجر معك لتأكيد التفاصيل قبل التجهيز.' },
]

export const trustItems = [
  { title: 'تفاصيل واضحة', description: 'معلومات قبل الشراء', icon: 'check' },
  { title: 'اختيارات متنوعة', description: 'تصفح منظم وسهل', icon: 'layers' },
  { title: 'تواصل مباشر', description: 'إجابة عن استفساراتك', icon: 'message' },
  { title: 'طلب منظم', description: 'مراجعة قبل التأكيد', icon: 'truck' },
] as const

export const homeStory = {
  title: 'تجربة تسوق تبدأ من التفاصيل',
  text: 'تجربة تجمع المنتجات والمعلومات ووسائل التواصل في واجهة واحدة، لتجعل اختيارك وطلبك أكثر وضوحاً.',
}

export interface QuickGuideAnswer {
  question: string
  answers: string[]
}

export const quickGuideAnswers: QuickGuideAnswer[] = [
  { question: 'كيف أختار الموديل؟', answers: ['ابدأ من الاستخدام اليومي أو المناسبة.', 'قارن الصور والتفاصيل.', 'اسأل المتجر عن الخيارات المتوفرة.'] },
  { question: 'كيف أتأكد من المقاس؟', answers: ['راجع القياسات المكتوبة.', 'قارنها بقطعة تستخدمها.', 'اطلب تأكيد المقاس قبل الطلب.'] },
  { question: 'كيف أعتني بالمنتج؟', answers: ['اتبع تعليمات العناية الخاصة بالمنتج.', 'احتفظ بالتغليف عند الحاجة.', 'تواصل مع المتجر عند وجود سؤال.'] },
]
