import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ClipboardList, Coins, Heart, Info, Layers, LayoutGrid, Package, Percent, RefreshCw, Receipt, ShoppingBag, Sparkles, Tag, TrendingDown, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'wouter'
import type { Category, Product } from '@/types'
import { formatMeters, formatPrice } from '@/lib/catalog'
import { buildStatsSnapshot, formatCount, formatShare, type StatsSnapshot } from '@/lib/stats'

interface StatsPageProps {
  products: Product[]
  categories: Category[]
}

interface KpiItem {
  id: string
  label: string
  value: number
  hint: string
  Icon: LucideIcon
  format?: (value: number) => string
}

const DONUT_RADIUS = 48
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS
const COUNT_DURATION = 900

const statsStyles = `
.stats-page { padding-bottom: 72px; }
.stats-toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.stats-page :focus-visible { outline: 3px solid rgba(183, 44, 111, .45); outline-offset: 3px; }
.stats-refresh.is-spinning svg { animation: stats-spin .65s ease; }
@keyframes stats-spin { to { transform: rotate(-360deg); } }
.stats-page .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-top: 6px; }
.stats-page .glass-card { position: relative; overflow: hidden; border-radius: 22px; background: linear-gradient(155deg, rgba(255, 253, 251, .93), rgba(255, 250, 245, .58)); border: 1px solid rgba(255, 255, 255, .85); box-shadow: 0 18px 40px rgba(48, 38, 42, .1), inset 0 1px 0 rgba(255, 255, 255, .9); -webkit-backdrop-filter: blur(16px) saturate(150%); backdrop-filter: blur(16px) saturate(150%); }
.stats-page .glass-card::before { content: ''; position: absolute; right: auto; left: auto; width: 150px; height: 150px; top: -78px; inset-inline-start: -56px; border-radius: 50%; background: radial-gradient(circle, rgba(183, 44, 111, .17), rgba(183, 44, 111, 0) 70%); pointer-events: none; }
.stats-page .glass-card > * { position: relative; }
.stats-page .stat-card { display: flex; flex-direction: column; gap: 7px; min-height: 134px; padding: 17px 16px; }
.stats-head { display: flex; align-items: center; gap: 8px; }
.stats-head svg { flex: 0 0 auto; color: var(--eva-rose); }
.stats-page .stat-label { font-size: 11px; font-weight: 500; color: var(--eva-muted); }
.stats-page .stat-value { position: relative; margin-top: auto; font-size: clamp(21px, 2.1vw, 27px); line-height: 1.35; letter-spacing: -.02em; color: var(--eva-ink); overflow-wrap: anywhere; }
.stats-hint { position: relative; font-size: 10px; line-height: 1.65; color: var(--eva-muted); overflow-wrap: anywhere; }
.stats-charts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 22px; }
.stats-page .chart-card { display: flex; flex-direction: column; gap: 15px; padding: 21px 19px; }
.chart-head { position: relative; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.chart-title { display: grid; gap: 6px; }
.chart-title h2 { font-size: 16px; line-height: 1.4; }
.chart-sub { font-size: 11px; line-height: 1.75; color: var(--eva-muted); }
.chart-tag { flex: 0 0 auto; padding: 4px 11px; border-radius: 999px; font-size: 10px; font-weight: 600; color: var(--eva-rose-dark); background: rgba(183, 44, 111, .1); border: 1px solid rgba(183, 44, 111, .2); }
.chart-legend { display: flex; flex-wrap: wrap; gap: 8px 15px; }
.legend-item { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; color: var(--eva-muted); }
.legend-dot { width: 10px; height: 10px; border-radius: 3px; }
.chart-empty { padding: 26px 16px; text-align: center; border: 1px dashed var(--eva-line-strong); border-radius: 16px; background: rgba(255, 255, 255, .45); color: var(--eva-muted); font-size: 12px; }
.bars-chart { position: relative; display: flex; align-items: flex-end; gap: 10px; min-height: 238px; }
.bars-col { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.bars-total { font-size: 11px; font-weight: 600; color: var(--eva-ink); }
.bars-stack { width: 100%; max-width: 66px; height: 150px; display: flex; flex-direction: column-reverse; overflow: hidden; border-radius: 9px; background: rgba(232, 220, 211, .45); }
.bar-seg { width: 100%; transition: height .55s ease; }
.bar-low { background: var(--eva-green); }
.bar-mid { background: var(--eva-orange); }
.bar-high { background: var(--eva-rose); }
.bars-name { min-height: 31px; display: inline-flex; align-items: center; justify-content: center; gap: 5px; font-size: 10px; line-height: 1.5; text-align: center; color: var(--eva-muted); overflow-wrap: anywhere; }
.bars-name i { width: 7px; height: 7px; border-radius: 50%; flex: 0 0 auto; }
.donut-area { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.donut-wrap { position: relative; width: 194px; height: 194px; }
.donut-wrap svg { width: 100%; height: 100%; display: block; }
.donut-track { stroke: rgba(232, 220, 211, .9); }
.donut-fill { stroke: var(--eva-rose); transition: stroke-dashoffset .7s ease; }
.donut-center { position: absolute; inset: 0; display: grid; place-content: center; gap: 2px; text-align: center; }
.donut-center strong { font-size: 30px; line-height: 1.2; color: var(--eva-rose); }
.donut-center span { font-size: 10px; color: var(--eva-muted); }
.donut-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 9px 18px; }
.donut-legend div { display: grid; gap: 2px; text-align: center; }
.donut-legend strong { font-size: 15px; color: var(--eva-ink); }
.donut-legend span { font-size: 10px; color: var(--eva-muted); }
.stock-list { display: grid; gap: 13px; margin: 0; padding: 0; list-style: none; }
.stock-top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.stock-name { font-size: 12px; color: var(--eva-ink); overflow-wrap: anywhere; }
.stock-top strong { flex: 0 0 auto; font-size: 12px; color: var(--eva-rose); white-space: nowrap; }
.stock-track { height: 9px; overflow: hidden; border-radius: 999px; background: rgba(232, 220, 211, .6); }
.stock-track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--eva-rose), rgba(183, 44, 111, .5)); transition: width .6s ease; }
.diversity-body { display: grid; gap: 13px; }
.diversity-figure { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.diversity-figure strong { font-size: clamp(19px, 2vw, 25px); color: var(--eva-ink); }
.diversity-figure span { font-size: 11px; color: var(--eva-muted); }
.progress-track { height: 14px; overflow: hidden; border-radius: 999px; background: rgba(232, 220, 211, .55); }
.progress-fill { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--eva-rose), var(--eva-orange)); transition: width .7s ease; }
.progress-meta { display: flex; justify-content: space-between; gap: 10px; font-size: 10px; color: var(--eva-muted); }
.diversity-list { display: grid; gap: 7px; margin: 0; padding: 0; list-style: none; }
.diversity-list li { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 7px; border-top: 1px dashed var(--eva-line); font-size: 11px; color: var(--eva-muted); }
.diversity-list li span { display: inline-flex; align-items: center; gap: 7px; }
.diversity-list li i { width: 7px; height: 7px; border-radius: 50%; }
.diversity-list li b { color: var(--eva-ink); font-weight: 600; }
.stats-orders { margin-top: 22px; padding: 21px 19px; }
.stats-table-wrap { position: relative; overflow-x: auto; }
.stats-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.stats-table th { padding: 10px 12px; text-align: start; color: var(--eva-muted); font-size: 11px; font-weight: 600; border-bottom: 1px solid var(--eva-line-strong); }
.stats-table td { padding: 13px 12px; border-bottom: 1px dashed var(--eva-line); }
.stats-table tbody tr:last-child td { border-bottom: 0; }
.stats-table tbody tr { transition: background .2s ease; }
.stats-table tbody tr:hover { background: rgba(255, 255, 255, .55); }
.stats-order-number { font-weight: 600; color: var(--eva-ink); }
.stats-status { display: inline-flex; align-items: center; min-height: 24px; padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 600; border: 1px solid transparent; }
.stats-status.is-done { color: var(--eva-green); background: rgba(73, 118, 91, .12); border-color: rgba(73, 118, 91, .25); }
.stats-status.is-pending { color: var(--eva-orange); background: rgba(217, 121, 67, .12); border-color: rgba(217, 121, 67, .28); }
.stats-status.is-new { color: var(--eva-rose-dark); background: rgba(183, 44, 111, .1); border-color: rgba(183, 44, 111, .22); }
.stats-empty { display: grid; justify-items: center; gap: 8px; padding: 34px 18px; text-align: center; border: 1px dashed var(--eva-line-strong); border-radius: 16px; background: rgba(255, 255, 255, .45); }
.stats-empty-icon { width: 54px; height: 54px; display: grid; place-items: center; border-radius: 50%; color: var(--eva-rose); background: rgba(183, 44, 111, .1); }
.stats-empty strong { font-size: 14px; }
.stats-empty p { max-width: 400px; font-size: 11px; line-height: 1.8; color: var(--eva-muted); }
.stats-empty .button { margin-top: 6px; }
.stats-note { display: flex; align-items: flex-start; gap: 12px; margin-top: 14px; padding: 17px 18px; }
.stats-note svg { flex: 0 0 auto; margin-top: 3px; color: var(--eva-rose); }
.stats-note strong { font-size: 13px; }
.stats-note p { margin-top: 5px; font-size: 11px; line-height: 1.85; color: var(--eva-muted); }
@media (max-width: 1100px) { .stats-page .stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 900px) { .stats-page .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .stats-charts { grid-template-columns: 1fr; } }
@media (max-width: 600px) {
  .stats-page .stat-card { min-height: 122px; padding: 14px 13px; gap: 6px; }
  .stats-page .stat-value { font-size: 20px; }
  .stats-page .stat-label, .stats-hint { font-size: 10px; }
  .stats-page .chart-card, .stats-orders { padding: 17px 15px; }
  .bars-chart { min-height: 214px; gap: 7px; }
  .bars-stack { height: 130px; max-width: 48px; }
  .donut-wrap { width: 170px; height: 170px; }
  .donut-center strong { font-size: 26px; }
  .stats-table thead { display: none; }
  .stats-table, .stats-table tbody, .stats-table tr, .stats-table td { display: block; width: 100%; }
  .stats-table tr { margin-bottom: 10px; padding: 9px 12px; border: 1px solid var(--eva-line); border-radius: 14px; background: rgba(255, 255, 255, .55); }
  .stats-table tr:last-child { margin-bottom: 0; }
  .stats-table td { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 5px 0; border-bottom: 0; }
  .stats-table td::before { content: attr(data-label); color: var(--eva-muted); font-size: 11px; }
}
@media (prefers-reduced-motion: reduce) {
  .stats-page *, .stats-page *::before, .stats-page *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const timeLabel = (): string => {
  try {
    return new Intl.DateTimeFormat('ar-IQ', { hour: '2-digit', minute: '2-digit' }).format(new Date())
  } catch {
    return new Date().toLocaleTimeString()
  }
}

const priceText = (value: number): string => (value > 0 ? formatPrice(Math.round(value)) : '—')

function CountUp({ value, token, format }: { value: number; token: number; format?: (value: number) => string }) {
  const [current, setCurrent] = useState(() => (reducedMotion() ? value : 0))

  useEffect(() => {
    if (!Number.isFinite(value) || reducedMotion()) {
      setCurrent(Number.isFinite(value) ? value : 0)
      return undefined
    }
    let frame = 0
    const start = performance.now()
    const step = (time: number) => {
      const progress = Math.min(1, (time - start) / COUNT_DURATION)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(value * eased)
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value, token])

  return <>{format ? format(current) : formatCount(current)}</>
}

function StatCard({ item, token }: { item: KpiItem; token: number }) {
  const { Icon } = item
  return (
    <article className="glass-card stat-card">
      <div className="stats-head">
        <Icon size={16} aria-hidden="true" />
        <span className="stat-label">{item.label}</span>
      </div>
      <strong className="stat-value">
        <CountUp value={item.value} token={token} format={item.format} />
      </strong>
      <span className="stats-hint">{item.hint}</span>
    </article>
  )
}

function PriceBars({ snapshot, hasProducts }: { snapshot: StatsSnapshot; hasProducts: boolean }) {
  const rows = snapshot.priceRows
  const label = hasProducts
    ? `أعمدة توزيع الأسعار حسب القسم: ${rows
        .map((row) => `${row.name}: ${formatCount(row.counts.low)} ضمن ${snapshot.bandLabels.low}، ${formatCount(row.counts.mid)} ضمن ${snapshot.bandLabels.mid}، ${formatCount(row.counts.high)} ضمن ${snapshot.bandLabels.high}`)
        .join('؛ ')}`
    : 'أعمدة توزيع الأسعار حسب القسم: لا توجد خامات لعرضها'

  return (
    <section className="glass-card chart-card">
      <div className="chart-head">
        <div className="chart-title">
          <span className="eyebrow">توزيع الأسعار</span>
          <h2>الأسعار حسب القسم</h2>
          <p className="chart-sub">عدد الخامات داخل كل نطاق سعري داخل كل قسم</p>
        </div>
        <span className="chart-tag">للمتر</span>
      </div>
      {hasProducts && rows.length ? (
        <div className="bars-chart" role="img" aria-label={label}>
          {rows.map((row) => (
            <div className="bars-col" key={row.id}>
              <span className="bars-total">{formatCount(row.total)}</span>
              <div className="bars-stack">
                <span className="bar-seg bar-low" style={{ height: `${row.total ? (row.counts.low / row.total) * 100 : 0}%` }} />
                <span className="bar-seg bar-mid" style={{ height: `${row.total ? (row.counts.mid / row.total) * 100 : 0}%` }} />
                <span className="bar-seg bar-high" style={{ height: `${row.total ? (row.counts.high / row.total) * 100 : 0}%` }} />
              </div>
              <span className="bars-name">
                <i style={{ backgroundColor: row.accent }} />
                {row.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="chart-empty">لا توجد خامات بعد لعرض توزيع الأسعار داخل الأقسام.</p>
      )}
      <div className="chart-legend">
        <span className="legend-item"><i className="legend-dot" style={{ background: 'var(--eva-green)' }} />{snapshot.bandLabels.low}</span>
        <span className="legend-item"><i className="legend-dot" style={{ background: 'var(--eva-orange)' }} />{snapshot.bandLabels.mid}</span>
        <span className="legend-item"><i className="legend-dot" style={{ background: 'var(--eva-rose)' }} />{snapshot.bandLabels.high}</span>
      </div>
    </section>
  )
}

function AvailabilityDonut({ snapshot, token }: { snapshot: StatsSnapshot; token: number }) {
  const percent = snapshot.availabilityPercent
  const offset = DONUT_CIRCUMFERENCE * (1 - Math.min(100, Math.max(0, percent)) / 100)
  const missing = Math.max(0, snapshot.productCount - snapshot.availableCount)
  const label = `نسبة المتوفر: ${formatShare(percent)}، ${formatCount(snapshot.availableCount)} خامة متوفرة من أصل ${formatCount(snapshot.productCount)}، و${formatCount(missing)} خامة نفدت`

  return (
    <section className="glass-card chart-card">
      <div className="chart-head">
        <div className="chart-title">
          <span className="eyebrow">التوفّر</span>
          <h2>نسبة المتوفر من الخامات</h2>
          <p className="chart-sub">خامة متوفرة تعني رصيداً فوق صفر في المعرض</p>
        </div>
        <span className="chart-tag">{formatShare(percent)}</span>
      </div>
      <div className="donut-area">
        <div className="donut-wrap">
          <svg viewBox="0 0 120 120" role="img" aria-label={label}>
            <circle className="donut-track" cx="60" cy="60" r={DONUT_RADIUS} fill="none" strokeWidth="13" />
            <circle
              className="donut-fill"
              cx="60"
              cy="60"
              r={DONUT_RADIUS}
              fill="none"
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={`${DONUT_CIRCUMFERENCE}`}
              strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="donut-center" aria-hidden="true">
            <strong><CountUp value={percent} token={token} format={(value) => formatShare(value)} /></strong>
            <span>متوفر الآن</span>
          </div>
        </div>
        <div className="donut-legend">
          <div>
            <strong>{formatCount(snapshot.availableCount)}</strong>
            <span>خامة متوفرة</span>
          </div>
          <div>
            <strong>{formatCount(missing)}</strong>
            <span>نفدت من المخزون</span>
          </div>
          <div>
            <strong>{formatCount(snapshot.productCount)}</strong>
            <span>إجمالي الخامات</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function StockLeaders({ snapshot }: { snapshot: StatsSnapshot }) {
  const rows = snapshot.stockRows
  const label = rows.length
    ? `أكبر خمس خامات بالمخزون: ${rows.map((row) => `${row.name} ${formatMeters(row.meters)}`).join('، ')}`
    : 'أكبر خمس خامات بالمخزون: لا توجد بيانات'

  return (
    <section className="glass-card chart-card">
      <div className="chart-head">
        <div className="chart-title">
          <span className="eyebrow">المخزون</span>
          <h2>أكبر ٥ خامات بالمخزون</h2>
          <p className="chart-sub">ترتيب تنازلي حسب الأمتار المتاحة لكل خامة</p>
        </div>
        <span className="chart-tag">بالمتر</span>
      </div>
      {rows.length ? (
        <ol className="stock-list" role="img" aria-label={label}>
          {rows.map((row) => (
            <li key={row.id}>
              <div className="stock-top">
                <span className="stock-name">{row.name}</span>
                <strong>{formatMeters(row.meters)}</strong>
              </div>
              <div className="stock-track" aria-hidden="true">
                <span style={{ width: `${row.percent}%` }} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="chart-empty">لا توجد خامات برصيد مسجل لعرضها هنا.</p>
      )}
    </section>
  )
}

function DiversityProgress({ snapshot }: { snapshot: StatsSnapshot }) {
  const top = snapshot.topCategory
  const label = top
    ? `القسم الأكثر تنوعاً: ${top.name} بـ${formatCount(top.count)} خامات، أي ${formatShare(top.percent)} من إجمالي المعرض`
    : 'القسم الأكثر تنوعاً: لا توجد بيانات'

  return (
    <section className="glass-card chart-card">
      <div className="chart-head">
        <div className="chart-title">
          <span className="eyebrow">التنوّع</span>
          <h2>القسم الأكثر تنوعاً</h2>
          <p className="chart-sub">حصة القسم الأعلى من عدد الخامات المعروضة</p>
        </div>
        <span className="chart-tag">{top ? top.name : '—'}</span>
      </div>
      {top ? (
        <div className="diversity-body" role="img" aria-label={label}>
          <div className="diversity-figure">
            <strong>{top.name}</strong>
            <span>{formatCount(top.count)} خامة · {formatShare(top.percent)}</span>
          </div>
          <div className="progress-track" aria-hidden="true">
            <span className="progress-fill" style={{ width: `${Math.min(100, top.percent)}%` }} />
          </div>
          <div className="progress-meta">
            <span>حصة القسم من المعرض</span>
            <span>{formatShare(top.percent)}</span>
          </div>
          <ul className="diversity-list">
            {snapshot.priceRows.map((row) => (
              <li key={row.id}>
                <span><i style={{ backgroundColor: row.accent }} />{row.name}</span>
                <b>{formatCount(row.total)}</b>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="chart-empty">أضيفي خامات إلى الأقسام ليظهر توزيع التنوّع.</p>
      )}
    </section>
  )
}

const statusTone = (status: string): string => {
  const value = status.toLowerCase()
  if (/مكتم|تم التسليم|تم التأكيد|delivered|complete|done|success|accepted|مقبول|مؤكد/.test(value)) return 'is-done'
  if (/قيد|جديد|pending|processing|review|مسجل|open/.test(value)) return 'is-pending'
  return 'is-new'
}

function OrdersTable({ orders }: { orders: StatsSnapshot['orders'] }) {
  if (!orders.length) {
    return (
      <div className="stats-empty" role="status">
        <span className="stats-empty-icon"><Receipt size={24} aria-hidden="true" /></span>
        <strong>لا توجد طلبات محفوظة بعد</strong>
        <p>عند إتمام أول طلب يظهر هنا رقمه وتاريخه وإجماليه وحالته، محفوظاً في متصفحك.</p>
        <Link href="/catalog" className="button button-outline">
          تصفحي الأقمشة <ArrowLeft size={16} aria-hidden="true" />
        </Link>
      </div>
    )
  }

  return (
    <div className="stats-table-wrap">
      <table className="stats-table">
        <caption className="sr-only">أحدث الطلبات المحفوظة محلياً في المتصفح</caption>
        <thead>
          <tr>
            <th scope="col">رقم الطلب</th>
            <th scope="col">التاريخ</th>
            <th scope="col">الإجمالي</th>
            <th scope="col">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 6).map((order) => (
            <tr key={order.id}>
              <td data-label="رقم الطلب"><span className="stats-order-number" dir="ltr">{order.orderNumber}</span></td>
              <td data-label="التاريخ">{order.date}</td>
              <td data-label="الإجمالي">{order.totalLabel}</td>
              <td data-label="الحالة"><span className={`stats-status ${statusTone(order.status)}`}>{order.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StatsPage({ products, categories }: StatsPageProps) {
  const [token, setToken] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [stamp, setStamp] = useState(() => timeLabel())
  const [snapshot, setSnapshot] = useState(() => buildStatsSnapshot(products, categories))

  useEffect(() => {
    setSnapshot(buildStatsSnapshot(products, categories))
  }, [products, categories, token])

  const kpis = useMemo<KpiItem[]>(() => {
    const stocked = products.filter((product) => product.stockMeters > 0).length
    return [
      { id: 'fabrics', label: 'عدد الخامات', value: snapshot.productCount, hint: `${formatCount(snapshot.availableCount)} منها متوفرة الآن`, Icon: Layers },
      { id: 'categories', label: 'عدد الأقسام', value: snapshot.categoryCount, hint: 'أقسام موزعة على المعرض', Icon: LayoutGrid },
      { id: 'average', label: 'متوسط السعر', value: snapshot.averagePrice, format: (value) => formatPrice(Math.round(value)), hint: 'متوسط سعر المتر داخل المعرض', Icon: Coins },
      { id: 'lowest', label: 'أقل سعر', value: snapshot.minPrice, format: priceText, hint: snapshot.cheapest ? 'أدنى سعر مسجل للخامة' : 'لا توجد خامات بعد', Icon: Tag },
      { id: 'cheapest', label: 'أرخص خامة', value: snapshot.cheapest ? snapshot.cheapest.price : 0, format: priceText, hint: snapshot.cheapest ? snapshot.cheapest.name : 'لا توجد خامات بعد', Icon: TrendingDown },
      { id: 'dearest', label: 'أغلى خامة', value: snapshot.dearest ? snapshot.dearest.price : 0, format: priceText, hint: snapshot.dearest ? snapshot.dearest.name : 'لا توجد خامات بعد', Icon: TrendingUp },
      { id: 'stock', label: 'إجمالي المخزون بالمتر', value: snapshot.totalMeters, format: (value) => formatMeters(value), hint: `${formatCount(stocked)} خامة عليها رصيد`, Icon: Package },
      { id: 'new', label: 'الخامات الجديدة', value: snapshot.newCount, hint: 'خامات موسومة بوصول حديثاً', Icon: Sparkles },
      { id: 'available', label: 'نسبة المتوفر', value: snapshot.availabilityPercent, format: (value) => formatShare(value), hint: `${formatCount(snapshot.availableCount)} من ${formatCount(snapshot.productCount)} خامة`, Icon: Percent },
      { id: 'cart', label: 'عناصر السلة المحفوظة', value: snapshot.cartItems, hint: `${formatMeters(snapshot.cartMeters)} محفوظة في المتصفح`, Icon: ShoppingBag },
      { id: 'wishlist', label: 'المفضلة', value: snapshot.wishlistCount, hint: 'خامات محفوظة بقلب المفضلة', Icon: Heart },
      { id: 'orders', label: 'الطلبات المحفوظة', value: snapshot.orderCount, hint: 'من مفتاح eva-orders في المتصفح', Icon: ClipboardList },
    ]
  }, [products, snapshot])

  const refresh = () => {
    setToken((current) => current + 1)
    setStamp(timeLabel())
    setSpinning(true)
    window.setTimeout(() => setSpinning(false), 700)
  }

  return (
    <main className="container-eva stats-page">
      <style>{statsStyles}</style>
      <div className="breadcrumbs">
        <Link href="/">الرئيسية</Link>
        <span>›</span>
        <span>الإحصائيات</span>
      </div>
      <div className="page-title-row">
        <div>
          <span className="eyebrow">لوحة الإحصائيات</span>
          <h1>أرقام المعرض</h1>
          <p>ملخص مباشر لتشكيلة إيفا ستور · آخر تحديث {stamp}</p>
        </div>
        <div className="stats-toolbar">
          <button
            type="button"
            className={`button button-outline stats-refresh${spinning ? ' is-spinning' : ''}`}
            onClick={refresh}
            aria-label="تحديث بيانات لوحة الإحصائيات من المتصفح"
          >
            <RefreshCw size={16} aria-hidden="true" />
            تحديث البيانات
          </button>
        </div>
      </div>

      <section className="stats-grid" aria-label="مؤشرات أرقام المعرض">
        {kpis.map((item) => (
          <StatCard key={item.id} item={item} token={token} />
        ))}
      </section>

      <section className="stats-charts" aria-label="رسوم بيانية للمعرض">
        <PriceBars snapshot={snapshot} hasProducts={products.length > 0} />
        <AvailabilityDonut snapshot={snapshot} token={token} />
        <StockLeaders snapshot={snapshot} />
        <DiversityProgress snapshot={snapshot} />
      </section>

      <section className="glass-card stats-orders" aria-labelledby="stats-orders-title">
        <div className="chart-head">
          <div className="chart-title">
            <span className="eyebrow"><Receipt size={13} aria-hidden="true" />سجل محلي</span>
            <h2 id="stats-orders-title">أحدث الطلبات</h2>
            <p className="chart-sub">آخر الطلبات المحفوظة في ذاكرة المتصفح، بترتيب الأحدث أولاً</p>
          </div>
          <span className="chart-tag">{formatCount(snapshot.orderCount)} طلب</span>
        </div>
        <OrdersTable orders={snapshot.orders} />
      </section>

      <div className="glass-card stats-note" role="note">
        <Info size={18} aria-hidden="true" />
        <div>
          <strong>البيانات من المعرض المحلي</strong>
          <p>
            كل رقم في هذه اللوحة يُحسب لحظياً من تشكيلة المعرض ومن ذاكرة المتصفح: السلة والمفضلة محفوظتان في localStorage،
            والطلبات تُقرأ من المفتاح eva-orders بمعاينة آمنة. لا يوجد خادم مرتبط بهذه اللوحة، وزر التحديث يعيد قراءة القيم فوراً.
          </p>
        </div>
      </div>
    </main>
  )
}
