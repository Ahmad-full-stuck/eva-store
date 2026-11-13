import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, BatteryCharging, CarFront, Headphones, House, Monitor, Search, Smartphone, Watch, X } from 'lucide-react'
import { Link, useLocation, useSearch } from 'wouter'
import type { Product, ProductColor } from '@/types'
import { ProductCard, ProductGridSkeleton } from '@/components/ProductCard'
import { useT } from '@/lib/i18n'
import { getStoreBrand } from '@/lib/store-brand'
import './aalam-alqalaa-catalog.css'

interface AalamAlqalaaCatalogProps {
  products: Product[]
  wishlist: string[]
  status: 'loading' | 'ready' | 'fallback'
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, quantity: number) => void
}

const icons = {
  phone: Smartphone,
  computer: Monitor,
  smartwatch: Watch,
  audio: Headphones,
  power: BatteryCharging,
  home: House,
  car: CarFront,
}

const normalize = (value: string) => value
  .normalize('NFKD')
  .replace(/[\u064B-\u065F\u0670]/g, '')
  .replace(/[أإآ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه')
  .toLowerCase()
  .trim()

export function AalamAlqalaaCatalogPage({ products, wishlist, status, onWish, onAdd }: AalamAlqalaaCatalogProps) {
  const { lang } = useT()
  const brand = getStoreBrand('aalam-alqalaa')
  const [, setLocation] = useLocation()
  const searchParams = useSearch()
  const initialParams = new URLSearchParams(searchParams.replace(/^\?/, ''))
  const [activeCategory, setActiveCategory] = useState(initialParams.get('category') || '')
  const [searchInput, setSearchInput] = useState(initialParams.get('search') || '')

  useEffect(() => {
    const params = new URLSearchParams(searchParams.replace(/^\?/, ''))
    setActiveCategory(params.get('category') || '')
    setSearchInput(params.get('search') || '')
  }, [searchParams])

  const updateQuery = (nextCategory: string, nextSearch: string) => {
    const params = new URLSearchParams()
    if (nextCategory) params.set('category', nextCategory)
    if (nextSearch.trim()) params.set('search', nextSearch.trim())
    const query = params.toString()
    setLocation('/catalog' + (query ? '?' + query : ''))
  }

  const shown = useMemo(() => {
    const q = normalize(searchInput)
    return products.filter((product) => {
      if (activeCategory && product.categoryId !== activeCategory) return false
      if (!q) return true
      const haystack = normalize([
        product.name, product.type, product.description,
        product.categoryId, product.specs.composition, product.specs.width,
        product.specs.weight, product.specs.finish, product.specs.use,
      ].join(' '))
      return q.split(/\s+/).every((part) => haystack.includes(part))
    })
  }, [products, activeCategory, searchInput])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    updateQuery(activeCategory, searchInput)
  }

  const clearSearch = () => {
    setSearchInput('')
    updateQuery(activeCategory, '')
  }

  const selectCategory = (id: string) => {
    setActiveCategory(id)
    updateQuery(id, searchInput)
  }

  return (
    <main className="aalam-catalog">
      <div className="aalam-catalog__container">
        <header className="aalam-catalog__hero">
          <div className="aalam-catalog__eyebrow"><span /> CASTLE WORLD <b>·</b> الكتالوج</div>
          <h1>اكتشف التقنية<br /><em>التي تناسبك.</em></h1>
          <p>تصفح المنتجات حسب الفئة، واستخدم البحث للوصول بسرعة إلى الجهاز أو الملحق الذي تبحث عنه. السعر والتوفر يؤكدان قبل الطلب.</p>
          <div className="aalam-catalog__proof">
            <span>منذ 2004</span><i /><span>ضمان واضح</span><i /><span>توصيل لكل العراق</span>
          </div>
        </header>

        <section className="aalam-catalog__tools" aria-label="البحث والتصنيفات">
          <form className="aalam-catalog__search" onSubmit={submitSearch} role="search">
            <Search size={19} />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={lang === 'en' ? 'Search phones, audio, accessories...' : 'ابحث عن هاتف أو سماعة أو جهاز أو ملحق'}
              aria-label="ابحث في منتجات عالم القلعة"
            />
            {searchInput && <button type="button" onClick={clearSearch} aria-label="مسح البحث"><X size={17} /></button>}
            <button type="submit" className="aalam-catalog__search-submit">بحث</button>
          </form>
          <div className="aalam-catalog__chips">
            <button type="button" className={!activeCategory ? 'is-active' : ''} onClick={() => selectCategory('')}>كل المنتجات <span>{products.length}</span></button>
            {brand.categories.map((category) => {
              const Icon = icons[category.icon as keyof typeof icons] || Smartphone
              const count = products.filter((product) => product.categoryId === category.id).length
              return (
                <button
                  type="button"
                  key={category.id}
                  className={activeCategory === category.id ? 'is-active' : ''}
                  onClick={() => selectCategory(category.id)}
                >
                  <Icon size={15} />
                  {category.label}
                  <span>{count}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="aalam-catalog__results">
          <div className="aalam-catalog__heading">
            <div>
              <span>تشكيلة عالم القلعة</span>
              <h2>{activeCategory || 'جميع المنتجات'}</h2>
            </div>
            <p>{shown.length} منتج</p>
          </div>

          {status === 'loading' ? <ProductGridSkeleton /> : shown.length ? (
            <div className="aalam-catalog__grid">
              {shown.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wished={wishlist.includes(product.slug)}
                  onWish={onWish}
                  onAdd={onAdd}
                  priority={index < 4}
                />
              ))}
            </div>
          ) : (
            <div className="aalam-catalog__empty">
              <span><Search size={24} /></span>
              <h3>{activeCategory && !searchInput.trim() ? 'هذا القسم قيد الإضافة إلى الكتالوج' : 'ما لقينا منتجات تطابق بحثك'}</h3>
              <p>{activeCategory && !searchInput.trim() ? 'تواصل مع عالم القلعة للاستفسار عن المنتجات المتوفرة في هذا القسم.' : 'جرّب كلمة ثانية أو اعرض كل منتجات عالم القلعة.'}</p>
              {activeCategory && !searchInput.trim()
                ? <Link href="/contact" className="aalam-catalog__empty-link">استفسر عن هذا القسم <ArrowLeft size={16} /></Link>
                : <button type="button" onClick={() => { setSearchInput(''); selectCategory('') }}>عرض كل المنتجات <ArrowLeft size={16} /></button>}
            </div>
          )}
        </section>

        <footer className="aalam-catalog__note">
          <span>ملاحظة</span>
          <p>السعر والتوفر يتغيران بحسب الموديل واللون والسعة. يتأكد فريق عالم القلعة من التفاصيل النهائية قبل اعتماد طلبك.</p>
        </footer>
      </div>
    </main>
  )
}
