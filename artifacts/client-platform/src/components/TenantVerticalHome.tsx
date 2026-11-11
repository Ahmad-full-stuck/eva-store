import './tenant-vertical-home.css'
import {
  ArrowLeft, ArrowUpLeft, BadgeCheck, Check, Clock3, Gift, Hammer,
  Headphones, Heart, Layers, MapPin, Monitor, Package, Palette,
  Paintbrush, Plug, Shirt, Smartphone, Sparkles,
  Utensils, Watch, Wrench, type LucideIcon,
} from 'lucide-react'
import { Link } from 'wouter'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/catalog'
import { getStoreBrand } from '@/lib/store-brand'
import { useSiteContent } from '@/lib/site-content'

interface TenantVerticalHomeProps {
  products: Product[]
  wishlist: string[]
  onWish: (slug: string) => void
  onAdd: (product: Product, color: Product['colors'][number], length: number) => void
}

const categoryIcons: Record<string, LucideIcon> = {
  fabric: Layers, phone: Smartphone, tablet: Smartphone, computer: Monitor,
  audio: Headphones, accessory: Package, power: Plug, smartwatch: Watch,
  burger: Utensils, sandwich: Utensils, food: Utensils,
  construction: Hammer, sanitary: Wrench, paint: Paintbrush, tools: Wrench,
  dress: Shirt, abaya: Shirt, fashion: Shirt, sculpture: Palette,
  decor: Gift, wall: Palette, custom: Sparkles, handmade: Sparkles, gift: Gift,
  watch: Watch, repair: Wrench, bag: Package, shoe: Package,
}

function SectionHeading({
  eyebrow,
  title,
  description,
  href = '/catalog',
  action = 'عرض الكل',
}: {
  eyebrow: string
  title: string
  description: string
  href?: string
  action?: string
}) {
  return (
    <div className="vhome-heading">
      <div className="vhome-heading__copy">
        <span className="vhome-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <Link href={href} className="vhome-link">
        {action}<ArrowLeft size={16} aria-hidden="true" />
      </Link>
    </div>
  )
}

function CategoryGrid({
  brand,
  products,
  fallbackImage,
}: {
  brand: ReturnType<typeof getStoreBrand>
  products: Product[]
  fallbackImage: string
}) {
  return (
    <div className="vhome-category-grid">
      {brand.categories.map((category, index) => {
        const Icon = categoryIcons[category.icon] || Package
        const product = products.find((item) => item.categoryId === category.id)
        const image = product?.image || fallbackImage
        return (
          <Link
            key={category.id}
            href={'/catalog?category=' + encodeURIComponent(category.id)}
            className="vhome-category-card"
          >
            <span className="vhome-category-card__media">
              {image ? <img src={image} alt="" loading="lazy" decoding="async" /> : <span className="vhome-category-card__placeholder"><Icon size={30} /></span>}
              <span className="vhome-category-card__number">{String(index + 1).padStart(2, '0')}</span>
              <span className="vhome-category-card__icon"><Icon size={18} strokeWidth={1.7} /></span>
            </span>
            <span className="vhome-category-card__body">
              <strong>{category.label}</strong>
              <small>{category.description}</small>
              <span className="vhome-category-card__action">استكشف القسم <ArrowLeft size={14} /></span>
            </span>
          </Link>
        )
      })}
    </div>
  )
}

function ProductTile({
  product,
  products,
  wished,
  onWish,
  unit,
}: {
  product: Product
  products: Product[]
  wished: boolean
  onWish: (slug: string) => void
  unit: string
}) {
  const category = product.categoryId
  return (
    <article className="vhome-product">
      <div className="vhome-product__media">
        <Link href={'/product/' + product.slug} aria-label={'تفاصيل ' + product.name}>
          {product.image
            ? <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
            : <span className="vhome-product__placeholder"><Package size={30} /></span>}
        </Link>
        <button
          type="button"
          className={'vhome-product__wish' + (wished ? ' is-active' : '')}
          onClick={() => onWish(product.slug)}
          aria-label={wished ? 'إزالة ' + product.name + ' من المفضلة' : 'إضافة ' + product.name + ' إلى المفضلة'}
          aria-pressed={wished}
        >
          <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
        </button>
        {product.isNew && <span className="vhome-product__flag">جديد</span>}
      </div>
      <div className="vhome-product__content">
        <span className="vhome-product__category">{category || product.type}</span>
        <Link href={'/product/' + product.slug} className="vhome-product__name">{product.name}</Link>
        <div className="vhome-product__bottom">
          <strong>{formatPrice(product.price)} <small>/ {unit}</small></strong>
          <Link href={'/product/' + product.slug} className="vhome-product__open" aria-label={'عرض ' + product.name}>
            <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    </article>
  )
}

function ProductGrid({
  products,
  wishlist,
  onWish,
  unit,
}: {
  products: Product[]
  wishlist: string[]
  onWish: (slug: string) => void
  unit: string
}) {
  const featured = products.filter((product) => product.isFeatured)
  const items = (featured.length ? featured : products).slice(0, 4)
  if (!items.length) return null
  return (
    <div className="vhome-product-grid">
      {items.map((product) => (
        <ProductTile
          key={product.id}
          product={product}
          products={products}
          wished={wishlist.includes(product.slug)}
          onWish={onWish}
          unit={unit}
        />
      ))}
    </div>
  )
}

function FeatureStrip({ brand }: { brand: ReturnType<typeof getStoreBrand> }) {
  if (!brand.features.length) return null
  return (
    <div className="vhome-feature-strip">
      {brand.features.slice(0, 3).map((feature, index) => (
        <div className="vhome-feature" key={feature.title}>
          <span className="vhome-feature__icon"><BadgeCheck size={19} strokeWidth={1.7} /></span>
          <span className="vhome-feature__text">
            <strong>{feature.title}</strong>
            <small>{feature.description}</small>
          </span>
          <span className="vhome-feature__index">0{index + 1}</span>
        </div>
      ))}
    </div>
  )
}

export function TenantVerticalHome({ products, wishlist, onWish }: TenantVerticalHomeProps) {
  const content = useSiteContent()
  const key = content.tenantKey || ''
  const brand = getStoreBrand(key)
  const shopName = content.shortName || content.shopName || brand.title
  const heroImage = content.storyImage || content.heroSlides?.[0] || products[0]?.image || ''
  const unit = content.quantityUnit || 'قطعة'
  const variant = key === 'mustafa-store'
    ? 'mustafa'
    : key === 'nineteen89-rest'
    ? 'restaurant'
    : key === 'sham-couture'
      ? 'fashion'
      : key === 'hayder-taif'
        ? 'fabric'
        : key === 'fink-factory'
          ? 'gallery'
          : key === 'alsifa-company'
            ? 'industrial'
            : key === 'morvo-handmade'
              ? 'handmade'
              : 'technology'

  return (
    <main className={'tenant-vertical-home vhome vhome--' + variant}>
      <div className="container-eva">
        <section className="vhome-hero">
          <div className="vhome-hero__copy">
            <span className="vhome-eyebrow">{brand.kicker}</span>
            <span className="vhome-hero__overline">{brand.artTitle}</span>
            <h1>{brand.title}</h1>
            <p className="vhome-hero__description">{brand.description}</p>
            <div className="vhome-hero__actions">
              <Link href="/catalog" className="vhome-button vhome-button--primary">
                تصفح التشكيلة<ArrowLeft size={17} />
              </Link>
              <Link href="/contact" className="vhome-button vhome-button--secondary">
                تواصل مع المتجر<ArrowUpLeft size={16} />
              </Link>
            </div>
            <div className="vhome-hero__meta">
              <span><Check size={15} /> تفاصيل واضحة لكل منتج</span>
              {content.location && <span><MapPin size={15} />{content.location}</span>}
            </div>
          </div>
          <figure className="vhome-hero__visual">
            {heroImage
              ? <img src={heroImage} alt={'صورة من ' + shopName} fetchPriority="high" decoding="async" />
              : <div className="vhome-hero__placeholder"><span>{brand.mark}</span></div>}
            <figcaption className="vhome-hero__caption">
              <span>{brand.artLabel}</span>
              <strong>{shopName}</strong>
            </figcaption>
            <span className="vhome-hero__seal" aria-hidden="true">{brand.mark}</span>
          </figure>
        </section>

        <aside className="vhome-demo" role="note">
          <span className="vhome-demo__icon">i</span>
          <p><strong>معاينة تصميمية مخصصة لـ {shopName}.</strong> الصور والمنتجات والأسعار المعروضة أمثلة أولية، وتُستبدل بالبيانات والصور التي يعتمدها صاحب المتجر قبل الإطلاق.</p>
        </aside>

        <section className="vhome-section vhome-categories-section">
          <SectionHeading
            eyebrow="DISCOVER THE COLLECTION"
            title="تصفح حسب القسم"
            description="وصل مباشرة إلى الفئة التي تبحث عنها، ثم افتح المنتج لمراجعة صوره وتفاصيله."
            action="كل المنتجات"
          />
          <CategoryGrid brand={brand} products={products} fallbackImage={heroImage} />
        </section>

        <section className="vhome-section vhome-products-section">
          <SectionHeading
            eyebrow={variant === 'restaurant' ? 'FROM THE MENU' : variant === 'fabric' ? 'SELECTED MATERIALS' : 'FEATURED SELECTION'}
            title={variant === 'mustafa' ? 'هواتف وإكسسوارات مختارة' : variant === 'restaurant' ? 'مختارات من المنيو' : variant === 'fabric' ? 'خامات مختارة' : 'مختارات من التشكيلة'}
            description={variant === 'mustafa' ? 'نماذج لتجربة عرض الهواتف والملحقات. يُؤكد الموديل والسعر والتوفر مباشرة مع المركز.' : 'نماذج توضيحية لطريقة عرض المنتجات والصور والأسعار والتفاصيل ضمن متجر مستقل.'}
          />
          <ProductGrid products={products} wishlist={wishlist} onWish={onWish} unit={unit} />
        </section>

        {(content.heroSlides?.[1] || content.heroSlides?.[2]) && (
          <section className="vhome-editorial">
            <div className="vhome-editorial__copy">
              <span className="vhome-eyebrow">A CLOSER LOOK</span>
              <h2>{brand.artTitle}</h2>
              <p>{brand.description}</p>
              <Link href="/catalog" className="vhome-link">اكتشف المزيد<ArrowLeft size={16} /></Link>
            </div>
            <div className="vhome-editorial__images">
              {content.heroSlides?.[1] && <img src={content.heroSlides[1]} alt={'تفاصيل من ' + shopName} loading="lazy" decoding="async" />}
              {content.heroSlides?.[2] && <img src={content.heroSlides[2]} alt={'صورة إضافية من ' + shopName} loading="lazy" decoding="async" />}
            </div>
          </section>
        )}

        <section className="vhome-section vhome-service-section">
          <SectionHeading
            eyebrow="THE STORE EXPERIENCE"
            title="التفاصيل والخدمة"
            description="معلومات منظمة تساعد الزبون على فهم الخيارات وطريقة التواصل مع المتجر."
            href="/contact"
            action="تواصل معنا"
          />
          <FeatureStrip brand={brand} />
        </section>

        <section className="vhome-contact">
          <div>
            <span className="vhome-eyebrow">DIRECT CONTACT</span>
            <h2>تحتاج إلى تفاصيل إضافية؟</h2>
            <p>تواصل مع {shopName} للاستفسار عن المنتجات والأسعار والتوفر والخدمة قبل تأكيد الطلب.</p>
            {content.hours && <span className="vhome-contact__hours"><Clock3 size={15} />{content.hours}</span>}
          </div>
          <Link href="/contact" className="vhome-button vhome-button--light">تواصل مع المتجر<ArrowLeft size={17} /></Link>
        </section>
      </div>
    </main>
  )
}
