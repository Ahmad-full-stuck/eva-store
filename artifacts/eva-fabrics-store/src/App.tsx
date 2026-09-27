import { useEffect, useState, type MouseEvent } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { Link } from 'wouter'
import { ArrowLeft, Check, ShoppingBag } from 'lucide-react'
import type { CartItem, Product, ProductColor } from '@/types'
import { useStoreData } from '@/hooks/use-store-data'
import { addCartItem, getStoredCart, getStoredWishlist, reconcileCart, removeCartItem, setStoredCart, setStoredWishlist, updateCartItem } from '@/lib/storage'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { HomePage } from '@/pages/HomePage'
import { CatalogPage } from '@/pages/CatalogPage'
import { ProductPage } from '@/pages/ProductPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { StatsPage } from '@/pages/StatsPage'
import { AboutPage, ContactPage, FabricGuidePage, OrderConfirmationPage, OrderTrackingPage, PoliciesPage } from '@/pages/InfoPages'
import NotFound from '@/pages/not-found'

const shellStyles = `
.skip-link { position: fixed; top: 14px; right: 14px; z-index: 140; display: inline-flex; align-items: center; gap: 8px; padding: 11px 18px; color: #fff8f1; background: var(--eva-rose); border: 1px solid rgba(255, 255, 255, .4); border-radius: 999px; box-shadow: var(--eva-shadow-small); backdrop-filter: blur(10px); font-size: 12px; font-weight: 600; transform: translateY(-190%); transition: transform .2s ease; }
.skip-link:focus { transform: translateY(0); }
.app-shell { overflow: clip; }
.app-main { scroll-margin-top: 116px; }
.footer-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px 34px; padding-top: 46px; }
.footer-top p { margin-top: 0; }
.footer-top .social-links { margin-top: 0; }
.footer-col { display: flex; flex-direction: column; align-items: flex-start; }
.mobile-nav a.is-active { color: var(--eva-rose); font-weight: 600; }
.bottom-nav .bottom-nav-icon { position: relative; display: inline-flex; align-items: center; justify-content: center; }
.bottom-nav .bottom-nav-badge { position: absolute; top: -7px; left: -10px; min-width: 15px; height: 15px; display: inline-grid; place-items: center; padding-inline: 3px; color: #fff; background: var(--eva-rose); border: 1.5px solid var(--eva-bg); border-radius: 999px; font-size: 8px; line-height: 1; font-weight: 600; }
.bottom-nav .bottom-nav-label { white-space: nowrap; }
@media (max-width: 1100px) {
  .desktop-nav { gap: 14px; }
  .desktop-nav a { font-size: 11px; }
}
@media (max-width: 980px) {
  .header-inner { gap: 14px; }
  .desktop-nav { gap: 11px; }
  .desktop-nav a { font-size: 10.5px; }
}
@media (max-width: 820px) {
  .announcement-bar span:nth-of-type(2) { display: none; }
  .site-footer { padding-bottom: calc(74px + env(safe-area-inset-bottom)); }
  .toast { bottom: calc(88px + env(safe-area-inset-bottom)); }
}
@media (max-width: 560px) {
  .header-inner { gap: 12px; }
  .header-actions .favorite-header, .header-actions .cart-button { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .skip-link, .site-header, .site-header *, .bottom-nav, .bottom-nav *, .site-footer, .site-footer *, .modal-layer, .modal-layer *, .toast, .toast * { transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
}
`

function App() {
  const { products, categories, routes, status } = useStoreData()
  const [location, setLocation] = useLocation()
  const [cart, setCart] = useState<CartItem[]>(() => getStoredCart(products))
  const [wishlist, setWishlist] = useState<string[]>(() => getStoredWishlist())
  const [notice, setNotice] = useState('')
  const pathname = location.split('?')[0]

  useEffect(() => {
    setCart((current) => {
      const next = reconcileCart(current, products)
      return next.length === current.length ? current : next
    })
  }, [products])

  useEffect(() => {
    setStoredCart(cart)
  }, [cart])

  useEffect(() => {
    setStoredWishlist(wishlist)
  }, [wishlist])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 2800)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  const addToCart = (product: Product, color: ProductColor, length: number) => {
    const result = addCartItem(cart, product, color, length)
    if (!result.available) {
      setNotice('هذه الخامة غير متوفرة حالياً')
      return
    }
    setCart(result.cart)
    setNotice(result.capped ? `أضيفت الكمية المتاحة فقط من «${product.name}»` : `أضيف «${product.name}» إلى السلة`)
  }

  const toggleWishlist = (slug: string) => {
    setWishlist((current) => {
      const exists = current.includes(slug)
      setNotice(exists ? 'أزيل القماش من المفضلة' : 'حُفظ القماش في المفضلة')
      return exists ? current.filter((item) => item !== slug) : [...current, slug]
    })
  }

  const updateCart = (key: string, length: number) => setCart((current) => updateCartItem(current, key, length))
  const deleteCart = (key: string) => setCart((current) => removeCartItem(current, key))
  const completeOrder = (orderNumber: string) => {
    setCart([])
    setStoredCart([])
    setNotice('تم تسجيل طلبك بنجاح')
    setLocation(`/order-confirmation/${encodeURIComponent(orderNumber)}`)
  }
  const skipToContent = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    document.getElementById('main-content')?.focus()
  }
  const cartMeters = cart.reduce((sum, item) => sum + item.length, 0)
  const pageProps = { products, categories, wishlist, onWish: toggleWishlist, onAdd: addToCart }

  return (
    <div className="app-shell" dir="rtl">
      <style>{shellStyles}</style>
      <a className="skip-link" href="#main-content" onClick={skipToContent}>تخطي إلى المحتوى</a>
      <SiteHeader routes={routes} products={products} cartMeters={cartMeters} wishlistCount={wishlist.length} />
      <div id="main-content" className="app-main" tabIndex={-1}>
        <Switch>
          <Route path="/" component={() => <HomePage {...pageProps} />} />
          <Route path="/catalog" component={() => <CatalogPage {...pageProps} status={status} />} />
          <Route path="/product/:slug">{(params) => <ProductPage {...pageProps} slug={params.slug} />}</Route>
          <Route path="/cart" component={() => <CartPage cart={cart} onUpdate={updateCart} onRemove={deleteCart} />} />
          <Route path="/checkout" component={() => <CheckoutPage cart={cart} onComplete={completeOrder} />} />
          <Route path="/favorites" component={() => <FavoritesPage {...pageProps} />} />
          <Route path="/stats" component={() => <StatsPage products={products} categories={categories} />} />
          <Route path="/about" component={AboutPage} />
          <Route path="/fabric-guide" component={FabricGuidePage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/policies" component={PoliciesPage} />
          <Route path="/order-tracking" component={OrderTrackingPage} />
          <Route path="/order-confirmation/:orderNumber">{(params) => <OrderConfirmationPage orderNumber={decodeURIComponent(params.orderNumber)} />}</Route>
          <Route component={NotFound} />
        </Switch>
      </div>
      <SiteFooter routes={routes} categories={categories} />
      <div className="toast-container">
        {notice && (
          <div className="toast" role="status" aria-live="polite">
            <span className="toast-icon"><Check size={15} /></span>
            <span>{notice}</span>
            {notice.includes('السلة') && <Link href="/cart" className="toast-link"><ShoppingBag size={14} />السلة</Link>}
            {notice.includes('المفضلة') && <Link href="/favorites" className="toast-link">المفضلة</Link>}
            <button type="button" className="toast-close" onClick={() => setNotice('')} aria-label="إغلاق التنبيه"><ArrowLeft size={14} /></button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
