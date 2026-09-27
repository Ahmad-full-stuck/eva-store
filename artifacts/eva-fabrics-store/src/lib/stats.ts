import type { Category, Product } from '@/types'
import { formatPrice } from './catalog'
import { getStoredCart, getStoredWishlist } from './storage'

export const ORDERS_KEY = 'eva-orders'

const LOW_BAND = 10000
const HIGH_BAND = 15000
const TOP_STOCK_ROWS = 5

export interface LocalOrder {
  id: string
  orderNumber: string
  date: string
  totalLabel: string
  status: string
  timestamp: number | null
}

export interface PriceBandCounts {
  low: number
  mid: number
  high: number
}

export interface CategoryPriceRow {
  id: string
  name: string
  accent: string
  total: number
  average: number
  counts: PriceBandCounts
}

export interface StockRow {
  id: string
  name: string
  meters: number
  percent: number
}

export interface TopCategory {
  id: string
  name: string
  count: number
  percent: number
}

export interface StatsSnapshot {
  productCount: number
  categoryCount: number
  averagePrice: number
  minPrice: number
  maxPrice: number
  cheapest: { name: string; price: number } | null
  dearest: { name: string; price: number } | null
  totalMeters: number
  newCount: number
  availableCount: number
  availabilityPercent: number
  cartItems: number
  cartMeters: number
  wishlistCount: number
  orderCount: number
  orders: LocalOrder[]
  priceRows: CategoryPriceRow[]
  stockRows: StockRow[]
  topCategory: TopCategory | null
  bandLabels: { low: string; mid: string; high: string }
}

export const formatCount = (value: number): string => Math.round(value).toLocaleString('ar-IQ')

export const formatShare = (value: number): string => `${Math.round(value).toLocaleString('ar-IQ')}٪`

const bandLabel = (value: number): string => value.toLocaleString('ar-IQ')

const readJson = (key: string): unknown => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

const flattenEntries = (raw: unknown): unknown[] => {
  let source: unknown[] = []
  if (Array.isArray(raw)) {
    source = raw
  } else if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    const nestedKeys = ['orders', 'items', 'list', 'data', 'results']
    let matched = false
    for (const key of nestedKeys) {
      const value = record[key]
      if (Array.isArray(value)) {
        source = value
        matched = true
        break
      }
    }
    if (!matched) source = Object.values(record).filter((entry) => entry !== null && typeof entry === 'object')
  }
  const flattened: unknown[] = []
  for (const entry of source) {
    if (Array.isArray(entry)) flattened.push(...entry)
    else flattened.push(entry)
  }
  return flattened
}

const pickString = (record: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return ''
}

const pickNumber = (record: Record<string, unknown>, keys: string[]): number | null => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value.replace(/[^\d.]/g, ''))
      if (Number.isFinite(parsed) && parsed > 0) return parsed
    }
  }
  return null
}

const pickValue = (record: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    const value = record[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return null
}

const toDate = (value: unknown): Date | null => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value > 1e11 ? value : value * 1000)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value.trim())
    if (!Number.isNaN(date.getTime())) return date
  }
  return null
}

const formatDate = (value: unknown): string => {
  const date = toDate(value)
  if (date) {
    try {
      return new Intl.DateTimeFormat('ar-IQ', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
    } catch {
      return date.toLocaleDateString()
    }
  }
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return formatCount(value)
  return '—'
}

export const readLocalOrders = (): LocalOrder[] => {
  const entries = flattenEntries(readJson(ORDERS_KEY))
  const orders: LocalOrder[] = []
  entries.forEach((entry, index) => {
    if (typeof entry === 'string' && entry.trim()) {
      orders.push({
        id: `order-${index}`,
        orderNumber: entry.trim(),
        date: '—',
        totalLabel: '—',
        status: 'مسجل محلياً',
        timestamp: null,
      })
      return
    }
    if (!entry || typeof entry !== 'object') return
    const record = entry as Record<string, unknown>
    const dateValue = pickValue(record, ['createdAt', 'created_at', 'date', 'timestamp', 'orderedAt', 'time', 'updatedAt'])
    const date = toDate(dateValue)
    const orderNumber = pickString(record, ['orderNumber', 'order_number', 'orderNo', 'orderId', 'order_id', 'number', 'id'])
    const total = pickNumber(record, ['total', 'grandTotal', 'grand_total', 'amount', 'orderTotal'])
    orders.push({
      id: `${orderNumber || 'order'}-${index}`,
      orderNumber: orderNumber || `#${index + 1}`,
      date: formatDate(dateValue),
      totalLabel: total === null ? '—' : formatPrice(Math.round(total)),
      status: pickString(record, ['status', 'state', 'orderStatus']) || 'مسجل محلياً',
      timestamp: date ? date.getTime() : null,
    })
  })
  orders.sort((left, right) => (right.timestamp || 0) - (left.timestamp || 0))
  return orders
}

const isAvailableProduct = (product: Product): boolean =>
  product.stockMeters > 0 && product.colors.some((color) => color.stockMeters > 0)

const readCart = (products: Product[]): { items: number; meters: number } => {
  try {
    const cart = getStoredCart(products)
    return {
      items: cart.length,
      meters: cart.reduce((sum, item) => sum + item.length, 0),
    }
  } catch {
    return { items: 0, meters: 0 }
  }
}

const readWishlistCount = (): number => {
  try {
    return getStoredWishlist().length
  } catch {
    return 0
  }
}

const buildPriceRows = (products: Product[], categories: Category[]): CategoryPriceRow[] =>
  categories.map((category) => {
    const items = products.filter((product) => product.categoryId === category.id)
    const counts: PriceBandCounts = { low: 0, mid: 0, high: 0 }
    let total = 0
    for (const item of items) {
      total += item.price
      if (item.price < LOW_BAND) counts.low += 1
      else if (item.price < HIGH_BAND) counts.mid += 1
      else counts.high += 1
    }
    return {
      id: category.id,
      name: category.name,
      accent: category.accent,
      total: items.length,
      average: items.length ? Math.round(total / items.length) : 0,
      counts,
    }
  })

const buildStockRows = (products: Product[]): StockRow[] => {
  const ranked = [...products].sort((left, right) => right.stockMeters - left.stockMeters).slice(0, TOP_STOCK_ROWS)
  const highest = ranked[0]?.stockMeters || 0
  return ranked.map((product) => ({
    id: product.id,
    name: product.name,
    meters: product.stockMeters,
    percent: highest > 0 ? Math.round((product.stockMeters / highest) * 100) : 0,
  }))
}

const buildTopCategory = (products: Product[], categories: Category[]): TopCategory | null => {
  if (!categories.length || !products.length) return null
  let best: TopCategory | null = null
  for (const category of categories) {
    const count = products.filter((product) => product.categoryId === category.id).length
    const candidate: TopCategory = {
      id: category.id,
      name: category.name,
      count,
      percent: (count / products.length) * 100,
    }
    if (!best || candidate.count > best.count) best = candidate
  }
  return best
}

export const buildStatsSnapshot = (products: Product[], categories: Category[]): StatsSnapshot => {
  const productCount = products.length
  const byPrice = [...products].sort((left, right) => left.price - right.price)
  const lowest = byPrice[0]
  const highest = byPrice[byPrice.length - 1]
  const totalPrice = products.reduce((sum, product) => sum + (Number.isFinite(product.price) ? product.price : 0), 0)
  const totalMeters = products.reduce((sum, product) => sum + (Number.isFinite(product.stockMeters) ? product.stockMeters : 0), 0)
  const availableCount = products.filter(isAvailableProduct).length
  const cart = readCart(products)
  const orders = readLocalOrders()

  return {
    productCount,
    categoryCount: categories.length,
    averagePrice: productCount ? Math.round(totalPrice / productCount) : 0,
    minPrice: lowest ? lowest.price : 0,
    maxPrice: highest ? highest.price : 0,
    cheapest: lowest ? { name: lowest.name, price: lowest.price } : null,
    dearest: highest ? { name: highest.name, price: highest.price } : null,
    totalMeters,
    newCount: products.filter((product) => product.isNew).length,
    availableCount,
    availabilityPercent: productCount ? (availableCount / productCount) * 100 : 0,
    cartItems: cart.items,
    cartMeters: cart.meters,
    wishlistCount: readWishlistCount(),
    orderCount: orders.length,
    orders,
    priceRows: buildPriceRows(products, categories),
    stockRows: buildStockRows(products),
    topCategory: buildTopCategory(products, categories),
    bandLabels: {
      low: `أقل من ${bandLabel(LOW_BAND)}`,
      mid: `${bandLabel(LOW_BAND)} – ${bandLabel(HIGH_BAND - 1)}`,
      high: `${bandLabel(HIGH_BAND)} فأعلى`,
    },
  }
}
