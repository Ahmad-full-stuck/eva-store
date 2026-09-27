import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Layers, LayoutGrid, Sparkles, Truck, Wallet } from 'lucide-react'
import { Link } from 'wouter'
import type { Category, Product } from '@/types'
import { CountUp } from './CountUp'

interface HeroSectionProps {
  products: Product[]
  categories: Category[]
}

interface HeroStat {
  key: string
  icon: ReactNode
  value: number
  prefix: string
  suffix: string
  label: string
  trend: string
}

export function HeroSection({ products, categories }: HeroSectionProps) {
  const stats: HeroStat[] = [
    { key: 'fabrics', icon: <Layers size={16} />, value: products.length, prefix: '+', suffix: '', label: 'منتج متاح', trend: 'تشكيلة تتجدد' },
    { key: 'categories', icon: <LayoutGrid size={16} />, value: categories.length, prefix: '+', suffix: '', label: 'قسم متخصص', trend: 'لكل مشروع' },
    { key: 'delivery', icon: <Truck size={16} />, value: 24, prefix: '', suffix: '', label: 'ساعة للتجهيز', trend: 'كل محافظات العراق' },
    { key: 'cash', icon: <Wallet size={16} />, value: 100, prefix: '', suffix: '٪', label: 'دفع عند الاستلام', trend: 'مريح وآمن' },
  ]

  return (
    <>
      <section className="home-hero glass-hero container-eva">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14} />مواد إنشائية وصحية وأصباغ</span>
          <h1>اختر <span>المادة المناسبة</span><br />لمشروعك</h1>
          <p>تشكيلة منتقاة من المواد الإنشائية والصحية والأصباغ، مع مواصفات واضحة قبل أن تضيفها إلى مشروعك.</p>
          <div className="hero-actions">
            <Link href="/catalog" className="button button-primary">تصفح المنتجات <ArrowLeft size={16} /></Link>
            <Link href="/catalog?sort=newest" className="button button-outline">اكتشف الجديد <ArrowRight size={16} /></Link>
          </div>
          <div className="hero-note"><span className="note-dot" />توصيل إلى جميع محافظات العراق <span className="note-divider" /> دفع عند استلام الطلب</div>
        </div>
        <div className="hero-visual">
          <img src="media/hero.svg" alt="مواد إنشائية وصحية وأصباغ من اخوان الصفا" />
          <div className="hero-visual-overlay" />
          <div className="hero-vertical-label" aria-hidden="true">AL SIFA · MATERIALS</div>
        </div>
      </section>

      <div className="container-eva" style={{ position: 'relative', zIndex: 2, marginTop: 'clamp(-84px, -5vw, -30px)' }}>
        <div className="glass-card">
          <span className="glass-pill">أرقام المخزون الآن</span>
          <div className="stats-grid">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.key} role="group" aria-label={`${stat.prefix}${stat.value.toLocaleString('ar-IQ')}${stat.suffix} ${stat.label}`}>
                <span className="stat-icon" aria-hidden="true">{stat.icon}</span>
                <strong className="stat-value"><CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} /></strong>
                <span className="stat-label">{stat.label}</span>
                <span className="stat-trend">{stat.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
