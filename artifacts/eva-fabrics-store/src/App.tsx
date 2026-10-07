import { useEffect, useState, type MouseEvent } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { Link } from 'wouter'
import { ArrowLeft, Check, ShoppingBag } from 'lucide-react'
import type { CartItem, Product, ProductColor } from '@/types'
import { useStoreData } from '@/hooks/use-store-data'
import { addCartItem, getStoredCart, getStoredWishlist, reconcileCart, removeCartItem, setStoredCart, setStoredWishlist, updateCartItem } from '@/lib/storage'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { AdminSecret } from '@/components/AdminSecret'
import { HomePage } from '@/pages/HomePage'
import { CatalogPage } from '@/pages/CatalogPage'
import { ProductPage } from '@/pages/ProductPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { AboutPage, ContactPage, FabricGuidePage, OrderConfirmationPage, OrderTrackingPage, PoliciesPage } from '@/pages/InfoPages'
import NotFound from '@/pages/not-found'

const shellStyles = `
.skip-link { position: fixed; top: 14px; right: 14px; z-index: 140; display: inline-flex; align-items: center; gap: 8px; padding: 11px 18px; color: #fff6f8; background: var(--eva-rose); border: 1px solid rgba(255, 255, 255, .4); border-radius: 999px; box-shadow: var(--eva-shadow-small); backdrop-filter: blur(10px); font-size: 12px; font-weight: 600; transform: translateY(-190%); transition: transform .2s ease; }
.skip-link:focus { transform: translateY(0); }
.app-shell { overflow: clip; }
.app-main { scroll-margin-top: 116px; }
.footer-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px 34px; padding-top: 46px; }
.footer-top p { margin-top: 0; }
.footer-top .social-links { margin-top: 0; }
.footer-col { display: flex; flex-direction: column; align-items: flex-start; }
.mobile-nav a.is-active { color: var(--eva-rose); font-weight: 600; }
@media (max-width: 1100px) {
  .desktop-nav { gap: 14px; }
  .desktop-nav a { font-size: 11.5px; }
}
@media (max-width: 980px) {
  .header-inner { gap: 14px; }
  .desktop-nav { gap: 11px; }
  .desktop-nav a { font-size: 11.5px; }
}
@media (max-width: 820px) {
  .toast { bottom: calc(20px + env(safe-area-inset-bottom)); }
}
@media (max-width: 560px) {
  .header-inner { gap: 8px; }
  .header-actions { gap: 0; }
  .header-actions .favorite-header, .header-actions .cart-button { display: inline-flex; }
}
@media (max-width: 400px) {
  .header-inner { gap: 6px; }
  .logo-copy strong { font-size: 13px; }
  .logo-copy small { font-size: 9px; }
  .cart-button { padding: 7px 10px; }
}
  @media (prefers-reduced-motion: reduce) {
  .skip-link, .site-header, .site-header *, .site-footer, .site-footer *, .modal-layer, .modal-layer *, .toast, .toast * { transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
}
`

const PAGE_SEO: Record<string, { title: string; desc: string }> = {
  '/': { title: 'إيفا ستور للأقمشة | خامات مختارة تصنع الفرق', desc: 'متجر إيفا ستور للأقمشة: تعرفي على الخامة والمرونة والشفافية واللون، اختاري ما يناسب قطعك، واطلبي بنصف متر مع توصيل إلى جميع محافظات العراق.' },
  '/catalog': { title: 'كل الأقمشة | إيفا ستور', desc: 'تصفحي أقمشة إيفا ستور: قطن، كريب، ساتان وأكثر — مع المرونة واللون والسعر لكل متر.' },
  '/cart': { title: 'سلة المشتريات | إيفا ستور', desc: 'راجعي قماشك المختار وعدد الأمتار قبل إتمام الطلب.' },
  '/checkout': { title: 'إتمام الطلب | إيفا ستور', desc: 'أدخلي بياناتك وعدد الأمتار لتأكيد طلب الأقمشة مع التوصيل إلى جميع محافظات العراق.' },
  '/favorites': { title: 'المفضلة | إيفا ستور', desc: 'الأقمشة التي حفظتيها للرجوع إليها لاحقاً.' },
  '/about': { title: 'من نحن | إيفا ستور', desc: 'قصة إيفا ستور وخامة تصنع الفرق.' },
  '/fabric-guide': { title: 'دليل الأقمشة | إيفا ستور', desc: 'كيف تفرقي بين أنواع الأقمشة؟ دليل عملي بالأسئلة الشائعة عن المرونة والكثافة والعناية.' },
  '/contact': { title: 'تواصلي معنا | إيفا ستور', desc: 'راسلي إيفا ستور عبر البريد أو اتصلي هاتفيًا للاستفسار عن الأقمشة والتوصيل.' },
  '/policies': { title: 'السياسات والخصوصية | إيفا ستور', desc: 'سياسات الشحن والإرجاع والخصوصية الخاصة بمتجر إيفا ستور.' },
  '/order-tracking': { title: 'تتبع الطلب | إيفا ستور', desc: 'تتبعي حالة طلبك برقم الطلب الخاص بك.' },
  '/order-confirmation': { title: 'تم تسجيل طلبك | إيفا ستور', desc: 'تم تسجيل طلبك بنجاح، سنتواصل معك قريباً لتأكيد التفاصيل.' },
}

const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function App() {
  const { products, categories, routes, status } = useStoreData()
  const [location, setLocation] = useLocation()
  const [cart, setCart] = useState<CartItem[]>(() => getStoredCart(products))
  const [wishlist, setWishlist] = useState<string[]>(() => getStoredWishlist())
  const [notice, setNotice] = useState('')
  const pathname = location.split('?')[0]

  useEffect(() => {
    const product = pathname.startsWith('/product/')
      ? products.find((item) => `/product/${item.slug}` === pathname)
      : undefined
    const fallback = pathname.startsWith('/order-confirmation') ? PAGE_SEO['/order-confirmation'] : undefined
    const entry = product
      ? { title: `${product.name} | إيفا ستور`, desc: product.description || PAGE_SEO['/catalog'].desc }
      : PAGE_SEO[pathname] ?? fallback
    document.title = entry?.title ?? PAGE_SEO['/'].title
    if (entry?.desc) document.querySelector('meta[name="description"]')?.setAttribute('content', entry.desc)
  }, [pathname, products])

  useEffect(() => {
    if (status === 'loading') return
    setCart((current) => reconcileCart(current, products))
  }, [products, status])

  useEffect(() => {
    if (status === 'loading') return
    setStoredCart(cart)
  }, [cart, status])

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
          <Route path="/about" component={AboutPage} />
          <Route path="/fabric-guide" component={FabricGuidePage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/policies" component={PoliciesPage} />
          <Route path="/order-tracking" component={OrderTrackingPage} />
          <Route path="/order-confirmation/:orderNumber">{(params) => <OrderConfirmationPage orderNumber={safeDecode(params.orderNumber)} />}</Route>
          <Route path="/admin" component={() => null} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <SiteFooter routes={routes} categories={categories} />
      <AdminSecret products={products} categories={categories} />
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
