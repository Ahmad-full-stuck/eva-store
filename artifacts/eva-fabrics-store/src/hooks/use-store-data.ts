import { useEffect, useState } from 'react'
import type { Category, DataSource, Product, ProductColor, ProductFaq, ProductSpecs, SiteRoute, StorefrontData } from '@/types'
import { fallbackCategories, fallbackProducts, fallbackRoutes } from '@/lib/fallback-data'
import { normalizeArabic } from '@/lib/catalog'
import { apiUrl } from '@/lib/site'

type ApiStatus = 'loading' | 'ready' | 'fallback'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const numberFrom = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/[^\d.-]/g, ''))
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

const textFrom = (value: unknown, fallback: string): string => typeof value === 'string' && value.trim() ? value.trim() : fallback

const booleanFrom = (value: unknown, fallback: boolean): boolean => typeof value === 'boolean' ? value : fallback

const listFrom = (payload: unknown, key: string): unknown[] => {
  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []
  if (Array.isArray(payload[key])) return payload[key] as unknown[]
  if (isRecord(payload.data)) {
    if (Array.isArray(payload.data[key])) return payload.data[key] as unknown[]
    if (Array.isArray(payload.data)) return payload.data as unknown[]
  }
  if (Array.isArray(payload.items)) return payload.items as unknown[]
  return []
}

const stockFrom = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, value)
  if (typeof value === 'string') {
    if (value.includes('غير متوفر')) return 0
    const parsed = Number(value.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/[^\d.-]/g, ''))
    if (Number.isFinite(parsed)) return Math.max(0, parsed)
    return value.includes('محدود') ? Math.min(fallback, 2) : fallback
  }
  return fallback
}

const normalizeColor = (value: unknown, index: number, stockMeters: number, primaryColorName: string, productAvailable: boolean): ProductColor => {
  const available = productAvailable && stockMeters > 0
  if (typeof value === 'string') {
    const isHex = /^#[0-9a-f]{3,8}$/i.test(value)
    return {
      id: `color-${index + 1}`,
      name: isHex ? (index === 0 && primaryColorName ? primaryColorName : `لون ${index + 1}`) : value,
      hex: isHex ? value : '#8e6e7d',
      available,
      stockMeters: available ? stockMeters : 0,
    }
  }
  if (!isRecord(value)) return { id: `color-${index + 1}`, name: `لون ${index + 1}`, hex: '#8e6e7d', available, stockMeters: available ? stockMeters : 0 }
  const colorStock = stockFrom(value.stockMeters ?? value.inventory ?? value.stock, stockMeters)
  return {
    id: textFrom(value.id, `color-${index + 1}`),
    name: textFrom(value.name ?? value.color, index === 0 && primaryColorName ? primaryColorName : `لون ${index + 1}`),
    hex: /^#[0-9a-f]{3,8}$/i.test(String(value.hex)) ? String(value.hex) : '#8e6e7d',
    available: productAvailable && booleanFrom(value.available, colorStock > 0) && colorStock > 0,
    stockMeters: productAvailable ? colorStock : 0,
  }
}

const normalizeSpecs = (value: unknown): ProductSpecs => {
  const source = isRecord(value) ? value : {}
  const stretch = textFrom(source.stretch, 'غير محدد')
  const hasExplicitStretch = typeof source.isStretch === 'boolean'
  const isStretch = hasExplicitStretch ? source.isStretch as boolean : !normalizeArabic(stretch).includes('غير مطاطي')
  return {
    composition: textFrom(source.composition, 'خامة غير محددة'),
    width: textFrom(source.width, 'غير محددة'),
    weight: textFrom(source.weight, 'غير محددة'),
    stretch,
    isStretch,
    opacity: textFrom(source.opacity, 'غير محددة'),
    finish: textFrom(source.finish, 'غير محدد'),
    care: textFrom(source.care, 'اتباع تعليمات العناية على البطاقة'),
    use: textFrom(source.use, 'حسب تصميم القطعة'),
  }
}

const normalizeFaq = (value: unknown, index: number): ProductFaq | null => {
  if (!isRecord(value)) return null
  const question = textFrom(value.question ?? value.q, '')
  const answer = textFrom(value.answer ?? value.a, '')
  return question && answer ? { question, answer } : null
}

const normalizeProduct = (value: unknown, index: number): Product | null => {
  if (!isRecord(value)) return null
  const name = textFrom(value.name, '')
  const slug = textFrom(value.slug, textFrom(value.id, `product-${index + 1}`))
  if (!name || !slug) return null
  const image = textFrom(value.image, 'fabrics/hero.jpg')
  const imageList = Array.isArray(value.images) ? value.images.filter((item): item is string => typeof item === 'string' && item.length > 0) : []
  const stockMeters = stockFrom(value.stockMeters ?? value.stockQuantity ?? value.inventory ?? value.stock, 10)
  const productAvailable = booleanFrom(value.inStock, stockMeters > 0)
  const primaryColorName = textFrom(value.color, '')
  const colors = Array.isArray(value.colors) && value.colors.length > 0
    ? value.colors.map((item, colorIndex) => normalizeColor(item, colorIndex, stockMeters, primaryColorName, productAvailable))
    : [normalizeColor({}, 0, stockMeters, primaryColorName, productAvailable)]
  return {
    id: textFrom(value.id, slug),
    slug,
    name,
    type: textFrom(value.type, 'قماش'),
    categoryId: textFrom(value.categoryId ?? value.category, 'plain'),
    description: textFrom(value.description, 'قماش مختار لتوسيع خيارات التفصيل والتصميم.'),
    price: Math.max(0, numberFrom(value.price, 0)),
    compareAtPrice: typeof value.compareAtPrice === 'number' ? value.compareAtPrice : undefined,
    image,
    images: [image, ...imageList.filter((item) => item !== image)],
    colors,
    specs: normalizeSpecs(isRecord(value.specs) ? { ...value, ...value.specs } : value),
    faqs: Array.isArray(value.faqs) ? value.faqs.map(normalizeFaq).filter((item): item is ProductFaq => item !== null) : [],
    isNew: booleanFrom(value.isNew, false),
    isFeatured: booleanFrom(value.isFeatured, true),
    stockMeters,
    createdAt: textFrom(value.createdAt, new Date().toISOString().slice(0, 10)),
  }
}

const normalizeCategory = (value: unknown, index: number): Category | null => {
  if (!isRecord(value)) return null
  const name = textFrom(value.name, '')
  const id = textFrom(value.id ?? value.slug, `category-${index + 1}`)
  return name ? { id, slug: textFrom(value.slug, id), name, description: textFrom(value.description, 'تشكيلة من الأقمشة المختارة'), image: textFrom(value.image, 'fabrics/hero.jpg'), accent: textFrom(value.accent, '#b44a72') } : null
}

const normalizeRoute = (value: unknown, index: number): SiteRoute | null => {
  if (!isRecord(value)) return null
  const path = textFrom(value.path, '')
  if (!path.startsWith('/') || path.startsWith('//')) return null
  return { id: textFrom(value.id, `route-${index + 1}`), label: textFrom(value.label, 'رابط'), path, header: booleanFrom(value.header, false) }
}

const fetchList = async (path: string, signal: AbortSignal, key: string): Promise<unknown[]> => {
  const response = await fetch(apiUrl(path), { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`API ${path} failed`)
  const payload: unknown = await response.json()
  return listFrom(payload, key)
}

export const useStoreData = (): StorefrontData & { status: ApiStatus } => {
  const [data, setData] = useState<StorefrontData>({ products: fallbackProducts, categories: fallbackCategories, routes: fallbackRoutes, source: 'fallback' })
  const [status, setStatus] = useState<ApiStatus>('loading')

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 3500)
    const load = async (): Promise<void> => {
      const [productsResult, categoriesResult, routesResult] = await Promise.allSettled([
        fetchList('/api/products', controller.signal, 'products'),
        fetchList('/api/categories', controller.signal, 'categories'),
        fetchList('/api/routes', controller.signal, 'routes'),
      ])
      const products = productsResult.status === 'fulfilled' ? productsResult.value.map(normalizeProduct).filter((item): item is Product => item !== null) : []
      const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value.map(normalizeCategory).filter((item): item is Category => item !== null) : []
      const routes = routesResult.status === 'fulfilled' ? routesResult.value.map(normalizeRoute).filter((item): item is SiteRoute => item !== null) : []
      const successful = Number(products.length > 0) + Number(categories.length > 0) + Number(routes.length > 0)
      const source: DataSource = successful === 0 ? 'fallback' : successful === 3 ? 'api' : 'mixed'
      setData({
        products: products.length ? products : fallbackProducts,
        categories: categories.length ? categories : fallbackCategories,
        routes: routes.length ? routes : fallbackRoutes,
        source,
      })
      setStatus(successful === 0 ? 'fallback' : 'ready')
    }
    void load()
    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [])

  return { ...data, status }
}
