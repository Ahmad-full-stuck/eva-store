import { useEffect, useState } from 'react'
import { BarChart3, Heart, Home, Instagram, Menu, MessageCircle, Search, ShoppingBag, Shirt, X } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import type { Product, SiteRoute } from '@/types'
import { formatMeters } from '@/lib/catalog'
import { siteConfig } from '@/lib/site'
import { Logo } from './Logo'
import { Modal } from './Modal'
import { SearchDialog } from './SearchDialog'

interface SiteHeaderProps {
  routes: SiteRoute[]
  products: Product[]
  cartMeters: number
  wishlistCount: number
}

interface NavItem {
  id: string
  label: string
  path: string
}

const primaryNav: NavItem[] = [
  { id: 'home', label: 'الرئيسية', path: '/' },
  { id: 'catalog', label: 'الأقمشة', path: '/catalog' },
  { id: 'favorites', label: 'المفضلة', path: '/favorites' },
  { id: 'guide', label: 'دليل الأقمشة', path: '/fabric-guide' },
  { id: 'about', label: 'من نحن', path: '/about' },
  { id: 'contact', label: 'تواصلي', path: '/contact' },
  { id: 'stats', label: 'الإحصائيات', path: '/stats' },
]

const drawerNav: NavItem[] = [
  { id: 'tracking', label: 'تتبع الطلب', path: '/order-tracking' },
  { id: 'policies', label: 'السياسات', path: '/policies' },
]

export function SiteHeader({ routes, products, cartMeters, wishlistCount }: SiteHeaderProps) {
  const [location] = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = location.split('?')[0]

  const navItems = primaryNav.map((item) => {
    const matched = routes.find((route) => route.id === item.id)
    return matched ? { ...item, path: matched.path, label: matched.label } : item
  })

  const isActive = (path: string): boolean => {
    const target = path.split('?')[0]
    if (target === pathname) return true
    if (target === '/catalog' && pathname.startsWith('/product/')) return true
    return false
  }

  const navigate = () => {
    setMenuOpen(false)
    setSearchOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const bottomItems = [
    { id: 'home', label: 'الرئيسية', path: '/', Icon: Home, badge: '' },
    { id: 'catalog', label: 'الأقمشة', path: '/catalog', Icon: Shirt, badge: '' },
    { id: 'favorites', label: 'المفضلة', path: '/favorites', Icon: Heart, badge: wishlistCount > 0 ? `${wishlistCount}` : '' },
    { id: 'cart', label: 'السلة', path: '/cart', Icon: ShoppingBag, badge: cartMeters > 0 ? formatMeters(cartMeters) : '' },
    { id: 'stats', label: 'الإحصائيات', path: '/stats', Icon: BarChart3, badge: '' },
  ]

  const drawerItems = [...navItems, ...drawerNav]

  return (
    <>
      <div className="announcement-bar" role="region" aria-label="إعلان المتجر">
        <span>شحن إلى جميع محافظات العراق</span>
        <span className="announcement-dot" />
        <a href={`tel:${siteConfig.phone}`} dir="ltr">{siteConfig.phone}</a>
        <span className="announcement-dot" />
        <span>شحن دولي عند التوفر</span>
      </div>
      <header className="site-header glass">
        <div className="container-eva header-inner">
          <Logo glass />
          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            {navItems.map((route) => {
              const active = isActive(route.path)
              return (
                <Link key={route.id} href={route.path} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined} onClick={navigate}>
                  {route.label}
                </Link>
              )
            })}
          </nav>
          <div className="header-actions">
            <button type="button" className="icon-button" onClick={() => setSearchOpen(true)} aria-label="فتح البحث في الأقمشة" aria-haspopup="dialog" aria-expanded={searchOpen}>
              <Search size={19} />
            </button>
            <Link href="/favorites" className="icon-button favorite-header" onClick={navigate} aria-label={`المفضلة، ${wishlistCount} عناصر`}>
              <Heart size={19} />
              {wishlistCount > 0 && <span>{wishlistCount}</span>}
            </Link>
            <Link href="/cart" className="cart-button" onClick={navigate} aria-label={`السلة، ${formatMeters(cartMeters)}`}>
              <ShoppingBag size={17} />
              <span>السلة</span>
              {cartMeters > 0 && <b>{formatMeters(cartMeters)}</b>}
            </Link>
            <button type="button" className="icon-button menu-toggle" onClick={() => setMenuOpen(true)} aria-label="فتح قائمة التنقل" aria-haspopup="dialog" aria-expanded={menuOpen}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} products={products} />
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="قائمة التنقل" variant="drawer" className="mobile-drawer glass-strong">
        <div className="drawer-header">
          <Logo glass />
          <button type="button" className="icon-button" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة">
            <X size={20} />
          </button>
        </div>
        <nav className="mobile-nav" aria-label="التنقل عبر الهاتف">
          {drawerItems.map((route) => {
            const active = isActive(route.path)
            return (
              <Link key={route.id} href={route.path} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined} onClick={navigate}>
                {route.label}
              </Link>
            )
          })}
        </nav>
        <div className="glass-divider" />
        <div className="drawer-contact">
          <a className="chip" href={siteConfig.whatsappUrl()} target="_blank" rel="noreferrer">
            <MessageCircle size={17} />
            تواصلي عبر واتساب
          </a>
          <a className="chip" href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">
            <Instagram size={17} />
            حساب إيفا على إنستغرام
          </a>
        </div>
      </Modal>
      <nav className="bottom-nav glass-strong" aria-label="التنقل السريع">
        {bottomItems.map((item) => {
          const Icon = item.Icon
          const active = isActive(item.path)
          return (
            <Link key={item.id} href={item.path} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined} onClick={navigate} aria-label={item.badge ? `${item.label}، ${item.badge}` : item.label}>
              <span className="bottom-nav-icon">
                <Icon size={20} />
                {item.badge && <b className="bottom-nav-badge">{item.badge}</b>}
              </span>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
