import type { Env } from './types'

// ---------- base64url + crypto helpers (WebCrypto, workerd-compatible) ----------

const enc = new TextEncoder()

function b64uEncode(bytes: Uint8Array | ArrayBuffer): string {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let s = ''
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i])
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64uDecode(str: string): Uint8Array {
  const s = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : ''
  const bin = atob(s + pad)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const p of parts) {
    out.set(p, off)
    off += p.length
  }
  return out
}

async function hmac(keyBytes: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, data))
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number): Promise<Uint8Array> {
  const prk = await hmac(salt, ikm)
  let t: Uint8Array = new Uint8Array(0)
  let okm: Uint8Array = new Uint8Array(0)
  let counter = 1
  while (okm.length < len) {
    t = await hmac(prk, concat(t, info, new Uint8Array([counter])))
    okm = concat(okm, t)
    counter++
  }
  return okm.slice(0, len)
}

// ---------- VAPID + RFC8291 payload encryption ----------

export async function vapidAuthHeader(env: Env, audience: string): Promise<string> {
  const header = b64uEncode(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const payload = b64uEncode(
    enc.encode(JSON.stringify({ aud: audience, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT || 'mailto:admin@example.com' })),
  )
  const signingInput = `${header}.${payload}`
  const key = await crypto.subtle.importKey(
    'pkcs8',
    b64uDecode(env.VAPID_PRIVATE_KEY as string) as Uint8Array,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(signingInput))
  return `vapid t=${signingInput}.${b64uEncode(sig)}, k=${env.VAPID_PUBLIC_KEY}`
}

export async function encryptPushPayload(subscription: { keys: { p256dh: string; auth: string } }, payloadStr: string): Promise<Uint8Array> {
  const clientPub = b64uDecode(subscription.keys.p256dh)
  const authSecret = b64uDecode(subscription.keys.auth)
  const ephemeral = (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])) as CryptoKeyPair
  const serverPub = new Uint8Array((await crypto.subtle.exportKey('raw', ephemeral.publicKey)) as ArrayBuffer)
  const clientKey = await crypto.subtle.importKey('raw', clientPub, { name: 'ECDH', namedCurve: 'P-256' }, false, [])
  const shared = new Uint8Array(
    await (crypto.subtle.deriveBits as (alg: unknown, key: CryptoKey, len: number) => Promise<ArrayBuffer>)(
      { name: 'ECDH', public: clientKey },
      ephemeral.privateKey,
      256,
    ),
  )

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const ikm = await hkdf(authSecret, shared, concat(enc.encode('WebPush: info\x00'), clientPub, serverPub), 32)
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\x00'), 16)
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\x00'), 12)

  const plaintext = concat(enc.encode(payloadStr), new Uint8Array([2]))
  const key = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt'])
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, plaintext))

  const rs = new Uint8Array([0, 0, 16, 0])
  // RFC 8291: the aes128gcm header's keyid carries the *sender's ephemeral*
  // public key — the recipient needs it to derive the DH shared secret. Using
  // the client's p256dh here breaks decryption (verified against http_ece).
  const header = concat(salt, rs, new Uint8Array([serverPub.length]), serverPub)
  return concat(header, cipher)
}

// ---------- storage ----------

export interface PushRow {
  endpoint: string
  p256dh: string
  auth: string
  admin_id: string | null
  created_at: string
}

export const pushConfigured = (env: Env): boolean => Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY)

let schemaReady = false

export const ensurePushSchema = async (env: Env): Promise<void> => {
  if (schemaReady) return
  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS push_subscriptions (
        endpoint   TEXT PRIMARY KEY,
        p256dh     TEXT NOT NULL,
        auth       TEXT NOT NULL,
        admin_id   TEXT,
        user_agent TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    ).run()
  } catch {
    /* exists */
  }
  schemaReady = true
}

export const listSubscriptions = async (env: Env): Promise<PushRow[]> => {
  try {
    const result = await env.DB.prepare(
      'SELECT endpoint, p256dh, auth, admin_id, user_agent, created_at FROM push_subscriptions ORDER BY created_at DESC',
    ).all<PushRow>()
    return result.results ?? []
  } catch {
    return []
  }
}

export const saveSubscription = async (
  env: Env,
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
  adminId: string | null,
): Promise<void> => {
  await ensurePushSchema(env)
  await env.DB.prepare(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth, admin_id, user_agent, created_at)
     VALUES (?1, ?2, ?3, ?4, '', datetime('now'))
     ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, admin_id = excluded.admin_id`,
  )
    .bind(sub.endpoint, sub.keys.p256dh, sub.keys.auth, adminId)
    .run()
}

export const deleteSubscription = async (env: Env, endpoint: string): Promise<void> => {
  if (!endpoint) return
  await env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?1').bind(endpoint).run()
}

export interface PushOutcome {
  ok: boolean
  status: number
  endpoint: string
  error?: string
}

async function sendPush(env: Env, row: PushRow, payload: unknown): Promise<PushOutcome> {
  const endpoint = row.endpoint
  try {
    const audience = new URL(endpoint).origin
    const authorization = await vapidAuthHeader(env, audience)
    const body = await encryptPushPayload({ keys: { p256dh: row.p256dh, auth: row.auth } }, JSON.stringify(payload))
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    let res: Response
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: authorization,
          'Content-Encoding': 'aes128gcm',
          'Content-Type': 'application/octet-stream',
          TTL: '86400',
          Urgency: 'high',
        },
        body,
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }
    // 404/410 = the subscription is permanently gone (user unsubscribed /
    // browser rotated the key) — the row must be dropped. 413 = payload too
    // large, 429 = rate limited: retryable, keep the row.
    if (res.status === 404 || res.status === 410) return { ok: false, status: res.status, endpoint, error: 'gone' }
    if (!res.ok) return { ok: false, status: res.status, endpoint, error: await res.text().catch(() => '') }
    return { ok: true, status: res.status, endpoint }
  } catch (error) {
    // Network/DNS/timeout: keep the row (may be transient) but report failure
    // so the caller can surface it instead of silently claiming success.
    const message = error instanceof Error ? error.message : String(error)
    console.log(`[push] send failed endpoint=${endpoint} error=${message}`)
    return { ok: false, status: 0, endpoint, error: message }
  }
}

export interface PushResult {
  sent: number
  total: number
  failed: number
  removed: number
  details: PushOutcome[]
}

export const sendPushToAll = async (env: Env, payload: unknown): Promise<PushResult> => {
  if (!pushConfigured(env)) return { sent: 0, total: 0, failed: 0, removed: 0, details: [] }
  await ensurePushSchema(env)
  const result = await env.DB.prepare('SELECT endpoint, p256dh, auth, admin_id, user_agent, created_at FROM push_subscriptions').all<PushRow>()
  const rows = result.results ?? []
  if (!rows.length) return { sent: 0, total: 0, failed: 0, removed: 0, details: [] }
  const outcomes = await Promise.all(rows.map((row) => sendPush(env, row, payload)))
  const dead = rows.filter((_, i) => !outcomes[i].ok && (outcomes[i].status === 404 || outcomes[i].status === 410))
  for (const row of dead) await deleteSubscription(env, row.endpoint)
  const sent = outcomes.filter((o) => o.ok).length
  console.log(`[push] total=${rows.length} sent=${sent} removed=${dead.length} failures=${outcomes.length - sent}`)
  return { sent, total: rows.length, failed: outcomes.length - sent, removed: dead.length, details: outcomes }
}
