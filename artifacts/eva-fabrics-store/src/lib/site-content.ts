import { useEffect, useState } from 'react'
import { readServerContent, readServerSettings } from '@/lib/api'
import { setTextOverrides } from '@/lib/text-overrides'

export const CONTENT_KEY = 'golden-admin-content'

/** الصور الافتراضية للغلاف — تُستخدم إن لم يحدّد الإدارة أي صور. */
export const DEFAULT_HERO_SLIDES = [
 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=85',
 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=85',
 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1400&q=85',
 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=1400&q=85',
]

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
  shopName: "Golden Cosmetics",
  phone: "",
  whatsapp: "",
  instagram: "",
  announcementRight: "مرحباً بكِ في Golden Cosmetics",
  announcementLeft: "السعر والتوفر يؤكدهما المتجر قبل تأكيد الطلب",
  aboutTitle: "الجمال يبدأ من تفاصيلك",
  aboutText: "Golden Cosmetics مساحة رقمية تجمع منتجات المكياج والعناية والعطور ضمن تجربة تسوق مرتبة. استعرضي التشكيلة، راجعي تفاصيل المنتج، واجمعي اختياراتك في السلة قبل إرسال الطلب.",
  contactTitle: "استفسار عن منتج أو طلب؟",
  contactText: "أرسلي استفسارك عبر نموذج التواصل، وسيراجع المتجر التفاصيل معك قبل اعتماد الطلب.",
  heroEyebrow: "GOLDEN COSMETICS · BEAUTY STORE",
  heroTitle: "اختاري *تفاصيل جمالك*|بكل أناقة",
  heroText: "اكتشفي تشكيلة المكياج والعناية والعطور في تجربة تسوق هادئة، مع فئات واضحة ومسار طلب بسيط.",
  heroNote: "استعرضي التشكيلة من داخل المتجر",
  heroNoteAlt: "السعر والتوفر عند التأكيد",
  statsTitle: "المتجر في لمحة",
  heroSlideMs: "4200",
  heroSlides: [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=1400&q=85',
  ],
  hiddenSections: ['discovery', 'newsletter'],
  categoriesEyebrow: "تسوّقي حسب اهتمامك",
  categoriesTitle: "اكتشفي عالم الجمال",
  newEyebrow: "اختيارات المتجر",
  newTitle: "منتجات مختارة",
  newDesc: "استعرضي المنتجات وأضيفي ما يناسبك إلى السلة",
  guideEyebrow: "دليل الجمال والعناية",
  guideTitle: "اختيار واعٍ|لبشرة أكثر عناية",
  guideText: "اقرئي المكونات وتعليمات الاستخدام وتحققي من تفاصيل المنتج قبل الشراء.",
  guideCta: "اكتشفي دليل العناية",
  newsletterEyebrow: "Golden Cosmetics",
  newsletterTitle: "ابقَي على اطلاع",
  newsletterText: "تواصلي مع المتجر للاستفسار عن المنتجات والتوفر.",
  promoPill: "تفاصيل واضحة",
  promoLead: "اختيار أسهل",
  promoText: "راجعي معلومات المنتج والسعر والتوفر قبل إتمام الطلب.",
  emailOrdersTo: "",
  emailFromName: "Golden Cosmetics",
  emailFrom: "",
  emailSubjectOrder: "طلب جديد من Golden Cosmetics #{orderNumber}",
  emailTemplateOrder: "",
  emailProvider: "mailto",
  emailFormSubmitAction: "",
  texts: {
    "about.imgAlt1": "مستحضرات مكياج",
    "about.imgAlt2": "منتجات عناية بالبشرة",
    "about.storyP1": "بدأت Golden Cosmetics من فكرة بسيطة: جمع منتجات المكياج والعناية والعطور في مكان واحد، مع فئات واضحة وصور وتفاصيل تساعد على الاختيار.",
    "about.storyP2": "اليوم يضم المتجر {count} منتجاً تجريبياً قابلاً للتعديل، وتتيح السلة جمع الاختيارات وإرسالها للمتجر لمراجعة السعر والتوفر قبل التجهيز.",
    "about.timeline1Text": "ابدئي بتصفح فئات المكياج والعناية والعطور، واكتشفي المنتجات المعروضة في المتجر.",
    "about.timeline2Text": "راجعي معلومات المنتج والمكونات والحجم والخيارات قبل إضافته إلى السلة.",
    "about.timeline3Text": "أرسلي الطلب ليتمكن المتجر من مراجعة السعر والتوفر وتأكيد تفاصيل التجهيز.",
    "about.valuesTitle": "تجربة واضحة من البداية",
    "about.valuesText": "نرتب المنتجات ضمن فئات مفهومة ونوضح المعلومات المتاحة قبل إرسال الطلب.",
    "about.value1Title": "وضوح التفاصيل",
    "about.value1Text": "نعرض اسم المنتج وفئته والمعلومات المتاحة دون إضافة وعود غير مؤكدة.",
    "about.value2Title": "اختيار مريح",
    "about.value2Text": "صور وفئات واضحة تساعدك على استعراض التشكيلة.",
    "about.value3Title": "تواصل مباشر",
    "about.value3Text": "يمكنك مراجعة التفاصيل مع المتجر قبل تجهيز الطلب.",
    "about.value4Title": "طلب منظم",
    "about.value4Text": "اجمعي اختياراتك في السلة وأرسليها للمتجر بخطوات واضحة.",
    "about.stat1Label": "منتجات في الكتالوج",
    "about.stat1Note": "نماذج أولية قابلة للتعديل",
    "about.stat2Label": "فئات رئيسية",
    "about.stat2Note": "مكياج وعناية بالبشرة وعطور ومستحضرات",
    "about.stat3Label": "خطوات الطلب",
    "about.stat3Note": "تصفح وإضافة للسلة وتأكيد البيانات",
    "about.stat4Label": "تفاصيل الطلب",
    "about.stat4Note": "السعر والتوفر يؤكدهما المتجر"
  },
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
  const server = readServerContent<Partial<SiteContent>>() || {}
  const local = readJson<Partial<SiteContent>>(CONTENT_KEY, {})
  const merged: SiteContent = {
    ...defaultSiteContent,
    ...server,
    ...local,
    texts: {
      ...defaultSiteContent.texts,
      ...(server.texts || {}),
      ...(local.texts || {}),
    },
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
  freeDeliveryFrom: 0,
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
