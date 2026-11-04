import { useEffect, useLayoutEffect, useState, type MouseEvent } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { Link } from 'wouter'
import { ArrowLeft, Check, ShoppingBag } from 'lucide-react'
import type { CartItem, Product, ProductColor } from '@/types'
import { useStoreData } from '@/hooks/use-store-data'
import { LangProvider, useT } from '@/lib/i18n'
import { addCartItem, getStoredCart, getStoredWishlist, reconcileCart, removeCartItem, setStoredCart, setStoredWishlist, updateCartItem } from '@/lib/storage'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { AdminSecret } from '@/components/AdminSecret'
import { AdminAlerts } from '@/components/AdminAlerts'
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
  '/': { title: 'لَمْحة LAMHA | حلول المراقبة والحماية الذكية', desc: 'تعرّف على أجهزة المراقبة وحلول الحماية الذكية من لَمْحة. راجع صور الأجهزة ومواصفاتها، أضف الكمية المطلوبة، وأرسل طلبك للتأكيد.' },
  '/catalog': { title: 'أجهزة المراقبة والحماية | لَمْحة', desc: 'تصفح كاميرات المراقبة الداخلية والخارجية، كاميرات Wi‑Fi، أجهزة التسجيل وملحقات الحماية من لَمْحة.' },
  '/cart': { title: 'سلة الطلب | لَمْحة', desc: 'راجع أجهزة المراقبة والكميات قبل إتمام الطلب.' },
  '/checkout': { title: 'إرسال الطلب | لَمْحة', desc: 'أدخل بيانات التواصل والتوصيل لإرسال طلبك إلى لَمْحة.' },
  '/favorites': { title: 'المفضلة | لَمْحة', desc: 'أجهزتك المحفوظة للرجوع إليها لاحقاً.' },
  '/about': { title: 'من نحن | لَمْحة', desc: 'لَمْحة للحلول الذكية للمراقبة والحماية.' },
  '/device-guide': { title: 'دليل اختيار أجهزة المراقبة | لَمْحة', desc: 'إرشادات تساعدك على اختيار الكاميرا وجهاز التسجيل بحسب المكان والاتصال والميزات التي تحتاجها.' },
  '/contact': { title: 'تواصل معنا | لَمْحة', desc: 'تواصل مع لَمْحة للاستفسار عن الأجهزة والتوافق والتوصيل.' },
  '/policies': { title: 'السياسات والخصوصية | لَمْحة', desc: 'سياسات الطلب والتوصيل والخصوصية الخاصة بمتجر لَمْحة.' },
  '/order-tracking': { title: 'تتبع الطلب | لَمْحة', desc: 'تتبع حالة طلبك باستخدام رقم الطلب.' },
  '/order-confirmation': { title: 'تم استلام الطلب | لَمْحة', desc: 'تم استلام طلبك، وسيتم التواصل معك لتأكيد التفاصيل.' },
}
const PAGE_SEO_EN: Record<string, { title: string; desc: string }> = {
  '/': { title: 'LAMHA | Smart Surveillance and Security Solutions', desc: 'Explore LAMHA surveillance cameras and smart security devices. Review product details, choose quantities and submit an order for confirmation.' },
  '/catalog': { title: 'Surveillance and Security Devices | LAMHA', desc: 'Browse indoor and outdoor cameras, Wi-Fi cameras, recording devices and security accessories.' },
  '/cart': { title: 'Your Cart | LAMHA', desc: 'Review your selected devices and quantities before checkout.' },
  '/checkout': { title: 'Submit Your Order | LAMHA', desc: 'Enter your contact and delivery details to submit your order to LAMHA.' },
  '/favorites': { title: 'Favorites | LAMHA', desc: 'Your saved devices.' },
  '/about': { title: 'About LAMHA', desc: 'LAMHA smart surveillance and security solutions.' },
  '/device-guide': { title: 'Security Device Guide | LAMHA', desc: 'Guidance for choosing cameras and recording devices by location, connectivity and required features.' },
  '/contact': { title: 'Contact LAMHA', desc: 'Contact LAMHA about products, compatibility and delivery.' },
  '/policies': { title: 'Policies and Privacy | LAMHA', desc: 'Ordering, delivery and privacy policies for LAMHA.' },
  '/order-tracking': { title: 'Track Your Order | LAMHA', desc: 'Check your order status using your order number.' },
  '/order-confirmation': { title: 'Order Received | LAMHA', desc: 'Your order was received. We will contact you to confirm the details.' },
}

const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function AppShell() {
  const { products, categories, routes, status } = useStoreData()
  const { t, lang } = useT()
  const [location, setLocation] = useLocation()
  const [cart, setCart] = useState<CartItem[]>(() => getStoredCart(products))
  const [wishlist, setWishlist] = useState<string[]>(() => getStoredWishlist())
  const [notice, setNoticeState] = useState<{ text: string; link?: 'cart' | 'wishlist' } | null>(null)
  const setNotice = (text: string, link?: 'cart' | 'wishlist') => setNoticeState({ text, link })
  const pathname = location.split('?')[0]

  useEffect(() => {
    const seo = lang === 'en' ? PAGE_SEO_EN : PAGE_SEO
    const product = pathname.startsWith('/product/')
      ? products.find((item) => `/product/${item.slug}` === pathname)
      : undefined
    const fallback = pathname.startsWith('/order-confirmation') ? seo['/order-confirmation'] : undefined
    const entry = product
      ? { title: `${product.name} | ${lang === 'en' ? 'LAMHA' : 'لَمْحة'}`, desc: product.description || seo['/catalog'].desc }
      : seo[pathname] ?? fallback
    document.title = entry?.title ?? seo['/'].title
    if (entry?.desc) document.querySelector('meta[name="description"]')?.setAttribute('content', entry.desc)
  }, [pathname, products, lang])

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
    const timer = window.setTimeout(() => setNoticeState(null), 2800)
    return () => window.clearTimeout(timer)
  }, [notice])

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const addToCart = (product: Product, color: ProductColor, length: number) => {
    const result = addCartItem(cart, product, color, length)
    if (!result.available) {
      setNotice(t('core.noticeUnavailable'))
      return
    }
    setCart(result.cart)
    setNotice(result.capped
      ? t('core.noticeCapped').replace('{name}', product.name)
      : t('core.noticeAdded').replace('{name}', product.name), 'cart')
  }

  const toggleWishlist = (slug: string) => {
    setWishlist((current) => {
      const exists = current.includes(slug)
      setNotice(exists ? t('core.noticeWishRemoved') : t('core.noticeWishAdded'), 'wishlist')
      return exists ? current.filter((item) => item !== slug) : [...current, slug]
    })
  }

  const updateCart = (key: string, length: number) => setCart((current) => updateCartItem(current, key, length))
  const deleteCart = (key: string) => setCart((current) => removeCartItem(current, key))
  const completeOrder = (orderNumber: string) => {
    setCart([])
    setStoredCart([])
    setNotice(t('core.noticeOrderSaved'))
    setLocation(`/order-confirmation/${encodeURIComponent(orderNumber)}`)
  }
  const skipToContent = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    document.getElementById('main-content')?.focus()
  }
  const cartMeters = cart.reduce((sum, item) => sum + item.length, 0)
  const pageProps = { products, categories, wishlist, onWish: toggleWishlist, onAdd: addToCart }

  return (
    <div className="app-shell" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      <style>{shellStyles}</style>
      <a className="skip-link" href="#main-content" onClick={skipToContent}>{t('core.skipLink')}</a>
      <SiteHeader routes={routes} products={products} cartMeters={cartMeters} wishlistCount={wishlist.length} />
      <AdminAlerts />
      <div id="main-content" className="app-main" tabIndex={-1}>
        <Switch>
          <Route path="/" component={() => <HomePage {...pageProps} />} />
          <Route path="/catalog" component={() => <CatalogPage {...pageProps} status={status} />} />
          <Route path="/product/:slug">{(params) => <ProductPage {...pageProps} slug={params.slug} />}</Route>
          <Route path="/cart" component={() => <CartPage cart={cart} onUpdate={updateCart} onRemove={deleteCart} />} />
          <Route path="/checkout" component={() => <CheckoutPage cart={cart} onComplete={completeOrder} />} />
          <Route path="/favorites" component={() => <FavoritesPage {...pageProps} />} />
          <Route path="/about" component={AboutPage} />
          <Route path="/device-guide" component={FabricGuidePage} />
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
            <span>{notice.text}</span>
            {notice.link === 'cart' && <Link href="/cart" className="toast-link"><ShoppingBag size={14} />{t('core.toastCart')}</Link>}
            {notice.link === 'wishlist' && <Link href="/favorites" className="toast-link">{t('core.toastWishlist')}</Link>}
            <button type="button" className="toast-close" onClick={() => setNoticeState(null)} aria-label={t('core.toastClose')}><ArrowLeft size={14} /></button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <AppShell />
    </LangProvider>
  )
}
