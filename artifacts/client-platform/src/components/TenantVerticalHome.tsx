import './tenant-vertical-home.css'
import { AalamAlqalaaHome } from '@/components/AalamAlqalaaHome'
import {
  ArrowLeft, ArrowUpLeft, BadgeCheck, Check, Clock3, CreditCard, Gift, Hammer,
  Headphones, Heart, Layers, MapPin, Monitor, Package, Palette, ShoppingBag, Zap,
  Paintbrush, Plug, Shirt, Smartphone, Sparkles,
  Utensils, Watch, Wrench, PhoneCall, Truck, type LucideIcon,
} from 'lucide-react'
import { Link } from 'wouter'
import type { Product } from '@/types'
import { formatPrice, isSoldOut } from '@/lib/catalog'
import { SmartImage } from '@/components/ui/SmartImage'
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
  audio: Headphones, accessory: Package, power: Plug, smartwatch: Watch, zap: Zap, shirt: Shirt,
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
        const image = product?.image || ''
        return (
          <Link
            key={category.id}
            href={'/catalog?category=' + encodeURIComponent(category.id)}
            className="vhome-category-card"
          >
            <span className="vhome-category-card__media">
              {image ? <SmartImage src={image} alt={category.label} sizes="(max-width: 620px) 46vw, 22vw" /> : <span className="vhome-category-card__placeholder"><Icon size={30} /></span>}
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
  wished,
  onWish,
  onAdd,
  unit,
}: {
  product: Product
  wished: boolean
  onWish: (slug: string) => void
  onAdd: (product: Product, color: Product['colors'][number], length: number) => void
  unit: string
}) {
  const category = product.categoryId
  const color = product.colors.find((item) => item.available) || product.colors[0]
  const canAdd = Boolean(color) && !isSoldOut(product)
  return (
    <article className="vhome-product">
      <div className="vhome-product__media">
        <Link href={'/product/' + product.slug} aria-label={'تفاصيل ' + product.name}>
          {product.image
            ? <SmartImage src={product.image} alt={product.name} sizes="(max-width: 620px) 46vw, 22vw" />
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
          <button
            type="button"
            className="vhome-product__buy"
            disabled={!canAdd}
            onClick={() => color && onAdd(product, color, 1)}
            aria-label={canAdd ? 'أضف ' + product.name + ' إلى السلة' : 'المنتج غير متوفر'}
          >
            <ShoppingBag size={14} /> {canAdd ? 'أضف للسلة' : 'غير متوفر'}
          </button>
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
          wished={wishlist.includes(product.slug)}
          onWish={onWish}
          onAdd={onAdd}
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


function MustafaCategoryCard({category,product,index}:{category:ReturnType<typeof getStoreBrand>['categories'][number];product?:Product;index:number}){
 const Icon=categoryIcons[category.icon]||Smartphone;
 return <Link href={'/catalog?category='+encodeURIComponent(category.id)} className="ms-category-card">
  <span className="ms-category-card__media">{product?.image?<img src={product.image} alt="" loading="lazy" decoding="async"/>:<span className="ms-category-card__fallback"><Icon size={34}/></span>}
   <span className="ms-category-card__number">0{index+1}</span><span className="ms-category-card__arrow"><ArrowLeft size={17}/></span>
  </span><span className="ms-category-card__body"><strong>{category.label}</strong><small>{category.description}</small></span>
 </Link>
}
function MustafaProductCard({product,wished,onWish}:{product:Product;wished:boolean;onWish:(slug:string)=>void}){
 return <article className="ms-product-card"><div className="ms-product-card__media">
  <Link href={'/product/'+product.slug} aria-label={'تفاصيل '+product.name}>{product.image?<SmartImage src={product.image} alt={product.name} sizes="(max-width: 680px) 46vw, 22vw"/>:<span className="ms-product-card__fallback"><Smartphone size={34}/></span>}</Link>
  <span className="ms-product-card__category">{product.categoryId||product.type}</span>
  <button type="button" className={'ms-product-card__wish'+(wished?' is-active':'')} onClick={()=>onWish(product.slug)} aria-label={wished?'إزالة من المفضلة':'إضافة إلى المفضلة'} aria-pressed={wished}><Heart size={17} fill={wished?'currentColor':'none'}/></button>
 </div><div className="ms-product-card__body"><Link href={'/product/'+product.slug} className="ms-product-card__name">{product.name}</Link>
  <div className="ms-product-card__footer"><span>السعر عند الاستفسار</span><Link href={'/product/'+product.slug} className="ms-product-card__open" aria-label={'تفاصيل '+product.name}>التفاصيل <ArrowLeft size={15}/></Link><button type="button" className="ms-product-card__buy" disabled={!canAdd} onClick={()=>color&&onAdd(product,color,1)}><ShoppingBag size={14}/>{canAdd?'أضف للسلة':'غير متوفر'}</button></div>
 </div></article>
}
function MustafaStoreHome({products,wishlist,onWish,onAdd}:{products:Product[];wishlist:string[];onWish:(slug:string)=>void;onAdd:(product:Product,color:Product['colors'][number],length:number)=>void}){
 const content=useSiteContent();const brand=getStoreBrand('mustafa-store');
 const heroImage=content.storyImage||content.heroSlides?.[0]||products[0]?.image||'';
 const featured=products.filter(p=>p.isFeatured).slice(0,4);
 const features=[{title:'بيع وشراء',description:'استفسر عن الأجهزة الجديدة والمستعملة',Icon:Smartphone},{title:'صيانة الهواتف',description:'تعرف على خدمات الصيانة المتاحة',Icon:Wrench},{title:'الأقساط',description:'اسأل عن الشروط وخيارات التقسيط',Icon:CreditCard}];
 return <main className="mustafa-storefront"><div className="ms-shell">
  <section className="ms-hero"><div className="ms-hero__copy">
   <span className="ms-eyebrow"><i/> مركز مصطفى ستور <b>·</b> الموصل</span><span className="ms-hero__overline">MOBILE · ACCESSORIES · SERVICE</span>
   <h1>كل ما تحتاجه لهاتفك، <em>بمكان واحد.</em></h1>
   <p>هواتف وأجهزة وإكسسوارات وخدمات صيانة، بتجربة واضحة تساعدك على استكشاف الخيارات والتواصل مع المركز لتأكيد التفاصيل.</p>
   <div className="ms-hero__actions"><Link href="/catalog" className="ms-button ms-button--primary">تصفح الأجهزة <ArrowLeft size={17}/></Link><a href={content.contactUrl||'https://www.instagram.com/m.center.iq/'} target="_blank" rel="noopener noreferrer" className="ms-button ms-button--quiet"><PhoneCall size={17}/> تواصل مع المركز</a></div>
   <div className="ms-hero__meta"><span><MapPin size={15}/> الموصل · المجموعة الثقافية</span><span><BadgeCheck size={15}/> تأكيد السعر والتوفر قبل الشراء</span></div>
  </div><figure className="ms-hero__visual">{heroImage?<img src={heroImage} alt="هاتف ذكي — صورة توضيحية" fetchPriority="high" decoding="async"/>:<div className="ms-hero__placeholder"><Smartphone size={70}/></div>}
   <div className="ms-visual__top"><span className="ms-visual__label"><i/> TECHNOLOGY, MADE CLEAR</span><span className="ms-visual__index">01 <b>/</b> 04</span></div>
   <div className="ms-visual__bottom"><span>مركز مصطفى ستور</span><strong>اختيار أوضح. تجربة أسهل.</strong></div><span className="ms-visual__orbit" aria-hidden="true"/>
  </figure></section>
  <div className="ms-service-ribbon" aria-label="خدمات المركز"><span><Smartphone size={17}/> الهواتف والأجهزة</span><i/><span><Truck size={17}/> بيع وشراء</span><i/><span><Wrench size={17}/> صيانة</span><i/><span><CreditCard size={17}/> خيارات أقساط</span></div>
  <aside className="ms-demo-note" role="note"><span className="ms-demo-note__icon">i</span><p><strong>معاينة تصميمية لمركز مصطفى ستور.</strong> الصور وأسماء المنتجات للتوضيح فقط؛ الموديلات والأسعار والتوفر تُعتمد من المركز قبل الإطلاق.</p></aside>
  <section className="ms-section ms-categories"><div className="ms-section-heading"><div><span className="ms-section-kicker">BROWSE BY CATEGORY</span><h2>تصفح حسب القسم</h2><p>وصل بسرعة إلى نوع الجهاز أو الملحق الذي تبحث عنه.</p></div><Link href="/catalog" className="ms-text-link">كل المنتجات <ArrowLeft size={16}/></Link></div>
   <div className="ms-category-grid">{brand.categories.map((category,index)=><MustafaCategoryCard key={category.id} category={category} index={index} product={products.find((p) => p.categoryId === category.id)} />)}</div>
  </section>
  <section className="ms-section ms-featured"><div className="ms-section-heading"><div><span className="ms-section-kicker">SELECTED DEVICES</span><h2>مختارات من التشكيلة</h2><p>نماذج توضيحية لطريقة عرض الأجهزة وتفاصيل كل منتج.</p></div><Link href="/catalog" className="ms-text-link">استكشف المتجر <ArrowLeft size={16}/></Link></div>
   <div className="ms-product-grid">{featured.map(product=><MustafaProductCard key={product.id} product={product} wished={wishlist.includes(product.slug)} onWish={onWish} onAdd={onAdd}/>)}</div>
  </section>
  <section className="ms-service-section"><div className="ms-service-section__intro"><span className="ms-section-kicker">MORE THAN DEVICES</span><h2>خدمات المركز، قريبة منك.</h2><p>لا تتوقف التجربة عند اختيار الهاتف؛ تواصل مع المركز للاستفسار عن البيع والشراء والصيانة وخيارات الأقساط.</p></div>
   <div className="ms-feature-list">{features.map(({title,description,Icon},index)=><div className="ms-feature" key={title}><span className="ms-feature__icon"><Icon size={20} strokeWidth={1.8}/></span><span className="ms-feature__copy"><strong>{title}</strong><small>{description}</small></span><b>0{index+1}</b></div>)}</div>
  </section>
  <section className="ms-location"><div className="ms-location__mark"><MapPin size={24}/></div><div className="ms-location__copy"><span className="ms-section-kicker">VISIT OUR CENTER</span><h2>نلتقي بك في الموصل.</h2><p>{content.location||'الموصل · المجموعة الثقافية · مقابل باب خروج محطة الوقود'}</p></div>
   <div className="ms-location__actions"><a href="https://wa.me/9647716600044" target="_blank" rel="noopener noreferrer" className="ms-button ms-button--light">تواصل عبر واتساب <ArrowLeft size={17}/></a><a href="https://www.instagram.com/m.center.iq/" target="_blank" rel="noopener noreferrer" className="ms-location__instagram">تابعنا على إنستغرام</a></div>
  </section>
 </div></main>
}

export function TenantVerticalHome({ products, wishlist, onWish, onAdd }: TenantVerticalHomeProps) {
  const content = useSiteContent()
  if (content.tenantKey === 'aalam-alqalaa') return <AalamAlqalaaHome products={products} wishlist={wishlist} onWish={onWish} onAdd={onAdd} />
  if (content.tenantKey === 'mustafa-store') return <MustafaStoreHome products={products} wishlist={wishlist} onWish={onWish} onAdd={onAdd} />
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
          <CategoryGrid brand={brand} products={products} />
        </section>

        <section className="vhome-section vhome-products-section">
          <SectionHeading
            eyebrow={variant === 'restaurant' ? 'FROM THE MENU' : variant === 'fabric' ? 'SELECTED MATERIALS' : 'FEATURED SELECTION'}
            title={variant === 'mustafa' ? 'هواتف وإكسسوارات مختارة' : variant === 'restaurant' ? 'مختارات من المنيو' : variant === 'fabric' ? 'خامات مختارة' : 'مختارات من التشكيلة'}
            description={variant === 'mustafa' ? 'نماذج لتجربة عرض الهواتف والملحقات. يُؤكد الموديل والسعر والتوفر مباشرة مع المركز.' : 'نماذج توضيحية لطريقة عرض المنتجات والصور والأسعار والتفاصيل ضمن متجر مستقل.'}
          />
          <ProductGrid products={products} wishlist={wishlist} onWish={onWish} onAdd={onAdd} unit={unit} />
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
