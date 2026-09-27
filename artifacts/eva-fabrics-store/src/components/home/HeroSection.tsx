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
    { key: 'fabrics', icon: <Layers size={16} />, value: products.length, prefix: '+', suffix: '', label: 'خامة متاحة', trend: 'تشكيلة تتجدد' },
    { key: 'categories', icon: <LayoutGrid size={16} />, value: categories.length, prefix: '+', suffix: '', label: 'أقسام مختارة', trend: 'لكل مشروع' },
    { key: 'delivery', icon: <Truck size={16} />, value: 24, prefix: '', suffix: '', label: 'ساعة للتوصيل', trend: 'كل محافظات العراق' },
    { key: 'cash', icon: <Wallet size={16} />, value: 100, prefix: '', suffix: '٪', label: 'دفع عند الاستلام', trend: 'مريح وآمن' },
  ]

  return (
    <>
      <section className="home-hero glass-hero container-eva">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14} />معرض أقمشة عربي</span>
          <h1>اختاري <span>القماش المثالي</span><br />لكل إبداع</h1>
          <p>تشكيلة منتقاة من الأقمشة الفاخرة والمريحة، مع شرح واضح للخامة قبل أن تضيفيها إلى مشروعك.</p>
          <div className="hero-actions">
            <Link href="/catalog" className="button button-primary">تصفحي الأقمشة <ArrowLeft size={16} /></Link>
            <Link href="/catalog?sort=newest" className="button button-outline">اكتشفي الجديد <ArrowRight size={16} /></Link>
          </div>
          <div className="hero-note"><span className="note-dot" />توصيل إلى جميع محافظات العراق <span className="note-divider" /> دفع عند استلام الطلب</div>
        </div>
        <div className="hero-visual">
          <img src="fabrics/hero.jpg" alt="نماذج من أقمشة إيفا ستور" />
          <div className="hero-visual-overlay" />
          <div className="hero-vertical-label" aria-hidden="true">EVA · FABRICS</div>
        </div>
      </section>

      <div className="container-eva" style={{ position: 'relative', zIndex: 2, marginTop: 'clamp(-84px, -5vw, -30px)' }}>
        <div className="glass-card">
          <span className="glass-pill">أرقام المعرض الآن</span>
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
