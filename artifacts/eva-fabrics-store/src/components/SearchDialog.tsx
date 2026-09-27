import { useState, type FormEvent } from 'react'
import { Search, X } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import type { Product } from '@/types'
import { matchesProductSearch, formatPrice } from '@/lib/catalog'
import { Modal } from './Modal'

interface SearchDialogProps {
  open: boolean
  onClose: () => void
  products: Product[]
}

const suggestions = ['قماش مطاطي', 'قماش أسود', 'مطرز', 'ترتر', 'فساتين سهرة', 'غير مطاطي']

export function SearchDialog({ open, onClose, products }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [, setLocation] = useLocation()
  const results = query.trim().length > 1 ? products.filter((product) => matchesProductSearch(product, query)).slice(0, 7) : []

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const clean = query.trim()
    if (!clean) return
    setLocation(`/catalog?search=${encodeURIComponent(clean)}`)
    onClose()
    setQuery('')
  }

  return (
    <Modal open={open} onClose={onClose} title="البحث في الأقمشة" variant="top" className="search-panel">
      <div className="search-panel-inner">
        <form className="search-form" onSubmit={submit} role="search">
          <Search size={20} aria-hidden="true" />
          <label className="sr-only" htmlFor="global-search">ابحثي عن قماش أو لون أو استخدام</label>
          <input id="global-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحثي عن قماش، لون أو استخدام" autoComplete="off" />
          {query && <button type="button" className="clear-search" onClick={() => setQuery('')} aria-label="مسح البحث"><X size={16} /></button>}
          <button type="submit" className="button button-primary button-small">بحث</button>
        </form>
        {!query && <div className="search-suggestions"><span>بحث شائع</span>{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => setQuery(suggestion)}>{suggestion}</button>)}</div>}
        {query && <div className="search-results" aria-live="polite">
          <p className="search-results-count">{results.length ? `${results.length} نتائج مناسبة` : 'لا توجد نتائج مطابقة'}</p>
          {results.map((product) => <Link key={product.id} href={`/product/${product.slug}`} className="search-result-item" onClick={onClose}>
            <img src={product.image} alt="" />
            <span><strong>{product.name}</strong><small>{product.type} · {product.specs.width}</small></span>
            <b>{formatPrice(product.price)}</b>
          </Link>)}
        </div>}
      </div>
    </Modal>
  )
}
