import type { Category, Product, ProductColor, ProductFaq, ProductSpecs } from '@/types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

const text = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback)

const number = (value: unknown, fallback = 0): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const emptySpecs = (): ProductSpecs => ({
  composition: '',
  width: '',
  weight: '',
  stretch: '',
  isStretch: false,
  opacity: '',
  finish: '',
  care: '',
  use: '',
})

const sanitizeColor = (value: unknown, index: number, stockMeters: number): ProductColor | null => {
  if (!isRecord(value)) return null
  const id = text(value.id) || `color-${index + 1}`
  const name = text(value.name) || 'لون'
  const color: ProductColor = {
    id,
    name,
    hex: text(value.hex, '#8e6e7d'),
    available: value.available !== false,
    stockMeters: Math.max(0, number(value.stockMeters, stockMeters)),
  }
  const image = text(value.image)
  if (image) color.image = image
  return color
}

const defaultColor = (stockMeters: number): ProductColor => ({
  id: 'default',
  name: 'اللون الافتراضي',
  hex: '#8e6e7d',
  available: true,
  stockMeters,
})

/** A backup file (or a hand-edited localStorage value) must never be able to
 *  crash the storefront, so every product is rebuilt field by field. */
export const sanitizeProduct = (value: unknown): Product | null => {
  if (!isRecord(value)) return null
  const slug = text(value.slug).trim()
  const name = text(value.name).trim()
  if (!slug || !name) return null

  const images = list(value.images).filter((item): item is string => typeof item === 'string' && item.length > 0)
  const image = text(value.image) || images[0] || ''
  const stockMeters = Math.max(0, number(value.stockMeters))
  const rawSpecs = isRecord(value.specs) ? value.specs : {}
  const specs: ProductSpecs = {
    ...emptySpecs(),
    composition: text(rawSpecs.composition),
    width: text(rawSpecs.width),
    weight: text(rawSpecs.weight),
    stretch: text(rawSpecs.stretch),
    isStretch: rawSpecs.isStretch === true,
    opacity: text(rawSpecs.opacity),
    finish: text(rawSpecs.finish),
    care: text(rawSpecs.care),
    use: text(rawSpecs.use),
  }
  const faqs: ProductFaq[] = list(value.faqs)
    .filter(isRecord)
    .map((item) => ({ question: text(item.question), answer: text(item.answer) }))
    .filter((item) => item.question.length > 0)
  const colors = list(value.colors)
    .map((item, index) => sanitizeColor(item, index, stockMeters))
    .filter((item): item is ProductColor => item !== null)
  const product: Product = {
    id: text(value.id) || slug,
    slug,
    name,
    type: text(value.type),
    categoryId: text(value.categoryId),
    description: text(value.description),
    price: Math.max(0, number(value.price)),
    image,
    images: images.length ? images : [image],
    colors: colors.length ? colors : [defaultColor(stockMeters)],
    specs,
    faqs,
    isNew: value.isNew === true,
    isFeatured: value.isFeatured === true,
    stockMeters,
    createdAt: text(value.createdAt) || new Date().toISOString(),
  }
  const compareAtPrice = number(value.compareAtPrice, 0)
  if (compareAtPrice > 0) product.compareAtPrice = compareAtPrice
  const video = text(value.video)
  if (video) product.video = video
  if (value.colorsEnabled === false) product.colorsEnabled = false
  const sourceUrl = text(value.sourceUrl)
  if (sourceUrl) product.sourceUrl = sourceUrl
  return product
}

export const sanitizeProducts = (value: unknown): Product[] =>
  list(value).map(sanitizeProduct).filter((item): item is Product => item !== null)

export const sanitizeCategory = (value: unknown, index: number): Category | null => {
  if (!isRecord(value)) return null
  const name = text(value.name).trim()
  if (!name) return null
  const id = text(value.id) || text(value.slug) || `category-${index + 1}`
  return {
    id,
    slug: text(value.slug) || id,
    name,
    description: text(value.description, 'تشكيلة من الأقمشة المختارة'),
    image: text(value.image),
    accent: text(value.accent, '#a34163'),
  }
}

export const sanitizeCategories = (value: unknown): Category[] =>
  list(value).map(sanitizeCategory).filter((item): item is Category => item !== null)
