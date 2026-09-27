import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Minus, Pencil, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from 'lucide-react'
import { Link } from 'wouter'
import type { CartItem } from '@/types'
import { formatMeters, formatPrice, getCartTotals, orderKey } from '@/lib/catalog'

interface CartPageProps {
  cart: CartItem[]
  onUpdate: (key: string, length: number) => void
  onRemove: (key: string) => void
}

const FREE_DELIVERY_AT = 50000

const glassStyles = `
.glass-scope { --glass-fill: rgba(255, 252, 248, .58); --glass-strong: rgba(255, 251, 247, .88); --glass-line: rgba(255, 255, 255, .72); --glass-shadow: 0 22px 48px rgba(70, 45, 35, .1); }
.glass-scope .glass { position: relative; background: var(--glass-fill); border: 1px solid var(--glass-line); box-shadow: var(--glass-shadow); backdrop-filter: blur(18px) saturate(150%); -webkit-backdrop-filter: blur(18px) saturate(150%); }
.glass-scope .glass-card { border-radius: 16px; }
.glass-scope .glass-strong { background: var(--glass-strong); border-color: rgba(255, 255, 255, .92); }
.glass-scope .glass-dark { color: #fff8f1; background: rgba(48, 38, 42, .9); border: 1px solid rgba(255, 248, 241, .18); box-shadow: 0 16px 34px rgba(48, 38, 42, .22); }
.glass-scope .glass-pill { border-radius: 999px; }
.glass-scope .glass-divider { height: 1px; margin: 16px 0; background: linear-gradient(90deg, rgba(183, 44, 111, 0), rgba(183, 44, 111, .35), rgba(183, 44, 111, 0)); border: 0; }
.glass-scope .chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; color: var(--eva-muted); background: rgba(255, 255, 255, .72); border: 1px solid rgba(255, 255, 255, .9); border-radius: 999px; font-size: 10px; line-height: 1.7; }
.glass-scope .chip i { width: 11px; height: 11px; border: 1px solid rgba(45, 34, 34, .2); border-radius: 50%; }
.glass-scope a.chip:hover { color: var(--eva-rose); border-color: rgba(183, 44, 111, .45); }
.glass-scope .cart-items { padding: 4px 20px; border-top: 0; border-radius: 18px; }
.glass-scope .cart-item:last-child { border-bottom: 0; }
.glass-scope .cart-item-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.glass-scope .cart-item-tools { display: flex; align-items: center; gap: 8px; }
.glass-scope .cart-item-total { display: grid; gap: 2px; text-align: end; }
.glass-scope .cart-item-total small { color: var(--eva-muted); font-size: 9px; }
.glass-scope .cart-item-total strong { color: var(--eva-ink); font-size: 14px; }
.glass-scope .order-summary, .glass-scope .checkout-summary { border-radius: 18px; }
.glass-scope .delivery-progress { display: grid; gap: 9px; padding: 13px 14px; background: rgba(255, 255, 255, .66); border: 1px solid rgba(255, 255, 255, .9); border-radius: 14px; }
.glass-scope .delivery-progress-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: var(--eva-muted); font-size: 10px; }
.glass-scope .delivery-progress-head b { color: var(--eva-rose); font-size: 10px; }
.glass-scope .progress-track { height: 7px; overflow: hidden; background: rgba(48, 38, 42, .12); border-radius: 999px; }
.glass-scope .progress-track i { display: block; height: 100%; background: linear-gradient(90deg, var(--eva-rose), #dd6ba0); border-radius: 999px; transition: width .45s ease; }
.glass-scope .delivery-free { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-radius: 14px; font-size: 11px; }
.glass-scope .empty-card { display: grid; justify-items: center; max-width: 470px; padding: 44px 32px; border-radius: 20px; text-align: center; }
.glass-scope .empty-card p { max-width: 330px; margin-top: 7px; color: var(--eva-muted); font-size: 13px; }
.glass-scope .empty-card .button { margin-top: 24px; }
.glass-scope a:focus-visible, .glass-scope button:focus-visible, .glass-scope input:focus-visible, .glass-scope select:focus-visible, .glass-scope textarea:focus-visible, .glass-scope [tabindex]:focus-visible { outline: 2px solid var(--eva-rose); outline-offset: 3px; }
@media (max-width: 820px) {
  .glass-scope .cart-items { padding: 4px 15px; }
}
@media (max-width: 560px) {
  .glass-scope .cart-item-bottom { flex-direction: column; align-items: stretch; gap: 11px; }
  .glass-scope .cart-item-total { text-align: start; }
  .glass-scope .quantity-control { width: 100%; justify-content: space-between; }
  .glass-scope .cart-item-chips .chip { font-size: 9px; }
  .glass-scope .empty-card { padding: 34px 18px; }
  .glass-scope .cart-item-top { flex-wrap: wrap; }
  .glass-scope .cart-item-tools { flex-wrap: wrap; justify-content: flex-end; }
  .glass-scope .delivery-progress-head { flex-wrap: wrap; }
  .glass-scope .summary-line, .glass-scope .summary-total { flex-wrap: wrap; }
}
@media (max-width: 360px) {
  .glass-scope .cart-item { grid-template-columns: 74px 1fr; gap: 9px; }
  .glass-scope .cart-item-tools { width: 100%; justify-content: space-between; }
  .glass-scope .cart-item-image { height: 100px; }
}
@media (min-width: 1600px) {
  .glass-scope.container-eva { width: min(1320px, calc(100% - 96px)); }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .glass-scope *, .glass-scope *::before, .glass-scope *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`

export function CartPage({ cart, onUpdate, onRemove }: CartPageProps) {
  const totals = getCartTotals(cart)
  const [announcement, setAnnouncement] = useState('')
  const itemsRef = useRef<HTMLElement>(null)
  const emptyRef = useRef<HTMLDivElement>(null)
  const previousCount = useRef(cart.length)

  useEffect(() => {
    const removed = cart.length < previousCount.current
    previousCount.current = cart.length
    if (!removed) return undefined
    const target = cart.length === 0 ? emptyRef.current : itemsRef.current
    if (!target) return undefined
    const timer = window.setTimeout(() => target.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [cart.length])

  const handleUpdate = (item: CartItem, nextLength: number) => {
    onUpdate(orderKey(item), nextLength)
    setAnnouncement(`تم تحديث كمية ${item.product.name} إلى ${formatMeters(nextLength)}`)
  }

  const handleRemove = (item: CartItem) => {
    onRemove(orderKey(item))
    setAnnouncement(`تم حذف ${item.product.name} باللون ${item.color.name} من السلة`)
  }

  if (cart.length === 0) {
    return (
      <main className="container-eva empty-state page-empty glass-scope">
        <style>{glassStyles}</style>
        <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
        <div className="glass glass-card empty-card" tabIndex={-1} ref={emptyRef}>
          <div className="empty-icon"><ShoppingBag size={26} /></div>
          <h1>السلة هادئة الآن</h1>
          <p>أضيفي قماشاً يعجبك، وستظهر تفاصيله هنا مع السعر لكل متر وإمكانية تعديل الكمية بنصف متر.</p>
          <Link href="/catalog" className="button button-primary">تصفحي الأقمشة <ArrowLeft size={16} /></Link>
        </div>
      </main>
    )
  }

  const meters = cart.reduce((sum, item) => sum + item.length, 0)
  const remaining = Math.max(0, FREE_DELIVERY_AT - totals.subtotal)
  const progress = Math.min(100, Math.round((totals.subtotal / FREE_DELIVERY_AT) * 100))

  return (
    <main className="container-eva cart-page glass-scope">
      <style>{glassStyles}</style>
      <div className="breadcrumbs">
        <Link href="/">الرئيسية</Link>
        <span>›</span>
        <span>السلة</span>
      </div>
      <div className="page-title-row">
        <div>
          <span className="eyebrow">اختياراتك</span>
          <h1>سلة التسوق</h1>
          <p>{formatMeters(meters)} في السلة</p>
        </div>
        <Link href="/catalog" className="underlined-link">متابعة التسوق <ArrowLeft size={15} /></Link>
      </div>
      <div className="cart-layout">
        <section className="cart-items glass glass-card" aria-label="عناصر السلة" tabIndex={-1} ref={itemsRef}>
          <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
          {cart.map((item) => {
            const key = orderKey(item)
            const maxMeters = Math.min(item.product.stockMeters, item.color.stockMeters)
            const lineTotal = item.product.price * item.length
            return (
              <article className="cart-item" key={key}>
                <Link href={`/product/${item.product.slug}`} className="cart-item-image glass-card">
                  <img src={item.product.image} alt={item.product.name} />
                </Link>
                <div className="cart-item-info">
                  <div className="cart-item-top">
                    <div className="cart-item-details">
                      <span className="product-type">{item.product.type}</span>
                      <Link href={`/product/${item.product.slug}`} className="product-name">{item.product.name}</Link>
                      <div className="cart-item-chips">
                        <span className="chip cart-item-color"><i style={{ backgroundColor: item.color.hex }} />{item.color.name}</span>
                        <span className="chip glass-pill">{formatPrice(item.product.price)} / متر</span>
                      </div>
                    </div>
                    <div className="cart-item-tools">
                      <Link href={`/product/${item.product.slug}`} className="chip"><Pencil size={12} />تعديل</Link>
                      <button type="button" className="remove-button" onClick={() => handleRemove(item)} aria-label={`حذف ${item.product.name} باللون ${item.color.name}`}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="cart-item-bottom">
                    <div className="quantity-control compact">
                      <button type="button" onClick={() => handleUpdate(item, item.length - 0.5)} disabled={item.length <= 0.5} aria-label={`إنقاص كمية ${item.product.name}`}><Minus size={15} /></button>
                      <output aria-label={`كمية ${item.product.name}`}>{formatMeters(item.length)}</output>
                      <button type="button" onClick={() => handleUpdate(item, item.length + 0.5)} disabled={item.length >= maxMeters} aria-label={`زيادة كمية ${item.product.name}`}><Plus size={15} /></button>
                    </div>
                    <div className="cart-item-total">
                      <small>{formatMeters(item.length)} × {formatPrice(item.product.price)}</small>
                      <strong>{formatPrice(lineTotal)}</strong>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
        <aside className="order-summary glass glass-strong" aria-label="ملخص الطلب">
          <h2>ملخص الطلب</h2>
          {remaining > 0 ? (
            <div className="delivery-progress">
              <div className="delivery-progress-head">
                <span>التوصيل المجاني عند {formatPrice(FREE_DELIVERY_AT)}</span>
                <b>{formatPrice(remaining)} متبقية</b>
              </div>
              <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="التقدم نحو التوصيل المجاني">
                <i style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="delivery-free glass-dark"><Truck size={16} /><span>حصلتِ على توصيل مجاني لهذا الطلب</span></div>
          )}
          <div className="glass-divider" />
          <div className="summary-line">
            <span>المجموع الفرعي</span>
            <strong>{formatPrice(totals.subtotal)}</strong>
          </div>
          <div className="summary-line">
            <span>التوصيل <small>(تقديري)</small></span>
            <strong>{totals.deliveryFee ? formatPrice(totals.deliveryFee) : 'مجاناً'}</strong>
          </div>
          <div className="summary-total">
            <span>الإجمالي</span>
            <strong>{formatPrice(totals.total)}</strong>
          </div>
          <Link href="/checkout" className="button button-primary summary-button">إتمام الطلب <ArrowLeft size={16} /></Link>
          <p className="summary-note">يُحتسب التوصيل حسب المحافظة، ويمكنك مراجعة كل التفاصيل قبل التأكيد النهائي.</p>
          <div className="summary-trust"><ShieldCheck size={16} /><span>السلة محفوظة على هذا الجهاز</span></div>
        </aside>
      </div>
    </main>
  )
}
