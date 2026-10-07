import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Check, ChevronDown, ChevronLeft, ChevronRight, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Zap, ZoomIn } from 'lucide-react'
import { Link } from 'wouter'
import type { Product, ProductColor } from '@/types'
import { formatMeters, formatPrice, isSoldOut, metersLabel } from '@/lib/catalog'
import { ProductCard } from '@/components/ProductCard'
import { Modal } from '@/components/Modal'
import { SmartImage } from '@/components/ui/SmartImage'

interface ProductPageProps {
  slug: string
  products: Product[]
  wishlist: string[]
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, length: number) => void
}

export function ProductPage({ slug, products, wishlist, onWish, onAdd }: ProductPageProps) {
  const product = products.find((item) => item.slug === slug)
  const [activeImage, setActiveImage] = useState(0)
  const [length, setLength] = useState(0.5)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [openSection, setOpenSection] = useState('specs')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [justAdded, setJustAdded] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const addBtnRef = useRef<HTMLButtonElement>(null)
  const relatedTrackRef = useRef<HTMLDivElement>(null)
  const [showStickyBuy, setShowStickyBuy] = useState(false)

  useEffect(() => {
    setActiveImage(0)
    setLength(0.5)
    setJustAdded(false)
    setZoomOpen(false)
  }, [product?.id])

  useEffect(() => {
    const button = addBtnRef.current
    if (!button || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => {
      setShowStickyBuy(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    }, { threshold: 0 })
    observer.observe(button)
    return () => observer.disconnect()
  }, [product?.id])

  const soldOut = product ? isSoldOut(product) : false
  const maxLength = product ? (soldOut ? 0 : product.stockMeters > 0 ? product.stockMeters : 1000) : 0

  useEffect(() => {
    if (maxLength <= 0) return
    setLength((current) => (current > maxLength ? Math.max(0.5, Math.floor(maxLength * 2) / 2) : current))
  }, [maxLength])
  const related = useMemo(() => product ? products.filter((item) => item.slug !== product.slug && item.categoryId === product.categoryId).slice(0, 6) : [], [product, products])
  const faqItems = product?.faqs.length ? product.faqs : [{ question: 'هل يمكن طلب أكثر من نصف متر؟', answer: 'يمكن طلب الأقمشة بنصف متر كحد أدنى.' }]

  if (!product || !product.colors.length) return <ProductMissing />

  const gallery = [...new Set([product.image, ...(product.video ? [product.video] : []), ...product.images])]
  const activeSrc = gallery[activeImage]
  const activeIsVideo = activeSrc === product.video
  const startSwipe = (x: number, y: number) => { touchStart.current = { x, y } }
  const endSwipe = (x: number, y: number) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const dx = x - start.x
    const dy = y - start.y
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return
    const step = dx < 0 ? 1 : -1
    setActiveImage((current) => (current + step + gallery.length) % gallery.length)
  }
  const onGalleryKey = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') setActiveImage((current) => (current + 1) % gallery.length)
    else if (event.key === 'ArrowRight') setActiveImage((current) => (current - 1 + gallery.length) % gallery.length)
    else return
    event.preventDefault()
  }
  const increase = () => setLength((current) => Math.min(maxLength, Math.round((current + 0.5) * 10) / 10))
  const decrease = () => setLength((current) => Math.max(0.5, Math.round((current - 0.5) * 10) / 10))
  const add = () => {
    onAdd(product, product.colors[0], length)
    setJustAdded(true)
  }
  const scrollRelated = (direction: 'next' | 'prev') => {
    const track = relatedTrackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('.product-card')
    const step = card ? card.offsetWidth + 14 : Math.round(track.clientWidth * 0.8)
    track.scrollBy({ left: (direction === 'next' ? -step : step), behavior: 'smooth' })
  }

  return <main className="container-eva product-page">
    <div className="breadcrumbs"><Link href="/">الرئيسية</Link><span>›</span><Link href="/catalog">الأقمشة</Link><span>›</span><span>{product.name}</span></div>
    <div className="product-detail-layout">
      <section className="product-gallery" aria-label={`معرض صور ${product.name}`}>
        <div
          className="gallery-main"
          tabIndex={0}
          onTouchStart={(event) => startSwipe(event.touches[0].clientX, event.touches[0].clientY)}
          onTouchEnd={(event) => endSwipe(event.changedTouches[0].clientX, event.changedTouches[0].clientY)}
          onKeyDown={onGalleryKey}
        >{activeIsVideo
          ? <video className="gallery-video" src={activeSrc} poster={product.image} controls autoPlay muted loop playsInline aria-label={`${product.name} — فيديو`} />
          : <>
              <div className="gallery-stack">
                {gallery.map((image, index) => image === product.video ? null : (
                  <div key={`${image}-${index}`} className={`gallery-layer${index === activeImage ? ' is-active' : ''}`} aria-hidden={index !== activeImage}>
                    <SmartImage className="gallery-img" src={image} alt={`${product.name} - صورة ${index + 1}`} sizes="(max-width: 900px) 92vw, 46vw" priority />
                  </div>
                ))}
              </div>
              <div className="gallery-shade" />
              <button type="button" className="gallery-zoom" onClick={() => setZoomOpen(true)} aria-label="تكبير الصورة"><ZoomIn size={19} /></button>
            </>}
          <button type="button" className="gallery-arrow gallery-next" onClick={() => setActiveImage((activeImage + 1) % gallery.length)} aria-label={activeIsVideo ? 'التالي' : 'الصورة التالية'}><ChevronLeft size={20} /></button>
          <button type="button" className="gallery-arrow gallery-prev" onClick={() => setActiveImage((activeImage - 1 + gallery.length) % gallery.length)} aria-label={activeIsVideo ? 'السابق' : 'الصورة السابقة'}><ChevronRight size={20} /></button>
        </div>
        <div className="gallery-thumbs">{gallery.map((image, index) => {
          const thumbIsVideo = image === product.video
          return <button type="button" key={`${image}-${index}`} className={index === activeImage ? 'is-active' : ''} onClick={() => setActiveImage(index)} aria-label={thumbIsVideo ? 'عرض الفيديو' : `عرض الصورة ${index + 1}`}>
            {thumbIsVideo ? <><SmartImage src={product.image} alt="" sizes="72px" intrinsicWidth={320} /><span className="thumb-play" aria-hidden="true">▶</span></> : <SmartImage src={image} alt="" sizes="72px" intrinsicWidth={320} />}
          </button>
        })}</div>
      </section>
      <section className="product-purchase">
        <div className="product-purchase-top"><div><span className="eyebrow">{product.type}</span><h1>{product.name}</h1><p className="product-description">{product.description}</p></div><button type="button" className={`detail-wish ${wishlist.includes(product.slug) ? 'is-active' : ''}`} onClick={() => onWish(product.slug)} aria-label={wishlist.includes(product.slug) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'} aria-pressed={wishlist.includes(product.slug)}><Heart size={20} fill={wishlist.includes(product.slug) ? 'currentColor' : 'none'} /></button></div>
        <div className="price-block"><span>السعر للمتر الواحد</span><strong>{formatPrice(product.price)}</strong>{product.compareAtPrice && <del>{formatPrice(product.compareAtPrice)}</del>}</div>
        <div className="detail-divider" />
        <div className="quantity-heading"><div><strong>الكمية المطلوبة</strong><small>يمكن الطلب بنصف متر كحد أدنى</small></div><span>التوفّر يُؤكَّد عند الطلب</span></div>
        <div className="quantity-control"><button type="button" onClick={decrease} disabled={length <= 0.5} aria-label="إنقاص نصف متر"><Minus size={17} /></button><output aria-live="polite">{metersLabel(length)}</output><button type="button" onClick={increase} disabled={length >= maxLength} aria-label="زيادة نصف متر"><Plus size={17} /></button></div>
        <label className="meters-input-row"><span>كم متر تريدين؟</span><input className="meters-input" type="number" inputMode="decimal" min={0.5} max={Math.max(0.5, maxLength)} step={0.5} value={length} onChange={(event) => {
          const next = Number(event.target.value)
          if (!Number.isFinite(next)) return
          setLength(Math.min(Math.max(0.5, next), Math.max(0.5, maxLength)))
        }} aria-label="إدخال عدد الأمتار مباشرة" /><em>متر</em></label>
        <div className="line-total"><span>الإجمالي — {metersLabel(length)} × {formatPrice(product.price)} للمتر</span><strong>{formatPrice(product.price * length)}</strong></div>
        <button ref={addBtnRef} type="button" className="button button-primary detail-add" onClick={add} disabled={maxLength <= 0}><ShoppingBag size={17} />{maxLength <= 0 ? 'غير متوفر حالياً' : 'أضيفي إلى السلة'}<ArrowLeft size={16} /></button>
        {justAdded && maxLength > 0 && <div className="add-confirm" role="status"><span><Check size={16} />أضيف {formatMeters(length)} من {product.name} إلى السلة</span><Link href="/checkout" className="button button-primary">إتمام الطلب الآن <ArrowLeft size={15} /></Link></div>}
        <div className="detail-perks"><div><ShieldCheck size={17} /><span>توصيل آمن للعراق</span></div><div><Zap size={17} /><span>الطلب بمربع واحد</span></div></div>
        <div className="detail-accordions"><Accordion id="specs" title="مواصفات القماش" open={openSection === 'specs'} onToggle={() => setOpenSection(openSection === 'specs' ? '' : 'specs')}><div className="specs-grid"><Spec label="الخامة" value={product.specs.composition} /><Spec label="العرض" value={product.specs.width} /><Spec label="السماكة" value={product.specs.weight} /><Spec label="التمدد" value={product.specs.stretch} /><Spec label="الشفافية" value={product.specs.opacity} /><Spec label="التشطيب" value={product.specs.finish} /><Spec label="الاستخدام" value={product.specs.use} /><Spec label="العناية" value={product.specs.care} /></div></Accordion><Accordion id="faq" title="أسئلة حول الخامة" open={openSection === 'faq'} onToggle={() => setOpenSection(openSection === 'faq' ? '' : 'faq')}><div className="product-faq-list">{faqItems.map((item, index) => <div key={item.question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}>{item.question}<ChevronDown size={15} /></button>{openFaq === index && <p>{item.answer}</p>}</div>)}</div></Accordion><Accordion id="shipping" title="الشحن والإرجاع" open={openSection === 'shipping'} onToggle={() => setOpenSection(openSection === 'shipping' ? '' : 'shipping')}><p className="accordion-text">نجهز الطلبات بعد التأكيد، ونرتب الشحن بحسب المحافظة. لأي استفسار عن الإرجاع أو تبديل اللون راسلنا عبر البريد الإلكتروني بعد الاستلام.</p></Accordion></div>
      </section>
    </div>
    {related.length > 0 && <section className="related-section"><div className="section-heading"><div><span className="eyebrow">اختيارات قريبة</span><h2>أقمشة ذات صلة</h2></div><div className="section-heading-actions">{related.length > 3 && <div className="related-nav" aria-label="تصفّح الأقمشة ذات الصلة"><button type="button" onClick={() => scrollRelated('prev')} aria-label="عرض الأقمشة السابقة"><ChevronRight size={17} /></button><button type="button" onClick={() => scrollRelated('next')} aria-label="عرض الأقمشة التالية"><ChevronLeft size={17} /></button></div>}<Link href={`/catalog?category=${encodeURIComponent(product.categoryId)}`} className="underlined-link">عرض الفئة <ArrowLeft size={15} /></Link></div></div><div className="related-track" ref={relatedTrackRef}>{related.map((item) => <ProductCard key={item.id} product={item} wished={wishlist.includes(item.slug)} onWish={onWish} onAdd={onAdd} />)}</div></section>}
    {(() => {
      const siblings = related.slice(0, 2)
      const others = products.filter((item) => item.slug !== product.slug && item.categoryId !== product.categoryId)
      const compareList = [product, ...siblings, ...others].slice(0, 4)
      if (compareList.length < 2) return null
      const compareRows: { label: string; value: (item: Product) => string }[] = [
        { label: 'السعر / م', value: (item) => formatPrice(item.price) },
        { label: 'الخامة', value: (item) => item.specs.composition },
        { label: 'العرض', value: (item) => item.specs.width },
        { label: 'السماكة', value: (item) => item.specs.weight },
        { label: 'التمدد', value: (item) => item.specs.stretch },
        { label: 'الشفافية', value: (item) => item.specs.opacity },
        { label: 'التشطيب', value: (item) => item.specs.finish },
        { label: 'العناية', value: (item) => item.specs.care },
      ]
      return (
        <section className="compare-section">
          <div className="section-heading"><div><span className="eyebrow">مقارنة سريعة</span><h2>قارني هذه الخامة</h2></div></div>
          <div className="compare-scroll" tabIndex={0} role="region" aria-label="جدول مقارنة الأقمشة">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">المواصفة</th>
                  {compareList.map((item) => <th key={item.id} scope="col" className={item.slug === product.slug ? 'is-current' : ''}>{item.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {compareList.map((item) => <td key={item.id} className={item.slug === product.slug ? 'is-current' : ''}>{row.value(item)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )
    })()}
    <div className={`mobile-sticky-buy ${showStickyBuy ? 'is-visible' : ''}`}><span><small>{formatMeters(length)}</small><strong>{formatPrice(product.price * length)}</strong></span>{justAdded ? <Link href="/checkout" className="button button-primary">إتمام الطلب <ArrowLeft size={15} /></Link> : <button type="button" className="button button-primary" onClick={add} disabled={maxLength <= 0}>أضيفي {formatMeters(length)}</button>}</div>
    <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={`صورة ${product.name}`} className="image-modal"><button type="button" className="modal-close" onClick={() => setZoomOpen(false)} aria-label="إغلاق الصورة">×</button><SmartImage src={gallery[activeImage]} alt={`${product.name} مكبرة`} sizes="92vw" priority /></Modal>
  </main>
}

function Spec({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div> }
function Accordion({ id, title, open, onToggle, children }: { id: string; title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) { return <section className={`detail-accordion ${open ? 'is-open' : ''}`}><button type="button" onClick={onToggle} aria-expanded={open} aria-controls={`accordion-${id}`}><strong>{title}</strong><ChevronDown size={17} /></button>{open && <div id={`accordion-${id}`}>{children}</div>}</section> }
function ProductMissing() { return <main className="container-eva empty-state page-empty"><div className="empty-icon">404</div><h1>هذه العينة غير موجودة</h1><p>ربما تغير الرابط أو لم تعد القطعة معروضة.</p><Link href="/catalog" className="button button-primary">العودة إلى الأقمشة <ArrowLeft size={16} /></Link></main> }
