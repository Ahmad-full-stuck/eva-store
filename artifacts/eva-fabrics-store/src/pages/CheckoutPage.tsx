import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, CircleAlert, LoaderCircle, MapPin, MessageCircle, Phone, RefreshCw, UserRound } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import type { CartItem, CheckoutForm, OrderPayload } from '@/types'
import { formatMeters, formatPrice, getCartTotals, getOrderNumber } from '@/lib/catalog'
import { apiUrl, siteConfig } from '@/lib/site'
import { governorates } from '@/lib/fallback-data'

interface CheckoutPageProps {
  cart: CartItem[]
  onComplete: (orderNumber: string) => void
}

const initialForm: CheckoutForm = { name: '', phone: '', email: '', governorate: '', district: '', address: '', notes: '' }

type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>

type OrderChannel = 'api' | 'whatsapp'

interface StoredOrderItem {
  productName: string
  colorName: string
  meters: number
  unitPrice: number
  total: number
}

interface StoredOrder {
  orderNumber: string
  createdAt: string
  items: StoredOrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  status: 'received' | 'whatsapp-pending'
  customerName: string
  phone: string
  governorate: string
  address: string
}

const ORDERS_KEY = 'eva-orders'

const stepFields: Record<number, (keyof CheckoutForm)[]> = {
  1: ['name', 'phone', 'email'],
  2: ['governorate', 'district', 'address'],
}

const validPhone = (value: string): boolean => /^(?:07\d{9}|009647\d{9}|9647\d{9}|\+9647\d{9})$/.test(value.replace(/[\s()-]/g, ''))

const padNumber = (value: number): string => String(value).padStart(2, '0')

const createLocalOrderNumber = (): string => {
  const now = new Date()
  const stamp = `${String(now.getFullYear()).slice(-2)}${padNumber(now.getMonth() + 1)}${padNumber(now.getDate())}`
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `EVA-${stamp}-${suffix}`
}

const glassStyles = `
.glass-scope { --glass-fill: rgba(255, 252, 248, .58); --glass-strong: rgba(255, 251, 247, .88); --glass-line: rgba(255, 255, 255, .72); --glass-shadow: 0 22px 48px rgba(70, 45, 35, .1); }
.glass-scope .glass { position: relative; background: var(--glass-fill); border: 1px solid var(--glass-line); box-shadow: var(--glass-shadow); backdrop-filter: blur(18px) saturate(150%); -webkit-backdrop-filter: blur(18px) saturate(150%); }
.glass-scope .glass-card { border-radius: 16px; }
.glass-scope .glass-strong { background: var(--glass-strong); border-color: rgba(255, 255, 255, .92); }
.glass-scope .glass-dark { color: #fff8f1; background: rgba(48, 38, 42, .9); border: 1px solid rgba(255, 248, 241, .18); box-shadow: 0 16px 34px rgba(48, 38, 42, .22); }
.glass-scope .glass-pill { border-radius: 999px; }
.glass-scope .glass-input, .glass-scope .field-input, .glass-scope .field textarea { background: rgba(255, 255, 255, .7); border-color: rgba(255, 255, 255, .9); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.glass-scope .glass-divider { height: 1px; margin: 16px 0; background: linear-gradient(90deg, rgba(183, 44, 111, 0), rgba(183, 44, 111, .35), rgba(183, 44, 111, 0)); border: 0; }
.glass-scope .chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; color: var(--eva-muted); background: rgba(255, 255, 255, .72); border: 1px solid rgba(255, 255, 255, .9); border-radius: 999px; font-size: 10px; line-height: 1.7; }
.glass-scope .chip i { width: 11px; height: 11px; border: 1px solid rgba(45, 34, 34, .2); border-radius: 50%; }
.glass-scope .steps-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; max-width: 760px; margin: 0 auto 30px; padding: 0; list-style: none; }
.glass-scope .step-card { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 12px 14px; color: var(--eva-muted); border-radius: 14px; }
.glass-scope .step-card > button { display: flex; align-items: center; gap: 10px; width: 100%; min-width: 0; padding: 0; color: inherit; background: transparent; border: 0; font: inherit; text-align: right; cursor: pointer; }
.glass-scope .step-index { width: 30px; height: 30px; flex: 0 0 30px; display: grid; place-items: center; color: var(--eva-ink); border: 1px solid var(--eva-line-strong); border-radius: 50%; font-size: 12px; font-weight: 600; }
.glass-scope .step-copy { display: grid; min-width: 0; gap: 1px; }
.glass-scope .step-copy strong { color: var(--eva-ink); font-size: 12px; }
.glass-scope .step-copy small { overflow: hidden; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.glass-scope .step-card.is-done { color: var(--eva-rose); }
.glass-scope .step-card.is-done .step-index, .glass-scope .step-card.is-current .step-index { color: #fff; background: var(--eva-rose); border-color: var(--eva-rose); }
.glass-scope .step-card.is-current { border-color: rgba(183, 44, 111, .45); box-shadow: 0 0 0 3px rgba(183, 44, 111, .1), var(--glass-shadow); }
.glass-scope .step-card.is-current .step-copy strong { color: var(--eva-rose); }
.glass-scope .review-block { background: rgba(255, 255, 255, .62); border-color: rgba(255, 255, 255, .88); }
.glass-scope .whatsapp-panel { display: grid; gap: 13px; margin-top: 20px; padding: 18px; border-radius: 16px; }
.glass-scope .whatsapp-panel h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; }
.glass-scope .whatsapp-panel p { color: var(--eva-muted); font-size: 11px; line-height: 1.9; }
.glass-scope .whatsapp-panel p strong { color: var(--eva-rose); }
.glass-scope .whatsapp-actions { display: grid; gap: 10px; }
.glass-scope .button-whatsapp { color: #fff; background: var(--eva-green); box-shadow: 0 8px 18px rgba(73, 118, 91, .25); }
.glass-scope .button-whatsapp:hover { background: #3c6350; box-shadow: 0 11px 24px rgba(73, 118, 91, .32); }
.glass-scope .server-error { background: rgba(249, 236, 231, .88); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.glass-scope .checkout-secure.glass-dark { margin-top: 18px; padding: 12px 14px; color: #c9ecda; background: rgba(48, 38, 42, .9); border: 1px solid rgba(255, 248, 241, .18); border-radius: 12px; }
.glass-scope .empty-card { display: grid; justify-items: center; max-width: 470px; padding: 44px 32px; border-radius: 20px; text-align: center; }
.glass-scope .empty-card p { max-width: 330px; margin-top: 7px; color: var(--eva-muted); font-size: 13px; }
.glass-scope .empty-card .button { margin-top: 24px; }
.glass-scope a:focus-visible, .glass-scope button:focus-visible, .glass-scope input:focus-visible, .glass-scope select:focus-visible, .glass-scope textarea:focus-visible, .glass-scope [tabindex]:focus-visible { outline: 2px solid var(--eva-rose); outline-offset: 3px; }
@media (max-width: 820px) {
  .glass-scope .steps-grid { grid-template-columns: 1fr; gap: 9px; margin-bottom: 24px; }
}
@media (max-width: 560px) {
  .glass-scope .steps-grid { gap: 8px; }
  .glass-scope .step-card { padding: 11px 13px; }
  .glass-scope .whatsapp-actions { gap: 9px; }
  .glass-scope .empty-card { padding: 34px 18px; }
  .glass-scope .checkout-actions { flex-wrap: wrap; gap: 10px; }
  .glass-scope .checkout-item, .glass-scope .checkout-item div { min-width: 0; }
  .glass-scope .checkout-item strong, .glass-scope .checkout-item b { overflow-wrap: anywhere; }
  .glass-scope .review-item { flex-wrap: wrap; }
  .glass-scope .whatsapp-panel { padding: 15px; }
}
@media (max-width: 360px) {
  .glass-scope .step-copy small { white-space: normal; }
  .glass-scope .checkout-actions .button { width: 100%; }
}
@media (min-width: 1600px) {
  .glass-scope.container-eva { width: min(1320px, calc(100% - 96px)); }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .glass-scope *, .glass-scope *::before, .glass-scope *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`

export function CheckoutPage({ cart, onComplete }: CheckoutPageProps) {
  const [location] = useLocation()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<CheckoutForm>(initialForm)
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [submitState, setSubmitState] = useState<'idle' | 'loading'>('idle')
  const [serverError, setServerError] = useState('')
  const [channel, setChannel] = useState<OrderChannel>('api')
  const [whatsappLink, setWhatsappLink] = useState('')
  const [whatsappOrderNumber, setWhatsappOrderNumber] = useState('')
  const [liveMessage, setLiveMessage] = useState('')
  const totals = getCartTotals(cart)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const whatsappRef = useRef<HTMLHeadingElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!started.current) {
      started.current = true
      return undefined
    }
    headingRef.current?.focus()
    return undefined
  }, [step])

  useEffect(() => {
    if (channel !== 'whatsapp') return undefined
    whatsappRef.current?.focus()
    return undefined
  }, [channel])

  if (cart.length === 0) {
    return (
      <main className="container-eva empty-state page-empty glass-scope">
        <style>{glassStyles}</style>
        <div className="glass glass-card empty-card">
          <div className="empty-icon"><Check size={25} /></div>
          <h1>لا توجد عناصر لإتمام الطلب</h1>
          <p>أضيفي قماشاً إلى السلة أولاً، ثم عدي إلى هذه الخطوة.</p>
          <Link href="/catalog" className="button button-primary">العودة إلى الكتالوج <ArrowLeft size={16} /></Link>
        </div>
      </main>
    )
  }

  const update = (key: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const applyValidation = (currentStep: number): boolean => {
    const nextErrors: CheckoutErrors = {}
    if (currentStep === 1) {
      if (form.name.trim().length < 3) nextErrors.name = 'اكتبي الاسم الكامل (3 أحرف على الأقل)'
      if (!validPhone(form.phone)) nextErrors.phone = 'أدخلي رقم هاتف عراقي صحيحاً يبدأ بـ 07 أو +964'
      if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'البريد الإلكتروني غير صحيح'
    }
    if (currentStep === 2) {
      if (!governorates.includes(form.governorate)) nextErrors.governorate = 'اختاري المحافظة من القائمة'
      if (form.district.trim().length < 2) nextErrors.district = 'أدخلي المنطقة أو القضاء'
      if (form.address.trim().length < 5) nextErrors.address = 'أدخلي عنواناً من 5 أحرف على الأقل'
    }
    setErrors(nextErrors)
    const invalidKeys = Object.keys(nextErrors) as (keyof CheckoutForm)[]
    if (invalidKeys.length === 0) {
      setLiveMessage('')
      return true
    }
    const details = invalidKeys.map((key) => nextErrors[key]).filter((value): value is string => Boolean(value))
    setLiveMessage(`يرجى تصحيح الحقول: ${details.join('، ')}`)
    const target = (stepFields[currentStep] || []).find((key) => invalidKeys.includes(key))
    if (target) window.setTimeout(() => document.getElementById(target)?.focus(), 60)
    return false
  }

  const next = () => {
    if (!applyValidation(step)) return
    setStep((current) => Math.min(3, current + 1))
  }

  const buildPayload = (): OrderPayload => ({
    customerName: form.name.trim(),
    phone: form.phone.replace(/[\s()-]/g, ''),
    email: form.email.trim() || undefined,
    governorate: form.governorate,
    district: form.district.trim(),
    address: form.address.trim(),
    notes: form.notes.trim() || undefined,
    items: cart.map((item) => ({ productId: item.product.id, productSlug: item.product.slug, productName: item.product.name, colorId: item.color.id, color: item.color.hex, colorName: item.color.name, quantity: item.length, unitPrice: item.product.price, totalPrice: item.product.price * item.length })),
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
  })

  const buildWhatsAppMessage = (payload: OrderPayload, orderNumber: string): string => {
    const lines = [
      `طلب جديد من ${siteConfig.name}`,
      `رقم الطلب: ${orderNumber}`,
      `الاسم: ${payload.customerName}`,
      `الهاتف: ${payload.phone}`,
      `المحافظة: ${payload.governorate} - ${payload.district}`,
      `العنوان: ${payload.address}`,
    ]
    if (payload.email) lines.push(`البريد الإلكتروني: ${payload.email}`)
    if (payload.notes) lines.push(`ملاحظات: ${payload.notes}`)
    lines.push('تفاصيل الطلب:')
    payload.items.forEach((item, index) => {
      lines.push(`${(index + 1).toLocaleString('ar-IQ')}. ${item.productName} - ${item.colorName} - ${formatMeters(item.quantity)} × ${formatPrice(item.unitPrice)} = ${formatPrice(item.totalPrice)}`)
    })
    lines.push(`المجموع الفرعي: ${formatPrice(payload.subtotal)}`)
    lines.push(`التوصيل: ${payload.deliveryFee ? formatPrice(payload.deliveryFee) : 'مجاني'}`)
    lines.push(`الإجمالي: ${formatPrice(payload.total)}`)
    lines.push('أرجو تأكيد الطلب وتحديد موعد التوصيل.')
    return lines.join('\n')
  }

  const saveLocalOrder = (orderNumber: string, status: StoredOrder['status'], payload: OrderPayload): void => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(ORDERS_KEY)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      const existing: Record<string, unknown>[] = Array.isArray(parsed)
        ? parsed.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
        : []
      const record: StoredOrder = {
        orderNumber,
        createdAt: new Date().toISOString(),
        items: payload.items.map((item) => ({ productName: item.productName, colorName: item.colorName, meters: item.quantity, unitPrice: item.unitPrice, total: item.totalPrice })),
        subtotal: payload.subtotal,
        deliveryFee: payload.deliveryFee,
        total: payload.total,
        status,
        customerName: payload.customerName,
        phone: payload.phone,
        governorate: payload.governorate,
        address: [payload.governorate, payload.district, payload.address].filter(Boolean).join(' - '),
      }
      const next: unknown[] = [record, ...existing.filter((item) => typeof item.orderNumber === 'string' && item.orderNumber !== orderNumber)].slice(0, 200)
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(next))
    } catch {
      return
    }
  }

  const switchToWhatsApp = (payload: OrderPayload, reason: string): void => {
    const orderNumber = createLocalOrderNumber()
    setWhatsappOrderNumber(orderNumber)
    setWhatsappLink(siteConfig.whatsappUrl(buildWhatsAppMessage(payload, orderNumber)))
    setChannel('whatsapp')
    setServerError(`تعذر إرسال الطلب تلقائياً: ${reason}. لم يُسجَّل الطلب في المتجر بعد.`)
    setSubmitState('idle')
    setLiveMessage('تعذر إرسال الطلب تلقائياً. يمكنك إتمام الطلب عبر واتساب وسيؤكد الفريق الطلب يدوياً.')
  }

  const submitOrder = async (event?: FormEvent): Promise<void> => {
    if (event) event.preventDefault()
    if (!applyValidation(1)) {
      setStep(1)
      return
    }
    if (!applyValidation(2)) {
      setStep(2)
      return
    }
    const payload = buildPayload()
    setSubmitState('loading')
    setServerError('')
    setChannel('api')
    setLiveMessage('جارٍ إرسال الطلب إلى المتجر...')
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 9000)
    try {
      const response = await fetch(apiUrl('/api/orders'), { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...payload, shippingAddress: { governorate: payload.governorate, district: payload.district, address: payload.address } }), signal: controller.signal })
      const body: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        switchToWhatsApp(payload, errorMessage(body, `الخادم أعاد الرد رقم ${response.status}`))
        return
      }
      const orderNumber = getOrderNumber(body)
      if (!orderNumber) {
        switchToWhatsApp(payload, 'استجابة الخادم ليست بيانات طلب صالحة، ربما صفحة HTML')
        return
      }
      saveLocalOrder(orderNumber, 'received', payload)
      onComplete(orderNumber)
    } catch (error) {
      const reason = error instanceof Error && error.name === 'AbortError'
        ? 'انتهت مهلة الاتصال بالخادم'
        : error instanceof Error
          ? error.message
          : 'تعذر الاتصال بالخادم'
      switchToWhatsApp(payload, reason)
    } finally {
      window.clearTimeout(timer)
    }
  }

  const confirmViaWhatsApp = (): void => {
    if (!whatsappOrderNumber) return
    saveLocalOrder(whatsappOrderNumber, 'whatsapp-pending', buildPayload())
    onComplete(whatsappOrderNumber)
  }

  return (
    <main className="container-eva checkout-page glass-scope">
      <style>{glassStyles}</style>
      <div className="breadcrumbs">
        <Link href="/cart">السلة</Link>
        <span>›</span>
        <span>إتمام الطلب</span>
      </div>
      <div className="checkout-top">
        <div>
          <span className="eyebrow">خطوات بسيطة وواضحة</span>
          <h1>إتمام الطلب</h1>
        </div>
        <Link href={`/cart${location.includes('?') ? location.slice(location.indexOf('?')) : ''}`} className="underlined-link"><ArrowRight size={15} />العودة للسلة</Link>
      </div>
      <CheckoutSteps step={step} onJump={setStep} />
      <div className="sr-only" role="status" aria-live="polite">{liveMessage}</div>
      <form className="checkout-layout" onSubmit={submitOrder} noValidate>
        <section className="checkout-form-card glass glass-card" aria-label="بيانات الطلب">
          <h2 tabIndex={-1} ref={headingRef}>{step === 1 ? 'بيانات التواصل' : step === 2 ? 'تفاصيل التوصيل' : 'مراجعة الطلب'}</h2>
          {step === 1 && <ContactFields form={form} errors={errors} update={update} />}
          {step === 2 && <DeliveryFields form={form} errors={errors} update={update} />}
          {step === 3 && <ReviewStep form={form} cart={cart} totals={totals} edit={() => setStep(1)} />}
          {channel === 'whatsapp' && step === 3 && (
            <div className="whatsapp-panel glass glass-strong" role="group" aria-labelledby="whatsapp-title">
              <h3 id="whatsapp-title" tabIndex={-1} ref={whatsappRef}><MessageCircle size={18} /> لم نتمكن من الإرسال التلقائي</h3>
              <div className="server-error" role="alert"><CircleAlert size={18} /><span>{serverError}</span></div>
              <p>هذه النسخة منشورة على GitHub Pages وتعمل بدون خادم مخصص للطلبات، لذلك أرسلي التفاصيل عبر واتساب. ستصلك رسالة جاهزة فيها كل بنود الطلب، والتأكيد يتم يدوياً من الفريق بعد مراجعته وموافقتك على موعد التوصيل.</p>
              <div className="whatsapp-actions">
                <a className="button button-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer" onClick={confirmViaWhatsApp}><MessageCircle size={16} />أكمل الطلب عبر واتساب</a>
                <button type="button" className="button button-outline" onClick={() => { setChannel('api'); void submitOrder() }}><RefreshCw size={15} />إعادة المحاولة عبر الخادم</button>
              </div>
              <p>رقم طلبك المحفوظ: <strong dir="ltr">{whatsappOrderNumber}</strong></p>
            </div>
          )}
          <div className="checkout-actions">
            {step > 1 ? <button type="button" className="button button-outline" onClick={() => setStep((current) => current - 1)}>السابق</button> : <span />}
            {step < 3 ? (
              <button type="button" className="button button-primary" onClick={next}>التالي <ArrowLeft size={16} /></button>
            ) : (
              <button type="submit" className="button button-primary" disabled={submitState === 'loading'}>
                {submitState === 'loading' ? <><LoaderCircle className="spin" size={17} />جارٍ إرسال الطلب</> : <>تأكيد الطلب <ArrowLeft size={16} /></>}
              </button>
            )}
          </div>
          {step === 3 && <p className="checkout-terms">بإرسال الطلب توافقين على <Link href="/policies#terms">شروط الاستخدام</Link> و<Link href="/policies#privacy">سياسة الخصوصية</Link>.</p>}
        </section>
        <aside className="checkout-summary glass glass-strong" aria-label="ملخص طلبك">
          <h2>ملخص طلبك</h2>
          <div className="checkout-items">
            {cart.map((item) => (
              <div className="checkout-item" key={`${item.product.slug}-${item.color.id}`}>
                <img src={item.product.image} alt="" />
                <div>
                  <strong>{item.product.name}</strong>
                  <span>{item.color.name} · {formatMeters(item.length)}</span>
                </div>
                <b>{formatPrice(item.product.price * item.length)}</b>
              </div>
            ))}
          </div>
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
          <div className="checkout-secure glass-dark"><Check size={15} />لن يُرسل الطلب قبل مراجعتك في الخطوة الأخيرة</div>
        </aside>
      </form>
    </main>
  )
}

function CheckoutSteps({ step, onJump }: { step: number; onJump: (value: number) => void }) {
  const steps = [
    { number: 1, label: 'التواصل', hint: 'الاسم والهاتف' },
    { number: 2, label: 'التوصيل', hint: 'المحافظة والعنوان' },
    { number: 3, label: 'المراجعة', hint: 'التأكد والإرسال' },
  ]
  return (
    <ol className="steps-grid" aria-label="مراحل إتمام الطلب">
      {steps.map(({ number, label, hint }) => {
        const content = (
          <>
            <span className="step-index">{step > number ? <Check size={14} aria-hidden="true" /> : number.toLocaleString('ar-IQ')}</span>
            <span className="step-copy">
              <strong>{label}</strong>
              <small>{hint}</small>
            </span>
          </>
        )
        const className = `step-card glass glass-card ${step > number ? 'is-done' : ''} ${step === number ? 'is-current' : ''}`
        if (number < step) {
          return (
            <li key={label} className={className}>
              <button type="button" onClick={() => onJump(number)} aria-label={`الرجوع إلى خطوة ${label}`}>{content}</button>
            </li>
          )
        }
        return (
          <li key={label} className={className} aria-current={step === number ? 'step' : undefined}>{content}</li>
        )
      })}
    </ol>
  )
}

function ContactFields({ form, errors, update }: { form: CheckoutForm; errors: CheckoutErrors; update: (key: keyof CheckoutForm, value: string) => void }) {
  return (
    <div className="form-fields">
      <Field label="الاسم الكامل" id="name" value={form.name} error={errors.name} onChange={(value) => update('name', value)} placeholder="مثال: سارة أحمد" autoComplete="name" icon={<UserRound size={17} />} />
      <Field label="رقم الهاتف" id="phone" value={form.phone} error={errors.phone} onChange={(value) => update('phone', value)} placeholder="07XXXXXXXXX" type="tel" autoComplete="tel" dir="ltr" icon={<Phone size={17} />} />
      <Field label="البريد الإلكتروني" id="email" value={form.email} error={errors.email} onChange={(value) => update('email', value)} placeholder="اختياري" type="email" autoComplete="email" dir="ltr" />
    </div>
  )
}

function DeliveryFields({ form, errors, update }: { form: CheckoutForm; errors: CheckoutErrors; update: (key: keyof CheckoutForm, value: string) => void }) {
  return (
    <div className="form-fields">
      <div className="field">
        <label htmlFor="governorate">المحافظة{errors.governorate && <span className="required-mark">*</span>}</label>
        <div className="field-input glass-input">
          <MapPin size={17} />
          <select id="governorate" value={form.governorate} onChange={(event) => update('governorate', event.target.value)} aria-invalid={Boolean(errors.governorate)} aria-describedby={errors.governorate ? 'governorate-error' : undefined}>
            <option value="">اختاري المحافظة</option>
            {governorates.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        {errors.governorate && <small className="field-error" id="governorate-error" aria-live="polite">{errors.governorate}</small>}
      </div>
      <Field label="المنطقة أو القضاء" id="district" value={form.district} error={errors.district} onChange={(value) => update('district', value)} placeholder="مثال: الكرادة" />
      <div className="field">
        <label htmlFor="address">العنوان بالتفصيل{errors.address && <span className="required-mark">*</span>}</label>
        <textarea className="glass-input" id="address" value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="المحلة، الشارع، رقم المنزل وأي علامة مميزة" rows={4} aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? 'address-error' : undefined} />
        {errors.address && <small className="field-error" id="address-error" aria-live="polite">{errors.address}</small>}
      </div>
      <div className="field">
        <label htmlFor="notes">ملاحظات للتوصيل <small>(اختياري)</small></label>
        <textarea className="glass-input" id="notes" value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="وقت مناسب للتوصيل أو تعليمات إضافية" rows={3} />
      </div>
    </div>
  )
}

function ReviewStep({ form, cart, totals, edit }: { form: CheckoutForm; cart: CartItem[]; totals: { subtotal: number; deliveryFee: number; total: number }; edit: () => void }) {
  return (
    <div className="review-step">
      <div className="review-block glass-card">
        <div>
          <strong>بيانات التوصيل</strong>
          <button type="button" onClick={edit}>تعديل</button>
        </div>
        <p>{form.name}</p>
        <p dir="ltr">{form.phone}</p>
        <p>{form.governorate}، {form.district}</p>
        <p>{form.address}</p>
        {form.notes && <p className="review-muted">ملاحظات: {form.notes}</p>}
      </div>
      <div className="review-block glass-card">
        <div>
          <strong>العناصر ({cart.length.toLocaleString('ar-IQ')})</strong>
          <button type="button" onClick={edit}>تعديل</button>
        </div>
        {cart.map((item) => (
          <div className="review-item" key={`${item.product.slug}-${item.color.id}`}>
            <span>{item.product.name} <span className="chip glass-pill">{item.color.name}</span></span>
            <b>{formatMeters(item.length)} · {formatPrice(item.product.price * item.length)}</b>
          </div>
        ))}
      </div>
      <div className="review-block glass-card">
        <div>
          <strong>الإجمالي</strong>
        </div>
        <div className="summary-line"><span>المجموع الفرعي</span><strong>{formatPrice(totals.subtotal)}</strong></div>
        <div className="summary-line"><span>التوصيل</span><strong>{totals.deliveryFee ? formatPrice(totals.deliveryFee) : 'مجاناً'}</strong></div>
        <div className="summary-total"><span>الإجمالي</span><strong>{formatPrice(totals.total)}</strong></div>
      </div>
    </div>
  )
}

function Field({ label, id, value, error, onChange, placeholder, type = 'text', autoComplete, dir, icon }: { label: string; id: string; value: string; error?: string; onChange: (value: string) => void; placeholder: string; type?: string; autoComplete?: string; dir?: 'ltr' | 'rtl'; icon?: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}{error && <span className="required-mark">*</span>}</label>
      <div className="field-input glass-input">
        {icon}
        <input id={id} type={type} dir={dir} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
      </div>
      {error && <small className="field-error" id={`${id}-error`} aria-live="polite">{error}</small>}
    </div>
  )
}

function errorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    for (const key of ['message', 'error', 'detail']) {
      const value = record[key]
      if (typeof value === 'string' && value) return value
    }
  }
  return fallback
}
