import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, Check, Filter, Layers, Package, Search, SlidersHorizontal, Tag, X } from 'lucide-react'
import { Link, useLocation, useSearch } from 'wouter'
import type { Category, Product, ProductColor } from '@/types'
import { formatPrice, normalizeArabic } from '@/lib/catalog'
import { ProductCard, ProductGridSkeleton } from '@/components/ProductCard'
import { Modal } from '@/components/Modal'

interface CatalogPageProps {
  products: Product[]
  categories: Category[]
  status: 'loading' | 'ready' | 'fallback'
  wishlist: string[]
  onWish: (slug: string) => void
  onAdd: (product: Product, color: ProductColor, length: number) => void
}

type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc'
type StretchKey = 'all' | 'stretch' | 'non'
type ParamChanges = Record<string, string | null>

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'الترتيب الافتراضي' },
  { value: 'newest', label: 'الأحدث أولاً' },
  { value: 'price-asc', label: 'السعر: الأقل أولاً' },
  { value: 'price-desc', label: 'السعر: الأعلى أولاً' },
]

const STRETCH_OPTIONS: { value: StretchKey; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'stretch', label: 'مطاطي' },
  { value: 'non', label: 'غير مطاطي' },
]

const STOP_WORDS = new Set(['قماش', 'القماش', 'اقمشه', 'الاقمشه', 'fabric'])

const catalogStyles = `
.chip-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  padding: 4px 2px 10px;
  margin-bottom: 14px;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
}
.chip-row::-webkit-scrollbar { display: none; }
.chip-row .chip { flex: 0 0 auto; min-height: 44px; padding: 10px 18px; font-size: 12px; font-weight: 600; scroll-snap-align: start; }
.chip-count {
  min-width: 24px;
  height: 21px;
  display: inline-grid;
  place-items: center;
  padding-inline: 7px;
  color: var(--eva-rose);
  background: rgba(183, 44, 111, .12);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
}
.chip.chip-active .chip-count, .chip[aria-pressed="true"] .chip-count { color: #fff; background: rgba(255, 255, 255, .24); }
.stats-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 18px; margin-top: 18px; color: var(--eva-muted); font-size: 11px; }
.stats-bar.glass-card { padding: 14px 20px; }
.stats-bar.glass-card:hover { transform: none; box-shadow: var(--glass-shadow); }
.stat-item { display: inline-flex; align-items: center; gap: 7px; }
.stat-item svg { flex: 0 0 auto; color: var(--eva-rose); }
.stat-item strong { color: var(--eva-rose); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
.stat-divider { width: 1px; height: 16px; background: rgba(48, 38, 42, .14); }
.empty-state.glass-card { padding: 62px 24px; margin-top: 4px; }
.empty-state.glass-card:hover { transform: none; box-shadow: var(--glass-shadow); }
.filter-panel-title strong { display: inline-flex; align-items: center; gap: 7px; }
.filter-panel .filter-browse { width: 100%; min-height: 44px; justify-content: space-between; padding: 10px 0; border-top: 1px solid rgba(48, 38, 42, .1); }
.filter-drawer .filter-panel { padding: 4px 24px 0; background: transparent; border: 0; border-radius: 0; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; }
.catalog-search input[type="search"] { -webkit-appearance: none; appearance: none; }
.catalog-search input[type="search"]::-webkit-search-cancel-button { display: none; }
@media (max-width: 560px) {
  .chip-row { gap: 7px; margin-bottom: 10px; }
  .chip-row .chip { padding: 9px 15px; font-size: 11px; }
  .stats-bar { justify-content: flex-start; gap: 6px 14px; }
  .stats-bar.glass-card { padding: 12px 14px; }
  .stat-item { font-size: 10px; }
  .stat-divider { display: none; }
  .empty-state.glass-card { padding: 48px 16px; }
}
`

const injectStyles = (id: string, css: string) => {
  if (typeof document === 'undefined' || document.getElementById(id)) return
  const node = document.createElement('style')
  node.id = id
  node.textContent = css
  document.head.appendChild(node)
}

injectStyles('eva-catalog-styles', catalogStyles)

const toWesternDigits = (value: string): string => value
  .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
  .replace(/[\u06f0-\u06f9]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))

const parseAmount = (raw: string | null): number | null => {
  if (!raw) return null
  const western = toWesternDigits(raw).replace(/[^\d.]/g, '')
  if (!western) return null
  const value = Number(western)
  return Number.isFinite(value) && value >= 0 ? value : null
}

const readSort = (raw: string | null): SortKey => (SORT_OPTIONS.some((option) => option.value === raw) ? (raw as SortKey) : 'featured')

const readStretch = (raw: string | null): StretchKey => {
  if (raw === '1' || raw === 'stretch' || raw === 'yes' || raw === 'true') return 'stretch'
  if (raw === '0' || raw === 'non' || raw === 'no' || raw === 'false') return 'non'
  return 'all'
}

const isStretchProduct = (product: Product): boolean => {
  if (typeof product.specs.isStretch === 'boolean') return product.specs.isStretch
  return !normalizeArabic(product.specs.stretch || '').includes('غير مطاطي')
}

const belongsToCategory = (product: Product, category: Category): boolean =>
  product.categoryId === category.id || product.categoryId === category.name || product.categoryId === category.slug

const buildQuery = (location: string, browserSearch: string): string => {
  const inline = location.includes('?') ? location.slice(location.indexOf('?') + 1) : ''
  const merged = new URLSearchParams(inline)
  new URLSearchParams(browserSearch.replace(/^\?/, '')).forEach((value, key) => merged.set(key, value))
  return merged.toString()
}

const matchesQuery = (product: Product, query: string, categories: Category[]): boolean => {
  const clean = normalizeArabic(query)
  if (!clean) return true
  const stretch = isStretchProduct(product)
  const asksNonStretch = clean.includes('غير مطاطي')
  const asksStretch = !asksNonStretch && clean.includes('مطاطي')
  if (asksNonStretch && stretch) return false
  if (asksStretch && !stretch) return false
  const rest = asksNonStretch
    ? clean.replace(/غير\s*مطاطي(?:ه)?/g, ' ')
    : asksStretch
      ? clean.replace(/مطاطي(?:ه)?/g, ' ')
      : clean
  const words = rest.split(' ').filter((word) => word && !STOP_WORDS.has(word))
  if (words.length === 0) return true
  const category = categories.find((item) => item.id === product.categoryId)
  const text = normalizeArabic([
    product.name,
    product.type,
    product.description,
    product.slug,
    product.categoryId,
    product.specs.composition,
    product.specs.width,
    product.specs.weight,
    product.specs.stretch,
    product.specs.opacity,
    product.specs.finish,
    product.specs.care,
    product.specs.use,
    category ? `${category.name} ${category.description} ${category.slug}` : '',
    ...product.colors.map((item) => item.name),
  ].join(' '))
  return words.every((word) => text.includes(word))
}

export function CatalogPage({ products, categories, status, wishlist, onWish, onAdd }: CatalogPageProps) {
  const [location, navigate] = useLocation()
  const browserSearch = useSearch()

  const query = useMemo(() => buildQuery(location, browserSearch), [browserSearch, location])
  const params = useMemo(() => new URLSearchParams(query), [query])

  const categoryId = params.get('category') || ''
  const search = params.get('search') || ''
  const stretch = readStretch(params.get('stretch'))
  const inStock = params.get('stock') === '1'
  const minRaw = params.get('min') || ''
  const maxRaw = params.get('max') || ''
  const sort = readSort(params.get('sort'))
  const minPrice = parseAmount(minRaw)
  const maxPrice = parseAmount(maxRaw)

  const [searchInput, setSearchInput] = useState(search)
  const [minInput, setMinInput] = useState(minRaw)
  const [maxInput, setMaxInput] = useState(maxRaw)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => setSearchInput(search), [search])
  useEffect(() => setMinInput(minRaw), [minRaw])
  useEffect(() => setMaxInput(maxRaw), [maxRaw])

  const updateParams = (changes: ParamChanges, replace = false) => {
    const next = new URLSearchParams(query)
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    })
    const nextSearch = next.toString()
    navigate(nextSearch ? `/catalog?${nextSearch}` : '/catalog', { replace })
  }

  const clearFilters = () => {
    setSearchInput('')
    setMinInput('')
    setMaxInput('')
    updateParams({ category: null, search: null, stretch: null, stock: null, min: null, max: null })
  }

  const activeCategory = useMemo(
    () => categories.find((item) => item.id === categoryId || item.name === categoryId || item.slug === categoryId) || null,
    [categories, categoryId],
  )
  const activeCategoryId = activeCategory ? activeCategory.id : ''

  const priceRange = useMemo(() => {
    if (minPrice === null && maxPrice === null) return { min: null, max: null }
    if (minPrice === null) return { min: null, max: maxPrice }
    if (maxPrice === null) return { min: minPrice, max: null }
    return minPrice <= maxPrice ? { min: minPrice, max: maxPrice } : { min: maxPrice, max: minPrice }
  }, [maxPrice, minPrice])

  const shown = useMemo(() => {
    const list = products.filter((product) => {
      if (categoryId) {
        const categoryMatch = activeCategory
          ? belongsToCategory(product, activeCategory)
          : product.categoryId === categoryId
        if (!categoryMatch) return false
      }
      if (stretch !== 'all' && isStretchProduct(product) !== (stretch === 'stretch')) return false
      if (inStock && product.stockMeters <= 0) return false
      if (priceRange.min !== null && product.price < priceRange.min) return false
      if (priceRange.max !== null && product.price > priceRange.max) return false
      return matchesQuery(product, search, categories)
    })
    const sorted = [...list]
    sorted.sort((a, b) => {
      if (sort === 'newest') return b.createdAt.localeCompare(a.createdAt) || Number(b.isFeatured) - Number(a.isFeatured)
      if (sort === 'price-asc') return a.price - b.price || b.createdAt.localeCompare(a.createdAt)
      if (sort === 'price-desc') return b.price - a.price || b.createdAt.localeCompare(a.createdAt)
      return Number(b.isFeatured) - Number(a.isFeatured) || Number(b.isNew) - Number(a.isNew) || b.createdAt.localeCompare(a.createdAt)
    })
    return sorted
  }, [activeCategory, categoryId, categories, inStock, priceRange, products, search, sort, stretch])

  const availableCount = shown.filter((product) => product.stockMeters > 0).length
  const averagePrice = shown.length ? Math.round(shown.reduce((total, product) => total + product.price, 0) / shown.length) : 0
  const activeCount = Number(Boolean(categoryId)) + Number(stretch !== 'all') + Number(inStock) + Number(minPrice !== null) + Number(maxPrice !== null) + Number(Boolean(search))
  const priceLabel = priceRange.min !== null && priceRange.max !== null
    ? `${formatPrice(priceRange.min)} — ${formatPrice(priceRange.max)}`
    : priceRange.min !== null
      ? `من ${formatPrice(priceRange.min)}`
      : priceRange.max !== null
        ? `حتى ${formatPrice(priceRange.max)}`
        : ''
  const statusLabel = status === 'loading' ? 'جارٍ الاتصال بالخادم' : status === 'fallback' ? 'نسخة محلية جاهزة' : 'تحديث مباشر عند توفر API'

  const chips = useMemo(() => [
    { id: '', label: 'كل الخامات', count: products.length },
    ...categories.map((category) => ({
      id: category.id,
      label: category.name,
      count: products.filter((product) => belongsToCategory(product, category)).length,
    })),
  ], [categories, products])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    updateParams({ search: searchInput.trim() || null })
  }

  const resetSearch = () => {
    setSearchInput('')
    updateParams({ search: null })
  }

  const changeMin = (value: string) => {
    setMinInput(value)
    updateParams({ min: value.trim() || null }, true)
  }

  const changeMax = (value: string) => {
    setMaxInput(value)
    updateParams({ max: value.trim() || null }, true)
  }

  const renderFilterPanel = (scope: string) => (
    <FilterPanel
      scope={scope}
      categories={categories}
      categoryId={categoryId}
      activeCategoryId={activeCategoryId}
      stretch={stretch}
      inStock={inStock}
      minInput={minInput}
      maxInput={maxInput}
      hasFilters={activeCount > 0}
      onChange={updateParams}
      onMin={changeMin}
      onMax={changeMax}
      onClear={clearFilters}
    />
  )

  const sidePanel = renderFilterPanel('side')
  const drawerPanel = renderFilterPanel('drawer')

  return (
    <main className="container-eva catalog-page">
      <div className="breadcrumbs">
        <Link href="/">الرئيسية</Link>
        <span>›</span>
        <span>الأقمشة</span>
        {activeCategory && <><span>›</span><span>{activeCategory.name}</span></>}
      </div>

      <div className="catalog-heading">
        <div>
          <span className="eyebrow">معرض الخامات</span>
          <h1>{activeCategory ? activeCategory.name : 'كل الأقمشة'}</h1>
          <p>{products.length} خامة في المعرض · {statusLabel}</p>
        </div>
        <div className="catalog-sort">
          <label htmlFor="catalog-sort">ترتيب حسب</label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(event) => updateParams({ sort: event.target.value === 'featured' ? null : event.target.value })}
          >
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
      </div>

      <div className="chip-row" role="group" aria-label="تصفحي الأقمشة حسب القسم">
        {chips.map((chip) => {
          const active = chip.id ? chip.id === activeCategoryId : !categoryId
          return (
            <button
              key={chip.id || 'all'}
              type="button"
              className={`chip ${active ? 'chip-active' : ''}`}
              aria-pressed={active}
              aria-label={`${chip.label}، ${chip.count} خامة`}
              onClick={() => updateParams({ category: chip.id || null })}
            >
              <span>{chip.label}</span>
              <span className="chip-count" aria-hidden="true">{chip.count}</span>
            </button>
          )
        })}
      </div>

      <div className="catalog-mobile-tools">
        <button
          type="button"
          className="filter-trigger"
          aria-haspopup="dialog"
          aria-label={activeCount > 0 ? `فتح التصفية، ${activeCount} فلتر مفعّل` : 'فتح التصفية'}
          onClick={() => setFilterOpen(true)}
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          تصفية
          {activeCount > 0 && <b>{activeCount}</b>}
        </button>
        <Link href="/catalog?sort=newest" className="underlined-link">
          وصل حديثاً <ArrowLeft size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="catalog-layout">
        <aside className="filter-sidebar" aria-label="تصفية الأقمشة">{sidePanel}</aside>
        <section className="catalog-results" aria-label="نتائج الأقمشة">
          <form className="catalog-search" onSubmit={submitSearch} role="search">
            <Search size={18} aria-hidden="true" />
            <label className="sr-only" htmlFor="catalog-search">ابحثي في النتائج</label>
            <input
              id="catalog-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="ابحثي باسم القماش أو اللون أو الاستخدام"
              autoComplete="off"
            />
            {searchInput && (
              <button type="button" onClick={resetSearch} aria-label="مسح البحث">
                <X size={16} aria-hidden="true" />
              </button>
            )}
            <button type="submit" className="button button-primary button-small">بحث</button>
          </form>

          {activeCount > 0 && (
            <div className="active-filters">
              <span>مرشحات:</span>
              {search && <FilterChip label={`بحث: ${search}`} onRemove={resetSearch} />}
              {activeCategory && <FilterChip label={activeCategory.name} onRemove={() => updateParams({ category: null })} />}
              {categoryId && !activeCategory && <FilterChip label={`قسم: ${categoryId}`} onRemove={() => updateParams({ category: null })} />}
              {stretch !== 'all' && <FilterChip label={STRETCH_OPTIONS.find((item) => item.value === stretch)?.label || ''} onRemove={() => updateParams({ stretch: null })} />}
              {inStock && <FilterChip label="متوفر فقط" onRemove={() => updateParams({ stock: null })} />}
              {priceLabel && (
                <FilterChip
                  label={priceLabel}
                  onRemove={() => {
                    setMinInput('')
                    setMaxInput('')
                    updateParams({ min: null, max: null })
                  }}
                />
              )}
              <button type="button" className="clear-all" onClick={clearFilters}>مسح الكل</button>
            </div>
          )}

          <div className="stats-bar glass-card" role="status">
            <span className="stat-item"><Layers size={14} aria-hidden="true" />عرض <strong>{shown.length}</strong> من {products.length} خامة</span>
            <span className="stat-divider" aria-hidden="true" />
            <span className="stat-item"><Tag size={14} aria-hidden="true" />متوسط السعر <strong>{shown.length ? formatPrice(averagePrice) : '—'}</strong></span>
            <span className="stat-divider" aria-hidden="true" />
            <span className="stat-item"><Package size={14} aria-hidden="true" />متوفر الآن <strong>{availableCount}</strong></span>
          </div>

          {status === 'loading' && products.length === 0
            ? <ProductGridSkeleton />
            : shown.length === 0
              ? <EmptyResults onClear={clearFilters} />
              : (
                <div className="product-grid">
                  {shown.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      wished={wishlist.includes(product.slug)}
                      onWish={onWish}
                      onAdd={onAdd}
                    />
                  ))}
                </div>
              )}
        </section>
      </div>

      <Modal open={filterOpen} onClose={() => setFilterOpen(false)} title="تصفية الأقمشة" variant="bottom" className="filter-drawer">
        <div className="drawer-header">
          <h2>تصفية النتائج</h2>
          <button type="button" className="icon-button" onClick={() => setFilterOpen(false)} aria-label="إغلاق التصفية">
            <X size={19} aria-hidden="true" />
          </button>
        </div>
        {drawerPanel}
        <button type="button" className="button button-primary drawer-submit" onClick={() => setFilterOpen(false)}>
          عرض النتائج ({shown.length}) <Check size={16} aria-hidden="true" />
        </button>
      </Modal>
    </main>
  )
}

interface FilterPanelProps {
  scope: string
  categories: Category[]
  categoryId: string
  activeCategoryId: string
  stretch: StretchKey
  inStock: boolean
  minInput: string
  maxInput: string
  hasFilters: boolean
  onChange: (changes: ParamChanges, replace?: boolean) => void
  onMin: (value: string) => void
  onMax: (value: string) => void
  onClear: () => void
}

function FilterPanel({
  scope,
  categories,
  categoryId,
  activeCategoryId,
  stretch,
  inStock,
  minInput,
  maxInput,
  hasFilters,
  onChange,
  onMin,
  onMax,
  onClear,
}: FilterPanelProps) {
  return (
    <div className="filter-panel">
      <div className="filter-panel-title">
        <strong><Filter size={14} aria-hidden="true" />التصفية</strong>
        <button type="button" onClick={onClear} disabled={!hasFilters}>مسح الكل</button>
      </div>

      <fieldset>
        <legend>نوع القماش</legend>
        <label className="filter-option">
          <input type="radio" name={`category-${scope}`} checked={!categoryId} onChange={() => onChange({ category: null })} />
          <span>كل الأقسام</span>
        </label>
        {categories.map((category) => (
          <label className="filter-option" key={`${scope}-${category.id}`}>
            <input
              type="radio"
              name={`category-${scope}`}
              checked={activeCategoryId === category.id}
              onChange={() => onChange({ category: category.id })}
            />
            <span>{category.name}</span>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>المرونة</legend>
        {STRETCH_OPTIONS.map((option) => (
          <label className="filter-option" key={`${scope}-${option.value}`}>
            <input
              type="radio"
              name={`stretch-${scope}`}
              checked={stretch === option.value}
              onChange={() => onChange({ stretch: option.value === 'all' ? null : option.value === 'stretch' ? '1' : '0' })}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>نطاق السعر</legend>
        <div className="price-fields">
          <label>
            <span>من</span>
            <input
              type="text"
              inputMode="numeric"
              value={minInput}
              onChange={(event) => onMin(event.target.value)}
              placeholder="السعر الأدنى"
              aria-label="السعر الأدنى بالدينار العراقي"
            />
          </label>
          <span aria-hidden="true">—</span>
          <label>
            <span>إلى</span>
            <input
              type="text"
              inputMode="numeric"
              value={maxInput}
              onChange={(event) => onMax(event.target.value)}
              placeholder="السعر الأعلى"
              aria-label="السعر الأعلى بالدينار العراقي"
            />
          </label>
        </div>
      </fieldset>

      <label className="filter-option filter-check">
        <input type="checkbox" checked={inStock} onChange={(event) => onChange({ stock: event.target.checked ? '1' : null })} />
        <span>المتوفر فقط</span>
      </label>

      <button type="button" className="filter-browse" onClick={onClear} disabled={!hasFilters}>
        عرض كل الخامات <ArrowLeft size={14} aria-hidden="true" />
      </button>
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="filter-chip">
      {label}
      <button type="button" onClick={onRemove} aria-label={`إزالة ${label}`}>
        <X size={12} aria-hidden="true" />
      </button>
    </span>
  )
}

function EmptyResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="empty-state glass-card" role="status">
      <div className="empty-icon"><Search size={23} aria-hidden="true" /></div>
      <h2>لم نجد خامة بهذه المواصفات</h2>
      <p>جرّبي كلمة بحث مختلفة أو أزيلي بعض الفلاتر لتظهر لك كل الخامات المتاحة في المعرض.</p>
      <button type="button" className="button button-primary" onClick={onClear}>عرض كل الأقمشة</button>
    </div>
  )
}
