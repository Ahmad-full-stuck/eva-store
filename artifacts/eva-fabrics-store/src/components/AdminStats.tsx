import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BarChart3, RefreshCw, TrendingUp } from 'lucide-react'
import { adminFetch } from '@/lib/api'

// ---- types mirror the worker payload (admin.ts → resource === 'stats') ----
interface StatsMonthPoint {
  month: string
  label: string
  orders: number
  completed: number
  revenue: number
}
interface StatsStatusSlice {
  status: string
  label: string
  count: number
  pct: number
}
interface StatsRegion {
  region: string
  count: number
  revenue: number
  pct: number
}
interface StatsSource {
  channel: string
  label: string
  count: number
  pct: number
}
interface StatsDay {
  day: number
  date: string
  orders: number
  revenue: number
}
interface StatsSelected {
  month: string
  label: string
  total: number
  completed: number
  completionRate: number
  revenue: number
  avgOrder: number
  statusBreakdown: StatsStatusSlice[]
  regions: StatsRegion[]
  sources: StatsSource[]
  daily: StatsDay[]
}
interface StatsResponse {
  generatedAt: string
  allTime: { total: number; completed: number; revenue: number; completionRate: number }
  months: string[]
  monthly: StatsMonthPoint[]
  selected: StatsSelected
}

// ---- palette lifted from the admin theme (index.css) ----
const ROSE = '#7a1e3c'
const ROSE_SOFT = '#f2dde4'
const BLUSH = '#e8b0c1'
const ORANGE = '#b0763c'
const GREEN = '#4e7a5e'
const LILAC = '#9b86b8'
const LINE = '#ecdedd'
const MUTED = '#6d5a60'
const INK = '#2b2124'
const STATUS_COLORS: Record<string, string> = { new: ROSE, contacted: ORANGE, shipped: LILAC, done: GREEN }
const SOURCE_COLORS = [ROSE, ORANGE, LILAC, GREEN, BLUSH]

const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const AR_MONTHS_SHORT = ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس']

const monthLabel = (key: string, short = false): string => {
  const [y, m] = key.split('-')
  const idx = Number(m) - 1
  const name = (short ? AR_MONTHS_SHORT : AR_MONTHS)[idx] ?? m
  return `${name} ${y}`
}

const fmtNum = (n: number): string => n.toLocaleString('ar-IQ')
const fmtMoney = (n: number): string => (n === 0 ? '٠' : n.toLocaleString('ar-IQ'))

// ---- small chart primitives (pure SVG, no dependencies) ----

function MonthlyBars({ data, active }: { data: StatsMonthPoint[]; active: string }) {
  const W = 480
  const H = 176
  const padL = 8
  const padR = 8
  const top = 22
  const bottom = 26
  const plotH = H - top - bottom
  const n = Math.max(1, data.length)
  const step = (W - padL - padR) / n
  const barW = Math.min(30, step - 8)
  const max = Math.max(1, ...data.map((d) => d.orders))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="الطلبات الشهرية">
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={padL} x2={W - padR} y1={top + plotH * (1 - t)} y2={top + plotH * (1 - t)} stroke={LINE} strokeWidth={1} />
      ))}
      {data.map((d, i) => {
        const x = padL + step * i + (step - barW) / 2
        const h = d.orders === 0 ? 2 : Math.max(4, (d.orders / max) * plotH)
        const y = top + plotH - h
        const isActive = d.month === active
        return (
          <g key={d.month}>
            <title>{`${d.label}: ${fmtNum(d.orders)} طلب`}</title>
            <rect x={x} y={y} width={barW} height={h} rx={5} fill={isActive ? ROSE : BLUSH} opacity={isActive ? 1 : d.orders ? 0.85 : 0.4} />
            {d.orders > 0 && (
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={10} fontWeight={700} fill={isActive ? ROSE : MUTED}>
                {fmtNum(d.orders)}
              </text>
            )}
            <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={9.5} fontWeight={isActive ? 700 : 500} fill={isActive ? ROSE : MUTED}>
              {d.label.split(' ')[0]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function DailyArea({ data }: { data: StatsDay[] }) {
  const W = 480
  const H = 176
  const padL = 30
  const padR = 12
  const top = 22
  const bottom = 26
  const plotW = W - padL - padR
  const plotH = H - top - bottom
  const max = Math.max(1, ...data.map((d) => d.orders))
  const n = Math.max(1, data.length - 1)
  const xOf = (i: number) => padL + (i / n) * plotW
  const yOf = (v: number) => top + plotH - (v / max) * plotH
  const points = data.map((d, i) => `${xOf(i)},${yOf(d.orders)}`)
  const areaPath = `M ${padL},${top + plotH} L ${points.join(' L ')} L ${padL + plotW},${top + plotH} Z`
  const linePath = `M ${points.join(' L ')}`

  if (!data.some((d) => d.orders > 0)) {
    return (
      <div style={{ height: 176, display: 'grid', placeItems: 'center', color: MUTED, fontSize: 12.5 }}>
        لا توجد طلبات في هذا الشهر
      </div>
    )
  }

  const tickDays = [1, 8, 15, 22, data.length]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="الطلبات اليومية">
      <defs>
        <linearGradient id="astDailyFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ROSE} stopOpacity={0.28} />
          <stop offset="100%" stopColor={ROSE} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={padL} x2={padL + plotW} y1={top + plotH * (1 - t)} y2={top + plotH * (1 - t)} stroke={LINE} strokeWidth={1} />
          <text x={padL - 6} y={top + plotH * (1 - t) + 3.5} textAnchor="end" fontSize={9} fill={MUTED}>
            {fmtNum(Math.round(max * t))}
          </text>
        </g>
      ))}
      <path d={areaPath} fill="url(#astDailyFill)" />
      <path d={linePath} fill="none" stroke={ROSE} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) =>
        d.orders > 0 ? (
          <g key={d.date}>
            <title>{`${d.date}: ${fmtNum(d.orders)} طلب`}</title>
            <circle cx={xOf(i)} cy={yOf(d.orders)} r={3.4} fill="#fff" stroke={ROSE} strokeWidth={2} />
          </g>
        ) : null,
      )}
      {tickDays.map((day, idx) => {
        const i = Math.min(day - 1, data.length - 1)
        return (
          <text key={idx} x={xOf(i)} y={H - 8} textAnchor="middle" fontSize={9.5} fill={MUTED}>
            {fmtNum(data[i]?.day ?? day)}
          </text>
        )
      })}
    </svg>
  )
}

function StatusDonut({ slices, total, completionRate }: { slices: StatsStatusSlice[]; total: number; completionRate: number }) {
  const R = 42
  const C = 2 * Math.PI * R
  let offset = 0
  const arcs = slices.map((s) => {
    const len = (s.pct / 100) * C
    const arc = { ...s, len, offset }
    offset += len
    return arc
  })

  if (!total) {
    return <div style={{ height: 156, display: 'grid', placeItems: 'center', color: MUTED, fontSize: 12.5 }}>لا توجد بيانات بعد</div>
  }

  return (
    <div className="ast-donut">
      <svg viewBox="0 0 100 100" width={116} height={116} role="img" aria-label="حالات الطلبات">
        <circle cx={50} cy={50} r={R} fill="none" stroke={ROSE_SOFT} strokeWidth={13} />
        {arcs.map((a) => (
          <circle
            key={a.status}
            cx={50}
            cy={50}
            r={R}
            fill="none"
            stroke={STATUS_COLORS[a.status] ?? ROSE}
            strokeWidth={13}
            strokeLinecap="butt"
            strokeDasharray={`${a.len} ${C - a.len}`}
            strokeDashoffset={-a.offset}
            transform="rotate(-90 50 50)"
          />
        ))}
      </svg>
      <div className="ast-donut-center">
        <strong>{fmtNum(completionRate)}%</strong>
        <span>إتمام</span>
      </div>
      <ul className="ast-legend">
        {slices.map((s) => (
          <li key={s.status}>
            <i style={{ background: STATUS_COLORS[s.status] ?? ROSE }} />
            <span>{s.label}</span>
            <b>{fmtNum(s.count)}</b>
            <em>{fmtNum(s.pct)}%</em>
          </li>
        ))}
      </ul>
    </div>
  )
}

function HorizontalBars({ items, total }: { items: { key: string; label: string; count: number; pct: number; note?: string; color?: string }[]; total: number }) {
  const max = Math.max(1, ...items.map((i) => i.count))
  if (!items.length) {
    return <div style={{ padding: '18px 4px', color: MUTED, fontSize: 12.5 }}>لا توجد بيانات بعد</div>
  }
  return (
    <ul className="ast-hbars">
      {items.map((it) => (
        <li key={it.key}>
          <span className="ast-hbar-label" title={it.label}>
            {it.label}
          </span>
          <span className="ast-hbar-track">
            <span className="ast-hbar-fill" style={{ width: `${(it.count / max) * 100}%`, background: it.color ?? ROSE }} />
          </span>
          <b className="ast-hbar-count">{fmtNum(it.count)}</b>
          <em className="ast-hbar-pct">{fmtNum(it.pct)}%</em>
          {it.note && <small className="ast-hbar-note">{it.note}</small>}
        </li>
      ))}
      <li className="ast-hbar-total">
        <span>الإجمالي</span>
        <b>{fmtNum(total)}</b>
      </li>
    </ul>
  )
}

function KpiCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="ast-kpi">
      <span className="ast-kpi-label">{label}</span>
      <strong className="ast-kpi-value" style={tone ? { color: tone } : undefined}>
        {value}
      </strong>
      {sub && <small className="ast-kpi-sub">{sub}</small>}
    </div>
  )
}

// ---- main component ----

export function AdminStats() {
  const [month, setMonth] = useState('')
  const [data, setData] = useState<StatsResponse | null>(null)
  const [initial, setInitial] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(0)
  const [tick, setTick] = useState(0)

  // Mirror the selected month into a ref so the interval/event listeners can
  // re-fetch the same month without being re-created on every month change.
  const monthRef = useRef('')
  const busyRef = useRef(false)
  const pendingRef = useRef(false)

  const fetchStats = useCallback(async (target: string, background = false) => {
    // Collapse bursts (e.g. several rapid status taps) into one request plus
    // a single trailing re-fetch so the last change is never dropped.
    if (busyRef.current) {
      pendingRef.current = true
      return
    }
    busyRef.current = true
    if (background) setRefreshing(true)
    else setInitial(true)
    setError('')
    try {
      const query = target ? `?month=${encodeURIComponent(target)}` : ''
      const result = await adminFetch<StatsResponse>(`/api/admin/stats${query}`)
      setData(result)
      setUpdatedAt(Date.now())
      if (!target && result?.selected?.month) {
        monthRef.current = result.selected.month
        setMonth(result.selected.month)
      }
    } catch (err) {
      if (!background) setError(err instanceof Error ? err.message : 'تعذر تحميل الإحصائيات')
    } finally {
      busyRef.current = false
      setRefreshing(false)
      setInitial(false)
      if (pendingRef.current) {
        pendingRef.current = false
        void fetchStats(monthRef.current || target, true)
      }
    }
  }, [])

  // Initial load when the tab opens.
  useEffect(() => {
    void fetchStats('', false)
  }, [fetchStats])

  // Live refresh while the panel is open: every 12s, and immediately whenever
  // an order is created/deleted/status-changed elsewhere in the admin panel.
  useEffect(() => {
    const refresh = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      void fetchStats(monthRef.current, true)
    }
    const interval = window.setInterval(refresh, 12_000)
    window.addEventListener('eva-orders-changed', refresh)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    // Relative-time ticker so "آخر تحديث قبل X" stays honest between fetches.
    const ticker = window.setInterval(() => setTick(Date.now()), 5_000)
    return () => {
      window.clearInterval(interval)
      window.clearInterval(ticker)
      window.removeEventListener('eva-orders-changed', refresh)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [fetchStats])

  const changeMonth = (next: string) => {
    setMonth(next)
    monthRef.current = next
    void fetchStats(next, true)
  }

  const relTime = useMemo(() => {
    if (!updatedAt) return '—'
    void tick
    const secs = Math.max(0, Math.round((Date.now() - updatedAt) / 1000))
    if (secs < 5) return 'الآن'
    if (secs < 60) return `قبل ${fmtNum(secs)} ثانية`
    const mins = Math.round(secs / 60)
    if (mins < 60) return `قبل ${fmtNum(mins)} دقيقة`
    return new Date(updatedAt).toLocaleTimeString('ar-IQ')
  }, [updatedAt, tick])

  // Month options: the 12 charted months plus any older month that has orders.
  const monthOptions = useMemo(() => {
    if (!data) return []
    const seen = new Map<string, string>()
    for (const m of data.monthly) seen.set(m.month, m.label)
    for (const key of data.months) if (!seen.has(key)) seen.set(key, monthLabel(key))
    return [...seen.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => (a.value < b.value ? 1 : -1))
  }, [data])

  const sel = data?.selected
  const regionItems = useMemo(
    () => (sel?.regions ?? []).map((r) => ({ key: r.region, label: r.region, count: r.count, pct: r.pct, note: r.revenue ? `${fmtMoney(r.revenue)} د.ع` : undefined, color: ROSE })),
    [sel],
  )
  const sourceItems = useMemo(
    () => (sel?.sources ?? []).map((s, i) => ({ key: s.channel, label: s.label, count: s.count, pct: s.pct, color: SOURCE_COLORS[i % SOURCE_COLORS.length] })),
    [sel],
  )

  return (
    <div className="ast">
      <style>{AST_CSS}</style>

      <div className="ast-head">
        <div className="ast-title">
          {refreshing ? <RefreshCw size={18} className="ast-spin" /> : <BarChart3 size={18} />}
          <div>
            <h3>الإحصائيات</h3>
            <small>مباشر · آخر تحديث {relTime}</small>
          </div>
        </div>
        <div className="ast-controls">
          <label className="ast-month">
            <span>الشهر</span>
            <select value={month} onChange={(e) => changeMonth(e.target.value)} disabled={!monthOptions.length}>
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="ast-refresh" onClick={() => void fetchStats(monthRef.current || month, true)} disabled={refreshing} title="تحديث الآن">
            <RefreshCw size={15} className={refreshing ? 'ast-spin' : ''} />
          </button>
        </div>
      </div>

      {initial && !data ? (
        <div className="ast-loading">جارٍ تحميل الإحصائيات…</div>
      ) : error ? (
        <div className="ast-error">{error}</div>
      ) : sel ? (
        <div className={`ast-live${refreshing ? ' is-refreshing' : ''}`}>
          <div className="ast-kpis">
            <KpiCard label="طلبات الشهر" value={fmtNum(sel.total)} sub={sel.label} />
            <KpiCard label="نسبة الإتمام" value={`${fmtNum(sel.completionRate)}%`} sub={`${fmtNum(sel.completed)} من ${fmtNum(sel.total)} مكتمل`} tone={GREEN} />
            <KpiCard label="مبيعات الشهر" value={fmtMoney(sel.revenue)} sub="دينار عراقي" tone={ROSE} />
            <KpiCard label="متوسط الطلب" value={fmtMoney(sel.avgOrder)} sub="دينار عراقي" tone={ORANGE} />
            <KpiCard label="الإجمالي الكلي" value={fmtNum(data?.allTime.total ?? 0)} sub={`${fmtNum(data?.allTime.completionRate ?? 0)}% إتمام`} />
          </div>

          <div className="ast-grid-2">
            <section className="ast-panel">
              <header>
                <TrendingUp size={15} />
                <h4>الطلبات الشهرية</h4>
                <small>آخر 12 شهراً — الشهر المحدد مميّز</small>
              </header>
              <div className="ast-chart">
                <MonthlyBars data={data?.monthly ?? []} active={sel.month} />
              </div>
            </section>

            <section className="ast-panel">
              <header>
                <TrendingUp size={15} />
                <h4>الطلبات اليومية</h4>
                <small>{sel.label}</small>
              </header>
              <div className="ast-chart">
                <DailyArea data={sel.daily} />
              </div>
            </section>
          </div>

          <div className="ast-grid-2">
            <section className="ast-panel">
              <header>
                <h4>حالات الطلبات</h4>
                <small>توزيع حالات {sel.label}</small>
              </header>
              <StatusDonut slices={sel.statusBreakdown} total={sel.total} completionRate={sel.completionRate} />
            </section>

            <section className="ast-panel">
              <header>
                <h4>مصادر الطلبات</h4>
                <small>من وين جاءت الطلبات</small>
              </header>
              <HorizontalBars items={sourceItems} total={sel.total} />
            </section>
          </div>

          <section className="ast-panel">
            <header>
              <h4>مناطق الطلبات</h4>
              <small>حسب المحافظة — عدد الطلبات والمبيعات</small>
            </header>
            <HorizontalBars items={regionItems} total={sel.total} />
          </section>

          <p className="ast-foot">تتحدّث تلقائياً · وقت الخادم: {data ? new Date(data.generatedAt).toLocaleString('ar-IQ') : '—'}</p>
        </div>
      ) : (
        <div className="ast-loading">لا توجد بيانات</div>
      )}
    </div>
  )
}

const AST_CSS = `
.ast { display: grid; gap: 14px; }
.ast-live { display: grid; gap: 14px; transition: opacity .18s ease; }
.ast-live.is-refreshing { opacity: .68; }
.ast-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.ast-title { display: flex; align-items: center; gap: 9px; color: var(--eva-ink); }
.ast-title > svg { color: var(--eva-rose); }
.ast-title h3 { margin: 0; font-size: 15.5px; }
.ast-title small { display: block; font-size: 11px; color: var(--eva-muted); font-weight: 400; }
.ast-controls { display: flex; align-items: center; gap: 8px; }
.ast-month { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; color: var(--eva-muted); }
.ast-month select { min-height: 38px; padding: 6px 12px; border: 1px solid var(--eva-line-strong); border-radius: 10px; background: #fff; color: var(--eva-ink); font-family: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
.ast-month select:focus { outline: none; border-color: var(--eva-rose); }
.ast-refresh { width: 38px; height: 38px; display: grid; place-items: center; border: 1px solid var(--eva-line-strong); border-radius: 10px; background: #fff; color: var(--eva-rose); cursor: pointer; }
.ast-refresh:disabled { opacity: .55; cursor: default; }
.ast-spin { animation: astSpin 1s linear infinite; }
@keyframes astSpin { to { transform: rotate(360deg); } }

.ast-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(158px, 1fr)); gap: 10px; }
.ast-kpi { border: 1px solid var(--eva-line); border-radius: 14px; background: #fff; padding: 12px 13px; display: grid; gap: 3px; box-shadow: var(--eva-shadow-small); }
.ast-kpi-label { font-size: 11.5px; color: var(--eva-muted); font-weight: 600; }
.ast-kpi-value { font-size: 20px; color: var(--eva-ink); line-height: 1.25; }
.ast-kpi-sub { font-size: 10.5px; color: var(--eva-muted); opacity: .82; }

.ast-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; }
.ast-panel { border: 1px solid var(--eva-line); border-radius: 14px; background: #fff; padding: 12px 14px 14px; box-shadow: var(--eva-shadow-small); }
.ast-panel > header { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-bottom: 10px; }
.ast-panel > header svg { color: var(--eva-rose); }
.ast-panel > header h4 { margin: 0; font-size: 13px; color: var(--eva-ink); }
.ast-panel > header small { font-size: 10.5px; color: var(--eva-muted); opacity: .8; margin-inline-start: auto; }
.ast-chart { width: 100%; }

.ast-donut { position: relative; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.ast-donut-center { position: absolute; top: 58px; left: 58px; transform: translate(-50%, -50%); text-align: center; pointer-events: none; }
.ast-donut-center strong { display: block; font-size: 17px; color: var(--eva-rose); }
.ast-donut-center span { font-size: 10px; color: var(--eva-muted); }
.ast-legend { list-style: none; margin: 0; padding: 0; display: grid; gap: 7px; flex: 1 1 150px; min-width: 140px; }
.ast-legend li { display: grid; grid-template-columns: 11px 1fr auto auto; align-items: center; gap: 7px; font-size: 12px; color: var(--eva-ink); }
.ast-legend i { width: 11px; height: 11px; border-radius: 3px; }
.ast-legend b { font-weight: 700; }
.ast-legend em { font-style: normal; color: var(--eva-muted); font-size: 11px; min-width: 34px; text-align: end; }

.ast-hbars { list-style: none; margin: 0; padding: 0; display: grid; gap: 9px; }
.ast-hbars li { display: grid; grid-template-columns: 88px 1fr 34px 40px; align-items: center; gap: 8px; font-size: 12px; }
.ast-hbar-label { color: var(--eva-ink); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ast-hbar-track { height: 9px; border-radius: 999px; background: var(--eva-rose-soft); overflow: hidden; }
.ast-hbar-fill { display: block; height: 100%; border-radius: 999px; transition: width .3s ease; }
.ast-hbar-count { color: var(--eva-ink); font-weight: 700; text-align: center; }
.ast-hbar-pct { font-style: normal; color: var(--eva-muted); font-size: 11px; text-align: end; }
.ast-hbar-note { grid-column: 2 / 5; font-size: 10.5px; color: var(--eva-muted); opacity: .8; margin-top: -3px; }
.ast-hbar-total { display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px dashed var(--eva-line); color: var(--eva-muted); font-weight: 600; }

.ast-loading, .ast-error { padding: 34px 12px; text-align: center; color: var(--eva-muted); font-size: 13px; border: 1px dashed var(--eva-line-strong); border-radius: 14px; background: #fff; }
.ast-error { color: #a3193f; border-color: #f0c9d4; background: #fff5f7; }
.ast-foot { margin: 2px 0 0; text-align: center; font-size: 10.5px; color: var(--eva-muted); opacity: .75; }

@media (max-width: 560px) {
  .ast-hbars li { grid-template-columns: 70px 1fr 30px 38px; }
  .ast-donut-center { top: 58px; left: 58px; }
}
`
