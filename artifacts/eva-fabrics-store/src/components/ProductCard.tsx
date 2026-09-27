import { Heart, Plus, ShoppingBag } from 'lucide-react'
import { Link } from 'wouter'
import type { Product, ProductColor } from '@/types'
import { formatPrice } from '@/lib/catalog'

interface ProductCardProps {
  product: Product
  wished: boolean
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, length: number) => void
}

const glassStyles = `
.glass-card {
  border: 1px solid rgba(255, 255, 255, .75);
  border-radius: 20px;
  background: linear-gradient(155deg, rgba(255, 255, 255, .8), rgba(255, 250, 245, .46));
  box-shadow: 0 14px 34px rgba(70, 45, 35, .1);
  backdrop-filter: blur(16px) saturate(1.15);
  -webkit-backdrop-filter: blur(16px) saturate(1.15);
}
.glass-surface {
  border: 1px solid rgba(255, 255, 255, .8);
  border-radius: 22px;
  background: linear-gradient(150deg, rgba(255, 255, 255, .78), rgba(255, 250, 245, .44));
  box-shadow: 0 16px 38px rgba(70, 45, 35, .1);
  backdrop-filter: blur(18px) saturate(1.12);
  -webkit-backdrop-filter: blur(18px) saturate(1.12);
}
.glass-pill {
  border: 1px solid rgba(255, 255, 255, .85);
  border-radius: 999px;
  background: linear-gradient(140deg, rgba(255, 255, 255, .85), rgba(255, 250, 245, .55));
  box-shadow: 0 8px 22px rgba(70, 45, 35, .08);
  backdrop-filter: blur(14px) saturate(1.1);
  -webkit-backdrop-filter: blur(14px) saturate(1.1);
}
.product-card.glass-card {
  position: relative;
  padding: 10px;
  transition: transform .35s cubic-bezier(.2, .7, .3, 1), box-shadow .35s ease, border-color .35s ease;
}
.product-card.glass-card:hover {
  transform: translateY(-6px);
  border-color: rgba(183, 44, 111, .38);
  box-shadow: 0 26px 48px rgba(183, 44, 111, .18);
}
.product-card.glass-card .product-card-media {
  border-radius: 12px;
  background: linear-gradient(160deg, rgba(232, 220, 211, .92), rgba(248, 243, 237, .75));
}
.product-card.glass-card .product-card-image { transition: transform .5s ease; }
.product-card.glass-card .product-card-body { padding: 13px 0 3px; }
.product-card.glass-card .badge {
  border: 1px solid rgba(255, 255, 255, .5);
  box-shadow: 0 4px 12px rgba(40, 26, 26, .18);
  backdrop-filter: blur(9px);
  -webkit-backdrop-filter: blur(9px);
}
.product-card.glass-card .badge-accent { background: rgba(183, 44, 111, .85); }
.product-card.glass-card .badge-warm { background: rgba(217, 121, 67, .88); }
.product-card.glass-card .badge-muted { background: rgba(255, 252, 249, .88); }
.product-card.glass-card .product-wish {
  background: rgba(44, 30, 30, .34);
  transition: background-color .2s ease, color .2s ease, transform .2s ease;
}
.product-card.glass-card .product-wish:hover,
.product-card.glass-card .product-wish.is-active { transform: scale(1.08); }
.product-card.glass-card .add-button {
  background: rgba(255, 255, 255, .74);
  backdrop-filter: blur(9px);
  -webkit-backdrop-filter: blur(9px);
}
.product-card.glass-card .add-button:hover:not(:disabled) { background: #fff; }
.skeleton-shimmer { position: relative; }
.skeleton-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(100deg, rgba(255, 255, 255, 0) 28%, rgba(255, 255, 255, .72) 50%, rgba(255, 255, 255, 0) 72%);
  background-size: 220% 100%;
  animation: skeleton-shimmer 1.5s linear infinite;
}
@keyframes skeleton-shimmer { from { background-position: 140% 0; } to { background-position: -140% 0; } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
  .product-card.glass-card:hover,
  .product-card:hover .product-card-image,
  .product-card.glass-card .product-wish:hover,
  .chip:hover,
  .chip.chip-active:hover,
  .button:hover { transform: none !important; }
}
`

const injectStyles = (id: string, css: string) => {
  if (typeof document === 'undefined' || document.getElementById(id)) return
  const node = document.createElement('style')
  node.id = id
  node.textContent = css
  document.head.appendChild(node)
}

injectStyles('eva-glass-styles', glassStyles)

export function ProductCard({ product, wished, onWish, onAdd }: ProductCardProps) {
  const availableColor = product.colors.find((color) => color.available && color.stockMeters > 0)
  const soldOut = product.stockMeters <= 0 || !availableColor
  const lowStock = !soldOut && product.stockMeters <= 3
  const wishLabel = wished ? `إزالة ${product.name} من المفضلة` : `إضافة ${product.name} إلى المفضلة`
  const addLabel = `أضيفي نصف متر من ${product.name} إلى السلة`
  const detailPath = `/product/${product.slug}`

  return (
    <article className="product-card glass-card">
      <div className="product-card-media">
        <Link href={detailPath} className="product-card-image-link" aria-label={`عرض تفاصيل ${product.name}`}>
          <img
            src={product.image}
            alt={product.name}
            className="product-card-image"
            width={640}
            height={762}
            loading="lazy"
            decoding="async"
            onError={(event) => {
              const node = event.currentTarget
              if (node.dataset.fallback === '1') return
              node.dataset.fallback = '1'
              node.src = 'fabrics/hero.jpg'
            }}
          />
        </Link>
        <div className="product-card-badges">
          {product.isNew && <span className="badge badge-accent">جديد</span>}
          {lowStock && <span className="badge badge-warm">كمية محدودة</span>}
          {soldOut && <span className="badge badge-muted">غير متوفر</span>}
        </div>
        <button
          type="button"
          className={`product-wish ${wished ? 'is-active' : ''}`}
          onClick={() => onWish(product.slug)}
          aria-label={wishLabel}
          aria-pressed={wished}
          title={wishLabel}
        >
          <Heart size={17} fill={wished ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>
      <div className="product-card-body">
        <div className="product-card-heading">
          <div>
            <p className="product-type">{product.type}</p>
            <Link href={detailPath} className="product-name">{product.name}</Link>
          </div>
          <span className="product-price">{formatPrice(product.price)}<small>/م</small></span>
        </div>
        <div className="product-card-footer">
          <div className="swatch-list" role="list" aria-label="ألوان الخامة">
            {product.colors.slice(0, 5).map((color) => (
              <span
                key={color.id}
                role="listitem"
                className={`mini-swatch ${color.available ? '' : 'is-muted'}`}
                style={{ backgroundColor: color.hex }}
                title={color.available ? `${color.name} متاح` : `${color.name} غير متاح`}
                aria-label={color.name}
              />
            ))}
          </div>
          <button
            type="button"
            className="add-button"
            disabled={soldOut}
            onClick={() => availableColor && onAdd(product, availableColor, 0.5)}
            aria-label={addLabel}
          >
            {soldOut ? 'نفد المخزون' : <><ShoppingBag size={14} aria-hidden="true" /><span>أضيفي ٠٫٥ م</span></>}
          </button>
        </div>
      </div>
    </article>
  )
}

export function ProductGridSkeleton() {
  return (
    <div className="product-grid" role="status" aria-busy="true" aria-label="جارٍ تحميل الأقمشة">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="product-skeleton skeleton-shimmer" aria-hidden="true"><div /><span /><span /></div>
      ))}
    </div>
  )
}

export function InlineAddButton({ product, onAdd }: { product: Product; onAdd: (product: Product, color: ProductColor, length: number) => void }) {
  const color = product.colors.find((item) => item.available && item.stockMeters > 0)
  return (
    <button
      type="button"
      className="icon-button"
      disabled={!color}
      onClick={() => color && onAdd(product, color, 0.5)}
      aria-label={`إضافة ${product.name} إلى السلة`}
    >
      <Plus size={18} aria-hidden="true" />
    </button>
  )
}
