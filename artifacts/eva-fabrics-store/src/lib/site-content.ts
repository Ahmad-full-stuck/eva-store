import { useEffect, useState } from 'react'
import { readServerContent, readServerSettings } from '@/lib/api'

export const CONTENT_KEY = 'eva-admin-content'

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
  shopName: 'إيفا ستور للأقمشة',
  phone: '07727282001',
  whatsapp: '9647727282001',
  instagram: 'https://instagram.com',
  announcementRight: 'شحن إلى جميع محافظات العراق',
  announcementLeft: 'شحن دولي عند التوفر',
  aboutTitle: 'قصة إيفا تبدأ بسؤال واحد: ماذا ستصنعين؟',
  aboutText: 'بدأت إيفا ستور بفكرة بسيطة: أن يرى الزبون الخامة كما تراها الخياطة، بشرح واضح للّمس والامتداد واللون قبل أن تدفع ديناراً واحداً. اليوم نعرض تشكيلة متنوعة مع مواصفات مكتوبة وطلب يبدأ من نصف متر.',
  contactTitle: 'سؤال عن خامة أو طلب؟',
  contactText: 'اكتبي لنا ما يدور في بالك. إن تعذّر إرسال الرسالة من الموقع مباشرة، نحوّلها تلقائياً إلى محادثة واتساب مكتوبة برسالتك نفسها.',
  heroEyebrow: 'معرض أقمشة عربي',
  heroTitle: 'اختاري *القماش المثالي*|لكل إبداع',
  heroText: 'تشكيلة منتقاة من الأقمشة الفاخرة والمريحة، مع شرح واضح للخامة قبل أن تضيفيها إلى مشروعك.',
  heroNote: 'توصيل إلى جميع محافظات العراق',
  heroNoteAlt: 'دفع عند استلام الطلب',
  statsTitle: 'أرقام المعرض الآن',
  heroSlideMs: '2600',
  categoriesEyebrow: 'اختاري من البداية',
  categoriesTitle: 'مساحات القماش',
  newEyebrow: 'نماذج مختارة',
  newTitle: 'وصل حديثاً',
  newDesc: 'أحدث الخامات التي أضفناها إلى المعرض',
  guideEyebrow: 'قبل أن تختاري',
  guideTitle: 'القماش قرار بصري|ولمسي في آن واحد.',
  guideText: 'العينة الجيدة لا تخفي التفاصيل. قارني السماكة والمرونة واللمعة وطريقة سقوط القماش قبل أن تحددي الاستخدام.',
  guideCta: 'ابدئي دليل الأقمشة',
  newsletterEyebrow: 'نشرة إيفا',
  newsletterTitle: 'جديد الأقمشة يصل إلى بريدك أولاً',
  newsletterText: 'خامة جديدة، لون متجدد، أو عرض لفترة محدودة، نرسله لك عند حدوثه فقط.',
  promoPill: 'عرض نهاية الأسبوع',
  promoLead: 'توصيل مجاني',
  promoText: 'للطلبات فوق {price} حتى نهاية الأسبوع',
  emailOrdersTo: 'wealiahmad.ali@gmail.com',
  emailFromName: 'إيفا ستور للأقمشة',
  emailFrom: '',
  emailSubjectOrder: 'طلب جديد من متجر إيفا #{orderNumber}',
  emailTemplateOrder: '',
  emailProvider: 'formsubmit',
  emailFormSubmitAction: 'https://formsubmit.co/wealiahmad.ali@gmail.com',
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

export const readSiteContent = (): SiteContent => ({
  ...defaultSiteContent,
  ...(readServerContent<Partial<SiteContent>>() || {}),
  ...readJson<Partial<SiteContent>>(CONTENT_KEY, {}),
})

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
