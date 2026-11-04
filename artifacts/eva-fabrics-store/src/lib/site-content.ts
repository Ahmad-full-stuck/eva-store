import { useEffect, useState } from 'react'
import { readServerContent, readServerSettings } from '@/lib/api'
import { setTextOverrides } from '@/lib/text-overrides'

export const CONTENT_KEY = 'lamha-admin-content'

/** الصور الافتراضية للغلاف — تُستخدم إن لم يحدّد الإدارة أي صور. */
export const DEFAULT_HERO_SLIDES = ['lamha-hero.svg']

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
  shopName: 'لَمْحة للحماية الذكية',
  phone: '',
  whatsapp: '',
  instagram: '',
  announcementRight: 'مواصفات واضحة حسب الموديل',
  announcementLeft: 'السعر والتوفر يؤكدان قبل الطلب',
  aboutTitle: 'لَمْحة أوضح لرؤية أكثر أماناً',
  aboutText: 'لَمْحة وجهتك للتعرّف على حلول المراقبة والحماية الذكية. نعرض الأجهزة ومواصفاتها بطريقة واضحة تساعدك على اختيار الحل المناسب لمنزلك أو عملك.',
  contactTitle: 'تحتاج مساعدة في اختيار جهاز؟',
  contactText: 'أرسل استفسارك عن الأجهزة والمواصفات والتوفر والضمان، وسيتواصل معك فريق لَمْحة.',
  heroEyebrow: 'حلول المراقبة والحماية الذكية',
  heroTitle: 'أمانك في *لَمْحة*|رؤية أوضح، واطمئنان أكبر',
  heroText: 'اكتشف أجهزة المراقبة والحماية الذكية بمواصفات واضحة وتجربة اختيار أسهل لمنزلك أو عملك.',
  heroNote: 'اسأل عن التوافق قبل الطلب',
  heroNoteAlt: 'راجع التفاصيل قبل إتمام الطلب',
  statsTitle: 'اكتشف حلول لَمْحة',
  heroSlideMs: '2600',
  heroSlides: [...DEFAULT_HERO_SLIDES],
  hiddenSections: [],
  categoriesEyebrow: 'تصفّح حسب احتياجك',
  categoriesTitle: 'حلول المراقبة والحماية',
  newEyebrow: 'تعرّف على الأجهزة',
  newTitle: 'أجهزة مختارة',
  newDesc: 'تفاصيل ومواصفات تساعدك على المقارنة قبل الاستفسار',
  guideEyebrow: 'دليل الاختيار',
  guideTitle: 'اختر جهازك|على أساس احتياجك.',
  guideText: 'قارن مجال الرؤية ودقة التصوير والرؤية الليلية والاتصال والتخزين قبل اختيار جهاز المراقبة.',
  guideCta: 'تصفّح الأجهزة',
  newsletterEyebrow: 'ابقَ على اطلاع',
  newsletterTitle: 'تواصل مع لَمْحة',
  newsletterText: 'تواصل معنا لمعرفة تفاصيل الأجهزة والحلول المتاحة.',
  promoPill: 'حلول حماية ذكية',
  promoLead: 'أمانك في لَمْحة',
  promoText: 'معلومات واضحة واختيار أسهل',
  emailOrdersTo: '',
  emailFromName: 'لَمْحة | LAMHA',
  emailFrom: '',
  emailSubjectOrder: 'طلب جديد من لَمْحة #{orderNumber}',
  emailTemplateOrder: '',
  emailProvider: 'formsubmit',
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
