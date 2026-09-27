import { useState } from 'react'
import { ArrowLeft, BadgeCheck, ChevronDown, Globe2, MessageCircle, Sparkles, Truck } from 'lucide-react'
import { Link } from 'wouter'
import type { Category, Product, ProductColor } from '@/types'
import { guideQuestions, homeStory, trustItems } from '@/lib/fallback-data'
import { ProductCard } from '@/components/ProductCard'
import { HeroSection } from '@/components/home/HeroSection'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { PromoBar } from '@/components/home/PromoBar'
import { SectionHeading } from '@/components/home/SectionHeading'
import { StepsSection } from '@/components/home/StepsSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'

interface HomePageProps {
  products: Product[]
  categories: Category[]
  wishlist: string[]
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, length: number) => void
}

const discoveryQuestions = [
  { title: 'ماذا ستصنعين؟', options: ['فستان يومي', 'فستان سهرة', 'عباءة أو برنوش', 'قطعة عملية'] },
  { title: 'هل تحتاجين مرونة؟', options: ['نعم، مطاطي', 'لا، غير مطاطي', 'لا يهمني'] },
  { title: 'ما اللون الأقرب لك؟', options: ['داكن', 'فاتح', 'لامع', 'محايد'] },
]

export function HomePage({ products, categories, wishlist, onWish, onAdd }: HomePageProps) {
  const [discoveryStep, setDiscoveryStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const newProducts = products.filter((product) => product.isNew).slice(0, 4)
  const recentProducts = newProducts.length >= 4 ? newProducts : products.filter((product) => product.isFeatured).slice(0, 4)
  const discoveryHref = (() => {
    const params = new URLSearchParams()
    if (answers[1] === 'نعم، مطاطي') params.set('stretch', '1')
    if (answers[1] === 'لا، غير مطاطي') params.set('stretch', '0')
    if (answers[2] === 'داكن') params.set('tone', 'dark')
    if (answers[2] === 'فاتح') params.set('tone', 'light')
    if (answers[2] === 'لامع') params.set('finish', 'gloss')
    params.set('search', answers[0] || 'قماش')
    return `/catalog?${params.toString()}`
  })()

  const chooseAnswer = (answer: string) => {
    if (discoveryStep < discoveryQuestions.length - 1) {
      setAnswers((current) => [...current.slice(0, discoveryStep), answer])
      setDiscoveryStep((step) => step + 1)
      return
    }
    setAnswers((current) => [...current.slice(0, discoveryStep), answer])
  }

  return (
    <main>
      <HeroSection products={products} categories={categories} />

      <PromoBar />

      <StepsSection />

      <section className="container-eva section-block category-section" aria-label="أقسام المعرض">
        <SectionHeading eyebrow="اختاري من البداية" title="مساحات القماش" linkLabel="عرض كل الأقمشة" linkHref="/catalog" />
        <div className="category-grid">
          {categories.map((category) => <Link key={category.id} href={`/catalog?category=${encodeURIComponent(category.id)}`} className="category-card">
            <img src={category.image} alt="" loading="lazy" />
            <span className="category-shade" />
            <span className="category-copy"><small>{category.description}</small><strong>{category.name}</strong><b>اكتشفي <ArrowLeft size={14} /></b></span>
          </Link>)}
        </div>
      </section>

      <section className="container-eva section-block new-section" aria-label="وصل حديثاً">
        <SectionHeading eyebrow="نماذج مختارة" title="وصل حديثاً" description="أحدث الخامات التي أضفناها إلى المعرض" linkLabel="كل العينات" linkHref="/catalog?sort=newest" />
        <div className="glass" style={{ padding: 'clamp(14px, 2.5vw, 28px)' }}>
          <div className="product-grid">{recentProducts.map((product) => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.slug)} onWish={onWish} onAdd={onAdd} />)}</div>
        </div>
      </section>

      <section className="container-eva section-block discovery-section">
        <div className="discovery-intro"><span className="eyebrow"><Sparkles size={14} />اكتشاف موجّه</span><h2>دعي القماش المناسب<br />يقترب منك.</h2><p>ثلاث خطوات صغيرة تساعدك على تضييق الخيارات قبل التصفح.</p></div>
        <div className="discovery-card">
          <div className="discovery-progress"><span>الخطوة {discoveryStep + 1} من ٣</span><div><i style={{ width: `${((discoveryStep + 1) / 3) * 100}%` }} /></div></div>
          <h3>{discoveryQuestions[discoveryStep].title}</h3>
          <div className="discovery-options">{discoveryQuestions[discoveryStep].options.map((option) => <button type="button" key={option} onClick={() => chooseAnswer(option)}>{option}<ArrowLeft size={15} /></button>)}</div>
          {discoveryStep > 0 && <button type="button" className="text-button" onClick={() => { setDiscoveryStep(0); setAnswers([]) }}>ابدئي من جديد</button>}
          {discoveryStep === discoveryQuestions.length - 1 && <Link href={discoveryHref} className="button button-primary discovery-result">شاهدي اقتراحاتي <ArrowLeft size={16} /></Link>}
        </div>
      </section>

      <section className="guide-preview-section">
        <div className="container-eva guide-preview-grid">
          <div className="guide-preview-copy"><span className="eyebrow"><BadgeCheck size={14} />قبل أن تختاري</span><h2>القماش قرار بصري<br />ولمسي في آن واحد.</h2><p>العينة الجيدة لا تخفي التفاصيل. قارني السماكة والمرونة واللمعة وطريقة سقوط القماش قبل أن تحددي الاستخدام.</p><Link href="/fabric-guide" className="button button-light">ابدئي دليل الأقمشة <ArrowLeft size={16} /></Link></div>
          <div className="guide-faq-list glass-dark">{guideQuestions.slice(0, 4).map((item, index) => <div className={`guide-faq ${openFaq === index ? 'is-open' : ''}`} key={item.question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span>سؤال {index + 1}</span><strong>{item.question}</strong><ChevronDown size={17} /></button>{openFaq === index && <p>{item.answer}</p>}</div>)}</div>
        </div>
      </section>

      <section className="container-eva section-block story-section" aria-label="قصة العلامة">
        <div className="story-visual"><img src="fabrics/blue.jpg" alt="تفاصيل نسيج أزرق من معرض إيفا" loading="lazy" /><span>Since<br /><strong>Eva</strong></span></div>
        <div className="story-copy"><span className="eyebrow">قصة العلامة</span><h2>{homeStory.title}</h2><p>{homeStory.text}</p><p>نصمم تجربتنا لتكون قريبة منك: صور واضحة، مواصفات مفهومة، وخدمة تساعدك قبل الطلب وبعده.</p><Link href="/about" className="button button-outline">اعرفي أكثر عن إيفا <ArrowLeft size={16} /></Link></div>
      </section>

      <section className="trust-section" aria-label="ضمانات المتجر"><div className="container-eva trust-grid">{trustItems.map((item) => <div className="trust-item" key={item.title}>{item.icon === 'truck' ? <Truck /> : item.icon === 'globe' ? <Globe2 /> : item.icon === 'message' ? <MessageCircle /> : <BadgeCheck />}<strong>{item.title}</strong><span>{item.description}</span></div>)}</div></section>

      <TestimonialsSection />

      <NewsletterSection />
    </main>
  )
}
