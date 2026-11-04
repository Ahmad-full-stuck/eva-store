import type { Env } from './types'
import { toProduct, type ProductRow, type StoreProduct } from './types'
import { requireAdmin, createSession, destroySession, rateLimit, orderRateLimit, ensureAuthSchema, hashPassword, verifyPassword, SESSION_TTL_MS } from './auth'
import { handleAdmin } from './admin'
import { runDiscovery, type DiscoveryInput } from './discover'
import { sendPushToAll, pushConfigured } from './push'

const MAINTENANCE_MODE: boolean = false
const MAINTENANCE_PAGE = "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"theme-color\" content=\"#f5f4f1\"><meta name=\"robots\" content=\"noindex,nofollow\"><title>Temporarily Unavailable</title>\n<style>\n:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,\"Segoe UI\",Arial,sans-serif;color-scheme:light}*{box-sizing:border-box}html,body{width:100%;min-height:100%;margin:0}body{min-height:100vh;display:grid;place-items:center;padding:28px 18px;color:#222b35;background:radial-gradient(ellipse at 50% 0%,rgba(222,190,141,.19),transparent 48%),linear-gradient(145deg,#f7f6f2,#efeee9)}main{width:min(100%,680px);padding:clamp(30px,6vw,58px);text-align:center;background:rgba(255,255,255,.91);border:1px solid rgba(39,48,59,.09);border-radius:24px;box-shadow:0 24px 80px rgba(25,32,42,.09)}.mark{width:64px;height:64px;margin:0 auto 26px;display:grid;place-items:center;border-radius:20px;color:#8e6634;background:#f7f0e5;border:1px solid #eadcc7}.eyebrow{margin:0 0 13px;color:#967345;font-size:11px;font-weight:700;letter-spacing:.19em}h1{margin:0;font-size:clamp(30px,6vw,43px);letter-spacing:-.04em;line-height:1.15;color:#202833}.lead{margin:21px auto 0;max-width:510px;color:#58616b;font-size:16px;line-height:1.8}.rule{height:1px;margin:29px 0;background:#e9e7e1}.rtl{direction:rtl;font-family:\"Segoe UI\",Tahoma,Arial,sans-serif}.rtl h2{margin:0 0 10px;color:#303945;font-size:20px}.rtl p{margin:0 auto;max-width:520px;color:#65707b;font-size:15px;line-height:1.9}.owner{margin:24px 0 0;padding:17px 19px;border-radius:14px;background:#f8f7f4;color:#616a74;font-size:13px;line-height:1.8}.owner strong{color:#343e49}footer{margin-top:26px;color:#9299a1;font-size:11px;line-height:1.7}@media(max-width:480px){body{padding:16px}main{border-radius:19px}.mark{width:58px;height:58px;border-radius:18px}}\n</style></head><body><main>\n<div class=\"mark\" aria-hidden=\"true\"><svg width=\"31\" height=\"31\" viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M12 8v4.6m0 3.4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></div>\n<p class=\"eyebrow\">SERVICE NOTICE · 503</p><h1>Temporarily Unavailable</h1>\n<p class=\"lead\">This website is temporarily unavailable while a pending hosting or domain renewal payment is being resolved.</p><div class=\"rule\"></div>\n<section class=\"rtl\" lang=\"ar\" dir=\"rtl\"><h2>الموقع غير متاح مؤقتاً</h2><p>تم إيقاف الخدمة مؤقتاً لحين استكمال تجديد الاستضافة أو النطاق وتسوية الدفعة المعلّقة.</p></section>\n<div class=\"owner\"><strong>If you own this website:</strong> please review your hosting provider's billing details and complete any outstanding payment or renewal to restore service.<div class=\"rtl\" lang=\"ar\" dir=\"rtl\" style=\"margin-top:8px\">إذا كنت مالك الموقع، يرجى مراجعة الفوترة لدى مزوّد الاستضافة وإكمال أي دفعة أو تجديد مستحق لإعادة الخدمة.</div></div>\n<footer>This is a temporary notice. It does not delete or modify the website's project files or stored data.<div class=\"rtl\" lang=\"ar\" dir=\"rtl\">هذا إشعار مؤقت ولا يحذف ملفات المشروع أو البيانات المخزّنة ولا يغيّرها.</div></footer>\n</main></body></html>"
const MAINTENANCE_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
}

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

/**
 * Cloudflare edge cache for the public catalog/content endpoints. Without this
 * every page load / filter change hits D1 and the 127-product payload takes
 * 1-4s to come back. Bumping CACHE_VERSION (or writing via the admin API)
 * invalidates everything at once.
 */
const CACHE_VERSION = 'v2'

const cacheKeyFor = (request: Request): Request => {
  // The Cache API only accepts fully-qualified URLs as keys, so the version
  // rides in a query parameter instead of a prefix.
  const url = new URL(request.url)
  url.searchParams.set('__lamha', CACHE_VERSION)
  return new Request(url.toString())
}

const cachedJson = async (request: Request, ttlSeconds: number, build: () => Promise<Response>): Promise<Response> => {
  const cache = caches.default
  const cacheKey = cacheKeyFor(request)
  const hit = await cache.match(cacheKey)
  if (hit) {
    // Rewrite the marker so the client can tell an edge hit from a rebuild.
    const headers = new Headers(hit.headers)
    headers.set('X-Eva-Cache', 'HIT')
    return new Response(hit.body, { status: hit.status, statusText: hit.statusText, headers })
  }
  const response = await build()
  if (response.ok && ttlSeconds > 0) {
    const headers = new Headers(response.headers)
    headers.set('Cache-Control', `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 4}`)
    headers.set('X-Eva-Cache', 'MISS')
    const cacheable = new Response(response.body, { status: response.status, statusText: response.statusText, headers })
    try {
      await cache.put(cacheKey, cacheable.clone())
    } catch (error) {
      // Not fatal — the response is still served — but worth surfacing in logs
      // because a silently-failing cache looks identical to a working one.
      console.log(`[cache] put failed key=${cacheKey.url} error=${error instanceof Error ? error.message : String(error)}`)
    }
    return cacheable
  }
  return response
}

/** Drop every cached public payload (call after any admin write). */
const purgePublicCache = async (): Promise<void> => {
  const cache = caches.default
  const keys = ['/api/products', '/api/categories', '/api/routes', '/api/content', '/api/settings'].map((path) => {
    const url = new URL(path, env.STORE_ORIGIN)
    url.searchParams.set('__lamha', CACHE_VERSION)
    return new Request(url.toString())
  })
  await Promise.all(keys.map((key) => cache.delete(key).catch(() => false)))
}

const readBody = async <T>(request: Request): Promise<T | null> => {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

const listProducts = async (env: Env, includeHidden: boolean, page?: number, limit?: number): Promise<StoreProduct[]> => {
  const base = `SELECT * FROM products ${includeHidden ? '' : 'WHERE hidden = 0'}`
  const ordered = `${base} ORDER BY sort_order ASC, created_at DESC, name ASC`
  if (page && limit) {
    const result = await env.DB.prepare(`${ordered} LIMIT ?1 OFFSET ?2`).bind(limit, (page - 1) * limit).all<ProductRow>()
    return (result.results ?? []).map(toProduct)
  }
  const result = await env.DB.prepare(ordered).all<ProductRow>()
  return (result.results ?? []).map(toProduct)
}

const publicProduct = (product: StoreProduct): StoreProduct => {
  const clone = { ...product }
  delete clone.hidden
  return clone
}

const orderNumber = (): string =>
  `LAMHA-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 90 + 10)}`

const fmtDinar = (value: number): string =>
  value >= 1000 && value % 1000 === 0 ? `${value / 1000} الف دينار عراقي` : `${value.toLocaleString('en-US')} دينار عراقي`

const formatQuantity = (value: number): string => {
  const quantity = Math.max(0, Math.floor(Number(value) || 0))
  return `${quantity} ${quantity === 1 ? 'قطعة' : 'قطع'}`
}

interface NotifyOrder {
  number: string
  body: Record<string, unknown>
}

const buildOrderMessage = (order: NotifyOrder): string => {
  const body = order.body
  const nested = (body.customer ?? {}) as Record<string, unknown>
  const str = (key: string): string => String(nested[key] ?? body[key] ?? '').trim()
  const items = Array.isArray(body.items) ? (body.items as Record<string, unknown>[]) : []
  const totals = (body.totals && typeof body.totals === 'object' ? body.totals : body) as Record<string, unknown>
  const num = (key: string): number => Number(totals[key] ?? 0) || 0
  const lines: string[] = []
  lines.push(`رقم الطلب: ${order.number}`)
  lines.push(`الاسم: ${str('name') || str('customerName')}`)
  lines.push(`الهاتف: ${str('phone')}`)
  if (str('email')) lines.push(`البريد الإلكتروني: ${str('email')}`)
  if (str('governorate')) lines.push(`المحافظة: ${str('governorate')}`)
  if (str('district')) lines.push(`القضاء/المنطقة: ${str('district')}`)
  if (str('address')) lines.push(`العنوان: ${str('address')}`)
  if (str('landmark')) lines.push(`معلم قريب: ${str('landmark')}`)
  if (str('notes')) lines.push(`ملاحظات: ${str('notes')}`)
  lines.push('')
  lines.push('تفاصيل الطلب:')
  for (const item of items) {
    const name = String(item.productName ?? '')
    const color = String(item.colorName ?? '')
    const qty = Number(item.quantity ?? 0) || 0
    const unit = Number(item.unitPrice ?? 0) || 0
    const total = Number(item.totalPrice ?? 0) || 0
    lines.push(`- ${name} (${color}) × ${formatQuantity(qty)} × ${fmtDinar(unit)} = ${fmtDinar(total)}`)
  }
  lines.push('')
  lines.push(`المجموع الفرعي: ${fmtDinar(num('subtotal'))}`)
  const deliveryConfirmed = totals.deliveryFeeConfirmed !== false
  const deliveryFree = totals.deliveryFree === true
  lines.push(!deliveryConfirmed ? 'رسوم التوصيل: تُحدد لاحقاً مع العنوان' : deliveryFree ? 'رسوم التوصيل: مجاني' : `رسوم التوصيل: ${fmtDinar(num('deliveryFee'))}`)
  lines.push(deliveryConfirmed ? `الإجمالي: ${fmtDinar(num('total'))}` : `المجموع قبل رسوم التوصيل: ${fmtDinar(num('total'))}`)
  lines.push(`التاريخ: ${new Date().toLocaleString('ar-IQ', { timeZone: 'Asia/Baghdad' })}`)
  return lines.join('\n')
}

const notifyOrderEmail = async (env: Env, order: NotifyOrder): Promise<boolean> => {
  try {
    let content: Record<string, unknown> = {}
    const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'content'").first<{ value: string }>()
    if (row?.value) {
      try {
        content = JSON.parse(row.value) as Record<string, unknown>
      } catch {
        content = {}
      }
    }
    const provider = String(content.emailProvider ?? 'formsubmit')
    if (provider !== 'formsubmit') {
      console.log(`[notify] order=${order.number} skipped provider=${provider}`)
      return false
    }
    const to = String(content.emailOrdersTo ?? '').trim()
    if (!to) {
      console.log(`[notify] order=${order.number} skipped: no LAMHA order email configured`)
      return false
    }
    const action = String(content.emailFormSubmitAction ?? '').trim() || `https://formsubmit.co/${encodeURIComponent(to)}`
    const subjectTemplate = String(content.emailSubjectOrder ?? 'طلب جديد #{orderNumber}')
    const subject = subjectTemplate.replace('#{orderNumber}', `#${order.number}`).replace('{orderNumber}', order.number)
    const form = new FormData()
    form.append('_subject', subject)
    form.append('_captcha', 'false')
    form.append('_template', 'table')
    form.append('orderNumber', order.number)
    form.append('message', buildOrderMessage(order))
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 7000)
    try {
      const res = await fetch(action, { method: 'POST', body: form, signal: controller.signal })
      const text = await res.text().catch(() => '')
      const pendingActivation = /needs Activation|Activate Form/i.test(text)
      const ok = res.ok && !pendingActivation
      console.log(`[notify] order=${order.number} status=${res.status} activationPending=${pendingActivation}`)
      return ok
    } finally {
      clearTimeout(timer)
    }
  } catch (error) {
    console.log(`[notify] order=${order.number} failed ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

async function handleApi(request: Request, env: Env, path: string, ctx?: ExecutionContext): Promise<Response> {
  const method = request.method.toUpperCase()
  const [segment, ...rest] = path.split('/').filter(Boolean)

  if (segment === 'health') {
    const visible = await env.DB.prepare('SELECT COUNT(*) AS n FROM products WHERE hidden = 0').first<{ n: number }>()
    const total = await env.DB.prepare('SELECT COUNT(*) AS n FROM products').first<{ n: number }>()
    return json({
      status: 'ok',
      products: visible?.n ?? 0,
      total: total?.n ?? 0,
      storage: 'd1',
      checkedAt: new Date().toISOString(),
    })
  }

  if (segment === 'admin') {
    if (rest[0] === 'login' && method === 'POST') {
      const body = await readBody<{ pin?: string; username?: string; password?: string }>(request)
      if (!rateLimit(request)) return json({ error: 'حاولي لاحقاً' }, 429)
      const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : ''
      const password = typeof body?.password === 'string' ? body.password : ''
      const pin = typeof body?.pin === 'string' ? body.pin : ''
      const configuredPassword = String(env.ADMIN_PASSWORD ?? '')
      const configuredPin = String(env.ADMIN_PIN ?? '')
      let adminId: string | null = null
      let valid = false

      // Admin access is fail-closed: no source-code defaults are accepted.
      if (username && password && configuredPassword.length >= 12 && password === configuredPassword) {
        await ensureAuthSchema(env)
        const row = await env.DB.prepare('SELECT id, username, password_hash FROM admins WHERE username = ?1')
          .bind(username)
          .first<{ id: string; username: string; password_hash: string }>()
        if (row) {
          if (!(await verifyPassword(configuredPassword, row.password_hash))) {
            const hash = await hashPassword(configuredPassword)
            await env.DB.prepare('UPDATE admins SET password_hash = ?1 WHERE id = ?2').bind(hash, row.id).run()
          }
          adminId = row.id
        } else {
          const hash = await hashPassword(configuredPassword)
          adminId = 'owner'
          await env.DB.prepare('INSERT INTO admins (id, username, password_hash, display_name) VALUES (?1, ?2, ?3, ?4)')
            .bind(adminId, username, hash, 'مدير لَمْحة')
            .run()
        }
        valid = true
      }

      if (!valid && pin && /^\d{6,12}$/.test(configuredPin) && pin === configuredPin) {
        valid = true
      }
      if (!valid) return json({ error: 'بيانات الدخول غير صحيحة' }, 401)
      const token = await createSession(env, adminId)
      return json({ data: { token, expiresIn: Math.floor(SESSION_TTL_MS / 1000) } })
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
    return handleAdmin(request, env, rest, method, ctx)
  }

  if (method !== 'GET' && method !== 'POST') return json({ error: 'طريقة غير مدعومة' }, 405)

  if (segment === 'push') {
    if (rest[0] === 'key') return json({ data: { publicKey: env.VAPID_PUBLIC_KEY || '', enabled: pushConfigured(env) } })
    return json({ error: 'المسار غير موجود' }, 404)
  }

  if (segment === 'products') {
    const slug = rest[0]
    if (slug) {
      const row = await env.DB.prepare('SELECT * FROM products WHERE slug = ?1 AND hidden = 0').bind(slug).first<ProductRow>()
      if (!row) return json({ error: 'المنتج غير موجود' }, 404)
      return json({ data: publicProduct(toProduct(row)) })
    }
    const params = new URL(request.url).searchParams
    const page = Math.max(1, Number(params.get('page')) || 0)
    const limitRaw = Number(params.get('limit')) || 0
    const limit = limitRaw > 0 ? Math.min(200, limitRaw) : 0
    return cachedJson(request, 300, async () => {
      const products = await listProducts(env, false, page || undefined, limit || undefined)
      const payload = products.map(publicProduct)
      // Paginated callers get the total so they can render page controls;
      // the unpaginated shape is kept for the existing storefront client.
      if (page && limit) {
        const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM products WHERE hidden = 0').first<{ n: number }>()
        return json({ data: payload, page, limit, total: count?.n ?? payload.length })
      }
      return json({ data: payload })
    })
  }

  if (segment === 'categories') {
    return cachedJson(request, 300, async () => {
      const result = await env.DB.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC').all()
      return json({ data: result.results ?? [] })
    })
  }

  if (segment === 'routes') {
    return cachedJson(request, 300, async () => {
      const result = await env.DB.prepare('SELECT * FROM routes ORDER BY sort_order ASC').all()
      return json({ data: result.results ?? [] })
    })
  }

  if (segment === 'content') {
    return cachedJson(request, 300, async () => {
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'content'").first<{ value: string }>()
      return json({ data: row ? JSON.parse(row.value) : null })
    })
  }

  if (segment === 'settings') {
    return cachedJson(request, 300, async () => {
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'store'").first<{ value: string }>()
      const stored = row ? (JSON.parse(row.value) as Record<string, unknown>) : {}
      return json({ data: { ...stored, colorsEnabled: stored.colorsEnabled ?? true, freeDeliveryFrom: Math.max(0, Number(stored.freeDeliveryFrom) || 0), deliveryFee: Math.max(0, Number(stored.deliveryFee) || 0) } })
    })
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
      if (!orderRateLimit(request)) return json({ error: 'حاولي إرسال الطلب بعد قليل' }, 429)
      const body = await readBody<Record<string, unknown>>(request)
      if (!body || typeof body !== 'object') return json({ error: 'تعذّر قراءة الطلب' }, 400)
      const items = Array.isArray(body.items) ? body.items : []
      const nested = (body.customer ?? {}) as Record<string, unknown>
      const shipping = (body.shippingAddress ?? {}) as Record<string, unknown>
      const name = String(nested.name ?? body.customerName ?? '').trim()
      const phone = String(nested.phone ?? body.phone ?? '').trim()
      if (!items.length) return json({ error: 'السلة فارغة' }, 400)
      if (!phone) return json({ error: 'رقم الهاتف مطلوب لتأكيد الطلب' }, 400)
      // Persist the delivery region so the admin statistics can break orders
      // down by governorate. Checkout sends it under shippingAddress.
      const governorate = String(shipping.governorate ?? nested.governorate ?? body.governorate ?? '').trim()
      const district = String(shipping.district ?? nested.district ?? body.district ?? '').trim()
      const customer = {
        ...nested,
        name,
        phone,
        ...(governorate ? { governorate } : {}),
        ...(district ? { district } : {}),
      }
      if (items.length > 40) return json({ error: 'عدد المنتجات في الطلب أكبر من المسموح' }, 400)

      // Recalculate prices from D1; client-provided prices and totals are never trusted.
      const validatedItems: Record<string, unknown>[] = []
      let subtotal = 0
      for (const rawItem of items) {
        if (!rawItem || typeof rawItem !== 'object') return json({ error: 'تفاصيل منتج غير صالحة' }, 400)
        const item = rawItem as Record<string, unknown>
        const productId = String(item.productId ?? '').trim()
        const quantity = Number(item.quantity)
        if (!productId || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
          return json({ error: 'كمية المنتج غير صالحة' }, 400)
        }
        const product = await env.DB.prepare('SELECT id, slug, name, price, hidden FROM products WHERE id = ?1')
          .bind(productId)
          .first<{ id: string; slug: string; name: string; price: number; hidden: number }>()
        if (!product || product.hidden === 1) return json({ error: 'أحد المنتجات لم يعد متاحاً' }, 409)
        const unitPrice = Number(product.price) || 0
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
          return json({ error: 'سعر هذا المنتج غير محدد بعد؛ يرجى الاستفسار قبل إرسال الطلب' }, 409)
        }
        const totalPrice = unitPrice * quantity
        subtotal += totalPrice
        validatedItems.push({
          ...item,
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          quantity,
          unitPrice,
          totalPrice,
        })
      }

      const settingsRow = await env.DB.prepare("SELECT value FROM settings WHERE key = 'store'").first<{ value: string }>()
      let storeSettings: Record<string, unknown> = {}
      try {
        storeSettings = settingsRow?.value ? JSON.parse(settingsRow.value) as Record<string, unknown> : {}
      } catch {
        storeSettings = {}
      }
      const freeDeliveryFrom = Math.max(0, Number(storeSettings.freeDeliveryFrom) || 0)
      const deliveryFeeConfigured = Math.max(0, Number(storeSettings.deliveryFee) || 0)
      const deliveryFree = freeDeliveryFrom > 0 && deliveryFeeConfigured > 0 && subtotal >= freeDeliveryFrom
      const deliveryFeeConfirmed = deliveryFeeConfigured > 0
      const deliveryFee = deliveryFree ? 0 : deliveryFeeConfigured
      const totals = {
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        deliveryFeeConfirmed,
        deliveryFree,
      }
      const orderBody = { ...body, items: validatedItems, totals }
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
          JSON.stringify(validatedItems),
          JSON.stringify(totals),
          String(body.notes ?? body.note ?? ''),
        )
        .run()
      // Email delivery (formsubmit) can take 1-7s and is unrelated to the
      // customer's confirmation — it must never block the 201 response.
      const emailWork = notifyOrderEmail(env, { number, body: orderBody }).catch((error) => {
        console.log(`[notify] order=${number} deferred failure ${error instanceof Error ? error.message : String(error)}`)
        return false
      })
      let pushWork: Promise<unknown> | null = null
      if (pushConfigured(env)) {
        const itemLines = validatedItems
          .slice(0, 4)
          .map((item) => `${String(item.productName ?? '')} ×${Number(item.quantity ?? 0) || 0}`)
          .join('، ')
        const total = Number((totals as Record<string, unknown>).total ?? 0) || 0
        const governorate = String(nested.governorate ?? body.governorate ?? '').trim()
        pushWork = sendPushToAll(env, {
          title: 'طلب جديد • لَمْحة',
          body: `#${number}\n${name}${governorate ? ` — ${governorate}` : ''}\n${itemLines}\nالإجمالي: ${fmtDinar(total)}`,
          data: { orderNumber: number, status: 'new', url: '/#/admin' },
        }).catch((error) => {
          console.log(`[push] order=${number} failed ${error instanceof Error ? error.message : String(error)}`)
          return { sent: 0, total: 0, failed: 0, removed: 0, details: [] }
        })
      }
      if (ctx) {
        ctx.waitUntil(Promise.all([emailWork, ...(pushWork ? [pushWork] : [])]))
      } else {
        await Promise.all([emailWork, ...(pushWork ? [pushWork] : [])])
      }
      return json({ data: { orderNumber: number, status: 'new', saved: true } }, 201)
    }
  }

  return json({ error: 'المسار غير موجود' }, 404)
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (MAINTENANCE_MODE) {
      return new Response(MAINTENANCE_PAGE, { status: 503, headers: MAINTENANCE_HEADERS })
    }
    try {
      const url = new URL(request.url)
      if (request.method === 'OPTIONS') return withCors(new Response(null, { status: 204, headers: cors }))

      if (url.pathname.startsWith('/api/') || url.pathname === '/api') {
        const path = url.pathname.slice('/api'.length) || '/'
        const response = await handleApi(request, env, path, ctx)
        return withCors(response)
      }

      if (url.pathname.startsWith('/media/')) {
        const key = decodeURIComponent(url.pathname.slice('/media/'.length))
        const row = await env.DB.prepare('SELECT content, type FROM media WHERE key = ?1')
          .bind(key)
          .first<{ content: number[] | ArrayBuffer | null; type: string | null }>()
        if (!row?.content) return new Response('Not found', { status: 404 })
        const raw = row.content
        const bytes = Array.isArray(raw) ? new Uint8Array(raw) : new Uint8Array(raw)
        const headers = new Headers()
        headers.set('Content-Type', row.type || 'image/jpeg')
        headers.set('Cache-Control', 'public, max-age=31536000, immutable')
        return new Response(bytes, { headers })
      }

      return env.ASSETS.fetch(request)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'خطأ غير متوقع'
      return withCors(json({ error: message }, 500))
    }
  },
} satisfies ExportedHandler<Env>
