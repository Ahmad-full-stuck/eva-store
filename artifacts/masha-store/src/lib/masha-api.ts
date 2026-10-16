export const mashaApiBase = (import.meta.env.VITE_MASHA_API_BASE_URL || '').replace(/\/+$/, '')
export const mashaApiEnabled = Boolean(mashaApiBase)
export const mashaAdminConfigured = import.meta.env.VITE_MASHA_ADMIN_CONFIGURED === 'true'

type JsonRecord = Record<string, any>

const parseJson = (value: unknown, fallback: any) => {
  if (typeof value !== 'string') return value ?? fallback
  try { return JSON.parse(value) } catch { return fallback }
}
const endpoint = (path: string) => mashaApiBase + (path.startsWith('/') ? path : '/' + path)

export async function mashaRequest<T = any>(path: string, init: RequestInit = {}, token = ''): Promise<T> {
  if (!mashaApiBase) throw new Error('خدمة ماشا غير مهيأة لهذا البناء.')
  const response = await fetch(endpoint(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(init.headers || {}),
    },
  })
  const body = await response.json().catch(() => null) as JsonRecord | null
  if (!response.ok) throw new Error(String(body?.error || 'فشل الاتصال بالخادم (' + response.status + ')'))
  return (body && 'data' in body ? body.data : body) as T
}

export function fromMashaApiProduct(raw: JsonRecord): JsonRecord {
  const specs = (raw.specs && typeof raw.specs === 'object' ? raw.specs : {}) as JsonRecord
  const categoryById: Record<string, string> = { girls: 'بناتي', boys: 'ولادي', baby: 'مواليد', sets: 'أطقم' }
  const colorRows = Array.isArray(raw.colors) ? raw.colors : []
  const colors = colorRows.map((item: any) => typeof item === 'string' ? item : String(item?.hex || '')).filter(Boolean)
  const images = Array.isArray(raw.images) ? raw.images.filter((x: unknown) => typeof x === 'string' && x) : []
  const id = String(raw.id || raw.slug || 'masha-product')
  return {
    id,
    name: String(raw.name || 'منتج ماشا'),
    category: categoryById[String(raw.categoryId || '')] || 'أطقم',
    price: Math.max(0, Number(raw.price) || 0),
    ...(raw.compareAtPrice == null ? {} : { oldPrice: Math.max(0, Number(raw.compareAtPrice) || 0) }),
    image: String(raw.image || images[0] || ''),
    images: Array.from(new Set([String(raw.image || ''), ...images].filter(Boolean))),
    badge: raw.isNew ? 'وصل حديثاً' : undefined,
    age: String(specs.age || 'يرجى السؤال عن العمر المناسب'),
    sizes: Array.isArray(specs.sizes) && specs.sizes.length ? specs.sizes.map(String) : ['يرجى السؤال عن المقاس'],
    colors: colors.length ? colors : ['#e9d8c7'],
    description: String(raw.description || ''),
    material: String(specs.material || specs.composition || '') || undefined,
    care: String(specs.care || '') || undefined,
    sku: String(specs.sku || id),
    instagramVideoUrl: String(raw.video || '') || undefined,
    stock: Number.isFinite(Number(raw.stockMeters)) ? Math.max(0, Number(raw.stockMeters)) : undefined,
    active: raw.hidden !== true && raw.hidden !== 1,
  }
}

export function toMashaApiProduct(p: JsonRecord): JsonRecord {
  const categoryId: Record<string, string> = { 'بناتي': 'girls', 'ولادي': 'boys', 'مواليد': 'baby', 'أطقم': 'sets' }
  const stock = p.stock === undefined || p.stock === null ? 10 : Math.max(0, Number(p.stock) || 0)
  const images = Array.from(new Set([p.image, ...(Array.isArray(p.images) ? p.images : [])].filter((x: unknown) => typeof x === 'string' && x)))
  const colors = (Array.isArray(p.colors) ? p.colors : []).map((hex: string, i: number) => ({
    id: String(p.id) + '-c' + (i + 1),
    name: 'لون ' + (i + 1),
    hex,
    available: stock > 0,
    stockMeters: stock,
  }))
  return {
    id: String(p.id || ''),
    slug: String(p.id || ''),
    name: String(p.name || ''),
    type: 'ملابس أطفال',
    categoryId: categoryId[String(p.category)] || 'sets',
    description: String(p.description || ''),
    price: Math.max(0, Number(p.price) || 0),
    compareAtPrice: p.oldPrice == null ? null : Math.max(0, Number(p.oldPrice) || 0),
    image: String(p.image || images[0] || ''),
    images,
    colors,
    colorsEnabled: true,
    specs: {
      age: String(p.age || ''),
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      material: String(p.material || ''),
      care: String(p.care || ''),
      sku: String(p.sku || p.id || ''),
    },
    faqs: Array.isArray(p.faqs) ? p.faqs : [],
    isNew: Boolean(p.badge),
    isFeatured: true,
    hidden: p.active === false,
    stockMeters: stock,
    sourceUrl: '',
    video: String(p.instagramVideoUrl || ''),
  }
}

export async function fetchMashaProducts() {
  const rows = await mashaRequest<JsonRecord[]>('/api/products')
  if (!Array.isArray(rows)) throw new Error('وصل رد غير متوقع من كتالوج ماشا.')
  return rows.map(fromMashaApiProduct)
}
export async function loginMashaAdmin(pin: string) {
  return mashaRequest<{token: string; expiresIn?: number}>('/api/admin/login', { method: 'POST', body: JSON.stringify({ pin }) })
}
export async function verifyMashaAdmin(token: string) {
  return mashaRequest<{ok: boolean}>('/api/admin/whoami', {}, token)
}
export async function fetchMashaAdminProducts(token: string) {
  const rows = await mashaRequest<JsonRecord[]>('/api/admin/products', {}, token)
  return rows.map(fromMashaApiProduct)
}
export async function saveMashaAdminProduct(product: JsonRecord, token: string, existingId?: string | null) {
  const payload = JSON.stringify(toMashaApiProduct(product))
  const path = existingId ? '/api/admin/products/' + encodeURIComponent(existingId) : '/api/admin/products'
  return mashaRequest(path, { method: existingId ? 'PUT' : 'POST', body: payload }, token)
}
export async function deleteMashaAdminProduct(id: string, token: string) {
  return mashaRequest('/api/admin/products/' + encodeURIComponent(id), { method: 'DELETE' }, token)
}
export async function importMashaAdminProducts(products: JsonRecord[], token: string) {
  return mashaRequest<{imported: number}>('/api/admin/products/import', {
    method: 'POST',
    body: JSON.stringify({ products: products.map(toMashaApiProduct) }),
  }, token)
}
export function fromMashaApiOrder(row: JsonRecord): JsonRecord {
  const customer = parseJson(row.customer, {}) as JsonRecord
  const items = parseJson(row.items, []) as JsonRecord[]
  const totals = parseJson(row.totals, {}) as JsonRecord
  const statusMap: Record<string, string> = {
    new: 'pending_store_confirmation', received: 'pending_store_confirmation',
    confirmed: 'confirmed', preparing: 'preparing', shipped: 'shipped',
    delivered: 'delivered', cancelled: 'cancelled', returned: 'cancelled',
  }
  return {
    reference: String(row.order_number || row.orderNumber || ''),
    createdAt: String(row.created_at || row.createdAt || new Date().toISOString()),
    status: statusMap[String(row.status || 'new')] || 'pending_store_confirmation',
    total: Number(totals.total ?? totals.subtotal ?? 0) || 0,
    itemCount: items.reduce((n, x) => n + Math.max(0, Number(x.quantity) || 0), 0),
    customer: {
      name: String(customer.name || ''), phone: String(customer.phone || ''),
      governorate: String(customer.governorate || ''),
      address: String(customer.address || ''), notes: String(customer.notes || row.note || ''),
    },
    items: items.map(item => ({
      name: String(item.productName || item.name || 'منتج'),
      size: String(item.size || ''), color: String(item.color || ''),
      quantity: Math.max(1, Number(item.quantity) || 1),
      unitPrice: Math.max(0, Number(item.unitPrice ?? item.price) || 0),
    })),
  }
}
export async function fetchMashaAdminOrders(token: string) {
  const rows = await mashaRequest<JsonRecord[]>('/api/admin/orders', {}, token)
  return rows.map(fromMashaApiOrder)
}
const statusToApi: Record<string, string> = {
  pending_store_confirmation: 'new', confirmed: 'confirmed', preparing: 'preparing',
  shipped: 'shipped', delivered: 'delivered', cancelled: 'cancelled',
}
export async function updateMashaOrderStatus(reference: string, status: string, token: string) {
  return mashaRequest('/api/admin/orders/' + encodeURIComponent(reference), {
    method: 'PATCH', body: JSON.stringify({ status: statusToApi[status] || 'new' }),
  }, token)
}
export async function saveMashaStoreSettings(settings: JsonRecord, token: string) {
  return mashaRequest('/api/admin/settings', { method: 'PUT', body: JSON.stringify(settings) }, token)
}
export async function fetchMashaPublicSettings() {
  return mashaRequest<JsonRecord>('/api/settings')
}
export async function createMashaOrder(payload: JsonRecord) {
  return mashaRequest<{orderNumber: string; status: string; saved: boolean}>('/api/orders', {
    method: 'POST', body: JSON.stringify(payload),
  })
}
export async function trackMashaOrder(reference: string) {
  return mashaRequest<JsonRecord>('/api/orders/' + encodeURIComponent(reference))
}
