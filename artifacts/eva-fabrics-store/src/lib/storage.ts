import type { CartItem, Product, ProductColor } from '@/types'
import { availableMeters, normalizeHalfMeters, orderKey } from './catalog'

const CART_KEY = 'eva-fabrics-cart-v1'
const WISHLIST_KEY = 'eva-fabrics-wishlist-v1'

const readArray = (key: string): unknown[] => {
  if (typeof window === 'undefined') return []
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const readStoredCart = (): unknown[] => {
  if (typeof window === 'undefined') return []
  const current = readArray(CART_KEY)
  if (current.length) return current
  return readArray('eva-cart')
}

const findProduct = (products: Product[], slug: string): Product | undefined => products.find((product) => product.slug === slug)

const findColor = (product: Product, id: string): ProductColor => product.colors.find((item) => item.id === id) || product.colors[0] || {
  id: 'default',
  name: 'اللون المختار',
  hex: '#c8b7aa',
  available: true,
  stockMeters: product.stockMeters,
}

const merge = (cart: CartItem[], item: CartItem): CartItem[] => {
  const max = availableMeters(item.product, item.color)
  const key = orderKey(item)
  const existingIndex = cart.findIndex((entry) => orderKey(entry) === key)
  if (max <= 0) return cart
  if (existingIndex < 0) return [...cart, { ...item, length: Math.min(item.length, max) }]
  const next = [...cart]
  const current = next[existingIndex]
  next[existingIndex] = { ...current, length: Math.min(max, current.length + item.length) }
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
    const lengthValue = typeof record.length === 'number' ? record.length : typeof record.quantity === 'number' ? record.quantity : 0
    const length = normalizeHalfMeters(lengthValue)
    if (!length) continue
    result.push(...merge(result, { product, color, length }))
  }
  return result
}

export const addCartItem = (
  cart: CartItem[],
  product: Product,
  color: ProductColor,
  requestedLength: number,
): { cart: CartItem[]; added: number; capped: boolean; available: boolean } => {
  const available = availableMeters(product, color)
  const length = normalizeHalfMeters(requestedLength)
  if (available <= 0 || length <= 0) return { cart, added: 0, capped: false, available: false }
  const existing = cart.find((item) => orderKey(item) === orderKey({ product, color }))
  const current = existing?.length || 0
  const nextLength = Math.min(available, current + length)
  return { cart: merge(cart, { product, color, length }), added: nextLength - current, capped: nextLength < current + length, available: true }
}

export const updateCartItem = (cart: CartItem[], key: string, requestedLength: number): CartItem[] => {
  const item = cart.find((entry) => orderKey(entry) === key)
  if (!item) return cart
  const max = availableMeters(item.product, item.color)
  const nextLength = normalizeHalfMeters(requestedLength)
  if (max <= 0 || nextLength <= max) return nextLength > 0 ? cart.map((entry) => orderKey(entry) === key ? { ...entry, length: nextLength } : entry) : cart.filter((entry) => orderKey(entry) !== key)
  return cart.map((entry) => orderKey(entry) === key ? { ...entry, length: max } : entry)
}

export const removeCartItem = (cart: CartItem[], key: string): CartItem[] => cart.filter((item) => orderKey(item) !== key)

export const reconcileCart = (cart: CartItem[], products: Product[]): CartItem[] => {
  const result: CartItem[] = []
  for (const item of cart) {
    const product = findProduct(products, item.product.slug)
    if (!product) continue
    const color = findColor(product, item.color.id)
    const length = Math.min(item.length, availableMeters(product, color))
    if (length > 0) result.push(...merge(result, { product, color, length }))
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
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart.map((item) => ({ productSlug: item.product.slug, colorId: item.color.id, length: item.length }))))
  } catch {
    return
  }
}
