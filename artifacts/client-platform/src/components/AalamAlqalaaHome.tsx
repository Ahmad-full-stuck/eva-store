import { ArrowLeft, BadgeCheck, BatteryCharging, CarFront, Check, ChevronLeft, Gift, Headphones, House, MapPin, Monitor, ShieldCheck, Smartphone, Truck, Watch } from 'lucide-react'
import { Link } from 'wouter'
import type { Product, ProductColor } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { SmartImage } from '@/components/ui/SmartImage'
import { useSiteContent } from '@/lib/site-content'
import { getStoreBrand } from '@/lib/store-brand'
import './aalam-alqalaa-home.css'

interface AalamAlqalaaHomeProps {
  products: Product[]
  wishlist: string[]
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, length: number) => void
}

const iconMap = {
  phone: Smartphone,
  computer: Monitor,
  smartwatch: Watch,
  audio: Headphones,
  power: BatteryCharging,
  home: House,
  car: CarFront,
}

export function AalamAlqalaaHome({ products, wishlist, onWish, onAdd }: AalamAlqalaaHomeProps) {
  const content = useSiteContent()
  const brand = getStoreBrand('aalam-alqalaa')
  const featured = products.filter((product) => product.isFeatured).slice(0, 8)
  const heroImage = content.storyImage || products.find((product) => product.isFeatured)?.image || ''
  const categories = brand.categories

  return (
    <main className="aalam-storefront">
      <div className="aalam-container">
        <section className="aalam-hero">
          <div className="aalam-hero__copy">
            <span className="aalam-eyebrow"><i /> CASTLE WORLD <b>·</b> منذ 2004</span>
            <span className="aalam-hero__micro">أجهزة أصلية · أسعار واضحة · خدمة موثوقة</span>
            <h1>تقنية تثق بها<br /><em>واختيار أسهل.</em></h1>
            <p>من الهواتف والأجهزة الذكية إلى الصوتيات والطاقة والملحقات، اكتشف عالم المنتجات في مكان واحد، واسألنا عن السعر والتوفر قبل إتمام طلبك.</p>
            <div className="aalam-hero__actions">
              <Link href="/catalog" className="aalam-button aalam-button--primary">تصفح المنتجات <ArrowLeft size={17} /></Link>
              <Link href="/about" className="aalam-button aalam-button--secondary">تعرف على عالم القلعة <ChevronLeft size={17} /></Link>
            </div>
            <div className="aalam-hero__proof">
              <span><Check size={14} /> خبرة منذ 2004</span>
              <span><MapPin size={14} /> 5 فروع في بغداد</span>
              <span><Truck size={14} /> توصيل لكل العراق</span>
            </div>
          </div>
          <div className="aalam-hero__visual">
            {heroImage
              ? <SmartImage src={heroImage} alt="منتجات عالم القلعة" className="aalam-hero__image" sizes="(max-width: 720px) 92vw, 48vw" intrinsicWidth={1200} intrinsicHeight={900} priority />
              : <div className="aalam-hero__image-fallback" aria-hidden="true"><img src="/aalam-alqalaa-mark.svg" alt="" /></div>}
            <div className="aalam-hero__overlay" />
            <span className="aalam-hero__seal"><img src="/aalam-alqalaa-mark.svg" alt="" /> CASTLE WORLD</span>
            <div className="aalam-hero__caption">
              <span>TECHNOLOGY · TRUST · IRAQ</span>
              <strong>كل احتياجاتك التقنية… أقرب</strong>
            </div>
            <div className="aalam-float-card">
              <span className="aalam-float-card__icon"><ShieldCheck size={19} /></span>
              <span><b>ضمان ذهبي</b><small>وفق شروط الضمان المعتمدة</small></span>
            </div>
          </div>
        </section>

        <section className="aalam-proofbar" aria-label="مزايا عالم القلعة">
          <div><strong>2004</strong><span>بداية الحكاية</span></div>
          <div><strong>5</strong><span>فروع في بغداد</span></div>
          <div><strong>كل العراق</strong><span>توصيل للمحافظات</span></div>
          <div><strong>سنة</strong><span>ضمان ذهبي وفق الشروط</span></div>
          <div><strong><Gift size={19} /></strong><span>مسابقات وهدايا أسبوعية</span></div>
        </section>

        <section className="aalam-section">
          <div className="aalam-section__heading">
            <div><span className="aalam-kicker">DISCOVER THE COLLECTION</span><h2>تسوق حسب القسم</h2><p>اختر الفئة التي تبحث عنها وانتقل مباشرة إلى منتجاتها.</p></div>
            <Link href="/catalog" className="aalam-text-link">كل المنتجات <ArrowLeft size={16} /></Link>
          </div>
          <div className="aalam-category-grid">
            {categories.map((category, index) => {
              const Icon = iconMap[category.icon as keyof typeof iconMap] || Smartphone
              const item = products.find((product) => product.categoryId === category.id)
              return (
                <Link key={category.id} href={'/catalog?category=' + encodeURIComponent(category.id)} className="aalam-category-card">
                  <span className="aalam-category-card__index">0{index + 1}</span>
                  <span className="aalam-category-card__icon"><Icon size={21} strokeWidth={1.75} /></span>
                  <strong>{category.label}</strong>
                  <small>{category.description}</small>
                  <span className="aalam-category-card__bottom">{item ? 'استكشف المنتجات' : 'اكتشف القسم'} <ArrowLeft size={14} /></span>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="aalam-section aalam-featured">
          <div className="aalam-section__heading">
            <div><span className="aalam-kicker">SELECTED TECHNOLOGY</span><h2>منتجات تستحق الاكتشاف</h2><p>راجع مواصفات كل منتج واسأل عن السعر والتوفر الحالي.</p></div>
            <Link href="/catalog" className="aalam-text-link">تصفح الكتالوج <ArrowLeft size={16} /></Link>
          </div>
          <div className="aalam-product-grid">
            {featured.map((product, index) => (
              <ProductCard key={product.id} product={product} wished={wishlist.includes(product.slug)} onWish={onWish} onAdd={onAdd} priority={index < 2} />
            ))}
          </div>
        </section>

        <section className="aalam-assurance">
          <div className="aalam-assurance__copy">
            <span className="aalam-kicker">A TRUST BUILT SINCE 2004</span>
            <h2>الضمان مو مجرد كلمة</h2>
            <p>تجد في عالم القلعة خيارات من الأجهزة والملحقات مع معلومات واضحة عن الخدمة والضمان. اسأل فريقنا عن شروط الضمان الذهبي والمنتجات المشمولة قبل الشراء.</p>
            <Link href="/contact" className="aalam-assurance__link">تواصل مع الفريق <ArrowLeft size={16} /></Link>
          </div>
          <div className="aalam-assurance__points">
            <div><span><BadgeCheck size={20} /></span><b>أجهزة وملحقات أصلية</b><small>تشكيلة من علامات تقنية معروفة</small></div>
            <div><span><ShieldCheck size={20} /></span><b>ضمان واضح</b><small>راجع الشروط المعتمدة لكل منتج</small></div>
            <div><span><Truck size={20} /></span><b>خدمة إلى كل العراق</b><small>توصيل إلى جميع المحافظات</small></div>
            <div><span><Gift size={20} /></span><b>مسابقات وهدايا أسبوعية</b><small>تابع حسابنا لمعرفة الجديد</small></div>
          </div>
        </section>

        <section className="aalam-branchline">
          <span className="aalam-branchline__mark"><MapPin size={22} /></span>
          <div><span className="aalam-kicker">VISIT OR ORDER</span><h2>نلتقي بك في بغداد… ونوصلك لكل العراق.</h2><p>{content.location || 'خمسة فروع في بغداد · توصيل إلى جميع المحافظات'}</p></div>
          <Link href="/contact" className="aalam-button aalam-button--light">تواصل معنا <ArrowLeft size={16} /></Link>
        </section>
      </div>
    </main>
  )
}
