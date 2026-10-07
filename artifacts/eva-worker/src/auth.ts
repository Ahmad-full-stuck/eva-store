import type { Env } from './types'

const DEFAULT_PIN = '2468'
const SESSION_TTL_MS = 8 * 60 * 60 * 1000

const sha256 = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const verifyPin = async (env: Env, pin: string): Promise<boolean> => {
  if (!pin) return false
  if (env.ADMIN_PIN) return pin === env.ADMIN_PIN
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'admin_pin'").first<{ value: string }>()
  if (!row?.value) return pin === DEFAULT_PIN
  if (row.value.startsWith('sha256:')) {
    const hash = await sha256(pin)
    return hash === row.value.slice('sha256:'.length)
  }
  return pin === row.value
}

export const hashPin = async (pin: string): Promise<string> => `sha256:${await sha256(pin)}`

export const createSession = async (env: Env): Promise<string> => {
  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  const expiresAt = Date.now() + SESSION_TTL_MS
  await env.DB.prepare('INSERT INTO sessions (token, expires_at) VALUES (?1, ?2)').bind(token, expiresAt).run()
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?1').bind(Date.now()).run()
  return token
}

export const destroySession = async (env: Env, token: string): Promise<void> => {
  if (!token) return
  await env.DB.prepare('DELETE FROM sessions WHERE token = ?1').bind(token).run()
}

const staticToken = (): string | null => {
  const value = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.ADMIN_TOKEN
  return value && value.trim() ? value.trim() : null
}

/** Returns `null` when the caller is authorised, otherwise a ready 401 response. */
export const requireAdmin = async (request: Request, env: Env): Promise<Response | null> => {
  const header = request.headers.get('Authorization') || request.headers.get('X-Admin-Token') || ''
  const token = header.replace(/^Bearer\s+/i, '').trim()
  if (!token) return nullWith('يجب تسجيل الدخول')
  const fallback = staticToken()
  if (fallback && token === fallback) return null
  const row = await env.DB.prepare('SELECT expires_at FROM sessions WHERE token = ?1').bind(token).first<{ expires_at: number }>()
  if (!row) return nullWith('انتهت الجلسة، سجّلي الدخول من جديد')
  if (row.expires_at < Date.now()) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?1').bind(token).run()
    return nullWith('انتهت الجلسة، سجّلي الدخول من جديد')
  }
  return null
}

const nullWith = (message: string): Response =>
  new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })

const buckets = new Map<string, Map<string, { count: number; resetAt: number }>>()

const hit = (bucket: string, client: string, max: number): boolean => {
  let entries = buckets.get(bucket)
  if (!entries) {
    entries = new Map()
    buckets.set(bucket, entries)
  }
  const now = Date.now()
  const entry = entries.get(client)
  if (!entry || entry.resetAt < now) {
    entries.set(client, { count: 1, resetAt: now + 60_000 })
    return true
  }
  entry.count += 1
  if (entries.size > 5000) entries.clear()
  return entry.count <= max
}

/** Best-effort login throttle (per isolate). 8 attempts per minute per client. */
export const rateLimit = (request: Request): boolean =>
  hit('login', request.headers.get('CF-Connecting-IP') || 'anon', 8)

/** الطلبات: 30 طلباً في الدقيقة لكل عميل (يفصل عن حد تسجيل الدخول). */
export const orderRateLimit = (request: Request): boolean =>
  hit('orders', request.headers.get('CF-Connecting-IP') || 'anon', 30)
