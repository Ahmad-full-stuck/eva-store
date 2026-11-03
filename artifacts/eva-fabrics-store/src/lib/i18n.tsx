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
    return value
      .replaceAll('إيفا ستور للأقمشة', 'شركة رتاج العربي')
      .replaceAll('إيفا ستور', 'رتاج العربي')
      .replaceAll('إيفا', 'رتاج')
      .replaceAll('كل الأقمشة', 'جميع الأجهزة')
      .replaceAll('الأقمشة', 'الأجهزة')
      .replaceAll('أقمشة', 'أجهزة')
      .replaceAll('القماش', 'الهاتف')
      .replaceAll('قماش', 'هاتف')
      .replaceAll('الخامات', 'الهواتف')
      .replaceAll('الخامة', 'الجهاز')
      .replaceAll('خامة', 'جهاز')
      .replaceAll('نصف متر', 'جهاز واحد')
      .replaceAll('الأمتار', 'الأجهزة')
      .replaceAll('المتر', 'الوحدة')
      .replaceAll('متر', 'جهاز')
      .replaceAll('غير مطاطي', 'لا يشترط 5G')
      .replaceAll('مطاطي', 'يدعم 5G')
      .replaceAll('المرونة', 'دعم 5G')
      .replaceAll('الشفافية', 'الكاميرا')
  }
  return value
    .replace(/Eva Store Fabrics|Eva Store/gi, 'Ritaj Al Arabi')
    .replace(/\bfabrics\b/gi, 'devices')
    .replace(/\bfabric\b/gi, 'phone')
    .replace(/\bhalf a meter\b/gi, 'one device')
    .replace(/\bmeters?\b/gi, 'devices')
    .replace(/\bstretchy\b/gi, '5G-enabled')
    .replace(/\bstretch\b/gi, '5G support')
    .replace(/\bsheerness\b|\bopacity\b/gi, 'camera')
    .replace(/\bgarments?\b/gi, 'devices')
};

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
    window.addEventListener('eva-admin-changed', sync)
    return () => window.removeEventListener('eva-admin-changed', sync)
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
