import { ArrowLeft, Search } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import {
  AboutPage,
  ContactPage,
  FabricGuidePage,
  GlassStyles,
  OrderTrackingPage,
  PoliciesPage,
} from '@/pages/InfoPages'

export default function NotFound() {
  const [location] = useLocation()
  const fragmentIndex = location.indexOf('#')

  if (fragmentIndex > 0) {
    const base = location.slice(0, fragmentIndex)
    if (base === '/about') return <AboutPage />
    if (base === '/fabric-guide') return <FabricGuidePage />
    if (base === '/contact') return <ContactPage />
    if (base === '/policies') return <PoliciesPage />
    if (base === '/order-tracking') return <OrderTrackingPage />
  }

  return (
    <>
      <GlassStyles />
      <main className="container-eva not-found-page">
        <section className="glass not-found-card">
          <span className="not-found-code" aria-hidden="true">404</span>
          <span className="eyebrow"><Search size={14} />الصفحة غير موجودة</span>
          <h1>هذا الرابط لم يعد متاحاً</h1>
          <p>ربما تغيّر العنوان أو حُذفت الصفحة. لا بأس: يمكنك العودة إلى الرئيسية أو متابعة تصفّح الأقمشة واختيار خامة جديدة.</p>
          <div className="not-found-actions">
            <Link href="/" className="button button-primary">العودة إلى الرئيسية <ArrowLeft size={16} /></Link>
            <Link href="/catalog" className="button button-outline">تصفحي الأقمشة <ArrowLeft size={16} /></Link>
          </div>
          <div className="not-found-links">
            <Link href="/fabric-guide" className="chip">دليل الأقمشة</Link>
            <Link href="/about" className="chip">من نحن</Link>
            <Link href="/contact" className="chip">تواصلي معنا</Link>
            <Link href="/order-tracking" className="chip">تتبّع الطلب</Link>
            <Link href="/favorites" className="chip">المفضلة</Link>
            <Link href="/policies" className="chip">السياسات</Link>
          </div>
        </section>
      </main>
    </>
  )
}
