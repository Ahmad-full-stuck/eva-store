import type { Env, ProductRow, StoreProduct, ProductColor } from './types'
import { toProduct } from './types'
import { hashPin } from './auth'

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })

const text = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value.trim() || fallback : fallback

const num = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''))
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

const flag = (value: unknown, fallback = false): boolean => (typeof value === 'boolean' ? value : fallback)

const slugify = (value: string): string => {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || `item-${Date.now().toString(36)}`
}

const normalizeColors = (value: unknown, stock: number): ProductColor[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item, index) => {
      const record = (item ?? {}) as Record<string, unknown>
      const hex = text(record.hex, '').toLowerCase()
      return {
        id: text(record.id, `color-${index + 1}`),
        name: text(record.name, `لون ${index + 1}`),
        hex: /^#[0-9a-f]{3,8}$/.test(hex) ? hex : '#8e6e7d',
        available: flag(record.available, true),
        stockMeters: Math.max(0, num(record.stockMeters, stock)),
        image: typeof record.image === 'string' ? record.image : undefined,
      } satisfies ProductColor
    })
    .filter((color) => Boolean(color))
}

interface ProductInput {
  slug?: string
  name?: string
  type?: string
  categoryId?: string
  description?: string
  price?: number | string
  compareAtPrice?: number | string | null
  image?: string
  images?: unknown
  colors?: unknown
  colorsEnabled?: boolean
  specs?: unknown
  faqs?: unknown
  isNew?: boolean
  isFeatured?: boolean
  hidden?: boolean
  stockMeters?: number | string
  sourceUrl?: string
  createdAt?: string
  sort_order?: number
}

const jsonColumn = (value: unknown, fallback: string): string => {
  if (value === undefined || value === null) return fallback
  try {
    return JSON.stringify(value)
  } catch {
    return fallback
  }
}

const buildProduct = (input: ProductInput, existing?: ProductRow) => {
  const slug = text(input.slug, existing ? existing.slug : slugify(text(input.name, '')))
  const name = text(input.name, existing ? existing.name : '')
  const images = Array.isArray(input.images)
    ? (input.images as unknown[]).filter((item): item is string => typeof item === 'string' && item.length > 0)
    : []
  const stock = Math.max(0, num(input.stockMeters, existing ? existing.stock_meters : 10))
  const image = text(input.image, images[0] || (existing ? existing.image : 'fabrics/hero.jpg'))
  return {
    id: existing ? existing.id : slug,
    slug,
    name,
    type: text(input.type, existing ? existing.type : 'قماش'),
    categoryId: text(input.categoryId, existing ? existing.category_id : 'plain'),
    description: text(input.description, existing ? existing.description : ''),
    price: Math.max(0, num(input.price, existing ? existing.price : 0)),
    compareAtPrice:
      input.compareAtPrice === null ? null : Number.isFinite(num(input.compareAtPrice, NaN)) ? num(input.compareAtPrice, 0) : (existing?.compare_at_price ?? null),
    image,
    images: jsonColumn(images.length ? images : [image], existing ? existing.images_json : '[]'),
    colors: jsonColumn(normalizeColors(input.colors, stock), existing ? existing.colors_json : '[]'),
    specs: jsonColumn(input.specs, existing ? existing.specs_json : '{}'),
    faqs: jsonColumn(input.faqs, existing ? existing.faqs_json : '[]'),
    colorsEnabled: (input.colorsEnabled === undefined ? existing?.colors_enabled === undefined || existing.colors_enabled === 1 : input.colorsEnabled) ? 1 : 0,
    isNew: (input.isNew === undefined ? existing?.is_new === 1 : input.isNew) ? 1 : 0,
    isFeatured: (input.isFeatured === undefined ? existing ? existing.is_featured === 1 : true : input.isFeatured) ? 1 : 0,
    hidden: (input.hidden === undefined ? existing?.hidden === 1 : input.hidden) ? 1 : 0,
    stock: stock,
    sourceUrl: text(input.sourceUrl, existing ? existing.source_url : ''),
    createdAt: text(input.createdAt, existing ? existing.created_at : new Date().toISOString().slice(0, 10)),
    sortOrder: num(input.sort_order, existing ? existing.sort_order : 0),
  }
}

const UPSERT_SQL = `INSERT INTO products
  (id, slug, name, type, category_id, description, price, compare_at_price, image, images_json, colors_json,
   specs_json, faqs_json, colors_enabled, is_new, is_featured, hidden, stock_meters, source_url, origin,
   sort_order, created_at, updated_at)
  VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, datetime('now'))
  ON CONFLICT(slug) DO UPDATE SET
    name = excluded.name, type = excluded.type, category_id = excluded.category_id,
    description = excluded.description, price = excluded.price, compare_at_price = excluded.compare_at_price,
    image = excluded.image, images_json = excluded.images_json, colors_json = excluded.colors_json,
    specs_json = excluded.specs_json, faqs_json = excluded.faqs_json, colors_enabled = excluded.colors_enabled,
    is_new = excluded.is_new, is_featured = excluded.is_featured, hidden = excluded.hidden,
    stock_meters = excluded.stock_meters, source_url = excluded.source_url, sort_order = excluded.sort_order,
    updated_at = datetime('now')`

const bindProduct = (value: ReturnType<typeof buildProduct>, origin: string) => [
  value.id,
  value.slug,
  value.name,
  value.type,
  value.categoryId,
  value.description,
  value.price,
  value.compareAtPrice,
  value.image,
  value.images,
  value.colors,
  value.specs,
  value.faqs,
  value.colorsEnabled,
  value.isNew,
  value.isFeatured,
  value.hidden,
  value.stock,
  value.sourceUrl,
  origin,
  value.sortOrder,
  value.createdAt,
]

const readBody = async <T>(request: Request): Promise<T | null> => {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

const dataUrlToKey = (dataUrl: string, product: string): { key: string; bytes: number; type: string; data: string } | null => {
  const match = /^data:([^;,]+)?;base64,(.*)$/s.exec(dataUrl)
  if (!match) return null
  const type = match[1] || 'image/jpeg'
  const extension = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg'
  const base = product.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'upload'
  const key = `products/${base}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${extension}`
  return { key, bytes: Math.floor((match[2].length * 3) / 4), type, data: match[2] }
}

export async function handleAdmin(request: Request, env: Env, rest: string[], method: string): Promise<Response> {
  const [resource, id] = rest

  if (resource === 'products') {
    if (method === 'GET') {
      const rows = await env.DB.prepare('SELECT * FROM products ORDER BY sort_order ASC, created_at DESC, name ASC').all<ProductRow>()
      return json({ data: (rows.results ?? []).map(toProduct) })
    }
    if (method === 'POST' && id !== 'import') {
      const body = await readBody<ProductInput>(request)
      if (!body?.name) return json({ error: 'اسم المنتج مطلوب' }, 400)
      const value = buildProduct(body)
      if (!value.name) return json({ error: 'اسم المنتج مطلوب' }, 400)
      await env.DB.prepare(UPSERT_SQL).bind(...bindProduct(value, 'admin')).run()
      return json({ data: { slug: value.slug } }, 201)
    }
    if (method === 'POST' && id === 'import') {
      const body = await readBody<{ products?: ProductInput[] }>(request)
      const list = Array.isArray(body?.products) ? body.products : []
      if (!list.length) return json({ error: 'لا توجد منتجات للاستيراد' }, 400)
      let saved = 0
      for (const item of list) {
        if (!item?.name) continue
        const value = buildProduct(item)
        if (!value.name) continue
        await env.DB.prepare(UPSERT_SQL).bind(...bindProduct(value, 'import')).run()
        saved += 1
      }
      return json({ data: { imported: saved } }, 201)
    }
    if (method === 'PUT' && id) {
      const slug = decodeURIComponent(id)
      const body = await readBody<ProductInput>(request)
      if (!body) return json({ error: 'بيانات غير صالحة' }, 400)
      const existing = await env.DB.prepare('SELECT * FROM products WHERE slug = ?1').bind(slug).first<ProductRow>()
      if (!existing) return json({ error: 'المنتج غير موجود' }, 404)
      const value = buildProduct({ ...body, slug: body.slug || slug }, existing)
      await env.DB.prepare(UPSERT_SQL).bind(...bindProduct(value, existing.origin)).run()
      return json({ data: { slug: value.slug } })
    }
    if (method === 'DELETE' && id) {
      const slug = decodeURIComponent(id)
      const hard = new URL(request.url).searchParams.get('hard') === '1'
      if (hard) {
        await env.DB.prepare('DELETE FROM products WHERE slug = ?1').bind(slug).run()
      } else {
        await env.DB.prepare('UPDATE products SET hidden = 1, updated_at = datetime(\'now\') WHERE slug = ?1').bind(slug).run()
      }
      return json({ data: { slug, deleted: true } })
    }
  }

  if (resource === 'upload' && method === 'POST') {
    const body = await readBody<{ dataUrl?: string; product?: string }>(request)
    if (!body?.dataUrl) return json({ error: 'لا توجد صورة' }, 400)
    const parsed = dataUrlToKey(body.dataUrl, text(body.product, 'upload'))
    if (!parsed) return json({ error: 'صيغة الصورة غير مدعومة' }, 400)
    if (parsed.bytes > 12 * 1024 * 1024) return json({ error: 'حجم الصورة يتجاوز 12 ميجابايت' }, 413)
    const bytes = Uint8Array.from(atob(parsed.data), (char) => char.charCodeAt(0))
    await env.MEDIA.put(parsed.key, bytes, {
      httpMetadata: { contentType: parsed.type, cacheControl: 'public, max-age=31536000, immutable' },
    })
    await env.DB.prepare('INSERT OR REPLACE INTO media (key, url, bytes, product) VALUES (?1, ?2, ?3, ?4)')
      .bind(parsed.key, `/media/${parsed.key}`, parsed.bytes, text(body.product))
      .run()
    return json({ data: { url: `/media/${parsed.key}`, key: parsed.key } }, 201)
  }

  if (resource === 'upload' && method === 'DELETE') {
    const body = await readBody<{ key?: string }>(request)
    if (body?.key) {
      await env.MEDIA.delete(body.key)
      await env.DB.prepare('DELETE FROM media WHERE key = ?1').bind(body.key).run()
    }
    return json({ data: true })
  }

  if (resource === 'content') {
    if (method === 'GET') {
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'content'").first<{ value: string }>()
      return json({ data: row ? JSON.parse(row.value) : null })
    }
    if (method === 'PUT') {
      const body = await readBody<Record<string, unknown>>(request)
      if (!body || typeof body !== 'object') return json({ error: 'بيانات غير صالحة' }, 400)
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'content'").first<{ value: string }>()
      const merged = { ...(row ? (JSON.parse(row.value) as Record<string, unknown>) : {}), ...body }
      await env.DB.prepare(
        "INSERT INTO settings (key, value, updated_at) VALUES ('content', ?1, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')",
      ).bind(JSON.stringify(merged)).run()
      return json({ data: merged })
    }
  }

  if (resource === 'settings') {
    if (method === 'GET') {
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'store'").first<{ value: string }>()
      return json({ data: row ? JSON.parse(row.value) : {} })
    }
    if (method === 'PUT') {
      const body = await readBody<Record<string, unknown>>(request)
      if (!body) return json({ error: 'بيانات غير صالحة' }, 400)
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'store'").first<{ value: string }>()
      const merged = { ...(row ? (JSON.parse(row.value) as Record<string, unknown>) : {}), ...body }
      await env.DB.prepare(
        "INSERT INTO settings (key, value, updated_at) VALUES ('store', ?1, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')",
      ).bind(JSON.stringify(merged)).run()
      return json({ data: merged })
    }
  }

  if (resource === 'pin' && method === 'POST') {
    const body = await readBody<{ pin?: string }>(request)
    const pin = text(body?.pin)
    if (!/^\d{4,12}$/.test(pin)) return json({ error: 'الرمز يجب أن يكون من 4 إلى 12 رقماً' }, 400)
    const hashed = await hashPin(pin)
    await env.DB.prepare(
      "INSERT INTO settings (key, value, updated_at) VALUES ('admin_pin', ?1, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')",
    ).bind(hashed).run()
    return json({ data: { changed: true } })
  }

  if (resource === 'orders') {
    if (method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 500').all()
      return json({ data: result.results ?? [] })
    }
    if (method === 'PATCH' && id) {
      const body = await readBody<{ status?: string }>(request)
      const status = text(body?.status, 'new')
      await env.DB.prepare("UPDATE orders SET status = ?1, updated_at = datetime('now') WHERE order_number = ?2")
        .bind(status, decodeURIComponent(id))
        .run()
      return json({ data: { orderNumber: id, status } })
    }
  }

  if (resource === 'contacts' && method === 'GET') {
    const result = await env.DB.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200').all()
    return json({ data: result.results ?? [] })
  }

  if (resource === 'categories' && method === 'GET') {
    const result = await env.DB.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC').all()
    return json({ data: result.results ?? [] })
  }

  if (resource === 'restore' && method === 'POST') {
    const body = await readBody<{ slugs?: string[] }>(request)
    const slugs = Array.isArray(body?.slugs) ? body.slugs : []
    for (const slug of slugs) {
      await env.DB.prepare("UPDATE products SET hidden = 0, updated_at = datetime('now') WHERE slug = ?1").bind(slug).run()
    }
    return json({ data: { restored: slugs.length } })
  }

  return json({ error: 'المسار غير موجود' }, 404)
}
