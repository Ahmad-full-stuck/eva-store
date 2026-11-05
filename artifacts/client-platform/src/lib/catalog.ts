import type { CartItem, Product, ProductColor } from '@/types'
import { readStoreSettings } from '@/lib/site-content'
import { getCurrentLang, tr } from '@/lib/i18n'

export const normalizeArabic = (value: string): string => value
  .normalize('NFKD')
  .replace(/[\u064B-\u065F\u0670]/g, '')
  .replace(/[أإآ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/[ؤئ]/g, 'ء')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim()

export const matchesProductSearch = (product: Product, query: string): boolean => {
  const cleanQuery = normalizeArabic(query)
  if (!cleanQuery) return true
  const text = normalizeArabic([
    product.name,
    product.type,
    product.description,
    product.specs.composition,
    product.specs.use,
    product.specs.stretch,
    product.specs.opacity,
    product.specs.finish,
    ...product.colors.map((item) => item.name),
  ].join(' '))
  const asksForNonStretch = cleanQuery.includes('غير مطاطي')
  const asksForStretch = cleanQuery.includes('مطاطي') && !asksForNonStretch
  if (asksForNonStretch && product.specs.isStretch) return false
  if (asksForStretch && !product.specs.isStretch) return false
  return cleanQuery.split(' ').every((word) => text.includes(word))
}

export const getCartTotals = (cart: CartItem[]): { subtotal: number; deliveryFee: number; total: number } => {
  const settings = readStoreSettings()
  const freeFrom = Math.max(0, settings.freeDeliveryFrom || 50000)
  const fee = Math.max(0, settings.deliveryFee ?? 5000)
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.length, 0)
  const deliveryFee = subtotal === 0 || subtotal >= freeFrom ? 0 : fee
  return { subtotal, deliveryFee, total: subtotal + deliveryFee }
}

/** «15000 د.ع» → «15 الف دينار عراقي» كما طلب المتجر. */
export const formatPrice = (value: number): string => {
  const safe = Math.max(0, Math.round(value))
  if (safe === 0) return tr('core.priceOnConfirm')
  if (safe >= 1000 && safe % 1000 === 0) return tr('core.priceThousand').replace('{n}', String(safe / 1000))
  return tr('core.priceFull').replace('{n}', safe.toLocaleString(getCurrentLang() === 'en' ? 'en-US' : 'ar-IQ'))
}

/** صيغة قصيرة للبانرات والشريط: «50 الف دينار». */
export const formatDinar = (value: number): string => {
  const safe = Math.max(0, Math.round(value))
  if (safe >= 1000 && safe % 1000 === 0) return tr('core.dinarShortThousand').replace('{n}', String(safe / 1000))
  return tr('core.dinarShort').replace('{n}', safe.toLocaleString(getCurrentLang() === 'en' ? 'en-US' : 'ar-IQ'))
}

/** «0.5» → «نصف متر» */
export const metersLabel = (value: number): string =>
  value === 0.5 ? tr('core.metersHalf') : `${Number(value.toFixed(2)).toLocaleString(getCurrentLang() === 'en' ? 'en-US' : 'ar-IQ')} ${tr('core.metersWord')}`

export const formatMeters = (value: number): string => (value === 0.5
  ? tr('core.metersShortHalf')
  : `${value.toLocaleString(getCurrentLang() === 'en' ? 'en-US' : 'ar-IQ', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${tr('core.metersShortUnit')}`)

export const normalizeHalfMeters = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.max(0.5, Math.ceil(value * 2) / 2)
}

export const availableMeters = (product: Product, color?: ProductColor): number => {
  if (color?.available === false) return 0
  return product.stockMeters > 0 ? product.stockMeters : 1000
}

export const isSoldOut = (product: Product): boolean =>
  product.colorsEnabled !== false && product.colors.length > 0 && !product.colors.some((color) => color.available)

export const orderKey = (item: Pick<CartItem, 'product' | 'color'>): string => `${item.product.slug}:${item.color.id}`

export const getOrderNumber = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null
  const read = (value: unknown): string | null => {
    if (!value || typeof value !== 'object') return null
    const record = value as Record<string, unknown>
    for (const key of ['orderNumber', 'order_number', 'orderId', 'order_id', 'id']) {
      const candidate = record[key]
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
      if (typeof candidate === 'number' && Number.isFinite(candidate)) return String(candidate)
    }
    return null
  }
  const direct = read(payload)
  if (direct) return direct
  const record = payload as Record<string, unknown>
  for (const key of ['data', 'order', 'result']) {
    const nested = read(record[key])
    if (nested) return nested
  }
  return null
}
