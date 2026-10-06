import { apiUrl } from '@/lib/site'

const TOKEN_KEY = 'eva-admin-token'
const SERVER_CONTENT_KEY = 'eva-server-content'
const SERVER_SETTINGS_KEY = 'eva-server-settings'

export const getToken = (): string => {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export const setToken = (token: string): void => {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export const readServerContent = <T,>(): T | null => {
  try {
    const raw = window.localStorage.getItem(SERVER_CONTENT_KEY)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

const writeServerContent = (value: unknown): void => {
  try {
    window.localStorage.setItem(SERVER_CONTENT_KEY, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

export const readServerSettings = (): Record<string, unknown> => {
  try {
    const raw = window.localStorage.getItem(SERVER_SETTINGS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

const writeServerSettings = (value: unknown): void => {
  try {
    window.localStorage.setItem(SERVER_SETTINGS_KEY, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

export const ping = async (): Promise<boolean> => {
  try {
    const response = await fetch(apiUrl('/api/health'), { headers: { Accept: 'application/json' } })
    return response.ok
  } catch {
    return false
  }
}

/** Pull the storefront content + settings published by the admin panel. */
export const loadServerConfig = async (): Promise<void> => {
  try {
    const [content, settings] = await Promise.all([
      fetch(apiUrl('/api/content'), { headers: { Accept: 'application/json' } }).then((r) => (r.ok ? r.json() : null)),
      fetch(apiUrl('/api/settings'), { headers: { Accept: 'application/json' } }).then((r) => (r.ok ? r.json() : null)),
    ])
    let changed = false
    if (content && typeof content.data === 'object' && content.data) {
      writeServerContent(content.data)
      changed = true
    }
    if (settings && typeof settings.data === 'object' && settings.data) {
      writeServerSettings(settings.data)
      changed = true
    }
    if (changed) window.dispatchEvent(new Event('eva-admin-changed'))
  } catch {
    /* offline — the cached copy keeps working */
  }
}

export class AdminRequestError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export const adminLogin = async (pin: string): Promise<void> => {
  let response: Response
  try {
    response = await fetch(apiUrl('/api/admin/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ pin }),
    })
  } catch {
    // لا خادم أصلاً (أو انقطع الاتصال) — ينتقل المتجر للوضع المحلي
    throw new Error('server-unreachable')
  }
  const body = (await response.json().catch(() => null)) as { data?: { token?: string }; error?: string } | null
  if (!response.ok || !body?.data?.token) {
    // الخادم موجود ويرفض الرمز فعلاً:401/403 — تُعتبر خطأ حقيقياً ولا يُسقط للوضع المحلي
    if (response.status === 401 || response.status === 403) {
      throw new AdminRequestError(body?.error || 'الرمز غير صحيح', response.status)
    }
    throw new Error('server-unavailable')
  }
  setToken(body.data.token)
}

export const adminLogout = async (): Promise<void> => {
  const token = getToken()
  setToken('')
  if (!token) return
  try {
    await fetch(apiUrl('/api/admin/logout'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
  } catch {
    /* ignore */
  }
}

export const adminFetch = async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
  const token = getToken()
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  })
  const body = (await response.json().catch(() => null)) as { data?: T; error?: string } | null
  if (!response.ok) {
    if (response.status === 401) setToken('')
    throw new AdminRequestError(body?.error || `خطأ ${response.status}`, response.status)
  }
  return (body && 'data' in body ? (body.data as T) : (body as unknown as T))
}

export const pushServerContent = async (content: Record<string, unknown>): Promise<void> => {
  writeServerContent(content)
  try {
    await adminFetch('/api/admin/content', { method: 'PUT', body: JSON.stringify(content) })
  } catch (error) {
    if (error instanceof AdminRequestError && error.status === 401) return
    throw error
  }
}

export const pushServerSettings = async (settings: Record<string, unknown>): Promise<void> => {
  writeServerSettings(settings)
  try {
    await adminFetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify(settings) })
  } catch (error) {
    if (error instanceof AdminRequestError && error.status === 401) return
    throw error
  }
}

const PENDING_KEY = 'eva-pending-orders'

/** يحفظ طلباً لم يصل إلى الخادم، ليُرسل تلقائياً عند عودة الاتصال. */
export const queuePendingOrder = (order: unknown): void => {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY)
    const list = raw ? (JSON.parse(raw) as unknown[]) : []
    list.push(order)
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

export const flushPendingOrders = async (): Promise<void> => {
  let list: unknown[] = []
  try {
    const raw = window.localStorage.getItem(PENDING_KEY)
    list = raw ? (JSON.parse(raw) as unknown[]) : []
  } catch {
    return
  }
  if (!list.length) return
  const remaining: unknown[] = []
  for (const order of list) {
    try {
      const response = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(order),
      })
      if (!response.ok && response.status !== 409) remaining.push(order)
    } catch {
      remaining.push(order)
    }
  }
  try {
    if (remaining.length) window.localStorage.setItem(PENDING_KEY, JSON.stringify(remaining))
    else window.localStorage.removeItem(PENDING_KEY)
  } catch {
    /* ignore */
  }
}
