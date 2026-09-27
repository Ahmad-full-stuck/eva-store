import { Instagram, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Link } from 'wouter'
import type { Category, SiteRoute } from '@/types'
import { governorates } from '@/lib/fallback-data'
import { siteConfig } from '@/lib/site'
import { Logo } from './Logo'

interface SiteFooterProps {
  routes: SiteRoute[]
  categories: Category[]
}

export function SiteFooter({ routes, categories }: SiteFooterProps) {
  const infoRoutes = routes.filter((route) => ['about', 'guide', 'contact', 'tracking', 'policies'].includes(route.id))
  const nearbyGovernorates = governorates.slice(0, 6)

  return (
    <footer className="site-footer glass-dark">
      <div className="container-eva footer-brand footer-top">
        <Logo light />
        <p>معرض أقمشة عربي يساعدك على معرفة الخامة والمرونة واللون قبل اختيار القطعة.</p>
        <div className="social-links">
          <a href={siteConfig.whatsappUrl()} target="_blank" rel="noreferrer" aria-label="تواصلي معنا عبر واتساب"><MessageCircle size={17} /></a>
          <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer" aria-label={siteConfig.instagramText}><Instagram size={17} /></a>
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
        </div>
        <div className="footer-col">
          <h2>تواصلي معنا</h2>
          <a href={`tel:${siteConfig.phone}`}><Phone size={15} /><span dir="ltr">{siteConfig.phone}</span></a>
          <a href={siteConfig.whatsappUrl()} target="_blank" rel="noreferrer"><MessageCircle size={15} />واتساب</a>
          <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer"><Instagram size={15} />إنستغرام</a>
        </div>
        <div className="footer-col">
          <h2>نطاق الخدمة</h2>
          <p>نوصل إلى {nearbyGovernorates.join('، ')} وجميع محافظات العراق.</p>
          <a href={siteConfig.whatsappUrl('مرحباً إيفا ستور، أستفسر عن الشحن الدولي للأقمشة')} target="_blank" rel="noreferrer"><MapPin size={15} />شحن دولي عند التوفر</a>
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
