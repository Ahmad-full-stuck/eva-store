import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, CircleAlert, LoaderCircle, MapPin, MessageCircle, Navigation, Phone, RefreshCw, ShieldCheck, UserRound } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import type { CartItem, CheckoutForm, CustomerProfile, OrderPayload } from '@/types'
import { formatMeters, formatPrice, getCartTotals, getOrderNumber } from '@/lib/catalog'
import { apiUrl, siteConfig } from '@/lib/site'
import { governorates } from '@/lib/fallback-data'
import { useSiteContent } from '@/lib/site-content'
import { sendOrderEmail } from '@/lib/email'
import { SmartImage } from '@/components/ui/SmartImage'

interface CheckoutPageProps {
  cart: CartItem[]
  onComplete: (orderNumber: string) => void
}

const initialForm: CheckoutForm = { name: '', phone: '', email: '', governorate: '', district: '', address: '', landmark: '', notes: '' }

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
const PROFILE_KEY = 'eva-customer'

const fieldOrder: (keyof CheckoutForm)[] = ['name', 'phone', 'governorate', 'district', 'address', 'landmark', 'email', 'notes']

const validPhone = (value: string): boolean => /^(?:07\d{9}|009647\d{9}|9647\d{9}|\+9647\d{9})$/.test(value.replace(/[\s()-]/g, ''))

const padNumber = (value: number): string => String(value).padStart(2, '0')

const createLocalOrderNumber = (): string => {
  const now = new Date()
  const stamp = `${String(now.getFullYear()).slice(-2)}${padNumber(now.getMonth() + 1)}${padNumber(now.getDate())}`
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `EVA-${stamp}-${suffix}`
}

const glassStyles = `
.glass-scope { --glass-fill: rgba(255, 252, 250, .6); --glass-strong: rgba(255, 251, 250, .9); --glass-line: rgba(255, 255, 255, .74); --glass-shadow: 0 22px 48px rgba(74, 24, 43, .1); }
.glass-scope .glass { position: relative; background: var(--glass-fill); border: 1px solid var(--glass-line); box-shadow: var(--glass-shadow); backdrop-filter: blur(18px) saturate(150%); -webkit-backdrop-filter: blur(18px) saturate(150%); }
.glass-scope .glass-card { border-radius: 16px; }
.glass-scope .glass-strong { background: var(--glass-strong); border-color: rgba(255, 255, 255, .92); }
.glass-scope .glass.checkout-summary, .glass-scope .glass.order-summary { position: sticky; top: 120px; }
.glass-scope .glass-dark { color: #fff6f8; background: rgba(46, 24, 33, .92); border: 1px solid rgba(255, 246, 248, .18); box-shadow: 0 16px 34px rgba(46, 24, 33, .24); }
.glass-scope .glass-pill { border-radius: 999px; }
.glass-scope .glass-input, .glass-scope .field-input, .glass-scope .field textarea { background: rgba(255, 255, 255, .74); border-color: rgba(255, 255, 255, .92); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.glass-scope .glass-divider { height: 1px; margin: 16px 0; background: linear-gradient(90deg, rgba(122, 30, 60, 0), rgba(122, 30, 60, .32), rgba(122, 30, 60, 0)); border: 0; }
.glass-scope .chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; color: var(--eva-muted); background: rgba(255, 255, 255, .78); border: 1px solid rgba(255, 255, 255, .92); border-radius: 999px; font-size: 11.5px; line-height: 1.7; }
.glass-scope .chip i { width: 11px; height: 11px; border: 1px solid rgba(43, 33, 36, .2); border-radius: 50%; }
.glass-scope .review-block { background: rgba(255, 255, 255, .62); border-color: rgba(255, 255, 255, .88); }
.glass-scope .whatsapp-panel { display: grid; gap: 13px; margin-top: 20px; padding: 18px; border-radius: 16px; }
.glass-scope .whatsapp-panel h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; }
.glass-scope .whatsapp-panel p { color: var(--eva-muted); font-size: 12.5px; line-height: 1.9; }
.glass-scope .whatsapp-panel p strong { color: var(--eva-rose); }
.glass-scope .whatsapp-actions { display: grid; gap: 10px; }
.glass-scope .button-whatsapp { color: #fff; background: var(--eva-green); box-shadow: 0 8px 18px rgba(73, 118, 91, .25); }
.glass-scope .button-whatsapp:hover { background: #3c6350; box-shadow: 0 11px 24px rgba(73, 118, 91, .32); }
.glass-scope .server-error { background: rgba(249, 236, 231, .88); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.glass-scope .order-notice { display: flex; gap: 8px; align-items: flex-start; padding: 11px 13px; border-radius: 12px; background: rgba(228, 245, 235, .92); border: 1px solid rgba(60, 130, 90, .32); color: #155e38; font-size: 13px; line-height: 1.75; }
.glass-scope .order-notice svg { flex: 0 0 auto; margin-top: 3px; }
.glass-scope .checkout-secure.glass-dark { margin-top: 18px; padding: 12px 14px; color: #c9ecda; background: rgba(46, 24, 33, .9); border: 1px solid rgba(255, 246, 248, .18); border-radius: 12px; }
.glass-scope .empty-card { display: grid; justify-items: center; max-width: 470px; padding: 44px 32px; border-radius: 20px; text-align: center; }
.glass-scope .empty-card p { max-width: 330px; margin-top: 7px; color: var(--eva-muted); font-size: 13.5px; line-height: 1.9; }
.glass-scope .empty-card .button { margin-top: 24px; }
.glass-scope a:focus-visible, .glass-scope button:focus-visible, .glass-scope input:focus-visible, .glass-scope select:focus-visible, .glass-scope textarea:focus-visible, .glass-scope [tabindex]:focus-visible { outline: 2px solid var(--eva-rose); outline-offset: 3px; }

.glass-scope .order-trust { display: flex; flex-wrap: wrap; gap: 9px; margin: 0 0 22px; padding: 0; list-style: none; }
.glass-scope .order-trust li { display: inline-flex; align-items: center; gap: 7px; padding: 8px 13px; color: var(--eva-ink); background: rgba(255, 255, 255, .72); border: 1px solid rgba(255, 255, 255, .9); border-radius: 999px; font-size: 12.5px; }
.glass-scope .order-trust svg { color: var(--eva-rose); }

.glass-scope .order-box { padding: 30px; }
.glass-scope .order-box-head { display: flex; align-items: flex-start; gap: 13px; margin-bottom: 24px; }
.glass-scope .order-box-icon { display: grid; place-items: center; width: 46px; height: 46px; flex: 0 0 46px; color: #fff; background: linear-gradient(140deg, var(--eva-rose), var(--eva-rose-dark)); border-radius: 14px; box-shadow: 0 10px 22px rgba(122, 30, 60, .28); }
.glass-scope .order-box-head h2 { margin: 0 0 4px; font-size: 21px; }
.glass-scope .order-box-head p { margin: 0; color: var(--eva-muted); font-size: 13.5px; line-height: 1.8; }

.glass-scope .order-box .form-fields { grid-template-columns: 1fr 1fr; gap: 17px 16px; }
.glass-scope .order-box .field-full { grid-column: 1 / -1; }
.glass-scope .order-box .field > label { font-size: 12.5px; }
.glass-scope .order-box .field label small { font-size: 11.5px; }
.glass-scope .order-box .field-input input, .glass-scope .order-box .field-input select { font-size: 15px; }
.glass-scope .order-box .field textarea { font-size: 15px; line-height: 1.9; }
.glass-scope .order-box .field-error { font-size: 12px; }
.glass-scope .order-box .field-hint { color: var(--eva-muted); font-size: 11.5px; line-height: 1.7; }

.glass-scope .order-total-strip { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 26px; padding: 16px 18px; background: linear-gradient(120deg, rgba(122, 30, 60, .07), rgba(122, 30, 60, .02)); border: 1px solid rgba(122, 30, 60, .14); border-radius: 18px; }
.glass-scope .order-total-strip > span { display: grid; gap: 2px; color: var(--eva-muted); font-size: 12.5px; }
.glass-scope .order-total-strip strong { color: var(--eva-rose); font-size: 24px; line-height: 1.3; }
.glass-scope .order-submit { width: 100%; min-height: 56px; margin-top: 14px; font-size: 16px; border-radius: 16px; box-shadow: 0 14px 30px rgba(122, 30, 60, .3); }
.glass-scope .order-submit:disabled { box-shadow: none; }
.glass-scope .consent-row {
  display: grid; grid-template-columns: 22px 1fr auto; align-items: start; gap: 9px;
  margin-top: 12px; padding: 11px 12px; background: rgba(255, 255, 255, .5);
  border: 1px solid rgba(255, 255, 255, .78); border-radius: 14px; cursor: pointer;
}
.glass-scope .consent-row:has(.consent-box:checked) { background: rgba(122, 30, 60, .06); border-color: rgba(122, 30, 60, .28); }
.glass-scope .consent-box {
  width: 20px; height: 20px; margin: 1px 0 0; accent-color: var(--eva-rose); cursor: pointer;
}
.glass-scope .consent-box:focus-visible { outline: 2px solid var(--eva-rose); outline-offset: 2px; }
.glass-scope .consent-title { display: block; color: var(--eva-ink); font-size: 12.5px; font-weight: 600; line-height: 1.6; }
.glass-scope .consent-row small { display: block; margin-top: 2px; color: var(--eva-muted); font-size: 11.5px; line-height: 1.65; }
.glass-scope .consent-links { display: flex; flex-direction: column; gap: 2px; }
.glass-scope .consent-links a { color: var(--eva-rose); font-size: 11.5px; font-weight: 600; text-decoration: underline; }
.glass-scope .consent-row .field-error { grid-column: 1 / -1; }
.glass-scope .order-terms a { color: var(--eva-rose); font-weight: 600; }
.glass-scope .checkout-item, .glass-scope .checkout-item div { min-width: 0; }
.glass-scope .checkout-item strong, .glass-scope .checkout-item b { overflow-wrap: anywhere; }
.glass-scope .checkout-items { display: grid; gap: 14px; max-height: 320px; overflow-y: auto; }
.glass-scope .checkout-item { display: grid; grid-template-columns: 58px 1fr auto; align-items: center; gap: 12px; }
.glass-scope .checkout-item img { width: 58px; height: 58px; object-fit: cover; border-radius: 12px; }
.glass-scope .checkout-item div { display: grid; gap: 3px; }
.glass-scope .checkout-item span { color: var(--eva-muted); font-size: 12px; }
.glass-scope .summary-line { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 11px; font-size: 13.5px; }
.glass-scope .summary-total { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 16px; padding-top: 15px; border-top: 1px solid rgba(122, 30, 60, .16); font-size: 15px; }
.glass-scope .summary-total strong { color: var(--eva-rose); font-size: 22px; }

@media (max-width: 820px) {
  .glass-scope .glass.checkout-summary, .glass-scope .glass.order-summary { position: static; top: auto; }
  .glass-scope .order-box { padding: 22px 18px; }
  .glass-scope .order-box .form-fields { grid-template-columns: 1fr; gap: 15px; }
  .glass-scope .order-box-head h2 { font-size: 19px; }
  .glass-scope .order-box-head p { font-size: 13px; }
  .glass-scope .order-total-strip strong { font-size: 22px; }
  .glass-scope .order-submit { min-height: 54px; font-size: 15.5px; }
  .glass-scope .whatsapp-actions { gap: 9px; }
  .glass-scope .empty-card { padding: 34px 18px; }
  .glass-scope .checkout-item, .glass-scope .checkout-item div { min-width: 0; }
  .glass-scope .checkout-item strong, .glass-scope .checkout-item b { overflow-wrap: anywhere; }
  .glass-scope .whatsapp-panel { padding: 15px; }
}
@media (max-width: 360px) {
  .glass-scope .order-box { padding: 20px 14px; }
  .glass-scope .order-total-strip { padding: 14px; }
}
@media (min-width: 1600px) {
  .glass-scope.container-eva { width: min(1320px, calc(100% - 96px)); }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .glass-scope *, .glass-scope *::before, .glass-scope *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; animation-iteration-count: 1 !important; }
}
`

export function CheckoutPage({ cart, onComplete }: CheckoutPageProps) {
  const [location] = useLocation()
  const [form, setForm] = useState<CheckoutForm>(initialForm)
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState('')
  const [submitState, setSubmitState] = useState<'idle' | 'loading'>('idle')
  const [serverError, setServerError] = useState('')
  const [notice, setNotice] = useState('')
  const [channel, setChannel] = useState<OrderChannel>('api')
  const [whatsappLink, setWhatsappLink] = useState('')
  const [whatsappOrderNumber, setWhatsappOrderNumber] = useState('')
  const [liveMessage, setLiveMessage] = useState('')
  const totals = getCartTotals(cart)
  const siteContent = useSiteContent()
  const whatsappRef = useRef<HTMLHeadingElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const restored = useRef(false)

  useEffect(() => {
    if (restored.current || typeof window === 'undefined') return
    restored.current = true
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as Partial<CustomerProfile>
      setForm((current) => ({
        ...current,
        name: saved.name || current.name,
        phone: saved.phone || current.phone,
        governorate: saved.governorate || current.governorate,
        district: saved.district || current.district,
        address: saved.address || current.address,
        landmark: saved.landmark || current.landmark,
      }))
    } catch {
      return
    }
  }, [])

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
          <p>أضيفي قماشاً إلى السلة أولاً، ثم املئي مربع الطلب بخطوة واحدة.</p>
          <Link href="/catalog" className="button button-primary">العودة إلى الأقمشة <ArrowLeft size={16} /></Link>
        </div>
      </main>
    )
  }

  const update = (key: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const applyValidation = (): boolean => {
    const nextErrors: CheckoutErrors = {}
    if (form.name.trim().length < 3) nextErrors.name = 'اكتبي الاسم الكامل (3 أحرف على الأقل)'
    if (!validPhone(form.phone)) nextErrors.phone = 'أدخلي رقم هاتف عراقي صحيحاً يبدأ بـ 07 أو +964'
    if (!governorates.includes(form.governorate)) nextErrors.governorate = 'اختاري المحافظة من القائمة'
    if (form.district.trim().length < 2) nextErrors.district = 'أدخلي المنطقة أو القضاء'
    if (form.address.trim().length < 5) nextErrors.address = 'أدخلي العنوان: المحلة والشارع ورقم المنزل'
    if (form.landmark.trim().length < 3) nextErrors.landmark = 'أدخلي أقرب نقطة دالة تساعدنا في الوصول'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'البريد الإلكتروني غير صحيح'
    setErrors(nextErrors)
    if (!consent) {
      setConsentError('شدّي الموافقة على شروط الاستخدام وسياسة الخصوصية لتأكيد الطلب')
      const box = document.getElementById('consent')
      box?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      window.setTimeout(() => box?.focus(), 260)
      return false
    }
    setConsentError('')
    const invalidKeys = Object.keys(nextErrors) as (keyof CheckoutForm)[]
    if (invalidKeys.length === 0) {
      setLiveMessage('')
      return true
    }
    const details = invalidKeys.map((key) => nextErrors[key]).filter((value): value is string => Boolean(value))
    setLiveMessage(`يرجى إكمال الحقول: ${details.join('، ')}`)
    const target = fieldOrder.find((key) => invalidKeys.includes(key))
    if (target) {
      const element = document.getElementById(target)
      element?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      window.setTimeout(() => element?.focus(), 260)
    }
    return false
  }

  const buildPayload = (): OrderPayload => ({
    customerName: form.name.trim(),
    phone: form.phone.replace(/[\s()-]/g, ''),
    email: form.email.trim() || undefined,
    governorate: form.governorate,
    district: form.district.trim(),
    address: form.address.trim(),
    landmark: form.landmark.trim(),
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
    if (payload.landmark) lines.push(`أقرب نقطة دالة: ${payload.landmark}`)
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

  const saveProfile = (): void => {
    if (typeof window === 'undefined') return
    const profile: CustomerProfile = {
      name: form.name.trim(),
      phone: form.phone.replace(/[\s()-]/g, ''),
      governorate: form.governorate,
      district: form.district.trim(),
      address: form.address.trim(),
      landmark: form.landmark.trim(),
    }
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    } catch {
      return
    }
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
        address: [payload.governorate, payload.district, payload.address, payload.landmark].filter(Boolean).join(' - '),
      }
      const next: unknown[] = [record, ...existing.filter((item) => typeof item.orderNumber === 'string' && item.orderNumber !== orderNumber)].slice(0, 200)
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(next))
    } catch {
      return
    }
  }

  const notifyByEmail = (payload: OrderPayload, orderNumber: string): void => {
    const to = siteContent.emailOrdersTo.trim()
    if (!to) return
    const subject = (siteContent.emailSubjectOrder || 'طلب جديد #{orderNumber}').replace('#{orderNumber}', `#${orderNumber}`).replace('{orderNumber}', orderNumber)
    void sendOrderEmail(
      {
        orderNumber,
        customerName: payload.customerName,
        phone: payload.phone,
        email: payload.email,
        governorate: payload.governorate,
        district: payload.district,
        address: payload.address,
        landmark: payload.landmark || undefined,
        notes: payload.notes,
        items: payload.items.map((item) => ({
          productName: item.productName,
          colorName: item.colorName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        subtotal: payload.subtotal,
        deliveryFee: payload.deliveryFee,
        total: payload.total,
        createdAt: new Date().toISOString(),
      },
      {
        to,
        fromName: siteContent.emailFromName.trim() || undefined,
        from: siteContent.emailFrom.trim() || undefined,
        subject,
        template: siteContent.emailTemplateOrder.trim() || undefined,
        provider: siteContent.emailProvider,
        formSubmitAction: siteContent.emailFormSubmitAction.trim() || `https://formsubmit.co/${encodeURIComponent(to)}`,
      },
    ).catch(() => undefined)
  }

  const switchToWhatsApp = (payload: OrderPayload, reason: string): void => {
    const orderNumber = createLocalOrderNumber()
    notifyByEmail(payload, orderNumber)
    setWhatsappOrderNumber(orderNumber)
    setWhatsappLink(siteConfig.whatsappUrl(buildWhatsAppMessage(payload, orderNumber)))
    setChannel('whatsapp')
    setServerError(`تعذر إرسال الطلب تلقائياً: ${reason}. لم يُسجَّل الطلب في المتجر بعد.`)
    setNotice('')
    setSubmitState('idle')
    setLiveMessage('تعذر إرسال الطلب تلقائياً. يمكنك إتمام الطلب عبر واتساب وسيؤكد الفريق الطلب يدوياً.')
  }

  // النسخة المنشورة بدون خادم خاص (GitHub Pages): لا يوجد /api/orders أصلاً،
  // لذلك يُسجَّل الطلب محلياً ويُرسل بالبريد إلى المتجر مباشرةً بلا رسائل خطأ.
  const completeStaticOrder = (payload: OrderPayload): void => {
    const orderNumber = createLocalOrderNumber()
    saveLocalOrder(orderNumber, 'received', payload)
    notifyByEmail(payload, orderNumber)
    setWhatsappOrderNumber(orderNumber)
    setWhatsappLink(siteConfig.whatsappUrl(buildWhatsAppMessage(payload, orderNumber)))
    setChannel('whatsapp')
    setServerError('')
    setNotice('تم تسجيل طلبك وإرسال تفاصيله إلى فريق المتجر. للتأكيد الفوري أكملي عبر واتساب — الرسالة جاهزة بكل بنود الطلب، وسنؤكد لك بعد المراجعة.')
    setSubmitState('idle')
    setLiveMessage('تم استلام طلبك بنجاح. يمكنك تأكيده عبر واتساب الآن.')
  }

  const submitOrder = async (event?: FormEvent): Promise<void> => {
    if (event) event.preventDefault()
    if (!applyValidation()) {
      boxRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
      return
    }
    const payload = buildPayload()
    saveProfile()
    setSubmitState('loading')
    setServerError('')
    setNotice('')
    setChannel('api')
    setLiveMessage('جارٍ إرسال الطلب إلى المتجر...')
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), 9000)
    try {
      const response = await fetch(apiUrl('/api/orders'), { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...payload, shippingAddress: { governorate: payload.governorate, district: payload.district, address: payload.address, landmark: payload.landmark } }), signal: controller.signal })
      const body: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        if (response.status === 404 || response.status === 405 || response.status === 501) {
          completeStaticOrder(payload)
        } else {
          switchToWhatsApp(payload, errorMessage(body, `الخادم أعاد الرد رقم ${response.status}`))
        }
        return
      }
      const orderNumber = getOrderNumber(body)
      if (!orderNumber) {
        switchToWhatsApp(payload, 'استجابة الخادم ليست بيانات طلب صالحة، ربما صفحة HTML')
        return
      }
      saveLocalOrder(orderNumber, 'received', payload)
      notifyByEmail(payload, orderNumber)
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
          <span className="eyebrow">مربع واحد فقط</span>
          <h1>أكمل طلبك</h1>
        </div>
        <Link href={`/cart${location.includes('?') ? location.slice(location.indexOf('?')) : ''}`} className="underlined-link"><ArrowRight size={15} />العودة للسلة</Link>
      </div>
      <ul className="order-trust">
        <li><Check size={15} />بدون تسجيل أو كلمة مرور</li>
        <li><ShieldCheck size={15} />الدفع عند الاستلام</li>
        <li><MessageCircle size={15} />تأكيد الطلب عبر واتساب</li>
      </ul>
      <div className="sr-only" role="status" aria-live="polite">{liveMessage}</div>
      <form className="checkout-layout" onSubmit={submitOrder} noValidate>
        <div className="checkout-form-card order-box glass glass-card" ref={boxRef}>
          <div className="order-box-head">
            <span className="order-box-icon"><MapPin size={22} /></span>
            <div>
              <h2>معلومات التوصيل</h2>
              <p>اسمك، عنوانك وأقرب نقطة دالة — كل ما نحتاجه في مربع واحد، ثم زر تأكيد واحد.</p>
            </div>
          </div>
          <div className="form-fields">
            <Field label="الاسم الكامل" id="name" value={form.name} error={errors.name} onChange={(value) => update('name', value)} placeholder="مثال: سارة أحمد" autoComplete="name" icon={<UserRound size={17} />} />
            <Field label="رقم الهاتف" id="phone" value={form.phone} error={errors.phone} onChange={(value) => update('phone', value)} placeholder="07XX XXX XXXX" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" icon={<Phone size={17} />} />
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
            <Field label="المنطقة أو القضاء" id="district" value={form.district} error={errors.district} onChange={(value) => update('district', value)} placeholder="مثال: الكرادة داخل" icon={<MapPin size={17} />} />
            <div className="field field-full">
              <label htmlFor="address">العنوان بالتفصيل{errors.address && <span className="required-mark">*</span>}</label>
              <textarea className="glass-input" id="address" value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="المحلة، الشارع، رقم المنزل والدور" rows={3} aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? 'address-error' : undefined} />
              {errors.address && <small className="field-error" id="address-error" aria-live="polite">{errors.address}</small>}
            </div>
            <div className="field field-full">
              <label htmlFor="landmark">أقرب نقطة دالة{errors.landmark && <span className="required-mark">*</span>}</label>
              <div className="field-input glass-input">
                <Navigation size={17} />
                <input id="landmark" type="text" value={form.landmark} onChange={(event) => update('landmark', event.target.value)} placeholder="مثال: جامع النور، صيدلية الشفاء، جسر المعلّق" aria-invalid={Boolean(errors.landmark)} aria-describedby={errors.landmark ? 'landmark-error' : 'landmark-hint'} />
              </div>
              {errors.landmark
                ? <small className="field-error" id="landmark-error" aria-live="polite">{errors.landmark}</small>
                : <small className="field-hint" id="landmark-hint">علامة قريبة تكفي للوصول أسرع عند التوصيل.</small>}
            </div>
            <div className="field field-full">
              <label htmlFor="notes">ملاحظات للتوصيل <small>(اختياري)</small></label>
              <textarea className="glass-input" id="notes" value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="وقت مناسب للتوصيل أو تعليمات إضافية" rows={2} />
            </div>
            <div className="field field-full">
              <label htmlFor="email">البريد الإلكتروني <small>(اختياري)</small></label>
              <div className="field-input glass-input">
                <input id="email" type="email" dir="ltr" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="name@example.com" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
              </div>
              {errors.email && <small className="field-error" id="email-error" aria-live="polite">{errors.email}</small>}
            </div>
          </div>
          {channel === 'whatsapp' && (
            <div className="whatsapp-panel glass glass-strong" role="group" aria-labelledby="whatsapp-title">
              <h3 id="whatsapp-title" tabIndex={-1} ref={whatsappRef}>
                {serverError ? <><MessageCircle size={18} /> لم نتمكن من الإرسال التلقائي</> : <><Check size={18} /> تم استلام طلبك</>}
              </h3>
              {serverError && <div className="server-error" role="alert"><CircleAlert size={18} /><span>{serverError}</span></div>}
              {!serverError && notice && <div className="order-notice" role="status"><Check size={16} /><span>{notice}</span></div>}
              <p>{serverError
                ? 'هذه النسخة منشورة على GitHub Pages وتعمل بدون خادم خاص للطلبات، لذلك أرسلي التفاصيل عبر واتساب. ستصلك رسالة جاهزة فيها كل بنود الطلب، والتأكيد يتم يدوياً من الفريق بعد مراجعته.'
                : 'لتأكيد الطلب فوراً أرسلي الرسالة الجاهزة عبر واتساب — تحتوي على كل بنود الطلب ورقم الطلب نفسه، وسنؤكد لك بعد المراجعة.'}</p>
              <div className="whatsapp-actions">
                <a className="button button-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer" onClick={confirmViaWhatsApp}><MessageCircle size={16} />أكمل الطلب عبر واتساب</a>
                {serverError && (
                  <button type="button" className="button button-outline" onClick={() => { setChannel('api'); void submitOrder() }}><RefreshCw size={15} />إعادة المحاولة عبر الخادم</button>
                )}
              </div>
              <p>رقم طلبك المحفوظ: <strong dir="ltr">{whatsappOrderNumber}</strong></p>
            </div>
          )}
          <div className="order-total-strip">
            <span>الإجمالي شامل التوصيل<small>{cart.length.toLocaleString('ar-IQ')} {cart.length === 1 ? 'قطعة' : 'قطع'} · {totals.deliveryFee ? `توصيل ${formatPrice(totals.deliveryFee)}` : 'توصيل مجاني'}</small></span>
            <strong>{formatPrice(totals.total)}</strong>
          </div>
          <div className="consent-row">
            <input
              id="consent"
              type="checkbox"
              className="consent-box"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked)
                if (event.target.checked) {
                  setConsentError('')
                  setLiveMessage('')
                }
              }}
              aria-invalid={Boolean(consentError)}
              aria-describedby={consentError ? 'consent-error' : 'consent-help'}
            />
            <label htmlFor="consent">
              <span className="consent-title">أوافق على شروط الاستخدام وسياسة الخصوصية</span>
              <small id="consent-help">نستخدم بياناتك لتجهيز الطلب والتواصل معك فقط، ولا نشاركها مع أي جهة أخرى.</small>
            </label>
            <span className="consent-links">
              <Link href="/policies#terms">الشروط</Link>
              <Link href="/policies#privacy">الخصوصية</Link>
            </span>
          </div>
          {consentError && <small className="field-error" id="consent-error" role="alert">{consentError}</small>}
          <button type="submit" className="button button-primary order-submit" disabled={submitState === 'loading'}>
            {submitState === 'loading' ? <><LoaderCircle className="spin" size={18} />جارٍ إرسال الطلب</> : <>تأكيد الطلب <ArrowLeft size={17} /></>}
          </button>
        </div>
        <aside className="checkout-summary glass glass-strong" aria-label="ملخص طلبك">
          <h2>ملخص طلبك</h2>
          <div className="checkout-items">
            {cart.map((item) => (
              <div className="checkout-item" key={`${item.product.slug}-${item.color.id}`}>
                <SmartImage src={item.product.image} alt="" sizes="64px" />
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
          <div className="checkout-secure"><Check size={15} />لن يُرسل الطلب إلا بعد الضغط على تأكيد</div>
        </aside>
      </form>
    </main>
  )
}

function Field({ label, id, value, error, onChange, placeholder, type = 'text', autoComplete, dir, icon, inputMode }: { label: string; id: string; value: string; error?: string; onChange: (value: string) => void; placeholder: string; type?: string; autoComplete?: string; dir?: 'ltr' | 'rtl'; icon?: ReactNode; inputMode?: 'tel' | 'text' | 'email' | 'numeric' }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}{error && <span className="required-mark">*</span>}</label>
      <div className="field-input glass-input">
        {icon}
        <input id={id} type={type} inputMode={inputMode} dir={dir} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
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
