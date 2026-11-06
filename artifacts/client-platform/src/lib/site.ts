const readRecord = (key: string): Record<string, unknown> => {
  try {
    if (typeof window === 'undefined') return {}
    const raw = window.localStorage.getItem(key)
    const value: unknown = raw ? JSON.parse(raw) : null
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

export const tenantContent = (): Record<string, unknown> => ({
  ...readRecord('eva-server-content'),
  ...readRecord('eva-admin-content'),
})

const textValue = (key: string, fallback: string): string => {
  const value = tenantContent()[key]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

const digits = (value: string): string => value.replace(/[^0-9]/g, '')
const phoneValue = (): string => textValue('phone', '')
const whatsappValue = (): string => textValue('whatsapp', phoneValue())
const internationalWhatsApp = (): string => {
  let value = digits(whatsappValue())
  if (value.startsWith('00')) value = value.slice(2)
  if (value.startsWith('0')) value = '964' + value.slice(1)
  if (value && !value.startsWith('964')) value = '964' + value
  return value
}
const safeUrl = (value: string): string =>
  /^https?:\/\//i.test(value) ? value : value ? 'https://' + value.replace(/^\/+/, '') : ''

export const siteConfig = {
  get name() { return textValue('shopName', 'المتجر الإلكتروني') },
  get shortName() { return textValue('shortName', textValue('shopName', 'المتجر')) },
  get tagline() { return textValue('tagline', 'تجربة تسوق متكاملة') },
  get phone() { return phoneValue() },
  get whatsapp() { return internationalWhatsApp() },
  get instagramUrl() { return safeUrl(textValue('instagram', '')) },
  get contactUrl() { return safeUrl(textValue('contactUrl', textValue('instagram', ''))) },
  get contactEmail() { return textValue('emailOrdersTo', '') },
  get quantityUnit() { return textValue('quantityUnit', 'قطعة') },
  get quantityUnitEn() { return textValue('quantityUnitEn', 'item') },
  get catalogLabel() { return textValue('catalogLabel', 'المنتجات') },
  emailUrl: (subject = 'استفسار من المتجر', body = 'مرحباً، أريد الاستفسار عن أحد المنتجات.') =>
    'mailto:' + siteConfig.contactEmail + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body),
  instagramText: 'حساب المتجر على إنستغرام',
}

export const adaptTenantCopy = (source: string, lang: 'ar' | 'en' = 'ar'): string => {
  if (!source) return source
  let value = source
  const pairs: [string, string][] = lang === 'en'
    ? [
      ['Eva Store Fabrics', siteConfig.name],
      ['Eva Store', siteConfig.shortName],
      ['Fabric gallery', 'Product catalog'],
      ['All fabrics', 'All products'],
      ['Fabric results', 'Product results'],
      ['Fabric specifications', 'Product specifications'],
      ['Related fabrics', 'Related products'],
      ['Fabric comparison table', 'Product comparison table'],
      ['Can I order more than half a meter?', 'Can I order more than one item?'],
      ['Fabrics can be ordered from half a meter as a minimum.', 'Minimum quantities depend on the product.'],
      ['half a meter or more', 'one or more items'],
      ['Price / m', 'Price / item'],
      ['fabric guide', 'product guide'],
      ['fabrics', 'products'],
      ['fabric', 'product'],
      ['half a meter', 'one item'],
      ['half meter', 'one item'],
      ['/m', '/' + siteConfig.quantityUnitEn],
      ['meters', siteConfig.quantityUnitEn + 's'],
      ['meter', siteConfig.quantityUnitEn],
      ['stretch', 'features'],
      ['opacity', 'details'],
    ]
    : [
      ['إيفا ستور للأقمشة', siteConfig.name],
      ['إيفا ستور', siteConfig.shortName],
      ['معرض الخامات', 'كتالوج المنتجات'],
      ['كل الخامات', 'كل المنتجات'],
      ['{n} خامة في المعرض', '{n} منتج في المتجر'],
      ['خامة واحدة بانتظارك', 'منتج واحد بانتظارك'],
      ['خامتان بانتظارك', 'منتجان بانتظارك'],
      ['خامات بانتظارك', 'منتجات بانتظارك'],
      ['قارني هذه الخامة', 'قارن مواصفات المنتج'],
      ['هل يمكن طلب أكثر من نصف متر؟', 'هل يمكن طلب أكثر من قطعة؟'],
      ['يمكن طلب الأقمشة بنصف متر كحد أدنى.', 'الحد الأدنى للطلب يُحدد حسب نوع المنتج.'],
      ['أضيفي قماشاً يعجبك', 'أضيفي منتجاً يعجبك'],
      ['نوع القماش', 'نوع المنتج'],
      ['مقارنة الأقمشة', 'مقارنة المنتجات'],
      ['للأقمشة', ''],
      ['معرض أقمشة عربي', 'متجر إلكتروني'],
      ['معرض الأقمشة', 'المتجر'],
      ['الخامات', siteConfig.catalogLabel],
      ['الخامة', 'المنتج'],
      ['خامة', 'منتج'],
      ['دليل الأقمشة', 'دليل المنتجات'],
      ['/م', '/' + siteConfig.quantityUnit],
      ['كل الأقمشة', 'كل المنتجات'],
      ['عرض كل الأقمشة', 'عرض كل المنتجات'],
      ['تصفحي الأقمشة', 'تصفحي المنتجات'],
      ['الأقمشة', siteConfig.catalogLabel],
      ['أقمشة', 'منتجات'],
      ['القماش', 'المنتج'],
      ['قماش', 'منتج'],
      ['الخامة', 'التفاصيل'],
      ['خامة', 'تفاصيل'],
      ['الشفافية', 'التفاصيل'],
      ['المرونة', 'المواصفات'],
      ['نصف متر فأكثر', 'قطعة واحدة فأكثر'],
      ['نصف متر', 'قطعة واحدة'],
      ['الأمتار', 'القطع'],
      ['المتر', 'القطعة'],
      ['متر', siteConfig.quantityUnit],
    ]
  for (const [from, to] of pairs) value = value.replaceAll(from, to)
  return value
}

export const apiUrl = (path: string): string => path.startsWith('/') ? path : '/' + path
export const phoneDigits = digits

const isTouchDevice = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches

export const telProps = (value: string): { href?: string } => ({
  href: isTouchDevice() ? 'tel:' + value : undefined
})
