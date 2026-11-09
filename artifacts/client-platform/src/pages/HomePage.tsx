import {
  ArrowLeft, BadgeCheck, Banknote, Clock3, CreditCard, Footprints, Headphones,
  MapPin, MessageCircle, Package, Shirt, ShieldCheck, ShoppingBag, Smartphone,
  Store, Truck, Wrench, Check, Layers, Monitor, Zap, Utensils, Hammer, Paintbrush, Palette, Gift, Watch, House, type LucideIcon,
} from 'lucide-react'
import { Link } from 'wouter'
import type { Product, ProductColor } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { useSiteContent } from '@/lib/site-content'
import { getStoreBrand } from '@/lib/store-brand'
import { TenantVerticalHome } from '@/components/TenantVerticalHome'

interface HomePageProps {
  products: Product[]
  categories: import('@/types').Category[]
  wishlist: string[]
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, length: number) => void
}

const icons: Record<string, LucideIcon> = {
  bag:ShoppingBag, shoe:Footprints, phone:Smartphone, accessory:Headphones,
  repair:Wrench, shirt:Shirt, polo:Shirt, style:BadgeCheck, truck:Truck,
  credit:CreditCard, check:Check, pin:MapPin, clock:Clock3, store:Store,
  installment:Banknote, warranty:ShieldCheck, fabric:Layers, tablet:Smartphone, computer:Monitor, audio:Headphones, power:Zap, burger:Utensils, sandwich:Utensils, food:Utensils, construction:Hammer, sanitary:Hammer, paint:Paintbrush, tools:Wrench, dress:Shirt, abaya:Shirt, fashion:Shirt, sculpture:Palette, decor:House, wall:House, custom:Palette, handmade:Palette, gift:Gift, smartwatch:Watch,
}

const VERTICAL_TENANT_KEYS = new Set(['hayder-taif','apple-center-amiriya','almass-mobile','alawhad-mobile','aalam-alqalaa','nineteen89-rest','alsifa-company','sham-couture','fink-factory','apple-store-98h','center-alsaa','morvo-handmade'])

export function HomePage({ products, wishlist, onWish, onAdd }: HomePageProps) {
  const content = useSiteContent()
  const hostKey = typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : ''
  const brand = getStoreBrand(content.tenantKey || hostKey)
  const HeroIcon = brand.key === 'laya' ? ShoppingBag : brand.key === 'njom' || brand.key === 'lna' ? Smartphone : Shirt
  const featured = products.filter((product) => product.isFeatured).slice(0, 6)
  const heroImage = content.storyImage || products[0]?.image || ''
  const editorialImages = (content.heroSlides || []).filter(Boolean).slice(1, 4)
  if (content.tenantKey && VERTICAL_TENANT_KEYS.has(brand.key)) return <TenantVerticalHome products={products} wishlist={wishlist} onWish={onWish} onAdd={onAdd} />

  return (
    <main className={'tenant-store tenant-store--' + brand.key}>
      <div className="container-eva">
        <section className="tenant-hero">
          <div className="tenant-hero__copy">
            <span className="tenant-kicker">{brand.kicker}</span>
            <h1>{brand.title}</h1>
            <p>{brand.description}</p>
            <div className="tenant-hero__actions">
              <Link href="/catalog" className="tenant-button tenant-button--primary">استكشف التشكيلة <ArrowLeft size={16} /></Link>
              <Link href="/contact" className="tenant-button tenant-button--quiet"><MessageCircle size={16} /> تواصل مع المتجر</Link>
            </div>
            <div className="tenant-hero__footnote">
              <span><Check size={14} /> نموذج عرض قابل للتخصيص بهوية العلامة</span>
              {content.location && <span><MapPin size={14} /> {content.location}</span>}
            </div>
          </div>
          <div className="tenant-hero__art" aria-label={brand.artLabel}>
            {heroImage && <img className="tenant-hero__photo" src={heroImage} alt={'صورة توضيحية لمنتجات ' + (content.shortName || content.shopName)} fetchPriority="high" />}
            <div className="tenant-hero__scrim" />
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
        <div className="tenant-demo-note" role="note">
          <span className="tenant-demo-note__mark">i</span>
          <div>
            <strong>معاينة تجريبية مخصصة لـ {content.shortName || content.shopName}</strong>
            <p>{content.announcementLeft || 'المنتجات والصور والأسعار المعروضة أمثلة توضيحية وليست مخزوناً أو عروضاً فعلية.'}</p>
          </div>
        </div>
      </div>

      <section className="tenant-categories">
        <div className="container-eva">
          <div className="tenant-section-heading">
            <div><span className="tenant-kicker">EXPLORE THE COLLECTION</span><h2>تصفّح حسب القسم</h2><p>اختر القسم للوصول إلى المنتجات والتفاصيل المرتبطة به</p></div>
            <Link href="/catalog" className="tenant-text-link">كل الأقسام <ArrowLeft size={16} /></Link>
          </div>
          <div className="tenant-category-grid tenant-category-grid--visual">
            {brand.categories.map((category,index) => {
              const Icon = icons[category.icon] || Package
              const categoryProduct = products.find((product) => product.categoryId === category.id)
              const image = categoryProduct?.image || heroImage
              return <Link key={category.id} href={'/catalog?category='+encodeURIComponent(category.id)} className="tenant-category-card tenant-category-card--visual">
                {image && <img className="tenant-category-photo" src={image} alt="" loading="lazy" decoding="async" />}
                <span className="tenant-category-shade" />
                <span className="tenant-category-index">0{index+1}</span>
                <span className="tenant-category-icon"><Icon size={25} strokeWidth={1.45}/></span>
                <span className="tenant-category-copy"><strong>{category.label}</strong><small>{category.description}</small></span>
                <ArrowLeft className="tenant-category-arrow" size={17}/>
              </Link>
            })}
          </div>
        </div>
      </section>

      {products.length > 0 && (
        <section className="tenant-product-showcase">
          <div className="container-eva">
            <div className="tenant-section-heading tenant-section-heading--products">
              <div><span className="tenant-kicker">THE SELECTED EDIT</span><h2>مختارات من التشكيلة</h2><p>نماذج منتجات قابلة للاستبدال بصوركم وأسعاركم وتفاصيلكم المعتمدة</p></div>
              <Link href="/catalog" className="tenant-text-link">اكتشف جميع المنتجات <ArrowLeft size={16} /></Link>
            </div>
            <div className="tenant-product-grid">
              {featured.map((product,index) => (
                <ProductCard key={product.id} product={product} wished={wishlist.includes(product.slug)} onWish={onWish} onAdd={onAdd} priority={index < 2} />
              ))}
            </div>
          </div>
        </section>
      )}

      {editorialImages.length > 0 && (
        <section className="tenant-editorial-gallery">
          <div className="container-eva">
            <div className="tenant-editorial-gallery__head">
              <span className="tenant-kicker">A CLOSER LOOK</span>
              <h2>التفاصيل تصنع الانطباع</h2>
            </div>
            <div className="tenant-editorial-gallery__grid">
              {editorialImages.map((src,index) => <figure key={src}>
                <img src={src} alt={'صورة توضيحية من تشكيلة ' + (content.shortName || content.shopName) + ' ' + (index + 1)} loading="lazy" decoding="async" />
                <figcaption>COLLECTION · 0{index + 1}</figcaption>
              </figure>)}
            </div>
          </div>
        </section>
      )}

      <section className="tenant-benefits">
        <div className="container-eva">
          <div className="tenant-section-heading"><div><span className="tenant-kicker">STORE SERVICES</span><h2>الخدمة والتفاصيل</h2><p>معلومات واضحة تساعد الزبون على معرفة ما يقدمه المتجر قبل التواصل</p></div></div>
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
          <div><span className="tenant-kicker">DIRECT CONTACT</span><h2>هل تحتاج إلى تفاصيل إضافية؟</h2><p>تواصل مع فريق المتجر لتأكيد المنتجات الفعلية والأسعار والمقاسات والتوفر قبل اتخاذ قرارك.</p>
            <div className="tenant-contact-meta">{content.location&&<span><MapPin size={15}/>{content.location}</span>}{content.hours&&<span><Clock3 size={15}/>{content.hours}</span>}</div>
          </div>
          <Link href="/contact" className="tenant-button tenant-button--light">تواصل الآن <ArrowLeft size={16}/></Link>
        </div>
      </section>
    </main>
  )
}
