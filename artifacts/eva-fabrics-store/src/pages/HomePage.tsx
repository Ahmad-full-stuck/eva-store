import { useState } from 'react'
import { ArrowLeft, BadgeCheck, ChevronDown, MessageCircle, Truck, Wallet } from 'lucide-react'
import { Link } from 'wouter'
import type { Category, Product, ProductColor } from '@/types'
import { guideQuestions, homeStory, trustItems } from '@/lib/fallback-data'
import { contentLines, useSiteContent, sectionVisible } from '@/lib/site-content'
import { useT } from '@/lib/i18n'
import { guideQuestionsEn, homeStoryEn, trustItemsEn } from '@/lib/strings/header'
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

export function HomePage({ products, categories, wishlist, onWish, onAdd }: HomePageProps) {
  const { lang, t } = useT()
  const content = useSiteContent()
  const story = lang === 'en' ? homeStoryEn : homeStory
  const trustSource: readonly { title: string; description: string; icon: string }[] = lang === 'en' ? trustItemsEn : trustItems
  const faqSource: { question: string; answer: string }[] = lang === 'en' ? guideQuestionsEn : guideQuestions
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const newProducts = products.filter((product) => product.isNew).slice(0, 4)
  const recentProducts = newProducts.length >= 4 ? newProducts : products.filter((product) => product.isFeatured).slice(0, 4)
  return (
    <main>
      {sectionVisible(content, 'hero') && <HeroSection products={products} categories={categories} />}

      {sectionVisible(content, 'promo') && <PromoBar />}

      {sectionVisible(content, 'steps') && <StepsSection />}

      {sectionVisible(content, 'categories') && (
        <section className="container-eva section-block category-section" aria-label={t('home.categoriesAria')}>
          <SectionHeading eyebrow={content.categoriesEyebrow} title={content.categoriesTitle} linkLabel={t('home.showAllDevices')} linkHref="/catalog" />
          <div className="category-grid">
            {categories.map((category) => {
              const image = category.image
              return (
                <Link key={category.id} href={`/catalog?category=${encodeURIComponent(category.id)}`} className="category-card">
                  {image && <SmartImage src={image} alt="" sizes="(max-width: 640px) 46vw, 23vw"  />}
                  <span className="category-shade" />
                  <span className="category-copy"><small>{category.description}</small><strong>{category.name}</strong><b>{t('home.discover')} <ArrowLeft size={14} /></b></span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {sectionVisible(content, 'newArrivals') && recentProducts.length > 0 && (
        <section className="container-eva section-block new-section" aria-label={t('home.newAria')}>
          <SectionHeading eyebrow={content.newEyebrow} title={content.newTitle} description={content.newDesc} linkLabel={t('home.seeNew')} linkHref="/catalog" />
          <div className="glass" style={{ padding: 'clamp(14px, 2.5vw, 28px)' }}>
            <div className="product-grid">{recentProducts.map((product) => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.slug)} onWish={onWish} onAdd={onAdd} />)}</div>
          </div>
        </section>
      )}

      {sectionVisible(content, 'guide') && (
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
            <Link href="/device-guide" className="button button-light">{content.guideCta} <ArrowLeft size={16} /></Link>
          </div>
          <div className="guide-faq-list glass-dark">{faqSource.slice(0, 4).map((item, index) => <div className={`guide-faq ${openFaq === index ? 'is-open' : ''}`} key={item.question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span>{t('home.faq.questionNumber').replace('{n}', String(index + 1))}</span><strong>{item.question}</strong><ChevronDown size={17} /></button>{openFaq === index && <p>{item.answer}</p>}</div>)}</div>
        </div>
      </section>
      )}

      {sectionVisible(content, 'story') && (
      <section className="container-eva section-block story-section" aria-label={t('home.storyEyebrow')}>
        <div className="story-visual"><SmartImage src="/lamha-camera.svg" alt={t('home.storyImageAlt')} sizes="(max-width: 820px) 92vw, 45vw" /><span>LAMHA<br /><strong>SMART SECURITY</strong></span></div>
        <div className="story-copy"><span className="eyebrow">{t('home.storyEyebrow')}</span><h2>{story.title}</h2><p>{story.text}</p><p>{t('home.storyText2')}</p><Link href="/about" className="button button-outline">{t('home.storyCta')} <ArrowLeft size={16} /></Link></div>
      </section>
      )}

      {sectionVisible(content, 'trust') && (
      <section className="trust-section" aria-label={t('home.trustAria')}><div className="container-eva trust-grid">{trustSource.map((item) => <div className="trust-item" key={item.title}>{item.icon === 'truck' ? <Truck /> : item.icon === 'wallet' ? <Wallet /> : item.icon === 'message' ? <MessageCircle /> : <BadgeCheck />}<strong>{item.title}</strong><span>{item.description}</span></div>)}</div></section>
      )}

      {sectionVisible(content, 'newsletter') && <NewsletterSection />}
    </main>
  )
}
