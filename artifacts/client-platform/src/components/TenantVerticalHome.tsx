import './tenant-vertical-home.css'
import {
  ArrowLeft, ArrowUpRight, BadgeCheck, Check, Gem, Layers, Package, Palette,
  Ruler, Smartphone, Sparkles, Utensils, Watch, Wrench,
} from 'lucide-react'
import { Link } from 'wouter'
import type { Product, ProductColor } from '@/types'
import { getStoreBrand, type StoreBrand } from '@/lib/store-brand'
import { ProductCard } from '@/components/ProductCard'
import { useSiteContent } from '@/lib/site-content'

interface TenantVerticalHomeProps {
  products: Product[]
  wishlist: string[]
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, length: number) => void
}

const categoryIcons: Record<string, typeof Package> = {
  fabric: Layers, phone: Smartphone, tablet: Smartphone, audio: Package,
  accessory: Package, computer: Package, smartwatch: Watch, power: Package,
  burger: Utensils, sandwich: Utensils, food: Utensils,
  construction: Wrench, sanitary: Wrench, paint: Palette, tools: Wrench,
  dress: Gem, abaya: Gem, fashion: Gem, sculpture: Palette, decor: Gem,
  wall: Palette, custom: Sparkles, handmade: Sparkles, gift: Package,
  watch: Watch,
}

function BrandCategoryLinks({ brand, variant = 'pills' }: { brand: StoreBrand; variant?: string }) {
  return (
    <nav className={`vhome-categories vhome-categories--${variant}`} aria-label="أقسام المتجر">
      {brand.categories.map((category, index) => {
        const Icon = categoryIcons[category.icon] || Package
        return (
          <Link key={category.id} href={'/catalog?category=' + encodeURIComponent(category.id)} className="vhome-category">
            <span className="vhome-category__index">{String(index + 1).padStart(2, '0')}</span>
            <span className="vhome-category__icon"><Icon size={18} strokeWidth={1.6} /></span>
            <span className="vhome-category__copy"><strong>{category.label}</strong><small>{category.description}</small></span>
            <ArrowUpRight size={16} className="vhome-category__arrow" />
          </Link>
        )
      })}
    </nav>
  )
}

function SectionHeading({ eyebrow, title, description, href = '/catalog', action = 'عرض التشكيلة' }: {
  eyebrow: string; title: string; description: string; href?: string; action?: string
}) {
  return (
    <div className="vhome-section-heading">
      <div><span className="vhome-eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>
      <Link href={href} className="vhome-text-link">{action}<ArrowLeft size={16} /></Link>
    </div>
  )
}

function ProductShelf({ products, wishlist, onWish, onAdd, layout = 'grid', count = 4 }: TenantVerticalHomeProps & { layout?: string; count?: number }) {
  const picked = products.filter((product) => product.isFeatured)
  const items = (picked.length ? picked : products).slice(0, count)
  if (!items.length) return null
  return (
    <div className={`vhome-product-shelf vhome-product-shelf--${layout}`}>
      {items.map((product, index) => (
        <ProductCard key={product.id} product={product} wished={wishlist.includes(product.slug)}
          onWish={onWish} onAdd={onAdd} priority={index < 2} />
      ))}
    </div>
  )
}

function FeatureRibbon({ brand }: { brand: StoreBrand }) {
  return (
    <div className="vhome-feature-ribbon">
      {brand.features.slice(0, 3).map((feature, index) => (
        <div key={feature.title} className="vhome-feature">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <div><strong>{feature.title}</strong><small>{feature.description}</small></div>
          <BadgeCheck size={18} strokeWidth={1.5} />
        </div>
      ))}
    </div>
  )
}

function DemoRibbon({ shopName }: { shopName: string }) {
  return (
    <aside className="vhome-demo" role="note">
      <span className="vhome-demo__mark">i</span>
      <p><strong>معاينة تصميمية لـ {shopName}</strong> — الصور والمنتجات والأسعار أمثلة توضيحية وليست بيانات مخزون معتمدة.</p>
    </aside>
  )
}

function ContactCallout({ title, text, action = 'تواصل مع المتجر' }: { title: string; text: string; action?: string }) {
  return (
    <section className="vhome-contact">
      <div><span className="vhome-eyebrow">LET’S TALK</span><h2>{title}</h2><p>{text}</p></div>
      <Link href="/contact" className="vhome-contact__button">{action}<ArrowLeft size={16} /></Link>
    </section>
  )
}

export function TenantVerticalHome({ products, wishlist, onWish, onAdd }: TenantVerticalHomeProps) {
  const content = useSiteContent()
  const key = content.tenantKey || ''
  const brand = getStoreBrand(key)
  const image = content.storyImage || content.heroSlides?.[0] || products[0]?.image || ''
  const imageTwo = content.heroSlides?.[1] || products[1]?.image || image
  const imageThree = content.heroSlides?.[2] || products[2]?.image || imageTwo
  const shopName = content.shortName || content.shopName || brand.title
  const productProps = { products, wishlist, onWish, onAdd }

  // Each new client preview deliberately receives a different information hierarchy and page composition.
  if (key === 'hayder-taif') return (
    <main className="tenant-vertical-home vhome vhome--fabric">
      <div className="container-eva">
        <section className="fabric-masthead">
          <div className="fabric-masthead__copy">
            <span className="vhome-eyebrow">THE FABRIC ROOM · {brand.mark}</span>
            <p className="fabric-masthead__overline">خامات تُختار بعناية</p>
            <h1>{brand.title}<em>نسيج التفاصيل يبدأ من هنا</em></h1>
            <p className="fabric-masthead__desc">اكتشف الخامات بحسب الاستخدام والملمس واللون، وقارن الخيارات قبل تحديد الكمية المناسبة.</p>
            <div className="fabric-actions"><Link href="/catalog" className="vhome-primary">تصفح الأقمشة<ArrowLeft size={16}/></Link><Link href="/contact" className="vhome-secondary">اسأل عن خامة<ArrowUpRight size={16}/></Link></div>
            <div className="fabric-tags"><span><Ruler size={15}/> عرض القماش</span><span><Layers size={15}/> الملمس والنقشة</span><span><Palette size={15}/> درجات اللون</span></div>
          </div>
          <figure className="fabric-masthead__image"><img src={image} alt="خامات وأقمشة من المجموعة" /><figcaption><span>TEXTURE STUDY</span><b>01 / 03</b></figcaption></figure>
        </section>
        <div className="fabric-swatchline"><span>PALETTE NOTES</span>{['#C8B79E','#A18D75','#7C7568','#D7CFC1','#555A55','#B8A6A0'].map((color) => <i key={color} style={{ background: color }} />)}<small>ألوان الخامات تتغير حسب التوفر الفعلي</small></div>
        <section className="vhome-section fabric-catalog">
          <SectionHeading eyebrow="FABRIC LIBRARY" title="اكتشف الأقمشة حسب الاستخدام" description="أقسام واضحة تساعدك على الوصول إلى نوع القماش المناسب لمشروعك." />
          <BrandCategoryLinks brand={brand} variant="fabric" />
        </section>
        <section className="fabric-editorial"><img src={imageTwo} alt="تفاصيل نسيج القماش" /><div><span className="vhome-eyebrow">THE FEEL OF MATERIAL</span><h2>الخامة ليست لوناً فقط</h2><p>الملمس والكثافة والعرض والنقشة تفاصيل مهمة عند اختيار القماش. افتح صفحة المنتج لمراجعة المعلومات المتاحة ثم تواصل لتأكيد المواصفات.</p><Link href="/catalog" className="vhome-text-link">شاهد المكتبة<ArrowLeft size={16}/></Link></div></section>
        <section className="vhome-section"><SectionHeading eyebrow="SELECTED MATERIALS" title="خامات مختارة" description="نماذج أولية لعرض طريقة تقديم كل خامة وصورها ومواصفاتها." /><ProductShelf {...productProps} count={4}/></section>
        <ContactCallout title="تبحث عن خامة محددة؟" text="أرسل استفسارك عن اللون أو العرض أو الكمية المطلوبة مباشرة إلى المتجر." />
        <DemoRibbon shopName={shopName}/>
      </div>
    </main>
  )

  if (key === 'apple-center-amiriya') return (
    <main className="tenant-vertical-home vhome vhome--apple-center">
      <div className="container-eva">
        <section className="apple-center-hero">
          <div className="apple-center-hero__copy"><span className="vhome-eyebrow">APPLE CENTER · AMIRIYA</span><h1>اعرف جهازك<br/><strong>قبل أن تختاره</strong></h1><p>مساحة واضحة لاستعراض موديلات الآيفون والأجهزة والملحقات مع صور وتفاصيل كل خيار في صفحة مستقلة.</p><div className="fabric-actions"><Link href="/catalog" className="vhome-primary">استعرض الأجهزة<ArrowLeft size={16}/></Link><Link href="/contact" className="vhome-secondary">استفسر عن التوفر</Link></div><div className="apple-center-points"><span><Check size={15}/> الموديل والسعة</span><span><Check size={15}/> صور وتفاصيل</span><span><Check size={15}/> استفسار مباشر</span></div></div>
          <figure className="apple-center-hero__device"><img src={image} alt="جهاز من مجموعة Apple Center"/><figcaption><span>DEVICE SPOTLIGHT</span><b>APPLE CENTER</b></figcaption></figure>
        </section>
        <section className="apple-center-categories"><SectionHeading eyebrow="FIND YOUR DEVICE" title="تصفح حسب الفئة" description="انتقل مباشرة إلى نوع الجهاز أو الإكسسوار الذي تبحث عنه."/><BrandCategoryLinks brand={brand} variant="device"/></section>
        <section className="vhome-section apple-center-products"><SectionHeading eyebrow="DEVICE SELECTION" title="أجهزة ضمن المعاينة" description="أمثلة لبطاقات الأجهزة مع تفاصيل قابلة للاستبدال ببيانات المركز المعتمدة."/><ProductShelf {...productProps} count={4}/></section>
        <FeatureRibbon brand={brand}/>
        <ContactCallout title="تحتاج التأكد من جهاز معين؟" text="تواصل مع المركز لتأكيد الموديل والسعة وحالة الجهاز والتفاصيل المتاحة قبل الزيارة."/>
        <DemoRibbon shopName={shopName}/>
      </div>
    </main>
  )

  if (key === 'almass-mobile') return (
    <main className="tenant-vertical-home vhome vhome--diamond-tech">
      <div className="container-eva">
        <section className="diamond-tech-hero">
          <div className="diamond-tech-hero__top"><span>ALMASS · DIGITAL SELECTION</span><span>TECH / 01</span></div>
          <div className="diamond-tech-hero__body"><div><span className="vhome-eyebrow">THE TECHNOLOGY EDIT</span><h1>كل التقنية<br/><b>في مساحة واحدة</b></h1><p>هواتف وأجهزة وصوتيات وملحقات، مرتبة لتصل إلى ما تحتاجه دون ازدحام.</p><Link href="/catalog" className="vhome-primary">اكتشف الأقسام<ArrowUpRight size={16}/></Link></div><figure><img src={image} alt="منتج تقني من الماس ستور"/><span className="diamond-tech-orbit">◇</span></figure></div>
          <div className="diamond-tech-hero__foot"><span>CURATED FOR EVERYDAY USE</span><span>{brand.mark} · {shopName}</span></div>
        </section>
        <section className="vhome-section"><SectionHeading eyebrow="SHOP BY ECOSYSTEM" title="عالم الماس ستور" description="أربع وجهات مختلفة تجمعها تجربة تصفح واحدة منظمة."/><BrandCategoryLinks brand={brand} variant="ecosystem"/></section>
        <section className="diamond-tech-promo"><div><span className="vhome-eyebrow">A CLOSER LOOK</span><h2>التفاصيل التقنية تستحق الوضوح</h2><p>صفحة مستقلة لكل منتج لعرض الموديل والمواصفات والتوافق والمعلومات المهمة قبل الاستفسار.</p></div><img src={imageTwo} alt="تفاصيل منتج تقني"/></section>
        <section className="vhome-section"><SectionHeading eyebrow="THE ALMASS EDIT" title="مختارات تقنية" description="نماذج المنتجات المعروضة هنا لأغراض تصميم المتجر فقط."/><ProductShelf {...productProps} count={4}/></section>
        <FeatureRibbon brand={brand}/>
        <ContactCallout title="ما الجهاز الذي تبحث عنه؟" text="أرسل استفسارك إلى الماس ستور لمعرفة الخيارات والتفاصيل المتاحة."/>
        <DemoRibbon shopName={shopName}/>
      </div>
    </main>
  )

  if (key === 'alawhad-mobile') return (
    <main className="tenant-vertical-home vhome vhome--alawhad">
      <div className="container-eva">
        <section className="alawhad-intro"><div><span className="vhome-eyebrow">AL AWHAD · MOBILE DESTINATION</span><h1>اختيارك يبدأ<br/><b>من التفاصيل</b></h1><p>تصفح الهواتف والإكسسوارات والصوتيات، وافتح المنتج لمراجعة مواصفاته وصوره.</p><div className="fabric-actions"><Link href="/catalog" className="vhome-primary">كل المنتجات<ArrowLeft size={16}/></Link><Link href="/contact" className="vhome-secondary">تواصل مع الأوحد</Link></div></div><figure><img src={image} alt="هاتف من مجموعة الأوحد"/><span>01 — MOBILE</span></figure></section>
        <div className="alawhad-quickbar"><strong>تصفح سريع</strong><BrandCategoryLinks brand={brand}/></div>
        <section className="alawhad-highlight"><div><span className="vhome-eyebrow">PRODUCT SPOTLIGHT</span><h2>المواصفات قبل القرار</h2><p>تفاصيل السعة واللون والحالة والصور في مكان واحد حتى تكون المقارنة أسهل.</p><Link href="/catalog" className="vhome-text-link">انتقل إلى الكتالوج<ArrowLeft size={16}/></Link></div><img src={imageTwo} alt="تفاصيل جهاز إلكتروني"/></section>
        <section className="vhome-section"><SectionHeading eyebrow="LATEST PICKS" title="منتجات مختارة" description="هذه بطاقات عرض توضيحية ويمكن استبدالها بمنتجاتكم الفعلية."/><ProductShelf {...productProps} count={4}/></section>
        <ContactCallout title="اسأل عن الجهاز المتوفر" text="تواصل مع الأوحد لتأكيد الموديل والسعر والتوفر قبل إتمام الطلب."/>
        <DemoRibbon shopName={shopName}/>
      </div>
    </main>
  )

  if (key === 'aalam-alqalaa') return (
    <main className="tenant-vertical-home vhome vhome--citadel">
      <div className="container-eva">
        <section className="citadel-hero"><div className="citadel-hero__copy"><span className="vhome-eyebrow">AL QALAA · TECHNOLOGY HOUSE</span><h1>وجهتك<br/><b>لعالم الأجهزة</b></h1><p>من الهواتف والأجهزة اللوحية إلى الحواسيب والساعات والصوتيات والطاقة.</p><Link href="/catalog" className="vhome-primary">ادخل إلى الأقسام<ArrowUpRight size={16}/></Link><div className="citadel-index"><strong>01—05</strong><span>TECHNOLOGY DEPARTMENTS</span></div></div><figure><img src={image} alt="أجهزة من عالم القلعة"/><figcaption>THE DIGITAL HOUSE</figcaption></figure></section>
        <section className="vhome-section citadel-departments"><SectionHeading eyebrow="DEPARTMENTS" title="أقسام عالم القلعة" description="كل فئة لها مدخل واضح يساعد الزبون على استكشاف خياراتها."/><BrandCategoryLinks brand={brand} variant="departments"/></section>
        <section className="citadel-duo"><div><span className="vhome-eyebrow">DISCOVER THE DETAILS</span><h2>من جهازك اليومي إلى تجهيزاتك الذكية</h2><p>استعرض المواصفات والتوافق والصور في صفحات المنتجات، ثم تواصل للتأكد من التوفر.</p></div><img src={imageTwo} alt="مجموعة أجهزة وملحقات تقنية"/></section>
        <section className="vhome-section"><SectionHeading eyebrow="FEATURED FINDS" title="اختيارات من الأقسام" description="نماذج لعرض المنتجات من أكثر من قسم تقني."/><ProductShelf {...productProps} count={4}/></section>
        <FeatureRibbon brand={brand}/>
        <ContactCallout title="ابحث عن جهازك في عالم القلعة" text="تواصل للاستفسار عن الأجهزة والفئات والمعلومات المتاحة."/>
        <DemoRibbon shopName={shopName}/>
      </div>
    </main>
  )

  if (key === 'nineteen89-rest') return (
    <main className="tenant-vertical-home vhome vhome--restaurant">
      <div className="container-eva">
        <section className="restaurant-hero"><img src={image} alt="طبق من قائمة 1989"/><div className="restaurant-hero__veil"/><div className="restaurant-hero__copy"><span className="restaurant-stamp">19<span>89</span></span><span className="vhome-eyebrow">1989 RESTAURANT · MENU</span><h1>لقمتك المفضلة<br/><em>تبدأ من هنا</em></h1><p>تصفح البرغر والسندويشات والوجبات، وشاهد صور الأصناف وتفاصيلها.</p><Link href="/catalog" className="restaurant-order-link">استكشف المنيو<ArrowLeft size={17}/></Link></div><div className="restaurant-hero__caption">GOOD FOOD · GOOD MOMENTS</div></section>
        <section className="restaurant-menu"><SectionHeading eyebrow="THE MENU" title="ماذا تشتهي اليوم؟" description="اختر فئة من المنيو للوصول إلى الأصناف المرتبطة بها." action="كل الأصناف"/><BrandCategoryLinks brand={brand} variant="menu"/></section>
        <section className="vhome-section restaurant-items"><SectionHeading eyebrow="FROM OUR MENU" title="أصناف مختارة" description="صور توضيحية تساعد على تصور طريقة عرض المنيو الرقمي."/><ProductShelf {...productProps} count={4}/></section>
        <section className="restaurant-story"><img src={imageTwo} alt="تفاصيل وجبة من 1989"/><div><span className="vhome-eyebrow">MADE TO BE SHARED</span><h2>من أول نظرة إلى اختيارك التالي</h2><p>منيو واضح بصور كبيرة وأقسام مرتبة حتى يكتشف الزبون الأصناف بسهولة قبل التواصل مع المطعم.</p><Link href="/contact" className="vhome-text-link">تواصل مع المطعم<ArrowLeft size={16}/></Link></div></section>
        <ContactCallout title="جاهز تختار وجبتك؟" text="تواصل مع المطعم لتأكيد الأصناف المتاحة وطريقة الطلب." action="اطلب عبر التواصل"/>
        <DemoRibbon shopName={shopName}/>
      </div>
    </main>
  )

  if (key === 'alsifa-company') return (
    <main className="tenant-vertical-home vhome vhome--industrial">
      <div className="container-eva">
        <section className="industrial-hero"><div><span className="vhome-eyebrow">AL SAFA · MATERIALS & SUPPLIES</span><h1>مواد المشروع<br/><b>من مصدر واحد</b></h1><p>كتالوج منظم للمواد الإنشائية والصحية والأصباغ، مع مساحة لعرض المواصفات والمقاسات وصور المنتجات.</p><div className="fabric-actions"><Link href="/catalog" className="vhome-primary">افتح كتالوج المواد<ArrowUpRight size={16}/></Link><Link href="/contact" className="vhome-secondary">استفسار توريد</Link></div><div className="industrial-specs"><span>01 <b>مواد إنشائية</b></span><span>02 <b>مواد صحية</b></span><span>03 <b>أصباغ</b></span></div></div><figure><img src={image} alt="مواد وتجهيزات للمشاريع"/><figcaption>PROJECT MATERIALS / CATALOG</figcaption></figure></section>
        <section className="vhome-section industrial-categories"><SectionHeading eyebrow="SUPPLY CATEGORIES" title="تصفح حسب نوع المادة" description="نظّم احتياجات المشروع بالوصول إلى الفئة المناسبة مباشرة."/><BrandCategoryLinks brand={brand} variant="industrial"/></section>
        <section className="industrial-procurement"><div><span className="vhome-eyebrow">SPECIFICATION FIRST</span><h2>المقاس والمواصفة قبل الاختيار</h2><p>صفحة المنتج تتيح إبراز نوع المادة ومقاسها وخامتها وتفاصيل الاستخدام. يمكن لفريق المبيعات تأكيد المواصفات والكميات قبل تجهيز الطلب.</p><ul><li><Check size={16}/> مواصفات أوضح لكل مادة</li><li><Check size={16}/> صور للمنتج والتفاصيل</li><li><Check size={16}/> استفسار مباشر عن الكميات</li></ul></div><img src={imageTwo} alt="تفاصيل مواد وتجهيزات"/></section>
        <section className="vhome-section"><SectionHeading eyebrow="MATERIAL SPOTLIGHT" title="مواد ضمن الكتالوج" description="أمثلة عرض أولية لطريقة تقديم المواد والصور والمواصفات."/><ProductShelf {...productProps} count={4}/></section>
        <ContactCallout title="تجهز لمشروع جديد؟" text="أرسل نوع المواد والكميات المطلوبة للاستفسار عن الخيارات المتاحة." action="استفسر عن التوريد"/>
        <DemoRibbon shopName={shopName}/>
      </div>
    </main>
  )

  if (key === 'sham-couture') return (
    <main className="tenant-vertical-home vhome vhome--couture">
      <div className="container-eva">
        <section className="couture-cover"><div className="couture-cover__copy"><span className="vhome-eyebrow">SHAM COUTURE · THE EDIT</span><h1>أناقة<br/><em>تُروى بالتفاصيل</em></h1><p>تصاميم وقطع تختارها العين أولاً، ثم تكشف تفاصيل القصة والخامة والتطريز.</p><Link href="/catalog" className="couture-link">استكشفي المجموعة<ArrowUpRight size={17}/></Link><span className="couture-cover__number">COLLECTION Nº 01</span></div><figure><img src={image} alt="إطلالة من SHAM Couture"/><figcaption>THE COUTURE FRAME</figcaption></figure></section>
        <section className="couture-lookbook"><div className="couture-lookbook__heading"><span className="vhome-eyebrow">A STUDY IN SILHOUETTE</span><h2>كل إطلالة لها حكاية</h2></div><div className="couture-lookbook__images"><figure><img src={imageTwo} alt="تفاصيل مجموعة SHAM Couture"/><figcaption>01 / THE LOOK</figcaption></figure><figure><img src={imageThree} alt="تصميم آخر من المجموعة"/><figcaption>02 / THE DETAIL</figcaption></figure></div></section>
        <section className="vhome-section"><SectionHeading eyebrow="THE COLLECTION" title="اختاري إطلالتك" description="استكشفي الفساتين والعبايات والأطقم من خلال صفحات مصورة لكل تصميم."/><ProductShelf {...productProps} count={4}/></section>
        <FeatureRibbon brand={brand}/>
        <ContactCallout title="لديك مناسبة أو تصميم محدد؟" text="تواصلي للاستفسار عن الموديل والمقاس والخامة والتفاصيل المتاحة." action="تواصلي معنا"/>
        <DemoRibbon shopName={shopName}/>
      </div>
    </main>
  )

  if (key === 'fink-factory') return (
    <main className="tenant-vertical-home vhome vhome--gallery">
      <div className="container-eva">
        <section className="gallery-intro"><div><span className="vhome-eyebrow">FINK FACTORY · OBJECTS & ART</span><h1>الفن يأخذ<br/><em>مساحته الخاصة</em></h1><p>معرض رقمي للمنحوتات والقطع الفنية والأعمال الجدارية، يضع كل عمل في واجهة تليق به.</p><Link href="/catalog" className="gallery-visit">ادخل إلى المعرض<ArrowUpRight size={16}/></Link></div><div className="gallery-intro__art"><img src={image} alt="عمل فني من FINK Factory"/><span>ARTWORK / 001</span></div></section>
        <section className="gallery-departments"><SectionHeading eyebrow="THE GALLERY" title="مساحات العمل الفني" description="اختر نوع العمل أو القطعة التي تريد استكشافها."/><BrandCategoryLinks brand={brand} variant="gallery"/></section>
        <section className="gallery-wall"><div className="gallery-wall__heading"><span className="vhome-eyebrow">SELECTED WORKS</span><h2>مختارات من المعرض</h2><p>صور أولية لاستعراض التكوين والخامات والتشطيب.</p></div><div className="gallery-wall__grid">{products.slice(0,4).map((product,index)=><Link key={product.id} href={'/product/'+product.slug} className={'gallery-art gallery-art--'+index}><img src={product.image} alt={product.name}/><span>{String(index+1).padStart(2,'0')} / {product.name}</span></Link>)}</div></section>
        <section className="gallery-commission"><img src={imageTwo} alt="تفاصيل عمل فني"/><div><span className="vhome-eyebrow">MADE TO MEAN SOMETHING</span><h2>قطعة خاصة بمساحة خاصة</h2><p>يمكن تخصيص مساحة لعرض الأعمال ذات التنفيذ الخاص، مع ذكر الأبعاد والخامة ومراحل التشطيب.</p><Link href="/contact" className="vhome-text-link">استفسر عن تنفيذ خاص<ArrowLeft size={16}/></Link></div></section>
        <DemoRibbon shopName={shopName}/>
      </div>
    </main>
  )

  if (key === 'apple-store-98h') return (
    <main className="tenant-vertical-home vhome vhome--apple-studio">
      <div className="container-eva">
        <section className="apple-studio-hero"><div className="apple-studio-hero__copy"><span className="vhome-eyebrow">APPLE STORE · DEVICE STUDIO</span><h1>التقنية<br/><b>بأوضح تفاصيلها</b></h1><p>مساحة تجمع أجهزة أبل والإكسسوارات والساعات والسماعات في تجربة بسيطة وسريعة.</p><Link href="/catalog" className="apple-studio-cta">تسوق حسب الفئة<ArrowUpRight size={17}/></Link></div><figure><img src={image} alt="جهاز أبل من مركز ابل ستور"/><span>PRODUCT / SPOTLIGHT</span></figure></section>
        <div className="apple-studio-shortcuts">{brand.categories.map((category,index)=><Link key={category.id} href={'/catalog?category='+encodeURIComponent(category.id)}><span>0{index+1}</span><strong>{category.label}</strong><ArrowUpRight size={16}/></Link>)}</div>
        <section className="apple-studio-feature"><img src={imageTwo} alt="منتجات أبل وإكسسوارات"/><div><span className="vhome-eyebrow">THE DEVICE EXPERIENCE</span><h2>الجهاز المناسب يبدأ بمعلومة واضحة</h2><p>اعرف السعة والموديل واللون وحالة الجهاز من صفحة المنتج، ثم استفسر عن التوفر والمعلومات المعتمدة من المركز.</p></div></section>
        <section className="vhome-section"><SectionHeading eyebrow="APPLE SELECTION" title="أجهزة وإكسسوارات" description="نماذج عرض لأقسام الأجهزة والملحقات."/><ProductShelf {...productProps} count={4}/></section>
        <ContactCallout title="هل تبحث عن موديل معين؟" text="أرسل استفسارك إلى مركز ابل ستور للتأكد من التفاصيل والتوفر."/>
        <DemoRibbon shopName={shopName}/>
      </div>
    </main>
  )

  if (key === 'center-alsaa') return (
    <main className="tenant-vertical-home vhome vhome--timepiece">
      <div className="container-eva">
        <section className="timepiece-hero"><div className="timepiece-hero__copy"><span className="vhome-eyebrow">CENTER ALSAA · TIME & TECH</span><h1>تفاصيل<br/><em>ترافق وقتك</em></h1><p>واجهة بوتيك تعرض الساعات والأجهزة والإكسسوارات بصور كبيرة وتفاصيل سهلة الوصول.</p><Link href="/catalog" className="timepiece-cta">اكتشف التشكيلة<ArrowUpRight size={16}/></Link><div className="timepiece-note"><span>DESIGN</span><span>DETAIL</span><span>FUNCTION</span></div></div><figure><img src={image} alt="ساعة من مجموعة مركز الساعة"/><figcaption>TIMEPIECE SELECTION</figcaption></figure></section>
        <section className="timepiece-categories"><SectionHeading eyebrow="THE COLLECTION" title="اختياراتك بحسب الفئة" description="تصفح الأجهزة والإكسسوارات والساعات الذكية."/><BrandCategoryLinks brand={brand} variant="timepiece"/></section>
        <section className="timepiece-product"><img src={imageTwo} alt="تفاصيل ساعة أو إكسسوار"/><div><span className="vhome-eyebrow">AN OBJECT OF DETAIL</span><h2>التفاصيل الصغيرة تصنع الفرق</h2><p>صورة المنتج ومواصفاته وألوانه وتوافقه في صفحة واحدة، مع إمكانية الاستفسار عن المتوفر.</p><Link href="/catalog" className="vhome-text-link">تصفح المعروض<ArrowLeft size={16}/></Link></div></section>
        <section className="vhome-section"><SectionHeading eyebrow="CURATED PICKS" title="مختارات المركز" description="نماذج أولية لطريقة عرض المنتجات والتفاصيل."/><ProductShelf {...productProps} count={4}/></section>
        <DemoRibbon shopName={shopName}/>
      </div>
    </main>
  )

  if (key === 'morvo-handmade') return (
    <main className="tenant-vertical-home vhome vhome--handmade">
      <div className="container-eva">
        <section className="handmade-hero"><div className="handmade-hero__copy"><span className="vhome-eyebrow">MORVO · MADE BY HAND</span><h1>أشياء تحمل<br/><em>أثر اليد</em></h1><p>قطع يدوية وديكور وهدايا، لكل قطعة صورتها وخامتها وتفاصيلها الخاصة.</p><Link href="/catalog" className="handmade-cta">اكتشف القطع<ArrowUpRight size={16}/></Link><div className="handmade-signature">MORVO / OBJECTS WITH CHARACTER</div></div><figure><img src={image} alt="قطعة يدوية من MORVO"/><figcaption>HANDMADE OBJECT Nº 01</figcaption></figure></section>
        <section className="handmade-story"><img src={imageTwo} alt="تفاصيل صناعة يدوية"/><div><span className="vhome-eyebrow">MATERIAL · FORM · FINISH</span><h2>ليست مجرد قطعة</h2><p>من ملمس الخامة إلى اللمسة الأخيرة، مساحة لعرض تفاصيل القطعة وطريقة صنعها والأبعاد والعناية بها.</p></div></section>
        <section className="handmade-categories"><SectionHeading eyebrow="EXPLORE THE WORKSHOP" title="تصفح المجموعة" description="قطع يدوية وديكور وهدايا وطلبات خاصة في أقسام واضحة."/><BrandCategoryLinks brand={brand} variant="handmade"/></section>
        <section className="vhome-section"><SectionHeading eyebrow="THE MORVO EDIT" title="قطع تستحق أن تُرى" description="أمثلة عرض أولية لصور وتفاصيل القطع اليدوية."/><ProductShelf {...productProps} count={4}/></section>
        <ContactCallout title="لديك فكرة لقطعة خاصة؟" text="تواصل للاستفسار عن الطلبات المخصصة والخامات والتفاصيل." action="ناقش فكرتك"/>
        <DemoRibbon shopName={shopName}/>
      </div>
    </main>
  )

  return (
    <main className="tenant-vertical-home vhome vhome--default">
      <div className="container-eva">
        <section className="vhome-section"><SectionHeading eyebrow={brand.kicker} title={brand.title} description={brand.description}/><BrandCategoryLinks brand={brand}/><ProductShelf {...productProps}/></section>
        <DemoRibbon shopName={shopName}/>
      </div>
    </main>
  )
}
