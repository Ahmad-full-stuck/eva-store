import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Image as ImageIcon, Lock, LogOut, Plus, Save, ShieldCheck, Trash2, Upload, X, Pencil, Download, RotateCcw } from 'lucide-react'
import type { Category, Product, ProductColor } from '@/types'
import { fallbackCategories, fallbackProducts } from '@/lib/fallback-data'

const PRODUCTS_KEY = 'eva-admin-products'
const REMOVED_KEY = 'eva-admin-removed'
const CATEGORIES_KEY = 'eva-admin-categories'
const CONTENT_KEY = 'eva-admin-content'
const PIN_KEY = 'eva-admin-pin'
const SESSION_KEY = 'eva-admin-session'

export interface AdminContent {
  shopName: string
  phone: string
  whatsapp: string
  instagram: string
  announcementRight: string
  announcementLeft: string
  aboutTitle: string
  aboutText: string
  contactTitle: string
  contactText: string
}

const defaultContent: AdminContent = {
  shopName: 'إيفا ستور للأقمشة',
  phone: '07727282001',
  whatsapp: '9647727282001',
  instagram: 'https://instagram.com',
  announcementRight: 'شحن مجاني لكل الطلبات فوق 100 ألف دينار',
  announcementLeft: 'توصيل لجميع المحافظات العراقية',
  aboutTitle: 'من نحن',
  aboutText: 'إيفا ستور للأقمشة - جودة وثقة منذ سنوات.',
  contactTitle: 'تواصل معنا',
  contactText: 'نسعد بخدمتك في أي وقت.',
}

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as T
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const writeJson = (key: string, value: unknown): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota */
  }
  try {
    window.dispatchEvent(new Event('eva-admin-changed'))
  } catch {
    /* ignore */
  }
}

export const readAdminProducts = (): Product[] => readJson<Product[]>(PRODUCTS_KEY, [])

export const readRemovedSlugs = (): string[] => readJson<string[]>(REMOVED_KEY, [])

export const readAdminCategories = (): Category[] => readJson<Category[]>(CATEGORIES_KEY, [])

export const readAdminContent = (): AdminContent => ({ ...defaultContent, ...readJson<Partial<AdminContent>>(CONTENT_KEY, {}) })

export const mergeAdminProducts = (source: Product[]): Product[] => {
  const removed = new Set(readRemovedSlugs())
  const overrides = readAdminProducts()
  const base = source.filter((item) => !removed.has(item.slug))
  const bySlug = new Map<string, Product>()
  for (const item of base) bySlug.set(item.slug, item)
  for (const item of overrides) {
    const existing = bySlug.get(item.slug)
    bySlug.set(item.slug, existing ? { ...existing, ...item, colors: item.colors.length ? item.colors : existing.colors } : item)
  }
  const custom = overrides.filter((item) => !source.some((entry) => entry.slug === item.slug))
  return [...bySlug.values(), ...custom.filter((item) => !bySlug.has(item.slug))]
}

export const mergeAdminCategories = (source: Category[]): Category[] => {
  const overrides = readAdminCategories()
  if (!overrides.length) return source
  const map = new Map<string, Category>()
  for (const item of source) map.set(item.slug, item)
  for (const item of overrides) map.set(item.slug, item)
  return [...map.values()]
}

const emptyProduct = (): Product => ({
  id: `custom-${Date.now()}`,
  slug: `custom-${Date.now()}`,
  name: '',
  type: 'قماش',
  categoryId: 'plain',
  description: '',
  price: 0,
  image: '',
  images: [],
  colors: [{ id: 'color-1', name: 'أساسي', hex: '#8e6e7d', available: true, stockMeters: 10 }],
  specs: {
    composition: 'قطن',
    width: '150 سم',
    weight: 'خفيف',
    stretch: 'بدون تأمل',
    isStretch: false,
    opacity: 'غير شفاف',
    finish: 'ناعم',
    care: 'غسيل لطيف',
    use: 'ملابس',
  },
  faqs: [],
  isNew: true,
  isFeatured: false,
  stockMeters: 10,
  createdAt: new Date().toISOString().slice(0, 10),
})

const toFileDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('read failed'))
    reader.readAsDataURL(file)
  })

const adminStyles = `
.admin-trigger { position: fixed; bottom: 0; left: 50%; transform: translate(-50%, 0); z-index: 150; width: 64px; height: 11px; border: 0; padding: 0; background: transparent; cursor: default; opacity: 0; color: transparent; font-size: 0; -webkit-tap-highlight-color: transparent; transition: opacity .18s ease; }
.admin-trigger:hover, .admin-trigger:focus-visible { opacity: .5; color: var(--eva-muted); font-size: 8.5px; line-height: 11px; letter-spacing: .4px; background: rgba(255,255,255,.45); border-radius: 7px 7px 0 0; cursor: pointer; }
.admin-trigger:focus-visible { outline: 2px solid var(--eva-rose); outline-offset: 2px; }
.admin-trigger.armed { cursor: pointer; opacity: .55; color: var(--eva-muted); font-size: 8.5px; line-height: 14px; letter-spacing: .5px; background: rgba(255,255,255,.4); border-radius: 8px 8px 0 0; }
.admin-layer { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; padding: 16px; background: rgba(46,24,33,.55); backdrop-filter: blur(6px); }
.admin-panel { width: min(940px, 100%); max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; background: #fffbfb; border: 1px solid rgba(255,255,255,.9); border-radius: 18px; box-shadow: 0 30px 70px -20px rgba(46,24,33,.5); }
.admin-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; color: #fff6f8; background: linear-gradient(135deg, var(--eva-charcoal), var(--eva-rose-dark)); }
.admin-head h2 { margin: 0; font-size: 16px; display: flex; align-items: center; gap: 8px; }
.admin-head small { display: block; font-size: 11px; opacity: .75; font-weight: 400; }
.admin-tabs { display: flex; gap: 6px; padding: 10px 14px; border-bottom: 1px solid var(--eva-line); background: #fff; overflow-x: auto; }
.admin-tab { flex: 0 0 auto; padding: 8px 14px; border: 1px solid var(--eva-line); border-radius: 999px; background: #fff; color: var(--eva-muted); font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit; }
.admin-tab.is-active { color: #fff; background: var(--eva-rose); border-color: var(--eva-rose); }
.admin-body { padding: 16px 18px; overflow-y: auto; }
.admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; }
.admin-card { border: 1px solid var(--eva-line); border-radius: 14px; overflow: hidden; background: #fff; }
.admin-card img { width: 100%; height: 118px; object-fit: cover; display: block; background: var(--eva-rose-soft); }
.admin-card .ac-body { padding: 10px 12px; display: grid; gap: 6px; }
.admin-card strong { font-size: 13.5px; color: var(--eva-ink); line-height: 1.5; }
.admin-card .ac-price { color: var(--eva-rose); font-weight: 700; font-size: 14px; }
.admin-card .ac-actions { display: flex; gap: 6px; }
.admin-card .ac-actions button { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 7px; border: 1px solid var(--eva-line); border-radius: 9px; background: #fff; color: var(--eva-ink); font-size: 11.5px; font-weight: 600; cursor: pointer; font-family: inherit; }
.admin-card .ac-actions button.danger { color: #a3193f; border-color: #f0c9d4; background: #fff5f7; }
.admin-field { display: grid; gap: 5px; margin-bottom: 12px; }
.admin-field label { font-size: 12px; font-weight: 700; color: var(--eva-muted); }
.admin-field input, .admin-field textarea, .admin-field select { width: 100%; padding: 9px 11px; border: 1px solid var(--eva-line-strong); border-radius: 10px; background: #fff; color: var(--eva-ink); font-family: inherit; font-size: 13.5px; }
.admin-field textarea { min-height: 78px; resize: vertical; line-height: 1.7; }
.admin-field input:focus, .admin-field textarea:focus, .admin-field select:focus { outline: 2px solid var(--eva-rose); outline-offset: 1px; border-color: var(--eva-rose); }
.admin-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.admin-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.admin-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 15px; border: 1px solid transparent; border-radius: 10px; background: var(--eva-rose); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
.admin-btn.ghost { background: #fff; color: var(--eva-ink); border-color: var(--eva-line-strong); }
.admin-btn.success { background: var(--eva-green); }
.admin-btn:disabled { opacity: .5; cursor: not-allowed; }
.admin-note { font-size: 12px; color: var(--eva-muted); line-height: 1.8; background: var(--eva-rose-soft); border: 1px solid var(--eva-rose-tint); border-radius: 10px; padding: 10px 12px; }
.admin-note.ok { background: #eef7f1; border-color: #cfe7d8; color: #2f5c42; }
.admin-login { display: grid; gap: 14px; justify-items: center; text-align: center; padding: 34px 20px; }
.admin-login .lock { display: grid; place-items: center; width: 54px; height: 54px; border-radius: 50%; color: #fff; background: linear-gradient(135deg, var(--eva-rose), var(--eva-charcoal)); }
.admin-login h3 { margin: 0; font-size: 17px; }
.admin-login p { margin: 0; font-size: 12.5px; color: var(--eva-muted); max-width: 330px; line-height: 1.8; }
.admin-pin { display: flex; gap: 8px; }
.admin-pin input { width: 150px; padding: 10px 12px; text-align: center; letter-spacing: 6px; font-size: 17px; border: 1px solid var(--eva-line-strong); border-radius: 10px; font-family: inherit; }
.admin-color-row { display: flex; gap: 8px; align-items: center; }
.admin-color-row input[type=color] { width: 44px; height: 38px; padding: 2px; border: 1px solid var(--eva-line-strong); border-radius: 8px; background: #fff; cursor: pointer; }
.admin-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 9px; border: 1px solid var(--eva-line); border-radius: 999px; background: #fff; font-size: 11.5px; color: var(--eva-ink); }
.admin-chip button { border: 0; background: none; padding: 0; cursor: pointer; color: #a3193f; display: inline-flex; }
.admin-thumb-row { display: flex; gap: 8px; flex-wrap: wrap; }
.admin-thumb { position: relative; width: 74px; height: 74px; border-radius: 10px; overflow: hidden; border: 1px solid var(--eva-line); }
.admin-thumb img { width: 100%; height: 100%; object-fit: cover; }
.admin-thumb button { position: absolute; top: 3px; right: 3px; width: 20px; height: 20px; display: grid; place-items: center; border: 0; border-radius: 50%; background: rgba(46,24,33,.82); color: #fff; cursor: pointer; padding: 0; }
.admin-list { display: grid; gap: 10px; }
.admin-list-item { display: flex; gap: 10px; align-items: center; padding: 9px 11px; border: 1px solid var(--eva-line); border-radius: 12px; background: #fff; }
.admin-list-item img { width: 46px; height: 46px; border-radius: 8px; object-fit: cover; background: var(--eva-rose-soft); }
.admin-list-item .li-main { flex: 1; min-width: 0; display: grid; gap: 2px; }
.admin-list-item .li-main strong { font-size: 13px; }
.admin-list-item .li-main small { font-size: 11.5px; color: var(--eva-muted); }
@media (max-width: 560px) {
  .admin-row { grid-template-columns: 1fr; }
  .admin-body { padding: 13px 13px; }
  .admin-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 9px; }
  .admin-panel { max-height: 94vh; border-radius: 16px; }
}
`

interface AdminSecretProps {
  products: Product[]
  categories: Category[]
}

type Tab = 'products' | 'content' | 'backup'

export function AdminSecret({ products, categories }: AdminSecretProps) {
  const [presses, setPresses] = useState(0)
  const [armed, setArmed] = useState(false)
  const [open, setOpen] = useState(false)
  const [authed, setAuthed] = useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem(SESSION_KEY) === '1'
    } catch {
      return false
    }
  })
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [tab, setTab] = useState<Tab>('products')
  const [editing, setEditing] = useState<Product | null>(null)
  const [toast, setToast] = useState('')
  const [overrides, setOverrides] = useState<Product[]>(() => readAdminProducts())
  const [removed, setRemoved] = useState<string[]>(() => readRemovedSlugs())
  const [content, setContent] = useState<AdminContent>(() => readAdminContent())
  const [customCategories, setCustomCategories] = useState<Category[]>(() => readAdminCategories())
  const [newCat, setNewCat] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const pressTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!toast) return undefined
    const t = window.setTimeout(() => setToast(''), 2200)
    return () => window.clearTimeout(t)
  }, [toast])

  useEffect(() => () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const allProducts = useMemo(() => mergeAdminProducts(products), [products, overrides, removed])
  const allCategories = useMemo(() => [...categories, ...customCategories.filter((c) => !categories.some((x) => x.slug === c.slug))], [categories, customCategories])

  const handleTrigger = () => {
    if (armed) {
      setOpen(true)
      return
    }
    const next = presses + 1
    setPresses(next)
    if (pressTimer.current) window.clearTimeout(pressTimer.current)
    if (next >= 5) {
      setArmed(true)
      setPresses(0)
      window.setTimeout(() => setArmed(false), 6000)
      return
    }
    pressTimer.current = window.setTimeout(() => setPresses(0), 1600)
  }

  const submitPin = () => {
    const stored = (() => {
      try {
        return window.localStorage.getItem(PIN_KEY) || '2468'
      } catch {
        return '2468'
      }
    })()
    if (pin === stored) {
      setAuthed(true)
      setPin('')
      setPinError('')
      try {
        window.sessionStorage.setItem(SESSION_KEY, '1')
      } catch {
        /* ignore */
      }
    } else {
      setPinError('الرمز غير صحيح')
    }
  }

  const logout = () => {
    setAuthed(false)
    try {
      window.sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  const persistProducts = (next: Product[]) => {
    setOverrides(next)
    writeJson(PRODUCTS_KEY, next)
  }

  const persistRemoved = (next: string[]) => {
    setRemoved(next)
    writeJson(REMOVED_KEY, next)
  }

  const saveProduct = (product: Product) => {
    const slug = product.slug.trim() || `custom-${Date.now()}`
    const clean: Product = {
      ...product,
      slug,
      id: product.id || slug,
      name: product.name.trim(),
      price: Math.max(0, Number(product.price) || 0),
      stockMeters: Math.max(0, Number(product.stockMeters) || 0),
      image: product.image || product.images[0] || 'fabrics/hero.jpg',
      images: product.images.length ? product.images : [product.image || 'fabrics/hero.jpg'],
    }
    const exists = overrides.some((item) => item.slug === slug)
    persistProducts(exists ? overrides.map((item) => (item.slug === slug ? clean : item)) : [clean, ...overrides])
    if (removed.includes(slug)) persistRemoved(removed.filter((item) => item !== slug))
    setEditing(null)
    setToast(exists ? 'تم تحديث المنتج' : 'تمت إضافة المنتج')
  }

  const deleteProduct = (product: Product) => {
    const isCustom = overrides.some((item) => item.slug === product.slug)
    if (isCustom) {
      persistProducts(overrides.filter((item) => item.slug !== product.slug))
    } else if (!removed.includes(product.slug)) {
      persistRemoved([...removed, product.slug])
    }
    setToast('تم حذف المنتج')
  }

  const uploadImages = async (files: FileList | null) => {
    if (!files || !files.length || !editing) return
    const list = await Promise.all(Array.from(files).slice(0, 6).map(toFileDataUrl))
    const valid = list.filter((item) => item.length > 2000)
    if (!valid.length) return
    const next = { ...editing, images: [...editing.images, ...valid].slice(0, 8) }
    if (!next.image || next.image === 'fabrics/hero.jpg') next.image = valid[0]
    setEditing(next)
    setToast('تم رفع الصور')
  }

  const restoreAll = () => {
    persistProducts([])
    persistRemoved([])
    setToast('تمت استعادة المنتجات الأصلية')
  }

  const exportData = () => {
    const payload = { products: overrides, removed, categories: customCategories, content, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eva-store-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setToast('تم تنزيل النسخة الاحتياطية')
  }

  const importData = async (file: File | null) => {
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as { products?: Product[]; removed?: string[]; categories?: Category[]; content?: Partial<AdminContent> }
      if (Array.isArray(parsed.products)) persistProducts(parsed.products)
      if (Array.isArray(parsed.removed)) persistRemoved(parsed.removed)
      if (Array.isArray(parsed.categories)) {
        setCustomCategories(parsed.categories)
        writeJson(CATEGORIES_KEY, parsed.categories)
      }
      if (parsed.content) {
        const next = { ...content, ...parsed.content }
        setContent(next)
        writeJson(CONTENT_KEY, next)
      }
      setToast('تم استيراد البيانات')
    } catch {
      setToast('ملف غير صالح')
    }
  }

  const saveContent = () => {
    writeJson(CONTENT_KEY, content)
    setToast('تم حفظ المحتوى')
  }

  const addCategory = () => {
    const name = newCat.trim()
    if (!name) return
    const slug = `cat-${Date.now()}`
    const next = [...customCategories, { id: slug, slug, name, description: name, image: 'fabrics/hero.jpg', accent: '#a34163' }]
    setCustomCategories(next)
    writeJson(CATEGORIES_KEY, next)
    setNewCat('')
    setToast('تمت إضافة التصنيف')
  }

  const removeCategory = (slug: string) => {
    const next = customCategories.filter((item) => item.slug !== slug)
    setCustomCategories(next)
    writeJson(CATEGORIES_KEY, next)
  }

  const setField = (key: keyof Product, value: unknown) => {
    if (!editing) return
    setEditing({ ...editing, [key]: value } as Product)
  }

  return (
    <>
      <style>{adminStyles}</style>
      <button
        type="button"
        className={`admin-trigger${armed ? ' armed' : ''}`}
        onClick={handleTrigger}
        aria-label="تسجيل صغير"
        title=""
      >
        {armed ? 'تسجيل صغير' : ''}
      </button>
      {open && (
        <div className="admin-layer" role="dialog" aria-modal="true" aria-label="لوحة التحكم">
          <div className="admin-panel">
            <div className="admin-head">
              <h2>
                <ShieldCheck size={17} />
                <span>
                  لوحة التحكم
                  <small>{authed ? 'مساحة الإدارة السرية' : 'دخول محمي'}</small>
                </span>
              </h2>
              <div style={{ display: 'flex', gap: 7 }}>
                {authed && (
                  <button type="button" className="admin-btn ghost" style={{ padding: '6px 11px', fontSize: 12 }} onClick={logout}>
                    <LogOut size={14} /> خروج
                  </button>
                )}
                <button type="button" className="admin-btn ghost" style={{ padding: '6px 9px' }} onClick={() => setOpen(false)} aria-label="إغلاق">
                  <X size={16} />
                </button>
              </div>
            </div>

            {!authed ? (
              <div className="admin-login">
                <span className="lock"><Lock size={22} /></span>
                <h3>تسجيل صغير</h3>
                <p>أدخل رمز الدخول للوصول إلى لوحة إدارة المنتجات والمحتوى. الرمز الافتراضي: 2468</p>
                <div className="admin-pin">
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pin}
                    onChange={(event) => { setPin(event.target.value); setPinError('') }}
                    onKeyDown={(event) => { if (event.key === 'Enter') submitPin() }}
                    placeholder="••••"
                    maxLength={8}
                    autoFocus
                    aria-label="رمز الدخول"
                  />
                  <button type="button" className="admin-btn" onClick={submitPin}>
                    <Lock size={15} /> دخول
                  </button>
                </div>
                {pinError && <p style={{ color: '#a3193f', fontWeight: 700, fontSize: 12.5 }}>{pinError}</p>}
              </div>
            ) : (
              <>
                <div className="admin-tabs" role="tablist">
                  <button type="button" className={`admin-tab${tab === 'products' ? ' is-active' : ''}`} onClick={() => setTab('products')} role="tab">
                    المنتجات
                  </button>
                  <button type="button" className={`admin-tab${tab === 'content' ? ' is-active' : ''}`} onClick={() => setTab('content')} role="tab">
                    المحتوى
                  </button>
                  <button type="button" className={`admin-tab${tab === 'backup' ? ' is-active' : ''}`} onClick={() => setTab('backup')} role="tab">
                    النسخ الاحتياطي
                  </button>
                </div>

                <div className="admin-body">
                  {editing ? (
                    <div>
                      <div className="admin-actions" style={{ marginTop: 0, marginBottom: 14 }}>
                        <button type="button" className="admin-btn ghost" onClick={() => setEditing(null)}>
                          <X size={15} /> رجوع للقائمة
                        </button>
                        <span className="admin-chip">{overrides.some((item) => item.slug === editing.slug) ? 'تعديل منتج' : 'منتج جديد'}</span>
                      </div>

                      <div className="admin-thumb-row" style={{ marginBottom: 14 }}>
                        {(editing.images.length ? editing.images : ['fabrics/hero.jpg']).map((src, index) => (
                          <div className="admin-thumb" key={`${src.slice(0, 24)}-${index}`}>
                            <img src={src} alt="" />
                            <button
                              type="button"
                              aria-label="حذف الصورة"
                              onClick={() => setField('images', editing.images.filter((_, i) => i !== index))}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        <button type="button" className="admin-btn ghost" style={{ height: 74, padding: '0 14px' }} onClick={() => fileRef.current?.click()}>
                          <Upload size={15} /> رفع صور
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(event) => void uploadImages(event.target.files)} />
                      </div>

                      <div className="admin-row">
                        <div className="admin-field">
                          <label>اسم المنتج *</label>
                          <input value={editing.name} onChange={(event) => setField('name', event.target.value)} placeholder="مثال: قماش كتان" />
                        </div>
                        <div className="admin-field">
                          <label>الرابط (slug)</label>
                          <input value={editing.slug} onChange={(event) => setField('slug', event.target.value)} dir="ltr" placeholder="cotton-fabric" />
                        </div>
                      </div>

                      <div className="admin-row">
                        <div className="admin-field">
                          <label>السعر (دينار) *</label>
                          <input type="number" min={0} value={editing.price} onChange={(event) => setField('price', Number(event.target.value))} dir="ltr" />
                        </div>
                        <div className="admin-field">
                          <label>المخزون (متر)</label>
                          <input type="number" min={0} value={editing.stockMeters} onChange={(event) => setField('stockMeters', Number(event.target.value))} dir="ltr" />
                        </div>
                      </div>

                      <div className="admin-row">
                        <div className="admin-field">
                          <label>التصنيف</label>
                          <select value={editing.categoryId} onChange={(event) => setField('categoryId', event.target.value)}>
                            {allCategories.map((item) => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="admin-field">
                          <label>النوع</label>
                          <input value={editing.type} onChange={(event) => setField('type', event.target.value)} />
                        </div>
                      </div>

                      <div className="admin-field">
                        <label>الوصف</label>
                        <textarea value={editing.description} onChange={(event) => setField('description', event.target.value)} />
                      </div>

                      <div className="admin-row">
                        <div className="admin-field">
                          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="checkbox" checked={editing.isNew} onChange={(event) => setField('isNew', event.target.checked)} style={{ width: 16, height: 16 }} />
                            منتج جديد
                          </label>
                        </div>
                        <div className="admin-field">
                          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="checkbox" checked={editing.isFeatured} onChange={(event) => setField('isFeatured', event.target.checked)} style={{ width: 16, height: 16 }} />
                            مميز
                          </label>
                        </div>
                      </div>

                      <div className="admin-field">
                        <label>الألوان</label>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {editing.colors.map((color, index) => (
                            <div className="admin-color-row" key={color.id}>
                              <input
                                type="color"
                                value={/^#[0-9a-fA-F]{6}$/.test(color.hex) ? color.hex : '#8e6e7d'}
                                onChange={(event) => {
                                  const next = [...editing.colors]
                                  next[index] = { ...color, hex: event.target.value }
                                  setField('colors', next)
                                }}
                                aria-label={`لون ${index + 1}`}
                              />
                              <input
                                value={color.name}
                                onChange={(event) => {
                                  const next = [...editing.colors]
                                  next[index] = { ...color, name: event.target.value }
                                  setField('colors', next)
                                }}
                                placeholder="اسم اللون"
                                style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--eva-line-strong)', borderRadius: 9, fontFamily: 'inherit', fontSize: 13 }}
                              />
                              <button
                                type="button"
                                className="admin-btn ghost"
                                style={{ padding: '7px 9px' }}
                                disabled={editing.colors.length <= 1}
                                onClick={() => setField('colors', editing.colors.filter((_, i) => i !== index))}
                                aria-label="حذف اللون"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="admin-btn ghost"
                            onClick={() => setField('colors', [...editing.colors, { id: `color-${editing.colors.length + 1}-${Date.now()}`, name: 'لون جديد', hex: '#8e6e7d', available: true, stockMeters: editing.stockMeters }])}
                          >
                            <Plus size={14} /> إضافة لون
                          </button>
                        </div>
                      </div>

                      <div className="admin-actions">
                        <button type="button" className="admin-btn success" onClick={() => saveProduct(editing)} disabled={!editing.name.trim()}>
                          <Save size={15} /> حفظ المنتج
                        </button>
                        <button type="button" className="admin-btn ghost" onClick={() => setEditing(null)}>
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : tab === 'products' ? (
                    <div>
                      <div className="admin-actions" style={{ marginTop: 0, marginBottom: 14 }}>
                        <button type="button" className="admin-btn" onClick={() => setEditing(emptyProduct())}>
                          <Plus size={15} /> إضافة منتج جديد
                        </button>
                        <button type="button" className="admin-btn ghost" onClick={restoreAll}>
                          <RotateCcw size={15} /> استعادة الأصلية
                        </button>
                        <span className="admin-chip">{allProducts.length} منتج</span>
                      </div>
                      <div className="admin-grid">
                        {allProducts.map((product) => (
                          <div className="admin-card" key={product.slug}>
                            <img src={product.image} alt="" loading="lazy" />
                            <div className="ac-body">
                              <strong>{product.name}</strong>
                              <span className="ac-price">{product.price.toLocaleString('ar-IQ')} د.ع</span>
                              <div className="ac-actions">
                                <button type="button" onClick={() => setEditing({ ...product, colors: product.colors.length ? product.colors : emptyProduct().colors, images: product.images.length ? product.images : [product.image] })}>
                                  <Pencil size={13} /> تعديل
                                </button>
                                <button type="button" className="danger" onClick={() => deleteProduct(product)}>
                                  <Trash2 size={13} /> حذف
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : tab === 'content' ? (
                    <div>
                      <div className="admin-note" style={{ marginBottom: 14 }}>
                        عدّل نصوص وبيانات المتجر. تُحفظ التعديلات فوراً في متصفحك وتنعكس على الواجهة مباشرة.
                      </div>
                      <div className="admin-row">
                        <div className="admin-field">
                          <label>اسم المتجر</label>
                          <input value={content.shopName} onChange={(event) => setContent({ ...content, shopName: event.target.value })} />
                        </div>
                        <div className="admin-field">
                          <label>رقم الهاتف</label>
                          <input value={content.phone} onChange={(event) => setContent({ ...content, phone: event.target.value })} dir="ltr" />
                        </div>
                      </div>
                      <div className="admin-row">
                        <div className="admin-field">
                          <label>رقم واتساب (دولي بدون +)</label>
                          <input value={content.whatsapp} onChange={(event) => setContent({ ...content, whatsapp: event.target.value })} dir="ltr" />
                        </div>
                        <div className="admin-field">
                          <label>رابط إنستغرام</label>
                          <input value={content.instagram} onChange={(event) => setContent({ ...content, instagram: event.target.value })} dir="ltr" />
                        </div>
                      </div>
                      <div className="admin-row">
                        <div className="admin-field">
                          <label>الشريط العلوي (يمين)</label>
                          <input value={content.announcementRight} onChange={(event) => setContent({ ...content, announcementRight: event.target.value })} />
                        </div>
                        <div className="admin-field">
                          <label>الشريط العلوي (يسار)</label>
                          <input value={content.announcementLeft} onChange={(event) => setContent({ ...content, announcementLeft: event.target.value })} />
                        </div>
                      </div>
                      <div className="admin-field">
                        <label>عنوان صفحة من نحن</label>
                        <input value={content.aboutTitle} onChange={(event) => setContent({ ...content, aboutTitle: event.target.value })} />
                      </div>
                      <div className="admin-field">
                        <label>نص صفحة من نحن</label>
                        <textarea value={content.aboutText} onChange={(event) => setContent({ ...content, aboutText: event.target.value })} />
                      </div>
                      <div className="admin-field">
                        <label>عنوان صفحة تواصل معنا</label>
                        <input value={content.contactTitle} onChange={(event) => setContent({ ...content, contactTitle: event.target.value })} />
                      </div>
                      <div className="admin-field">
                        <label>نص صفحة تواصل معنا</label>
                        <textarea value={content.contactText} onChange={(event) => setContent({ ...content, contactText: event.target.value })} />
                      </div>

                      <div className="admin-field">
                        <label>التصنيفات</label>
                        <div className="admin-actions" style={{ marginTop: 0 }}>
                          <input value={newCat} onChange={(event) => setNewCat(event.target.value)} placeholder="اسم تصنيف جديد" style={{ flex: 1, minWidth: 160, padding: '9px 11px', border: '1px solid var(--eva-line-strong)', borderRadius: 10, fontFamily: 'inherit', fontSize: 13.5 }} />
                          <button type="button" className="admin-btn" onClick={addCategory}>
                            <Plus size={14} /> إضافة
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 9 }}>
                          {allCategories.map((item) => (
                            <span className="admin-chip" key={item.id}>
                              {item.name}
                              {customCategories.some((c) => c.slug === item.slug) && (
                                <button type="button" onClick={() => removeCategory(item.slug)} aria-label="حذف التصنيف">
                                  <X size={12} />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="admin-actions">
                        <button type="button" className="admin-btn success" onClick={saveContent}>
                          <Save size={15} /> حفظ المحتوى
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="admin-note" style={{ marginBottom: 14 }}>
                        تنزيل نسخة احتياطية من كل التعديلات (منتجات، تصنيفات، محتوى) أو استيرادها من ملف سابق. استخدمها قبل إعادة بناء الموقع لحفظ تعديلاتك.
                      </div>
                      <div className="admin-actions" style={{ marginTop: 0 }}>
                        <button type="button" className="admin-btn" onClick={exportData}>
                          <Download size={15} /> تنزيل نسخة احتياطية
                        </button>
                        <label className="admin-btn ghost" style={{ cursor: 'pointer' }}>
                          <Upload size={15} /> استيراد نسخة
                          <input type="file" accept="application/json" hidden onChange={(event) => void importData(event.target.files?.[0] ?? null)} />
                        </label>
                        <button type="button" className="admin-btn ghost" onClick={restoreAll}>
                          <RotateCcw size={15} /> استعادة الافتراضي
                        </button>
                      </div>

                      <div className="admin-field" style={{ marginTop: 18 }}>
                        <label>تغيير رمز الدخول</label>
                        <div className="admin-actions" style={{ marginTop: 0 }}>
                          <input
                            id="new-pin"
                            type="password"
                            inputMode="numeric"
                            placeholder="رمز جديد (4-8 أرقام)"
                            maxLength={8}
                            style={{ flex: 1, minWidth: 150, padding: '9px 11px', border: '1px solid var(--eva-line-strong)', borderRadius: 10, fontFamily: 'inherit', fontSize: 14, letterSpacing: 4 }}
                            onKeyDown={(event) => {
                              if (event.key !== 'Enter') return
                              const value = (event.target as HTMLInputElement).value.trim()
                              if (/^\d{4,8}$/.test(value)) {
                                try { window.localStorage.setItem(PIN_KEY, value) } catch { /* ignore */ }
                                ;(event.target as HTMLInputElement).value = ''
                                setToast('تم تغيير الرمز')
                              } else {
                                setToast('الرمز يجب أن يكون 4-8 أرقام')
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={() => {
                              const input = document.getElementById('new-pin') as HTMLInputElement | null
                              const value = input?.value.trim() ?? ''
                              if (!/^\d{4,8}$/.test(value)) {
                                setToast('الرمز يجب أن يكون 4-8 أرقام')
                                return
                              }
                              try { window.localStorage.setItem(PIN_KEY, value) } catch { /* ignore */ }
                              if (input) input.value = ''
                              setToast('تم تغيير الرمز')
                            }}
                          >
                            <Save size={15} /> حفظ الرمز
                          </button>
                        </div>
                      </div>

                      <div className="admin-list">
                        <div className="admin-list-item">
                          <ImageIcon size={20} style={{ color: 'var(--eva-rose)' }} />
                          <div className="li-main">
                            <strong>{allProducts.length} منتج</strong>
                            <small>{overrides.length} مُعدَّل · {removed.length} محذوف</small>
                          </div>
                        </div>
                        <div className="admin-list-item">
                          <Check size={20} style={{ color: 'var(--eva-green)' }} />
                          <div className="li-main">
                            <strong>{content.shopName}</strong>
                            <small dir="ltr">{content.phone}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {toast && (
        <div style={{ position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 400, background: 'var(--eva-charcoal)', color: '#fff6f8', padding: '10px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, boxShadow: '0 12px 30px -12px rgba(46,24,33,.6)' }} role="status">
          {toast}
        </div>
      )}
    </>
  )
}

export { fallbackProducts, fallbackCategories }
