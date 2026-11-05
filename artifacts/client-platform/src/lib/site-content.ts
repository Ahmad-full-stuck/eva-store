import { useEffect, useState } from 'react'
import { readServerContent, readServerSettings } from '@/lib/api'
import { setTextOverrides } from '@/lib/text-overrides'

export const CONTENT_KEY = 'eva-admin-content'

/** الصور الافتراضية للغلاف — تُستخدم إن لم يحدّد الإدارة أي صور. */
export const DEFAULT_HERO_SLIDES = ['home/hero-1.jpg', 'home/hero-2.jpg', 'home/hero-3.jpg', 'home/hero-4.jpg']

/** أقسام الصفحة الرئيسية القابلة للإخفاء/الإظهار من الإدارة. */
export const HOME_SECTION_KEYS = [
  'announcement',
  'hero',
  'promo',
  'steps',
  'categories',
  'newArrivals',
  'discovery',
  'guide',
  'story',
  'trust',
  'newsletter',
] as const

export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number]

/** القسم ظاهر ما لم تُدرج مفتاحه في hiddenSections. */
export const sectionVisible = (content: SiteContent, key: HomeSectionKey): boolean =>
  !Array.isArray(content.hiddenSections) || !content.hiddenSections.includes(key)


export interface SiteContent {
  shopName: string
  phone: string
  whatsapp: string
  instagram: string
  announcementRight: string
  announcementLeft: string
  aboutTitle: string
  aboutText: string
  contactTitle: string
  contactText: string
  heroEyebrow: string
  heroTitle: string
  heroText: string
  heroNote: string
  heroNoteAlt: string
  statsTitle: string
  heroSlideMs: string
  /** الصور التي تتقليب تلقائياً في الغلاف — قابلة للإضافة/الحذف/الترتيب من الإدارة. */
  heroSlides: string[]
  /** مفاتيح الأقسام المخفية في الصفحة الرئيسية (لا يغيّر التصميم — فقط إخفاء/إظهار). */
  hiddenSections: string[]
  /** تجاوزات نصوص النظام (مفتاح الترجمة → النص المخصّص). فارغ = استخدام النص الافتراضي. */
  texts: Record<string, string>
  categoriesEyebrow: string
  categoriesTitle: string
  newEyebrow: string
  newTitle: string
  newDesc: string
  guideEyebrow: string
  guideTitle: string
  guideText: string
  guideCta: string
  newsletterEyebrow: string
  newsletterTitle: string
  newsletterText: string
  promoPill: string
  promoLead: string
  promoText: string
  emailOrdersTo: string
  emailFromName: string
  emailFrom: string
  emailSubjectOrder: string
  emailTemplateOrder: string
  emailProvider: 'mailto' | 'formsubmit'
  emailFormSubmitAction: string
  shortName?: string
  tagline?: string
  catalogLabel?: string
  quantityUnit?: string
  quantityUnitEn?: string
  theme?: Record<string, string>
  storyImage?: string
  location?: string
  hours?: string
  contactUrl?: string
  deliveryNote?: string
  paymentNote?: string
  statsDeliveryValue?: number
  statsTrustValue?: number
  statsTrustSuffix?: string
}

export const defaultSiteContent: SiteContent = {
  shopName: 'المتجر الإلكتروني',
  phone: '07727282001',
  whatsapp: '9647727282001',
  instagram: 'https://www.instagram.com/x__illc/',
  announcementRight: 'شحن إلى جميع محافظات العراق',
  announcementLeft: 'التوصيل بـ ٥ آلاف دينار فقط',
  aboutTitle: 'قصة العلامة تبدأ من اهتمامها بالتفاصيل',
  aboutText: 'تجربة تسوق متكاملة تجمع التشكيلة والمعلومات ووسائل التواصل في واجهة واحدة، مع مسار طلب واضح ومريح من الهاتف أو الحاسوب.',
  contactTitle: 'تحتاج مساعدة في اختيارك؟',
  contactText: 'أرسل استفسارك عن المنتجات أو المقاسات أو التوفر، وسيعود إليك فريق المتجر لتأكيد التفاصيل.',
  heroEyebrow: 'تجربة تسوق متكاملة',
  heroTitle: 'اكتشف *اختياراتنا*|بتفاصيل تهمك',
  heroText: 'تصفح التشكيلة بعناية، وشاهد الصور والتفاصيل، ثم أرسل طلبك بخطوات بسيطة وواضحة.',
  heroNote: 'تواصل مباشر مع المتجر',
  heroNoteAlt: 'تأكيد التفاصيل قبل الطلب',
  statsTitle: 'التجربة في أرقام',
  heroSlideMs: '2600',
  heroSlides: [...DEFAULT_HERO_SLIDES],
  hiddenSections: ['discovery', 'guide', 'newsletter'],
  categoriesEyebrow: 'تصفح حسب القسم',
  categoriesTitle: 'الأقسام الرئيسية',
  newEyebrow: 'تشكيلة المتجر',
  newTitle: 'مختاراتنا',
  newDesc: 'مجموعة من المنتجات والنماذج المتاحة للتصفح',
  guideEyebrow: 'دليل التسوق',
  guideTitle: 'اختر بثقة|واطلب بسهولة',
  guideText: 'راجع الصور والتفاصيل، واستفسر عن التوفر والمقاسات قبل إتمام الطلب.',
  guideCta: 'تصفح المنتجات',
  newsletterEyebrow: 'ابقَ على اطلاع',
  newsletterTitle: 'تواصل معنا مباشرة',
  newsletterText: 'تابع الجديد واسأل عن المنتجات والتفاصيل المتاحة عبر قنوات المتجر الرسمية.',
  promoPill: 'خدمة المتجر',
  promoLead: 'تجربة تسوق',
  promoText: 'تصفح التشكيلة وتواصل معنا لتأكيد التفاصيل',
  emailOrdersTo: '',
  emailFromName: 'المتجر الإلكتروني',
  emailFrom: '',
  emailSubjectOrder: 'طلب جديد من المتجر #{orderNumber}',
  emailTemplateOrder: '',
  emailProvider: 'mailto',
  emailFormSubmitAction: '',
  texts: {},
  shortName: 'المتجر',
  tagline: 'تجربة تسوق متكاملة',
  catalogLabel: 'المنتجات',
  quantityUnit: 'قطعة',
  quantityUnitEn: 'item',
  storyImage: '',
  location: '',
  hours: '',
  contactUrl: '',
  deliveryNote: 'يؤكد المتجر تفاصيل التوصيل قبل إتمام الطلب',
  paymentNote: 'تؤكد طريقة الدفع مباشرة مع المتجر',
  statsDeliveryValue: 1,
  statsTrustValue: 4,
  statsTrustSuffix: '',
}

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as T
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

export const readSiteContent = (): SiteContent => {
  const merged: SiteContent = {
    ...defaultSiteContent,
    ...(readServerContent<Partial<SiteContent>>() || {}),
    ...readJson<Partial<SiteContent>>(CONTENT_KEY, {}),
  }
  setTextOverrides(merged.texts)
  return merged
}

export interface StoreSettings {
  colorsEnabled: boolean
  freeDeliveryFrom: number
  deliveryFee: number
  [key: string]: unknown
}

export const defaultStoreSettings: StoreSettings = {
  colorsEnabled: true,
  freeDeliveryFrom: 1000000000,
  deliveryFee: 0,
}

export const readStoreSettings = (): StoreSettings => ({
  ...defaultStoreSettings,
  ...(readServerSettings() as Partial<StoreSettings>),
})

export const useStoreSettings = (): StoreSettings => {
  const [settings, setSettings] = useState<StoreSettings>(() => readStoreSettings())
  useEffect(() => {
    const sync = () => setSettings(readStoreSettings())
    window.addEventListener('eva-admin-changed', sync)
    return () => window.removeEventListener('eva-admin-changed', sync)
  }, [])
  return settings
}

const listeners = new Set<() => void>()

export const useSiteContent = (): SiteContent => {
  const [content, setContent] = useState<SiteContent>(() => readSiteContent())
  useEffect(() => {
    const sync = () => setContent(readSiteContent())
    listeners.add(sync)
    window.addEventListener('eva-admin-changed', sync)
    return () => {
      listeners.delete(sync)
      window.removeEventListener('eva-admin-changed', sync)
    }
  }, [])
  return content
}

export const contentLines = (value: string): string[] =>
  value.split('|').map((line) => line.trim()).filter(Boolean)

export const contentParts = (value: string): string[] => value.split('*')
