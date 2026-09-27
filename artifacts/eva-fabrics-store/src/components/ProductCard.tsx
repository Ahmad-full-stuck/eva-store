import { Heart, Plus, ShoppingBag } from 'lucide-react'
import { Link } from 'wouter'
import type { Product, ProductColor } from '@/types'
import { formatPrice } from '@/lib/catalog'

interface ProductCardProps {
  product: Product
  wished: boolean
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, quantity: number) => void
}

const cardStyles = `
.glass-card {
  border: 1px solid #E1E5E0;
  border-radius: 14px;
  background: #FFFFFF;
  box-shadow: 0 1px 2px rgba(17, 38, 31, .05), 0 10px 26px rgba(17, 38, 31, .07);
}
.glass-surface {
  border: 1px solid #E1E5E0;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: 0 1px 2px rgba(17, 38, 31, .05), 0 10px 26px rgba(17, 38, 31, .07);
}
.glass-pill {
  border: 1px solid #E1E5E0;
  border-radius: 999px;
  background: #FFFFFF;
  box-shadow: none;
}
.product-card.glass-card {
  position: relative;
  padding: 10px;
  transition: transform .35s cubic-bezier(.2, .7, .3, 1), box-shadow .35s ease, border-color .35s ease;
}
.product-card.glass-card:hover {
  transform: translateY(-6px);
  border-color: rgba(14, 107, 69, .4);
  box-shadow: 0 4px 10px rgba(17, 38, 31, .06), 0 24px 46px rgba(17, 38, 31, .13);
}
.product-card.glass-card .product-card-media {
  border-radius: 12px;
  background: #EEF1EC;
}
.product-card.glass-card .product-card-image { transition: transform .5s ease; }
.product-card.glass-card .product-card-body { padding: 13px 0 3px; }
.product-card.glass-card .badge {
  border: 1px solid rgba(255, 255, 255, .6);
  box-shadow: 0 4px 12px rgba(17, 38, 31, .18);
}
.product-card.glass-card .badge-accent { background: rgba(14, 107, 69, .92); }
.product-card.glass-card .badge-warm { background: rgba(192, 90, 17, .92); }
.product-card.glass-card .badge-muted { background: #FFFFFF; }
.product-card.glass-card .product-wish {
  background: rgba(17, 38, 31, .58);
  transition: background-color .2s ease, color .2s ease, transform .2s ease;
}
.product-card.glass-card .product-wish:hover,
.product-card.glass-card .product-wish.is-active { transform: scale(1.08); }
.product-card.glass-card .add-button { background: #FFFFFF; }
.product-card.glass-card .add-button:hover:not(:disabled) { background: #F2F7F3; }
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

injectStyles('sifa-card-styles', cardStyles)

export function ProductCard({ product, wished, onWish, onAdd }: ProductCardProps) {
  const availableColor = product.colors.find((color) => color.available && color.stock > 0)
  const soldOut = product.stock <= 0 || !availableColor
  const lowStock = !soldOut && product.stock <= 3
  const wishLabel = wished ? `إزالة ${product.name} من المفضلة` : `إضافة ${product.name} إلى المفضلة`
  const addLabel = `أضف ${product.name} إلى السلة`
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
              node.src = 'media/hero.svg'
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
          <span className="product-price">{formatPrice(product.price)}<small>/{product.unit}</small></span>
        </div>
        <div className="product-card-footer">
          <div className="swatch-list" role="list" aria-label="ألوان المنتج">
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
            onClick={() => availableColor && onAdd(product, availableColor, 1)}
            aria-label={addLabel}
          >
            {soldOut ? 'نفد المخزون' : <><ShoppingBag size={14} aria-hidden="true" /><span>أضف {product.unit}</span></>}
          </button>
        </div>
      </div>
    </article>
  )
}

export function ProductGridSkeleton() {
  return (
    <div className="product-grid" role="status" aria-busy="true" aria-label="جارٍ تحميل المنتجات">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="product-skeleton skeleton-shimmer" aria-hidden="true"><div /><span /><span /></div>
      ))}
    </div>
  )
}

export function InlineAddButton({ product, onAdd }: { product: Product; onAdd: (product: Product, color: ProductColor, quantity: number) => void }) {
  const color = product.colors.find((item) => item.available && item.stock > 0)
  return (
    <button
      type="button"
      className="icon-button"
      disabled={!color}
      onClick={() => color && onAdd(product, color, 1)}
      aria-label={`إضافة ${product.name} إلى السلة`}
    >
      <Plus size={18} aria-hidden="true" />
    </button>
  )
}
