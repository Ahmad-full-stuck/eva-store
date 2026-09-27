import type { CartItem, Product, ProductColor } from '@/types'

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
    product.specs.material,
    product.specs.use,
    product.specs.install,
    product.specs.finish,
    product.specs.size,
    ...product.colors.map((item) => item.name),
  ].join(' '))
  return cleanQuery.split(' ').every((word) => text.includes(word))
}

export const getCartTotals = (cart: CartItem[]): { subtotal: number; deliveryFee: number; total: number } => {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const deliveryFee = subtotal === 0 || subtotal >= 50000 ? 0 : 5000
  return { subtotal, deliveryFee, total: subtotal + deliveryFee }
}

export const formatPrice = (value: number): string => `${value.toLocaleString('ar-IQ')} د.ع`

export const formatNumber = (value: number): string => value.toLocaleString('ar-IQ', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

export const formatQuantity = (value: number, unit = 'وحدة'): string => `${formatNumber(value)} ${unit}`

export const normalizeQuantity = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.max(1, Math.round(value))
}

export const availableStock = (product: Product, color: ProductColor): number => Math.max(0, Math.min(product.stock, color.stock))

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
