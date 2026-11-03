import { useEffect, useState } from 'react'
import { readServerContent, readServerSettings } from '@/lib/api'
import { setTextOverrides } from '@/lib/text-overrides'

export const CONTENT_KEY = 'ritaj-admin-content'

/** الصور الافتراضية للغلاف — تُستخدم إن لم يحدّد الإدارة أي صور. */
export const DEFAULT_HERO_SLIDES = ['https://media.ldlc.com/r1600/ld/products/00/06/27/53/LD0006275321.jpg', 'https://ddfndelma2gpn.cloudfront.net/color/3387/Cobalt_Violet.webp', 'https://cdn.etoren.com/upload/images/0.99641000_1772525373_xiaomi-17-ultra-5g-dual-sim-1tb-black-16gb-ram-global-version.png', 'https://www.maccenter.vn/App_Images/iPadPro-13inch-M5-Black-A.jpg']

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
}

export const defaultSiteContent: SiteContent = {
  shopName: 'شركة رتاج العربي',
  phone: '',
  whatsapp: '',
  instagram: 'https://www.instagram.com/alrtag_2/',
  announcementRight: 'شركة رتاج العربي | عالم الهواتف الذكية',
  announcementLeft: 'تأكيد السعر والتوفر قبل تثبيت الطلب',
  aboutTitle: 'تقنية تختارها بثقة',
  aboutText: 'رتاج العربي وجهتك لاستكشاف الهواتف الذكية والأجهزة والإكسسوارات. صممنا هذه المعاينة لتجمع المنتجات ومواصفاتها وطلبها في تجربة رقمية واحدة، على أن تُعتمد بيانات كل منتج من الشركة.',
  contactTitle: 'هل تبحث عن جهاز محدد؟',
  contactText: 'تواصل مع فريق رتاج العربي للاستفسار عن الموديلات والسعات والألوان والأسعار وحالة الجهاز والضمان.',
  heroEyebrow: 'شركة رتاج العربي | الهواتف الذكية',
  heroTitle: 'اختيارك التقني|يبدأ من هنا',
  heroText: 'اكتشف الهواتف والأجهزة والإكسسوارات في تجربة تسوق منظمة تساعدك على مقارنة التفاصيل وتجهيز طلبك بسهولة.',
  heroNote: 'هواتف وأجهزة وإكسسوارات',
  heroNoteAlt: 'تأكيد مباشر من الشركة',
  statsTitle: 'نظرة على المعاينة',
  heroSlideMs: '3400',
  heroSlides: [...DEFAULT_HERO_SLIDES],
  hiddenSections: ['newsletter'],
  categoriesEyebrow: 'تسوّق حسب الفئة',
  categoriesTitle: 'عالم رتاج من الأجهزة',
  newEyebrow: 'اختيارات من الكتالوج',
  newTitle: 'تعرّف على الأجهزة',
  newDesc: 'نماذج أولية لعرض تجربة المتجر، وتُحدّث القائمة وفق المنتجات الفعلية للشركة.',
  guideEyebrow: 'قبل اختيارك',
  guideTitle: 'المواصفات تصنع|الفرق الحقيقي.',
  guideText: 'قارن المعالج والسعة والذاكرة والكاميرات والبطارية، وتأكد من الإصدار والضمان قبل اعتماد طلبك.',
  guideCta: 'دليل اختيار الجهاز',
  newsletterEyebrow: 'تواصل مباشر',
  newsletterTitle: 'فريق رتاج أقرب إليك',
  newsletterText: 'للاستفسار عن الأسعار والتوفر وتفاصيل المنتجات، تواصل مع الشركة عبر حسابها الرسمي.',
  promoPill: 'رتاج العربي',
  promoLead: 'اختيار واضح',
  promoText: 'وتفاصيل يؤكدها فريق الشركة',
  emailOrdersTo: '',
  emailFromName: 'شركة رتاج العربي',
  emailFrom: '',
  emailSubjectOrder: 'طلب جديد من متجر رتاج العربي #{orderNumber}',
  emailTemplateOrder: '',
  emailProvider: 'mailto',
  emailFormSubmitAction: '',
  texts: {},
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
  freeDeliveryFrom: 50000,
  deliveryFee: 5000,
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
