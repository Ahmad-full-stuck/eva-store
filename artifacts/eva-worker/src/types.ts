export interface Env {
  DB: D1Database
  MEDIA?: R2Bucket
  STORE_ORIGIN: string
  ADMIN_PIN?: string
}

export interface ProductColor {
  id: string
  name: string
  hex: string
  available: boolean
  stockMeters: number
  image?: string
}

export interface ProductRow {
  id: string
  slug: string
  name: string
  type: string
  category_id: string
  description: string
  price: number
  compare_at_price: number | null
  image: string
  images_json: string
  colors_json: string
  specs_json: string
  faqs_json: string
  colors_enabled: number
  is_new: number
  is_featured: number
  hidden: number
  stock_meters: number
  source_url: string
  origin: string
  sort_order: number
  created_at: string
  updated_at: string
  video: string | null
}

export interface StoreProduct {
  id: string
  slug: string
  name: string
  type: string
  categoryId: string
  description: string
  price: number
  compareAtPrice?: number
  image: string
  images: string[]
  colors: ProductColor[]
  colorsEnabled: boolean
  specs: Record<string, unknown>
  faqs: { question: string; answer: string }[]
  isNew: boolean
  isFeatured: boolean
  hidden?: boolean
  stockMeters: number
  sourceUrl?: string
  createdAt: string
  video?: string
}

const parseJson = <T>(raw: string, fallback: T): T => {
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export const toProduct = (row: ProductRow): StoreProduct => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  type: row.type,
  categoryId: row.category_id,
  description: row.description,
  price: row.price,
  compareAtPrice: row.compare_at_price ?? undefined,
  image: row.image,
  images: parseJson<string[]>(row.images_json, []),
  colors: parseJson<ProductColor[]>(row.colors_json, []),
  colorsEnabled: row.colors_enabled === 1,
  specs: parseJson<Record<string, unknown>>(row.specs_json, {}),
  faqs: parseJson<{ question: string; answer: string }[]>(row.faqs_json, []),
  isNew: row.is_new === 1,
  isFeatured: row.is_featured === 1,
  hidden: row.hidden === 1,
  stockMeters: row.stock_meters,
  sourceUrl: row.source_url,
  createdAt: row.created_at,
  video: row.video || undefined,
})
