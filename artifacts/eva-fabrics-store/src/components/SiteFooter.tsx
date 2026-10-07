import { MapPin, MessageCircle, PackageSearch } from 'lucide-react'
import { Link } from 'wouter'
import type { Category, SiteRoute } from '@/types'
import { governorates } from '@/lib/fallback-data'
import { siteConfig } from '@/lib/site'
import { Logo } from './Logo'

interface SiteFooterProps {
  routes: SiteRoute[]
  categories: Category[]
}

const infoItems = [
  { path: '/about', label: 'من نحن' },
  { path: '/fabric-guide', label: 'دليل الأقمشة' },
  { path: '/order-tracking', label: 'تتبّع الطلب' },
  { path: '/contact', label: 'تواصلي معنا' },
  { path: '/policies', label: 'السياسات' },
]

export function SiteFooter({ routes, categories }: SiteFooterProps) {
  const infoRoutes = infoItems.map((item) => {
    const matched = routes.find((route) => route.path === item.path)
    return { ...item, id: item.path, label: matched?.label || item.label }
  })
  const nearbyGovernorates = governorates.slice(0, 6)

  return (
    <footer className="site-footer glass-dark">
      <div className="container-eva footer-brand footer-top">
        <Logo light />
        <p>معرض أقمشة عربي يساعدك على معرفة الخامة والمرونة واللون قبل اختيار القطعة.</p>
        <div className="social-links">
          <Link href="/contact" aria-label="تواصلي معنا عبر الموقع"><MessageCircle size={17} /></Link>
        </div>
      </div>
      <div className="container-eva footer-grid">
        <div className="footer-col">
          <h2>الأقمشة</h2>
          <Link href="/catalog">كل الأقمشة</Link>
          {categories.slice(0, 5).map((category) => <Link key={category.id} href={`/catalog?category=${encodeURIComponent(category.id)}`}>{category.name}</Link>)}
        </div>
        <div className="footer-col">
          <h2>معلومات</h2>
          {infoRoutes.map((route) => <Link key={route.id} href={route.path}>{route.label}</Link>)}
          <Link href="/policies#privacy">الخصوصية</Link>
          <Link href="/policies#returns">الإرجاع والتبديل</Link>
          <Link href="/admin" className="footer-admin-link">تسجيل الدخول كمدير</Link>
        </div>
        <div className="footer-col">
          <h2>تواصلي معنا</h2>
          <Link href="/contact"><MessageCircle size={15} />نموذج التواصل في الموقع</Link>
          <Link href="/order-tracking"><PackageSearch size={15} />تتبّع حالة الطلب</Link>
        </div>
        <div className="footer-col">
          <h2>نطاق الخدمة</h2>
          <p>نوصل إلى {nearbyGovernorates.join('، ')} وجميع محافظات العراق.</p>
          <span className="footer-delivery-note"><MapPin size={15} />توصيل ٥ آلاف دينار</span>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container-eva">
          <span>© {new Date().getFullYear()} {siteConfig.name}</span>
          <span>الأسعار والمواصفات تُراجع قبل تأكيد الطلب</span>
        </div>
      </div>
    </footer>
  )
}
