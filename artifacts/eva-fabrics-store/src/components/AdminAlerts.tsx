import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'wouter'
import { Bell, BellRing, X } from 'lucide-react'
import { adminFetch, AdminRequestError, getToken } from '@/lib/api'
import { ensureSubscription, pushSupported } from '@/lib/push'

const SEEN_KEY = 'eva-alerts-seen-orders'
const PROMPT_KEY = 'eva-alerts-prompt-hidden'
const POLL_MS = 15_000

interface AdminOrderRow {
  order_number?: string
  orderNumber?: string
  customer?: unknown
  totals?: unknown
  created_at?: string
}

interface OrderAlert {
  id: string
  name: string
  total: number
  count: number
}

const readSeen = (): string[] => {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY)
    const list = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(list) ? list.map((item) => String(item)) : []
  } catch {
    return []
  }
}

const writeSeen = (ids: string[]): void => {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(ids.slice(0, 300)))
  } catch {
    /* ignore */
  }
}

const idOf = (row: AdminOrderRow): string => String(row.order_number || row.orderNumber || '').trim()

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
    } catch {
      return {}
    }
  }
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function playChime(): void {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    if (ctx.state === 'suspended') void ctx.resume()
    const now = ctx.currentTime
    const gain = ctx.createGain()
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.setValueAtTime(1175, now + 0.16)
    osc.connect(gain)
    osc.start(now)
    osc.stop(now + 0.52)
    window.setTimeout(() => void ctx.close().catch(() => undefined), 900)
  } catch {
    /* ignore */
  }
}

const styles = `
.eva-alert-card { position: fixed; z-index: 260; inset-inline-start: 16px; inset-inline-end: 16px; bottom: calc(16px + env(safe-area-inset-bottom)); max-width: 460px; margin-inline: auto; display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 16px; border: 1px solid rgba(122,30,60,.18); background: #fff; box-shadow: 0 22px 46px -20px rgba(46,24,33,.5); animation: evaAlertUp .22s ease both; text-align: start; }
.eva-alert-card .eap-ico { flex: 0 0 auto; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; color: #fff; background: linear-gradient(135deg, var(--eva-rose), var(--eva-charcoal)); }
.eva-alert-card .eap-copy { flex: 1 1 auto; min-width: 0; }
.eva-alert-card .eap-copy strong { display: block; font-size: 13.5px; font-weight: 700; color: var(--eva-ink); }
.eva-alert-card .eap-copy span { display: block; font-size: 12px; color: var(--eva-muted); margin-top: 2px; }
.eva-alert-card .eap-copy small { display: block; font-size: 11px; color: var(--eva-muted); opacity: .85; margin-top: 4px; }
.eva-alert-toast { cursor: pointer; color: #fff6f8; background: linear-gradient(135deg, var(--eva-charcoal), var(--eva-rose-dark)); border-color: rgba(255,255,255,.2); font-family: inherit; }
.eva-alert-toast .eap-ico { background: rgba(255,255,255,.16); }
.eva-alert-toast .eap-copy strong { color: #fff6f8; }
.eva-alert-toast .eap-copy span, .eva-alert-toast .eap-copy small { color: #fff6f8; opacity: .85; }
.eva-alert-close { flex: 0 0 auto; display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid var(--eva-line-strong); border-radius: 50%; background: #fff; color: var(--eva-muted); cursor: pointer; }
@keyframes evaAlertUp { from { opacity: 0; transform: translateY(14px); } }
@media (prefers-reduced-motion: reduce) { .eva-alert-card { animation: none; } }
`

export function AdminAlerts() {
  const [, navigate] = useLocation()
  const [active, setActive] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [promptHidden, setPromptHidden] = useState(true)
  const [alert, setAlert] = useState<OrderAlert | null>(null)
  const seenRef = useRef<string[]>([])
  const initializedRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  const syncSession = useCallback(() => {
    setActive(Boolean(getToken()))
  }, [])

  useEffect(() => {
    if (!pushSupported()) {
      setPermission('unsupported')
      return undefined
    }
    try {
      setPromptHidden(window.localStorage.getItem(PROMPT_KEY) === '1')
    } catch {
      setPromptHidden(false)
    }
    setPermission(Notification.permission)
    const onVisibility = () => setPermission(Notification.permission)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', onVisibility)
    }
  }, [])

  useEffect(() => {
    syncSession()
    const onChange = () => syncSession()
    window.addEventListener('eva-admin-changed', onChange)
    window.addEventListener('eva-admin-expired', onChange)
    window.addEventListener('storage', onChange)
    window.addEventListener('focus', onChange)
    return () => {
      window.removeEventListener('eva-admin-changed', onChange)
      window.removeEventListener('eva-admin-expired', onChange)
      window.removeEventListener('storage', onChange)
      window.removeEventListener('focus', onChange)
    }
  }, [syncSession])

  useEffect(() => {
    if (!active || permission !== 'granted') return undefined
    void ensureSubscription().catch(() => undefined)
    return undefined
  }, [active, permission])

  const poll = useCallback(async () => {
    let rows: AdminOrderRow[]
    try {
      rows = await adminFetch<AdminOrderRow[]>('/api/admin/orders')
    } catch (error) {
      if (error instanceof AdminRequestError && error.status === 401) setActive(false)
      return
    }
    if (!Array.isArray(rows)) return
    const ids = rows.map(idOf).filter(Boolean)
    if (!initializedRef.current) {
      const stored = readSeen()
      seenRef.current = stored.length ? stored : ids.slice()
      initializedRef.current = true
      writeSeen(seenRef.current)
    }
    const known = new Set(seenRef.current)
    const fresh = rows.filter((row) => {
      const id = idOf(row)
      return id && !known.has(id)
    })
    if (fresh.length) {
      const newest = fresh[0]
      const customer = asRecord(newest.customer)
      const totals = asRecord(newest.totals)
      setAlert({
        id: idOf(newest),
        name: String(customer.name ?? customer.customerName ?? '').trim(),
        total: Number(totals.total ?? 0) || 0,
        count: fresh.length,
      })
      playChime()
      const merged = [...fresh.map(idOf), ...seenRef.current].filter(Boolean)
      seenRef.current = merged
      writeSeen(merged)
    }
  }, [])

  useEffect(() => {
    if (!active) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
      return undefined
    }
    void poll()
    timerRef.current = window.setInterval(() => void poll(), POLL_MS)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [active, poll])

  useEffect(() => {
    if (!alert) return undefined
    const handle = window.setTimeout(() => setAlert(null), 12_000)
    return () => window.clearTimeout(handle)
  }, [alert])

  const enable = async () => {
    if (!pushSupported()) return
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm === 'granted') await ensureSubscription().catch(() => undefined)
    } catch {
      /* ignore */
    }
  }

  const dismissPrompt = () => {
    setPromptHidden(true)
    try {
      window.localStorage.setItem(PROMPT_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  const showPrompt = active && permission === 'default' && !promptHidden

  return (
    <>
      <style>{styles}</style>
      {alert && (
        <button type="button" className="eva-alert-card eva-alert-toast" onClick={() => { setAlert(null); navigate('/admin') }} aria-live="assertive">
          <span className="eap-ico"><BellRing size={19} /></span>
          <span className="eap-copy">
            <strong>{alert.count > 1 ? `${alert.count} طلبات جديدة` : 'طلب جديد'}</strong>
            <span>{[alert.name, alert.total ? `${alert.total.toLocaleString('en-US')} دينار` : ''].filter(Boolean).join(' — ') || alert.id}</span>
            <small>{alert.id} • اضغط لعرض الطلبات</small>
          </span>
        </button>
      )}
      {showPrompt && (
        <div className="eva-alert-card" role="dialog" aria-label="تفعيل إشعارات الطلبات">
          <span className="eap-ico"><Bell size={19} /></span>
          <span className="eap-copy">
            <strong>فعّلي إشعارات الطلبات</strong>
            <span>لتصلك كل طلبية جديدة فوراً على هذا الجهاز حتى أثناء إغلاق المتجر.</span>
          </span>
          <button type="button" className="admin-btn success" style={{ minHeight: 38, padding: '7px 14px', flex: '0 0 auto' }} onClick={() => void enable()}>
            تفعيل
          </button>
          <button type="button" className="eva-alert-close" onClick={dismissPrompt} aria-label="إغلاق"><X size={15} /></button>
        </div>
      )}
    </>
  )
}
