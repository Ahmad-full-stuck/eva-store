import {
  ArrowLeft, BadgeCheck, Banknote, Clock3, CreditCard, Footprints, Headphones,
  MapPin, MessageCircle, Package, Shirt, ShieldCheck, ShoppingBag, Smartphone,
  Store, Truck, Wrench, Check, type LucideIcon,
} from 'lucide-react'
import { Link } from 'wouter'
import type { Category, Product, ProductColor } from '@/types'
import { useSiteContent } from '@/lib/site-content'
import { getStoreBrand } from '@/lib/store-brand'

interface HomePageProps {
  products: Product[]
  categories: Category[]
  wishlist: string[]
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, length: number) => void
}
const icons: Record<string, LucideIcon> = {
  bag:ShoppingBag, shoe:Footprints, phone:Smartphone, accessory:Headphones,
  repair:Wrench, shirt:Shirt, polo:Shirt, style:BadgeCheck, truck:Truck,
  credit:CreditCard, check:Check, pin:MapPin, clock:Clock3, store:Store,
  installment:Banknote, warranty:ShieldCheck,
}
export function HomePage(_props: HomePageProps) {
  const content = useSiteContent()
  const hostKey = typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : ''
  const brand = getStoreBrand(content.tenantKey || hostKey)
  const HeroIcon = brand.key === 'laya' ? ShoppingBag : brand.key === 'njom' || brand.key === 'lna' ? Smartphone : Shirt
  return (
    <main className={'tenant-store tenant-store--' + brand.key}>
      <div className="container-eva">
        <section className="tenant-hero">
          <div className="tenant-hero__copy">
            <span className="tenant-kicker">{brand.kicker}</span>
            <h1>{brand.title}</h1>
            <p>{brand.description}</p>
            <div className="tenant-hero__actions">
              <Link href="/catalog" className="tenant-button tenant-button--primary">استكشف الأقسام <ArrowLeft size={16} /></Link>
              <Link href="/contact" className="tenant-button tenant-button--quiet"><MessageCircle size={16} /> تواصل مع المتجر</Link>
            </div>
            <div className="tenant-hero__footnote">
              <span><Check size={14} /> تفاصيل وتوفر مؤكّدان من المتجر</span>
              {content.location && <span><MapPin size={14} /> {content.location}</span>}
            </div>
          </div>
          <div className="tenant-hero__art" aria-label={brand.artLabel}>
            <div className="tenant-art__top"><span>{brand.artLabel}</span><span>IRAQ · {brand.mark}</span></div>
            <div className="tenant-art__center">
              <div className="tenant-art__halo" />
              <div className="tenant-art__icon"><HeroIcon size={66} strokeWidth={1.1} /></div>
              <strong>{brand.mark}</strong>
            </div>
            <div className="tenant-art__bottom"><span>{brand.artTitle}</span><span>{content.shortName || content.shopName}</span></div>
            <div className="tenant-art__index">01 — 0{brand.categories.length}</div>
          </div>
        </section>
      </div>
      <section className="tenant-categories">
        <div className="container-eva">
          <div className="tenant-section-heading">
            <div><span className="tenant-kicker">EXPLORE THE COLLECTION</span><h2>تصفّح حسب القسم</h2><p>اختر القسم الذي تبحث عنه للوصول إلى تفاصيله وطلب المساعدة مباشرة</p></div>
            <Link href="/catalog" className="tenant-text-link">كل الأقسام <ArrowLeft size={16} /></Link>
          </div>
          <div className="tenant-category-grid">
            {brand.categories.map((category,index) => {
              const Icon = icons[category.icon] || Package
              return <Link key={category.id} href={'/catalog?category='+encodeURIComponent(category.id)} className="tenant-category-card">
                <span className="tenant-category-index">0{index+1}</span>
                <span className="tenant-category-icon"><Icon size={27} strokeWidth={1.45}/></span>
                <span className="tenant-category-copy"><strong>{category.label}</strong><small>{category.description}</small></span>
                <ArrowLeft className="tenant-category-arrow" size={17}/>
              </Link>
            })}
          </div>
        </div>
      </section>
      <section className="tenant-benefits">
        <div className="container-eva">
          <div className="tenant-section-heading"><div><span className="tenant-kicker">STORE SERVICES</span><h2>الخدمة والتفاصيل</h2></div></div>
          <div className="tenant-benefit-grid">
            {brand.features.map((feature,index) => {
              const Icon=icons[feature.icon]||BadgeCheck
              return <article className="tenant-benefit" key={feature.title}><span className="tenant-benefit__index">0{index+1}</span><Icon size={22} strokeWidth={1.5}/><h3>{feature.title}</h3><p>{feature.description}</p></article>
            })}
          </div>
        </div>
      </section>
      <section className="tenant-contact-band">
        <div className="container-eva tenant-contact-band__inner">
          <div><span className="tenant-kicker">DIRECT CONTACT</span><h2>اسأل عن المتوفر قبل اتخاذ قرارك</h2><p>نؤكد لك الصور والتفاصيل والسعر والتوفر من المتجر مباشرة، دون عرض بيانات أو منتجات غير معتمدة.</p>
            <div className="tenant-contact-meta">{content.location&&<span><MapPin size={15}/>{content.location}</span>}{content.hours&&<span><Clock3 size={15}/>{content.hours}</span>}</div>
          </div>
          <Link href="/contact" className="tenant-button tenant-button--light">تواصل الآن <ArrowLeft size={16}/></Link>
        </div>
      </section>
    </main>
  )
}
