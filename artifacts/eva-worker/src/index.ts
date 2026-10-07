import type { Env } from './types'
import { toProduct, type ProductRow, type StoreProduct } from './types'
import { requireAdmin, readPin, verifyPin, createSession, destroySession, rateLimit } from './auth'
import { handleAdmin } from './admin'
import { runDiscovery, type DiscoveryInput } from './discover'

const json = (data: unknown, status = 200, extra: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
  })

const cors: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
  'Access-Control-Max-Age': '86400',
}

const withCors = (response: Response): Response => {
  const headers = new Headers(response.headers)
  Object.entries(cors).forEach(([key, value]) => headers.set(key, value))
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

const readBody = async <T>(request: Request): Promise<T | null> => {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

const listProducts = async (env: Env, includeHidden: boolean): Promise<StoreProduct[]> => {
  const result = await env.DB.prepare(
    `SELECT * FROM products ${includeHidden ? '' : 'WHERE hidden = 0'} ORDER BY sort_order ASC, created_at DESC, name ASC`,
  ).all<ProductRow>()
  return (result.results ?? []).map(toProduct)
}

const publicProduct = (product: StoreProduct): StoreProduct => {
  const clone = { ...product }
  delete clone.hidden
  return clone
}

const orderNumber = (): string =>
  `EVA-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`

async function handleApi(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method.toUpperCase()
  const [segment, ...rest] = path.split('/').filter(Boolean)

  if (segment === 'health') {
    const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM products').first<{ n: number }>()
    return json({ status: 'ok', products: count?.n ?? 0, storage: 'r2', checkedAt: new Date().toISOString() })
  }

  if (segment === 'admin') {
    if (rest[0] === 'login' && method === 'POST') {
      const body = await readBody<{ pin?: string }>(request)
      const pin = typeof body?.pin === 'string' ? body.pin : ''
      if (!rateLimit(request)) return json({ error: 'حاولي لاحقاً' }, 429)
      const valid = await verifyPin(env, pin)
      if (!valid) return json({ error: 'الرمز غير صحيح' }, 401)
      const token = await createSession(env)
      return json({ data: { token, expiresIn: 60 * 60 * 8 } })
    }

    const auth = await requireAdmin(request, env)
    if (auth) return auth

    if (rest[0] === 'logout' && method === 'POST') {
      const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
      await destroySession(env, token)
      return json({ data: true })
    }
    if (rest[0] === 'whoami') {
      return json({ data: { ok: true } })
    }
    return handleAdmin(request, env, rest, method)
  }

  if (method !== 'GET' && method !== 'POST') return json({ error: 'طريقة غير مدعومة' }, 405)

  if (segment === 'products') {
    const slug = rest[0]
    if (slug) {
      const row = await env.DB.prepare('SELECT * FROM products WHERE slug = ?1').bind(slug).first<ProductRow>()
      if (!row) return json({ error: 'المنتج غير موجود' }, 404)
      return json({ data: publicProduct(toProduct(row)) })
    }
    const products = await listProducts(env, false)
    return json({ data: products.map(publicProduct) })
  }

  if (segment === 'categories') {
    const result = await env.DB.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC').all()
    return json({ data: result.results ?? [] })
  }

  if (segment === 'routes') {
    const result = await env.DB.prepare('SELECT * FROM routes ORDER BY sort_order ASC').all()
    return json({ data: result.results ?? [] })
  }

  if (segment === 'content') {
    const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'content'").first<{ value: string }>()
    return json({ data: row ? JSON.parse(row.value) : null })
  }

  if (segment === 'settings') {
    const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'store'").first<{ value: string }>()
    const stored = row ? (JSON.parse(row.value) as Record<string, unknown>) : {}
    return json({ data: { colorsEnabled: true, freeDeliveryFrom: 50000, deliveryFee: 5000, ...stored } })
  }

  if (segment === 'contact' && method === 'POST') {
    const body = await readBody<{ name?: unknown; phone?: unknown; message?: unknown }>(request)
    const name = String(body?.name ?? '').trim()
    const phone = String(body?.phone ?? '').trim()
    const message = String(body?.message ?? '').trim()
    if (name.length < 3 || phone.length < 7 || message.length < 10) return json({ error: 'بيانات الرسالة غير مكتملة' }, 400)
    await env.DB.prepare("INSERT INTO contact_messages (name, phone, message, created_at) VALUES (?1, ?2, ?3, datetime('now'))")
      .bind(name, phone, message)
      .run()
    return json({ data: { saved: true } }, 201)
  }

  if (segment === 'discover' && method === 'POST') {
    const input = await readBody<DiscoveryInput>(request)
    if (!input) return json({ error: 'بيانات غير صالحة' }, 400)
    const products = await listProducts(env, false)
    return json({ data: runDiscovery(products.map(publicProduct), input) })
  }

  if (segment === 'orders') {
    if (method === 'GET') {
      const id = rest[0]
      if (!id) return json({ error: 'رقم الطلب مطلوب' }, 400)
      const row = await env.DB.prepare('SELECT order_number, status, created_at FROM orders WHERE order_number = ?1')
        .bind(id)
        .first()
      if (!row) return json({ error: 'الطلب غير موجود' }, 404)
      return json({ data: row })
    }
    if (method === 'POST') {
      const body = await readBody<Record<string, unknown>>(request)
      if (!body || typeof body !== 'object') return json({ error: 'تعذّر قراءة الطلب' }, 400)
      const items = Array.isArray(body.items) ? body.items : []
      const nested = (body.customer ?? {}) as Record<string, unknown>
      const name = String(nested.name ?? body.customerName ?? '').trim()
      const phone = String(nested.phone ?? body.phone ?? '').trim()
      if (!items.length) return json({ error: 'السلة فارغة' }, 400)
      if (!phone) return json({ error: 'رقم الهاتف مطلوب لتأكيد الطلب' }, 400)
      const customer = { ...nested, name, phone }
      const totals =
        body.totals && typeof body.totals === 'object'
          ? body.totals
          : { subtotal: body.subtotal ?? 0, deliveryFee: body.deliveryFee ?? 0, total: body.total ?? 0 }
      const requested = String(body.orderNumber ?? '').trim()
      const number = requested || orderNumber()
      if (requested) {
        const existing = await env.DB.prepare('SELECT order_number FROM orders WHERE order_number = ?1').bind(number).first()
        if (existing) return json({ data: { orderNumber: number, status: 'new', saved: true } }, 200)
      }
      await env.DB.prepare(
        `INSERT INTO orders (id, order_number, status, customer, items, totals, note, channel, created_at, updated_at)
         VALUES (?1, ?2, 'new', ?3, ?4, ?5, ?6, 'web', datetime('now'), datetime('now'))`,
      )
        .bind(
          number,
          number,
          JSON.stringify(customer),
          JSON.stringify(items),
          JSON.stringify(totals),
          String(body.notes ?? body.note ?? ''),
        )
        .run()
      return json({ data: { orderNumber: number, status: 'new', saved: true } }, 201)
    }
  }

  return json({ error: 'المسار غير موجود' }, 404)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url)
      if (request.method === 'OPTIONS') return withCors(new Response(null, { status: 204, headers: cors }))

      if (url.pathname.startsWith('/api/') || url.pathname === '/api') {
        const path = url.pathname.slice('/api'.length) || '/'
        const response = await handleApi(request, env, path)
        return withCors(response)
      }

      if (url.pathname.startsWith('/media/')) {
        const key = decodeURIComponent(url.pathname.slice('/media/'.length))
        const row = await env.DB.prepare('SELECT content, type, LENGTH(content) AS db_len FROM media WHERE key = ?1')
          .bind(key)
          .first<{ content: number[] | ArrayBuffer | null; type: string | null; db_len: number | null }>()
        if (!row?.content) return new Response('Not found', { status: 404 })
        const raw = row.content
        const bytes = Array.isArray(raw) ? new Uint8Array(raw) : new Uint8Array(raw)
        const headers = new Headers()
        headers.set('Content-Type', row.type || 'image/jpeg')
        headers.set('Cache-Control', 'public, max-age=31536000, immutable')
        headers.set('X-Db-Len', String(row.db_len ?? -1))
        headers.set('X-Db-Shape', JSON.stringify({ t: typeof raw, a: Array.isArray(raw), c: raw && (raw as object).constructor ? (raw as object).constructor.name : 'null', n: Array.isArray(raw) ? raw.length : -1 }))
        return new Response(bytes, { headers })
      }

      return new Response('EVA STORE API', { status: 404 })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'خطأ غير متوقع'
      return withCors(json({ error: message }, 500))
    }
  },
} satisfies ExportedHandler<Env>
