import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Check, ChevronDown, ChevronLeft, ChevronRight, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Zap, ZoomIn } from 'lucide-react'
import { Link } from 'wouter'
import type { Product, ProductColor } from '@/types'
import { formatMeters, formatPrice, isSoldOut, metersLabel } from '@/lib/catalog'
import { useT } from '@/lib/i18n'
import { typeLabelsEn } from '@/lib/strings/product'
import { ProductCard } from '@/components/ProductCard'
import { Modal } from '@/components/Modal'
import { SmartImage } from '@/components/ui/SmartImage'
import { prefetchImages } from '@/lib/prefetch'

interface ProductPageProps {
  slug: string
  products: Product[]
  wishlist: string[]
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, length: number) => void
}

export function ProductPage({ slug, products, wishlist, onWish, onAdd }: ProductPageProps) {
  const { t, lang } = useT()
  const product = products.find((item) => item.slug === slug)
  const [activeImage, setActiveImage] = useState(0)
  const [length, setLength] = useState(0.5)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [openSection, setOpenSection] = useState('specs')
  const [justAdded, setJustAdded] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const addBtnRef = useRef<HTMLButtonElement>(null)
  const relatedTrackRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showStickyBuy, setShowStickyBuy] = useState(false)
  const [videoNeedsUnmute, setVideoNeedsUnmute] = useState(false)

  useEffect(() => {
    setActiveImage(0)
    setLength(0.5)
    setJustAdded(false)
    setZoomOpen(false)
    setVideoNeedsUnmute(false)
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

  const gallery = product ? [...new Set([product.image, ...(product.video ? [product.video] : []), ...product.images])] : []
  const activeSrc = gallery[activeImage]
  const activeIsVideo = Boolean(product?.video) && activeSrc === product?.video

  const playVideoAudible = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    setVideoNeedsUnmute(false)
    const attempt = video.play()
    if (attempt) attempt.catch(() => {
      video.muted = true
      const fallback = video.play()
      if (fallback) fallback.then(() => setVideoNeedsUnmute(true)).catch(() => undefined)
    })
  }
  const unmuteVideo = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    setVideoNeedsUnmute(false)
    const attempt = video.play()
    if (attempt) attempt.catch(() => setVideoNeedsUnmute(true))
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (activeIsVideo) {
      if (video.paused) playVideoAudible()
    } else {
      if (!video.paused) video.pause()
      if (video.muted) video.muted = false
      setVideoNeedsUnmute(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIsVideo, product?.id])

  const soldOut = product ? isSoldOut(product) : false
  const maxLength = product ? (soldOut ? 0 : product.stockMeters > 0 ? product.stockMeters : 1000) : 0

  useEffect(() => {
    if (maxLength <= 0) return
    setLength((current) => (current > maxLength ? Math.max(0.5, Math.floor(maxLength * 2) / 2) : current))
  }, [maxLength])
  const related = useMemo(() => product ? products.filter((item) => item.slug !== product.slug && item.categoryId === product.categoryId).slice(0, 6) : [], [product, products])

  useEffect(() => {
    if (!product) return
    prefetchImages(related.map((item) => item.image))
    const next = gallery[1]
    if (next && next !== product.video) {
      prefetchImages([next.replace(/\.jpe?g$/i, '-640.webp')])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id])
  const faqItems = product?.faqs.length ? product.faqs : [{ question: t('pd.faqQ1'), answer: t('pd.faqA1') }]

  if (!product || !product.colors.length) return <ProductMissing />

  const startSwipe = (x: number, y: number) => { touchStart.current = { x, y } }
  const goTo = (index: number) => {
    const next = (index + gallery.length) % gallery.length
    setActiveImage(next)
    if (gallery[next] === product.video) playVideoAudible()
  }
  const endSwipe = (x: number, y: number) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const dx = x - start.x
    const dy = y - start.y
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return
    const step = dx < 0 ? 1 : -1
    goTo(activeImage + step)
  }
  const onGalleryKey = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') goTo(activeImage + 1)
    else if (event.key === 'ArrowRight') goTo(activeImage - 1)
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
    <div className="breadcrumbs"><Link href="/">{t('pd.breadcrumbHome')}</Link><span>›</span><Link href="/catalog">{t('pd.breadcrumbFabrics')}</Link><span>›</span><span>{product.name}</span></div>
    <div className="product-detail-layout">
      <section className="product-gallery" aria-label={t('pd.galleryAria').replace('{name}', product.name)}>
        <div
          className="gallery-main"
          tabIndex={0}
          onTouchStart={(event) => startSwipe(event.touches[0].clientX, event.touches[0].clientY)}
          onTouchEnd={(event) => endSwipe(event.changedTouches[0].clientX, event.changedTouches[0].clientY)}
          onKeyDown={onGalleryKey}
        >{product.video && (
            <video
              ref={videoRef}
              className={`gallery-video${activeIsVideo ? ' is-active' : ''}`}
              src={product.video}
              poster={product.image}
              controls={activeIsVideo}
              loop
              playsInline
              preload="metadata"
              aria-label={t('pd.videoAria').replace('{name}', product.name)}
              onPointerDown={() => { const video = videoRef.current; if (video && video.muted) unmuteVideo() }}
            />
          )}
          {activeIsVideo && videoNeedsUnmute && <button type="button" className="video-unmute" onClick={unmuteVideo}><span aria-hidden="true">🔊</span> {t('pd.unmute')}</button>}
          {!activeIsVideo && <>
              <div className="gallery-stack">
                {gallery.map((image, index) => image === product.video ? null : (
                  <div key={`${image}-${index}`} className={`gallery-layer${index === activeImage ? ' is-active' : ''}`} aria-hidden={index !== activeImage}>
                    <SmartImage className="gallery-img" src={image} alt={t('pd.photoAlt').replace('{name}', product.name).replace('{n}', String(index + 1))} sizes="(max-width: 900px) 92vw, 46vw" priority={index === activeImage} />
                  </div>
                ))}
              </div>
              <div className="gallery-shade" />
              <button type="button" className="gallery-zoom" onClick={() => setZoomOpen(true)} aria-label={t('pd.zoom')}><ZoomIn size={19} /></button>
            </>}
          <button type="button" className="gallery-arrow gallery-next" onClick={() => goTo(activeImage + 1)} aria-label={activeIsVideo ? t('pd.next') : t('pd.nextPhoto')}><ChevronLeft size={20} /></button>
          <button type="button" className="gallery-arrow gallery-prev" onClick={() => goTo(activeImage - 1)} aria-label={activeIsVideo ? t('pd.prev') : t('pd.prevPhoto')}><ChevronRight size={20} /></button>
        </div>
        <div className="gallery-thumbs">{gallery.map((image, index) => {
          const thumbIsVideo = image === product.video
          return <button type="button" key={`${image}-${index}`} className={index === activeImage ? 'is-active' : ''} onClick={() => goTo(index)} aria-label={thumbIsVideo ? t('pd.thumbVideo') : t('pd.thumbPhoto').replace('{n}', String(index + 1))}>
            {thumbIsVideo ? <><SmartImage src={product.image} alt="" sizes="72px" /><span className="thumb-play" aria-hidden="true">▶</span></> : <SmartImage src={image} alt="" sizes="72px" />}
          </button>
        })}</div>
      </section>
      <section className="product-purchase">
        <div className="product-purchase-top"><div><span className="eyebrow">{lang === 'en' ? typeLabelsEn[product.type] || product.type : product.type}</span><h1>{product.name}</h1><p className="product-description">{product.description}</p></div><button type="button" className={`detail-wish ${wishlist.includes(product.slug) ? 'is-active' : ''}`} onClick={() => onWish(product.slug)} aria-label={wishlist.includes(product.slug) ? t('pd.wishRemove') : t('pd.wishAdd')} aria-pressed={wishlist.includes(product.slug)}><Heart size={20} fill={wishlist.includes(product.slug) ? 'currentColor' : 'none'} /></button></div>
        <div className="price-block"><span>{t('pd.pricePerMeter')}</span><strong>{formatPrice(product.price)}</strong>{product.compareAtPrice && <del>{formatPrice(product.compareAtPrice)}</del>}</div>
        <div className="detail-divider" />
        <div className="quantity-heading"><div><strong>{t('pd.qtyHeading')}</strong><small>{t('pd.qtyHint')}</small></div><span>{t('pd.availability')}</span></div>
        <div className="quantity-control"><button type="button" onClick={decrease} disabled={length <= 0.5} aria-label={t('pd.decreaseHalf')}><Minus size={17} /></button><output aria-live="polite">{metersLabel(length)}</output><button type="button" onClick={increase} disabled={length >= maxLength} aria-label={t('pd.increaseHalf')}><Plus size={17} /></button></div>
        <label className="meters-input-row"><input className="meters-input" type="number" inputMode="decimal" min={0.5} max={Math.max(0.5, maxLength)} step={0.5} value={length} onChange={(event) => {
          const next = Number(event.target.value)
          if (!Number.isFinite(next)) return
          setLength(Math.min(Math.max(0.5, next), Math.max(0.5, maxLength)))
        }} aria-label={t('pd.metersInputAria')} /><em>{t('pd.unitMeters')}</em></label>
        <div className="line-total"><span>{t('pd.lineTotal').replace('{meters}', metersLabel(length)).replace('{price}', formatPrice(product.price))}</span><strong>{formatPrice(product.price * length)}</strong></div>
        <button ref={addBtnRef} type="button" className="button button-primary detail-add" onClick={add} disabled={maxLength <= 0}><ShoppingBag size={17} />{maxLength <= 0 ? t('pd.unavailable') : t('pd.addCart')}<ArrowLeft size={16} /></button>
        {justAdded && maxLength > 0 && <div className="add-confirm" role="status"><span><Check size={16} />{t('pd.addedToast').replace('{meters}', formatMeters(length)).replace('{name}', product.name)}</span><Link href="/checkout" className="button button-primary">{t('pd.checkoutNow')} <ArrowLeft size={15} /></Link></div>}
        <div className="detail-perks"><div><ShieldCheck size={17} /><span>{t('pd.perkDelivery')}</span></div><div><Zap size={17} /><span>{t('pd.perkOneBox')}</span></div></div>
        <div className="detail-accordions"><Accordion id="specs" title={t('pd.specsTitle')} open={openSection === 'specs'} onToggle={() => setOpenSection(openSection === 'specs' ? '' : 'specs')}><div className="specs-grid"><Spec label={t('pd.spec.composition')} value={product.specs.composition} /><Spec label={t('pd.spec.width')} value={product.specs.width} /><Spec label={t('pd.spec.weight')} value={product.specs.weight} /><Spec label={t('pd.spec.stretch')} value={product.specs.stretch} /><Spec label={t('pd.spec.opacity')} value={product.specs.opacity} /><Spec label={t('pd.spec.finish')} value={product.specs.finish} /><Spec label={t('pd.spec.use')} value={product.specs.use} /><Spec label={t('pd.spec.care')} value={product.specs.care} /></div></Accordion><Accordion id="faq" title={t('pd.faqTitle')} open={openSection === 'faq'} onToggle={() => setOpenSection(openSection === 'faq' ? '' : 'faq')}><div className="product-faq-list">{faqItems.map((item) => <div key={item.question}><strong>{item.question}</strong><p>{item.answer}</p></div>)}</div></Accordion><Accordion id="shipping" title={t('pd.shippingTitle')} open={openSection === 'shipping'} onToggle={() => setOpenSection(openSection === 'shipping' ? '' : 'shipping')}><p className="accordion-text">{t('pd.shippingText')}</p></Accordion></div>
      </section>
    </div>
    {related.length > 0 && <section className="related-section"><div className="section-heading"><div><span className="eyebrow">{t('pd.relatedEyebrow')}</span><h2>{t('pd.relatedTitle')}</h2></div><div className="section-heading-actions">{related.length > 3 && <div className="related-nav" aria-label={t('pd.relatedNavAria')}><button type="button" onClick={() => scrollRelated('prev')} aria-label={t('pd.relatedPrevAria')}><ChevronRight size={17} /></button><button type="button" onClick={() => scrollRelated('next')} aria-label={t('pd.relatedNextAria')}><ChevronLeft size={17} /></button></div>}<Link href={`/catalog?category=${encodeURIComponent(product.categoryId)}`} className="underlined-link">{t('pd.viewCategory')} <ArrowLeft size={15} /></Link></div></div><div className="related-track" ref={relatedTrackRef}>{related.map((item) => <ProductCard key={item.id} product={item} wished={wishlist.includes(item.slug)} onWish={onWish} onAdd={onAdd} />)}</div></section>}
    {(() => {
      const siblings = related.slice(0, 2)
      const others = products.filter((item) => item.slug !== product.slug && item.categoryId !== product.categoryId)
      const compareList = [product, ...siblings, ...others].slice(0, 4)
      if (compareList.length < 2) return null
      const allRows: { label: string; value: (item: Product) => string }[] = [
        { label: t('pd.comparePrice'), value: (item) => formatPrice(item.price) },
        { label: t('pd.spec.composition'), value: (item) => item.specs.composition },
        { label: t('pd.spec.width'), value: (item) => item.specs.width },
        { label: t('pd.spec.weight'), value: (item) => item.specs.weight },
        { label: t('pd.spec.stretch'), value: (item) => item.specs.stretch },
        { label: t('pd.spec.opacity'), value: (item) => item.specs.opacity },
        { label: t('pd.spec.finish'), value: (item) => item.specs.finish },
        { label: t('pd.spec.care'), value: (item) => item.specs.care },
      ]
      const compareRows = allRows.filter((row) => compareList.some((item) => {
        const value = row.value(item)
        return Boolean(value) && value !== 'غير محددة' && value !== 'خامة غير محددة'
      }))
      return (
        <section className="compare-section">
          <div className="section-heading"><div><span className="eyebrow">{t('pd.compareEyebrow')}</span><h2>{t('pd.compareTitle')}</h2></div></div>
          <div className="compare-scroll" tabIndex={0} role="region" aria-label={t('pd.compareTableAria')}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">{t('pd.compareSpec')}</th>
                  {compareList.map((item) => <th key={item.id} scope="col" className={item.slug === product.slug ? 'is-current' : ''}>{item.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {compareList.map((item) => {
                      const value = row.value(item)
                      const defined = Boolean(value) && value !== 'غير محددة' && value !== 'خامة غير محددة'
                      return <td key={item.id} className={item.slug === product.slug ? 'is-current' : ''}>{defined ? value : '—'}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )
    })()}
    <div className={`mobile-sticky-buy ${showStickyBuy ? 'is-visible' : ''}`}><span><small>{formatMeters(length)}</small><strong>{formatPrice(product.price * length)}</strong></span>{justAdded ? <Link href="/checkout" className="button button-primary">{t('pd.checkout')} <ArrowLeft size={15} /></Link> : <button type="button" className="button button-primary" onClick={add} disabled={maxLength <= 0}>{t('pd.addLength').replace('{meters}', formatMeters(length))}</button>}</div>
    <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={t('pd.zoomTitle').replace('{name}', product.name)} className="image-modal"><button type="button" className="modal-close" onClick={() => setZoomOpen(false)} aria-label={t('pd.closeImage')}>×</button><img src={(gallery[activeImage] === product.video ? product.image : gallery[activeImage]) || product.image} alt={t('pd.zoomAlt').replace('{name}', product.name)} decoding="async" /></Modal>
  </main>
}

function Spec({ label, value }: { label: string; value: string }) {
  if (!value || value === 'غير محددة' || value === 'خامة غير محددة') return null
  return <div><span>{label}</span><strong>{value}</strong></div>
}
function Accordion({ id, title, open, onToggle, children }: { id: string; title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) { return <section className={`detail-accordion ${open ? 'is-open' : ''}`}><button type="button" onClick={onToggle} aria-expanded={open} aria-controls={`accordion-${id}`}><strong>{title}</strong><ChevronDown size={17} /></button>{open && <div id={`accordion-${id}`}>{children}</div>}</section> }
function ProductMissing() { const { t } = useT(); return <main className="container-eva empty-state page-empty"><div className="empty-icon">404</div><h1>{t('pd.missingTitle')}</h1><p>{t('pd.missingText')}</p><Link href="/catalog" className="button button-primary">{t('pd.backToFabrics')} <ArrowLeft size={16} /></Link></main> }
