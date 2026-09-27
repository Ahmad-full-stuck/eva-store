import type { CartItem, Product, ProductColor } from '@/types'
import { availableStock, normalizeQuantity, orderKey } from './catalog'

const CART_KEY = 'sifa-store-cart-v1'
const WISHLIST_KEY = 'sifa-store-wishlist-v1'

const readArrayOrNull = (key: string): unknown[] | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const dropLegacyCart = (): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem('eva-cart')
    window.localStorage.removeItem('eva-fabrics-cart-v1')
  } catch {
    return
  }
}

const readStoredCart = (): unknown[] => {
  const current = readArrayOrNull(CART_KEY)
  if (current !== null) {
    dropLegacyCart()
    return current
  }
  const legacy = readArrayOrNull('eva-fabrics-cart-v1')
  if (legacy === null) return []
  dropLegacyCart()
  return legacy
}

const findProduct = (products: Product[], slug: string): Product | undefined => products.find((product) => product.slug === slug)

const findColor = (product: Product, id: string): ProductColor => product.colors.find((item) => item.id === id) || product.colors[0] || {
  id: 'default',
  name: 'اللون المختار',
  hex: '#c8b7aa',
  available: true,
  stock: product.stock,
}

const merge = (cart: CartItem[], item: CartItem): CartItem[] => {
  const max = availableStock(item.product, item.color)
  const key = orderKey(item)
  const existingIndex = cart.findIndex((entry) => orderKey(entry) === key)
  if (max <= 0) return cart
  if (existingIndex < 0) return [...cart, { ...item, quantity: Math.min(item.quantity, max) }]
  const next = [...cart]
  const current = next[existingIndex]
  next[existingIndex] = { ...current, quantity: Math.min(max, current.quantity + item.quantity) }
  return next
}

export const getStoredCart = (products: Product[]): CartItem[] => {
  const result: CartItem[] = []
  for (const entry of readStoredCart()) {
    if (!entry || typeof entry !== 'object') continue
    const record = entry as Record<string, unknown>
    const productRecord = record.product && typeof record.product === 'object' ? record.product as Record<string, unknown> : undefined
    const slug = typeof record.productSlug === 'string'
      ? record.productSlug
      : typeof record.slug === 'string'
        ? record.slug
        : typeof productRecord?.slug === 'string'
          ? productRecord.slug
          : ''
    const product = findProduct(products, slug)
    if (!product) continue
    const colorId = typeof record.colorId === 'string'
      ? record.colorId
      : typeof record.color === 'string'
        ? record.color
        : ''
    const color = findColor(product, colorId)
    const rawQuantity = typeof record.quantity === 'number'
      ? record.quantity
      : typeof record.length === 'number'
        ? record.length
        : 0
    const quantity = normalizeQuantity(rawQuantity)
    if (!quantity) continue
    result.push(...merge(result, { product, color, quantity }))
  }
  return result
}

export const addCartItem = (
  cart: CartItem[],
  product: Product,
  color: ProductColor,
  requestedQuantity: number,
): { cart: CartItem[]; added: number; capped: boolean; available: boolean } => {
  const available = availableStock(product, color)
  const quantity = normalizeQuantity(requestedQuantity)
  if (available <= 0 || quantity <= 0) return { cart, added: 0, capped: false, available: false }
  const existing = cart.find((item) => orderKey(item) === orderKey({ product, color }))
  const current = existing?.quantity || 0
  const nextQuantity = Math.min(available, current + quantity)
  return { cart: merge(cart, { product, color, quantity }), added: nextQuantity - current, capped: nextQuantity < current + quantity, available: true }
}

export const updateCartItem = (cart: CartItem[], key: string, requestedQuantity: number): CartItem[] => {
  const item = cart.find((entry) => orderKey(entry) === key)
  if (!item) return cart
  const max = availableStock(item.product, item.color)
  const nextQuantity = normalizeQuantity(requestedQuantity)
  if (max <= 0 || nextQuantity <= max) return nextQuantity > 0 ? cart.map((entry) => orderKey(entry) === key ? { ...entry, quantity: nextQuantity } : entry) : cart.filter((entry) => orderKey(entry) !== key)
  return cart.map((entry) => orderKey(entry) === key ? { ...entry, quantity: max } : entry)
}

export const removeCartItem = (cart: CartItem[], key: string): CartItem[] => cart.filter((item) => orderKey(item) !== key)

export const reconcileCart = (cart: CartItem[], products: Product[]): CartItem[] => {
  const result: CartItem[] = []
  for (const item of cart) {
    const product = findProduct(products, item.product.slug)
    if (!product) continue
    const color = findColor(product, item.color.id)
    const quantity = Math.min(item.quantity, availableStock(product, color))
    if (quantity > 0) result.push(...merge(result, { product, color, quantity }))
  }
  return result
}

export const getStoredWishlist = (): string[] => {
  if (typeof window === 'undefined') return []
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || '[]')
    if (!Array.isArray(value)) return []
    return [...new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0))]
  } catch {
    return []
  }
}

export const setStoredWishlist = (slugs: string[]): void => {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(WISHLIST_KEY, JSON.stringify([...new Set(slugs)])) } catch { return }
}

export const setStoredCart = (cart: CartItem[]): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart.map((item) => ({ productSlug: item.product.slug, colorId: item.color.id, quantity: item.quantity }))))
  } catch {
    return
  }
}
