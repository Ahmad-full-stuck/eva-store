import { useState } from 'react'
import { ArrowLeft, BadgeCheck, ChevronDown, MessageCircle, Sparkles, Truck, Wallet } from 'lucide-react'
import { Link } from 'wouter'
import type { Category, Product, ProductColor } from '@/types'
import { guideQuestions, homeStory, trustItems } from '@/lib/fallback-data'
import { contentLines, useSiteContent } from '@/lib/site-content'
import { runDiscovery, type DiscoveryMatch } from '@/lib/discover'
import { ProductCard } from '@/components/ProductCard'
import { HeroSection } from '@/components/home/HeroSection'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { PromoBar } from '@/components/home/PromoBar'
import { SectionHeading } from '@/components/home/SectionHeading'
import { StepsSection } from '@/components/home/StepsSection'
import { SmartImage } from '@/components/ui/SmartImage'

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
  const content = useSiteContent()
  const [discoveryStep, setDiscoveryStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const newProducts = products.filter((product) => product.isNew).slice(0, 4)
  const recentProducts = newProducts.length >= 4 ? newProducts : products.filter((product) => product.isFeatured).slice(0, 4)
  const [suggestions, setSuggestions] = useState<DiscoveryMatch[]>([])
  const discoveryHref = (() => {
    const params = new URLSearchParams()
    if (answers[1] === 'نعم، مطاطي') params.set('stretch', '1')
    if (answers[1] === 'لا، غير مطاطي') params.set('stretch', '0')
    const query = params.toString()
    return `/catalog${query ? `?${query}` : ''}`
  })()

  const chooseAnswer = (answer: string) => {
    const next = [...answers.slice(0, discoveryStep), answer]
    setAnswers(next)
    if (discoveryStep < discoveryQuestions.length - 1) {
      setDiscoveryStep((step) => step + 1)
      return
    }
    setSuggestions(runDiscovery(products, {
      garment: next[0] || '',
      stretch: next[1] === 'نعم، مطاطي' ? 'yes' : next[1] === 'لا، غير مطاطي' ? 'no' : '',
      tone: next[2] || '',
      limit: 3,
    }))
  }

  return (
    <main>
      <HeroSection products={products} categories={categories} />

      <PromoBar />

      <StepsSection />

      <section className="container-eva section-block category-section" aria-label="أقسام المعرض">
        <SectionHeading eyebrow={content.categoriesEyebrow} title={content.categoriesTitle} linkLabel="عرض كل الأقمشة" linkHref="/catalog" />
        <div className="category-grid">
          {categories.map((category) => <Link key={category.id} href={`/catalog?category=${encodeURIComponent(category.id)}`} className="category-card">
            {category.image && <SmartImage src={category.image} alt="" sizes="(max-width: 640px) 46vw, 23vw" />}
            <span className="category-shade" />
            <span className="category-copy"><small>{category.description}</small><strong>{category.name}</strong><b>اكتشفي <ArrowLeft size={14} /></b></span>
          </Link>)}
        </div>
      </section>

      {recentProducts.length > 0 && (
        <section className="container-eva section-block new-section" aria-label="وصل حديثاً">
          <SectionHeading eyebrow={content.newEyebrow} title={content.newTitle} description={content.newDesc} linkLabel="شاهدي الجديد" linkHref="/catalog" />
          <div className="glass" style={{ padding: 'clamp(14px, 2.5vw, 28px)' }}>
            <div className="product-grid">{recentProducts.map((product) => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.slug)} onWish={onWish} onAdd={onAdd} />)}</div>
          </div>
        </section>
      )}

      <section className="container-eva section-block discovery-section">
        <div className="discovery-intro"><span className="eyebrow"><Sparkles size={14} />اكتشاف موجّه</span><h2>دعي القماش المناسب<br />يقترب منك.</h2><p>ثلاث خطوات صغيرة تساعدك على تضييق الخيارات قبل التصفح.</p></div>
        <div className="discovery-card">
          <div className="discovery-progress"><span>الخطوة {discoveryStep + 1} من ٣</span><div><i style={{ width: `${((discoveryStep + 1) / 3) * 100}%` }} /></div></div>
          <h3>{discoveryQuestions[discoveryStep].title}</h3>
          <div className="discovery-options">{discoveryQuestions[discoveryStep].options.map((option) => <button type="button" key={option} onClick={() => chooseAnswer(option)}>{option}<ArrowLeft size={15} /></button>)}</div>
          {discoveryStep > 0 && <button type="button" className="text-button" onClick={() => { setDiscoveryStep(0); setAnswers([]); setSuggestions([]) }}>ابدئي من جديد</button>}
          {suggestions.length > 0 && (
            <div className="discovery-result-list" role="status" aria-live="polite">
              <strong className="discovery-result-title">اقتراحاتنا لك</strong>
              {suggestions.map((match) => {
                const product = products.find((item) => item.slug === match.slug)
                if (!product) return null
                return (
                  <div className="discovery-result-item" key={match.slug}>
                    <Link href={`/product/${product.slug}`} className="discovery-result-thumb"><SmartImage src={product.image} alt="" sizes="72px" /></Link>
                    <div className="discovery-result-copy">
                      <Link href={`/product/${product.slug}`}><strong>{product.name}</strong></Link>
                      <span>{match.reasons.join(' · ') || 'خامة مطابقة لاختياراتك'}</span>
                    </div>
                    <Link href={`/product/${product.slug}`} className="button button-primary discovery-result" aria-label={`عرض ${product.name}`}>شاهدي <ArrowLeft size={15} /></Link>
                  </div>
                )
              })}
              <Link href={discoveryHref} className="underlined-link discovery-all">عرض كل الأقمشة المطابقة <ArrowLeft size={15} /></Link>
            </div>
          )}
          {!suggestions.length && discoveryStep === discoveryQuestions.length - 1 && answers.length === discoveryQuestions.length && (
            <Link href={discoveryHref} className="button button-primary discovery-result">شاهدي اقتراحاتي <ArrowLeft size={16} /></Link>
          )}
        </div>
      </section>

      <section className="guide-preview-section">
        <div className="container-eva guide-preview-grid">
          <div className="guide-preview-copy">
            <span className="eyebrow"><BadgeCheck size={14} />{content.guideEyebrow}</span>
            <h2>
              {contentLines(content.guideTitle).map((line, index) => (
                <span key={`${index}-${line}`}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </h2>
            <p>{content.guideText}</p>
            <Link href="/fabric-guide" className="button button-light">{content.guideCta} <ArrowLeft size={16} /></Link>
          </div>
          <div className="guide-faq-list glass-dark">{guideQuestions.slice(0, 4).map((item, index) => <div className={`guide-faq ${openFaq === index ? 'is-open' : ''}`} key={item.question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span>سؤال {index + 1}</span><strong>{item.question}</strong><ChevronDown size={17} /></button>{openFaq === index && <p>{item.answer}</p>}</div>)}</div>
        </div>
      </section>

      <section className="container-eva section-block story-section" aria-label="قصة العلامة">
        <div className="story-visual"><SmartImage src="products/swfmytalk/01.jpg" alt="صوف ميتالك" sizes="(max-width: 820px) 92vw, 45vw" /><span>EVA<br /><strong>FABRICS</strong></span></div>
        <div className="story-copy"><span className="eyebrow">قصة العلامة</span><h2>{homeStory.title}</h2><p>{homeStory.text}</p><p>نصمم تجربتنا لتكون قريبة منك: صور واضحة، مواصفات مفهومة، وخدمة تساعدك قبل الطلب وبعده.</p><Link href="/about" className="button button-outline">اعرفي أكثر عن إيفا <ArrowLeft size={16} /></Link></div>
      </section>

      <section className="trust-section" aria-label="ضمانات المتجر"><div className="container-eva trust-grid">{trustItems.map((item) => <div className="trust-item" key={item.title}>{item.icon === 'truck' ? <Truck /> : item.icon === 'wallet' ? <Wallet /> : item.icon === 'message' ? <MessageCircle /> : <BadgeCheck />}<strong>{item.title}</strong><span>{item.description}</span></div>)}</div></section>

      <NewsletterSection />
    </main>
  )
}
