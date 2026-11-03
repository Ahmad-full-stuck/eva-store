import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { coreStrings } from '@/lib/strings/core'
import { headerStrings } from '@/lib/strings/header'
import { catalogStrings } from '@/lib/strings/catalog'
import { productStrings } from '@/lib/strings/product'
import { infoStrings } from '@/lib/strings/info'
import { ritajStrings } from '@/lib/strings/ritaj'
import { getTextOverride } from '@/lib/text-overrides'

export type Lang = 'ar' | 'en'
export type StringEntry = { ar: string; en: string }

const MODULES: Record<string, StringEntry>[] = [coreStrings, headerStrings, catalogStrings, productStrings, infoStrings, ritajStrings]

const DICT: Record<string, StringEntry> = {}
for (const module of MODULES) {
  for (const [key, entry] of Object.entries(module)) {
    if (import.meta.env.DEV && DICT[key]) console.warn(`[i18n] duplicate key: ${key}`)
    DICT[key] = entry
  }
}

const LANG_KEY = 'ritaj-lang'

const brandCopy = (value: string, lang: Lang): string => {
  if (lang === 'ar') {
    const replacements: Array<[string, string]> = [
      ['إيفا ستور للأقمشة', 'شركة رتاج العربي'],
      ['متجر إيفا ستور', 'متجر رتاج العربي'],
      ['إيفا ستور', 'رتاج العربي'],
      ['إيفا', 'رتاج العربي'],
      ['دليل اختيار الأقمشة', 'دليل اختيار الأجهزة'],
      ['دليل الأقمشة', 'دليل الأجهزة'],
      ['معرض الأقمشة', 'كتالوج الأجهزة'],
      ['معرض أقمشة', 'كتالوج الأجهزة'],
      ['كل الأقمشة', 'جميع الأجهزة'],
      ['الأقمشة', 'الأجهزة'],
      ['أقمشة', 'أجهزة'],
      ['القماش', 'الهاتف'],
      ['قماش', 'هاتف'],
      ['الخامات', 'الأجهزة'],
      ['الخامة', 'مواصفات الجهاز'],
      ['خامة', 'جهاز'],
      ['نصف متر', 'جهاز واحد'],
      ['أنصاف الأمتار', 'أعداد الأجهزة'],
      ['الأمتار', 'الأجهزة'],
      ['أمتار', 'أجهزة'],
      ['المتر الواحد', 'الجهاز الواحد'],
      ['للمتر', 'للجهاز'],
      ['المتر', 'الجهاز'],
      ['متر', 'جهاز'],
      ['غير مطاطي', 'لا يشترط 5G'],
      ['مطاطي', 'يدعم 5G'],
      ['المرونة', 'دعم شبكات 5G'],
      ['الشفافية', 'الكاميرا'],
      ['فساتين السهرة', 'التصوير'],
      ['فستان سهرة', 'التصوير'],
      ['الفساتين اليومية', 'الاستخدام اليومي'],
      ['فستان يومي', 'استخدام يومي'],
      ['الفساتين', 'الهواتف'],
      ['الفستان', 'الهاتف'],
      ['فستان', 'هاتف'],
      ['العباءات', 'هواتف أندرويد'],
      ['عباءة أو برنوش', 'هواتف أندرويد'],
      ['العباءة', 'الهاتف'],
      ['عباءة', 'هاتف'],
      ['القطعة', 'الجهاز'],
      ['القطع', 'الأجهزة'],
      ['التطريز', 'الكاميرا'],
      ['النسيج', 'الجهاز'],
      ['الخياطة', 'الاستخدام'],
      ['عرض القماش', 'حجم الشاشة'],
      ['العرض مطابق للمكتوب', 'السعة مطابقة للمواصفات'],
    ]
    let result = value
    for (const [from, to] of replacements) result = result.replaceAll(from, to)
    return result
  }
  const replacements: Array<[RegExp, string]> = [
    [/Eva Store Fabrics|Eva Store/gi, 'Ritaj Al Arabi'],
    [/fabric guide/gi, 'device guide'],
    [/fabric gallery|fabric showroom/gi, 'device catalogue'],
    [/\\bfabrics\\b/gi, 'devices'],
    [/\\bfabric\\b/gi, 'device'],
    [/\\bhalf a meter\\b/gi, 'one device'],
    [/\\bmeters\\b/gi, 'devices'],
    [/\\bmeter\\b/gi, 'device'],
    [/everyday dresses/gi, 'everyday use'],
    [/evening dress/gi, 'photography'],
    [/\\bdresses\\b/gi, 'phones'],
    [/\\bdress\\b/gi, 'phone'],
    [/\\babaya(s)?\\b/gi, 'Android phone'],
    [/\\bburnous\\b/gi, 'Android phone'],
    [/\\bgarments?\\b/gi, 'devices'],
    [/cutting and sewing/gi, 'device use and performance'],
    [/\\bsewing\\b/gi, 'usage'],
    [/\\bcutting\\b/gi, 'usage'],
    [/\\bstretchy\\b/gi, '5G-enabled'],
    [/\\bnon-stretch(?:y)?\\b/gi, 'without 5G requirement'],
    [/\\bstretch\\b/gi, '5G support'],
    [/\\bsheerness\\b|\\bopacity\\b/gi, 'camera'],
    [/\\bwidth\\b/gi, 'screen size'],
    [/\\bweight\\b/gi, 'RAM'],
    [/\\bembroidered\\b/gi, 'advanced'],
    [/\\bembroidery\\b/gi, 'camera'],
  ]
  let result = value
  for (const [pattern, replacement] of replacements) result = result.replace(pattern, replacement)
  return result
}

const readStoredLang = (): Lang => {
  try {
    const value = window.localStorage.getItem(LANG_KEY)
    if (value === 'en' || value === 'ar') return value
  } catch {
    /* ignore */
  }
  return 'ar'
}

let currentLang: Lang = typeof window === 'undefined' ? 'ar' : readStoredLang()

/** Non-React access for plain helpers (formatPrice, metersLabel, …). */
export const getCurrentLang = (): Lang => currentLang

/** Non-React translation using the current language (for non-component code). */
export const tr = (key: string): string => {
  const override = getTextOverride(key)
  if (override !== undefined) return override
  const entry = DICT[key]
  if (!entry) return key
  return brandCopy(entry[currentLang] || entry.ar || key, currentLang)
}

export interface StringInfo {
  key: string
  ar: string
  en: string
  group: string
}

/** كل نصوص النظام مع قيمتها العربية الافتراضية — لعرضها في لوحة التخصيص. */
export const allStrings = (): StringInfo[] =>
  Object.keys(DICT)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({ key, ar: DICT[key].ar, en: DICT[key].en, group: key.split('.')[0] }))

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readStoredLang())
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    currentLang = lang
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl'
    try {
      window.localStorage.setItem(LANG_KEY, lang)
    } catch {
      /* ignore */
    }
  }, [lang])

  useEffect(() => {
    const sync = () => setRevision((value) => value + 1)
    window.addEventListener('ritaj-admin-changed', sync)
    return () => window.removeEventListener('ritaj-admin-changed', sync)
  }, [])

  const setLang = useCallback((next: Lang) => setLangState(next === 'en' ? 'en' : 'ar'), [])

  const value = useMemo<LangContextValue>(() => ({
    lang,
    setLang,
    t: (key: string) => {
      const override = getTextOverride(key)
      if (override !== undefined) return override
      const entry = DICT[key]
      if (!entry) return key
      return brandCopy(entry[lang] || entry.ar || key, lang)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [lang, setLang, revision])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useT(): LangContextValue {
  const context = useContext(LangContext)
  if (!context) throw new Error('useT must be used inside <LangProvider>')
  return context
}
