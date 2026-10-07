import { useEffect, useState } from 'react'
import { BookOpen, ChevronLeft, Heart, Home, Info, Instagram, Menu, Mail, MessageCircle, PackageSearch, Phone, Search, ShieldCheck, ShoppingBag, Shirt, X } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import type { Product, SiteRoute } from '@/types'
import { formatMeters } from '@/lib/catalog'
import { siteConfig } from '@/lib/site'
import { useSiteContent } from '@/lib/site-content'
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
]

interface IconNavItem extends NavItem {
  Icon: typeof Home
}

const quickNav: IconNavItem[] = [
  { id: 'home', label: 'الرئيسية', path: '/', Icon: Home },
  { id: 'catalog', label: 'الأقمشة', path: '/catalog', Icon: Shirt },
  { id: 'favorites', label: 'المفضلة', path: '/favorites', Icon: Heart },
  { id: 'guide', label: 'دليل الأقمشة', path: '/fabric-guide', Icon: BookOpen },
  { id: 'tracking', label: 'تتبع الطلب', path: '/order-tracking', Icon: PackageSearch },
  { id: 'about', label: 'من نحن', path: '/about', Icon: Info },
  { id: 'contact', label: 'تواصلي', path: '/contact', Icon: MessageCircle },
  { id: 'policies', label: 'السياسات', path: '/policies', Icon: ShieldCheck },
]

const drawerGroups: { label: string; items: IconNavItem[] }[] = [
  {
    label: 'التسوق',
    items: [
      { id: 'home', label: 'الرئيسية', path: '/', Icon: Home },
      { id: 'catalog', label: 'كل الأقمشة', path: '/catalog', Icon: Shirt },
      { id: 'favorites', label: 'المفضلة', path: '/favorites', Icon: Heart },
      { id: 'cart', label: 'سلة المشتريات', path: '/cart', Icon: ShoppingBag },
    ],
  },
  {
    label: 'خدمة العملاء',
    items: [
      { id: 'guide', label: 'دليل الأقمشة', path: '/fabric-guide', Icon: BookOpen },
      { id: 'tracking', label: 'تتبع الطلب', path: '/order-tracking', Icon: PackageSearch },
      { id: 'contact', label: 'تواصلي معنا', path: '/contact', Icon: MessageCircle },
      { id: 'about', label: 'من نحن', path: '/about', Icon: Info },
      { id: 'policies', label: 'السياسات والشحن', path: '/policies', Icon: ShieldCheck },
    ],
  },
]

export function SiteHeader({ routes, products, cartMeters, wishlistCount }: SiteHeaderProps) {
  const [location] = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const content = useSiteContent()
  const pathname = location.split('?')[0]

  const withRoutes = <T extends NavItem>(items: T[]): T[] =>
    items.map((item) => {
      const matched = routes.find((route) => route.id === item.id)
      return matched ? { ...item, path: matched.path, label: matched.label } : item
    })

  const navItems = withRoutes(primaryNav)
  const quickItems = withRoutes(quickNav)
  const groups = drawerGroups.map((group) => ({ ...group, items: withRoutes(group.items) }))

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
    setSearchOpen(false)
  }, [pathname])

  return (
    <>
      <div className="announcement-bar" role="region" aria-label="إعلان المتجر">
        <span className="announcement-msg announcement-msg-right">{content.announcementRight}</span>
        <span className="announcement-dot" />
        <a href={`tel:${siteConfig.phone}`} dir="ltr">{siteConfig.phone}</a>
        <span className="announcement-dot" />
        <span className="announcement-msg announcement-msg-left">{content.announcementLeft}</span>
      </div>
      <header className="site-header glass">
        <div className="container-eva header-inner">
          <Logo />
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
        <nav className="mobile-quick-nav" aria-label="تنقل سريع">
          <div className="mobile-quick-nav-track">
            {quickItems.filter((i) => ["home","catalog","favorites"].includes(i.id)).map((item) => {
              const Icon = item.Icon
              const active = isActive(item.path)
              return (
                <Link key={item.id} href={item.path} className={active ? "is-active" : ""} aria-current={active ? "page" : undefined} onClick={navigate}>
                  <Icon size={14} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} products={products} />
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="قائمة التنقل" variant="drawer" className="mobile-drawer glass-strong">
        <div className="drawer-header">
          <Logo />
          <button type="button" className="icon-button drawer-close" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة">
            <X size={20} />
          </button>
        </div>
        <div className="drawer-scroll">
          {groups.map((group) => (
            <div key={group.label} className="drawer-group">
              <p className="drawer-group-label">{group.label}</p>
              <nav className="mobile-nav drawer-nav" aria-label={group.label}>
                {group.items.map((route) => {
                  const Icon = route.Icon
                  const active = isActive(route.path)
                  return (
                    <Link key={route.id} href={route.path} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined} onClick={navigate}>
                      <Icon size={18} aria-hidden="true" />
                      <span>{route.label}</span>
                      <ChevronLeft size={16} className="drawer-chevron" aria-hidden="true" />
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
          <div className="glass-divider" />
          <div className="drawer-contact">
            <a className="chip drawer-chip drawer-chip-primary" href={siteConfig.emailUrl()} target="_blank" rel="noreferrer">
              <Mail size={17} />
              راسلينا بالبريد
            </a>
            <a className="chip drawer-chip" href={`tel:${siteConfig.phone}`} dir="ltr">
              <Phone size={17} />
              {siteConfig.phone}
            </a>
            <a className="chip drawer-chip" href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">
              <Instagram size={17} />
              حساب إيفا على إنستغرام
            </a>
          </div>
        </div>
      </Modal>
    </>
  )
}

