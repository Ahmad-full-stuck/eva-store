import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Heart, Minus, Package, Plus, ShieldCheck, ShoppingBag, ZoomIn } from 'lucide-react'
import { Link } from 'wouter'
import type { Product, ProductColor } from '@/types'
import { availableStock, formatQuantity, formatPrice } from '@/lib/catalog'
import { ProductCard } from '@/components/ProductCard'
import { Modal } from '@/components/Modal'

interface ProductPageProps {
  slug: string
  products: Product[]
  wishlist: string[]
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, quantity: number) => void
}

export function ProductPage({ slug, products, wishlist, onWish, onAdd }: ProductPageProps) {
  const product = products.find((item) => item.slug === slug)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedColorId, setSelectedColorId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [openSection, setOpenSection] = useState('specs')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    setActiveImage(0)
    setQuantity(1)
    setSelectedColorId(product?.colors.find((color) => color.available)?.id || product?.colors[0]?.id || '')
  }, [product?.id, product?.colors])

  const selectedColor = product?.colors.find((color) => color.id === selectedColorId) || product?.colors[0]
  const maxQuantity = product && selectedColor ? availableStock(product, selectedColor) : 0
  const related = useMemo(() => product ? products.filter((item) => item.slug !== product.slug && item.categoryId === product.categoryId).slice(0, 3) : [], [product, products])
  const faqItems = product?.faqs.length ? product.faqs : [{ question: 'هل يمكن طلب أكثر من وحدة واحدة؟', answer: 'نعم، حدّد الكمية المطلوبة قبل إضافة المنتج إلى السلة.' }]

  if (!product || !selectedColor) return <ProductMissing />

  const unit = product.unit
  const gallery = [...new Set([product.image, ...product.images])]
  const increase = () => setQuantity((current) => Math.min(maxQuantity, current + 1))
  const decrease = () => setQuantity((current) => Math.max(1, current - 1))
  const add = () => onAdd(product, selectedColor, quantity)

  return <main className="container-eva product-page">
    <div className="breadcrumbs"><Link href="/">الرئيسية</Link><span>›</span><Link href="/catalog">المنتجات</Link><span>›</span><span>{product.name}</span></div>
    <div className="product-detail-layout">
      <section className="product-gallery" aria-label={`معرض صور ${product.name}`}>
        <div className="gallery-main"><img src={gallery[activeImage]} alt={`${product.name} - صورة ${activeImage + 1}`} /><div className="gallery-shade" /><button type="button" className="gallery-zoom" onClick={() => setZoomOpen(true)} aria-label="تكبير الصورة"><ZoomIn size={19} /></button><button type="button" className="gallery-arrow gallery-next" onClick={() => setActiveImage((activeImage + 1) % gallery.length)} aria-label="الصورة التالية"><ChevronLeft size={20} /></button><button type="button" className="gallery-arrow gallery-prev" onClick={() => setActiveImage((activeImage - 1 + gallery.length) % gallery.length)} aria-label="الصورة السابقة"><ChevronRight size={20} /></button></div>
        <div className="gallery-thumbs">{gallery.map((image, index) => <button type="button" key={`${image}-${index}`} className={index === activeImage ? 'is-active' : ''} onClick={() => setActiveImage(index)} aria-label={`عرض الصورة ${index + 1}`}><img src={image} alt="" /></button>)}</div>
      </section>
      <section className="product-purchase">
        <div className="product-purchase-top"><div><span className="eyebrow">{product.type}</span><h1>{product.name}</h1><p className="product-description">{product.description}</p></div><button type="button" className={`detail-wish ${wishlist.includes(product.slug) ? 'is-active' : ''}`} onClick={() => onWish(product.slug)} aria-label={wishlist.includes(product.slug) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'} aria-pressed={wishlist.includes(product.slug)}><Heart size={20} fill={wishlist.includes(product.slug) ? 'currentColor' : 'none'} /></button></div>
        <div className="price-block"><span>سعر ال{unit}</span><strong>{formatPrice(product.price)}</strong>{product.compareAtPrice && <del>{formatPrice(product.compareAtPrice)}</del>}</div>
        <div className="detail-divider" />
        <fieldset className="color-fieldset"><legend>اللون <span>{selectedColor.name}</span></legend><div className="color-options">{product.colors.map((color) => <button type="button" key={color.id} className={`color-option ${selectedColor.id === color.id ? 'is-selected' : ''} ${!color.available ? 'is-unavailable' : ''}`} style={{ backgroundColor: color.hex }} onClick={() => color.available && setSelectedColorId(color.id)} disabled={!color.available} aria-label={`${color.name}${color.available ? '' : '، غير متوفر'}`} aria-pressed={selectedColor.id === color.id} title={color.name} />)}</div></fieldset>
        <div className="detail-divider" />
        <div className="quantity-heading"><div><strong>الكمية المطلوبة</strong><small>الحد الأدنى {unit} واحد</small></div><span>{formatQuantity(product.stock, unit)} متاح</span></div>
        <div className="quantity-control"><button type="button" onClick={decrease} disabled={quantity <= 1} aria-label={`إنقاص ${unit}`}><Minus size={17} /></button><output aria-live="polite">{formatQuantity(quantity, unit)}</output><button type="button" onClick={increase} disabled={quantity >= maxQuantity} aria-label={`زيادة ${unit}`}><Plus size={17} /></button></div>
        <div className="line-total"><span>إجمالي هذا السطر</span><strong>{formatPrice(product.price * quantity)}</strong></div>
        <button type="button" className="button button-primary detail-add" onClick={add} disabled={maxQuantity <= 0}><ShoppingBag size={17} />{maxQuantity <= 0 ? 'غير متوفر حالياً' : 'أضف إلى السلة'}<ArrowLeft size={16} /></button>
        <div className="detail-perks"><div><ShieldCheck size={17} /><span>توصيل إلى كل محافظات العراق</span></div><div><Package size={17} /><span>متوفر بالمخزن للفروع والمشاريع</span></div></div>
        <div className="detail-accordions"><Accordion id="specs" title="مواصفات المنتج" open={openSection === 'specs'} onToggle={() => setOpenSection(openSection === 'specs' ? '' : 'specs')}><div className="specs-grid"><Spec label="الخامة" value={product.specs.material} /><Spec label="المقاس" value={product.specs.size} /><Spec label="الوزن" value={product.specs.weight} /><Spec label="طريقة التركيب" value={product.specs.install} /><Spec label="التشطيب" value={product.specs.finish} /><Spec label="التوفر" value={product.specs.supply} /><Spec label="الاستخدام" value={product.specs.use} /><Spec label="الحفظ" value={product.specs.care} /></div></Accordion><Accordion id="faq" title="أسئلة حول المنتج" open={openSection === 'faq'} onToggle={() => setOpenSection(openSection === 'faq' ? '' : 'faq')}><div className="product-faq-list">{faqItems.map((item, index) => <div key={item.question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index} aria-controls={`product-faq-answer-${index}`}>{item.question}<ChevronDown size={15} /></button><p id={`product-faq-answer-${index}`} hidden={openFaq !== index}>{item.answer}</p></div>)}</div></Accordion><Accordion id="shipping" title="الشحن والإرجاع" open={openSection === 'shipping'} onToggle={() => setOpenSection(openSection === 'shipping' ? '' : 'shipping')}><p className="accordion-text">نجهّز الطلبات بعد تأكيد الأسعار والكميات، ونرتب التوصيل بحسب المحافظة. لأي استفسار عن الإرجاع أو استبدال اللون تواصل معنا خلال 48 ساعة من الاستلام.</p></Accordion></div>
      </section>
    </div>
    {related.length > 0 && <section className="related-section"><div className="section-heading"><div><span className="eyebrow">اختيارات قريبة</span><h2>منتجات ذات صلة</h2></div><Link href={`/catalog?category=${encodeURIComponent(product.categoryId)}`} className="underlined-link">عرض الفئة <ArrowLeft size={15} /></Link></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} wished={wishlist.includes(item.slug)} onWish={onWish} onAdd={onAdd} />)}</div></section>}
    <div className="mobile-sticky-buy"><span><small>سعر ال{unit}</small><strong>{formatPrice(product.price)}</strong></span><button type="button" className="button button-primary" onClick={add} disabled={maxQuantity <= 0}>أضف {formatQuantity(quantity, unit)}</button></div>
    <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={`صورة ${product.name}`} className="image-modal"><button type="button" className="modal-close" onClick={() => setZoomOpen(false)} aria-label="إغلاق الصورة">×</button><img src={gallery[activeImage]} alt={`${product.name} مكبرة`} /></Modal>
  </main>
}

function Spec({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div> }
function Accordion({ id, title, open, onToggle, children }: { id: string; title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) { return <section className={`detail-accordion ${open ? 'is-open' : ''}`}><button type="button" onClick={onToggle} aria-expanded={open} aria-controls={`accordion-${id}`}><strong>{title}</strong><ChevronDown size={17} /></button>{open && <div id={`accordion-${id}`}>{children}</div>}</section> }
function ProductMissing() { return <main className="container-eva empty-state page-empty"><div className="empty-icon">404</div><h1>هذا المنتج غير موجود</h1><p>ربما تغيّر الرابط أو لم يعد معروضاً حالياً.</p><Link href="/catalog" className="button button-primary">العودة إلى المنتجات <ArrowLeft size={16} /></Link></main> }
