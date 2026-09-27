import { ArrowLeft } from 'lucide-react'
import { Link } from 'wouter'
import { SectionHeading } from './SectionHeading'

const orderSteps = [
  {
    index: '٠١',
    title: 'اختاري القماش',
    text: 'تصفحي الأقسام وقارني الصور والمواصفات: السماكة والمرونة والشفافية قبل أن تقرري.',
    hint: 'بدون تسجيل',
  },
  {
    index: '٠٢',
    title: 'حددي اللون والكمية',
    text: 'أضيفي نصف متر فأكثر إلى السلة، والكمية المتاحة مكتوبة أمام كل لون من الألوان.',
    hint: 'مخزون واضح',
  },
  {
    index: '٠٣',
    title: 'أرسلي الطلب وادفعي',
    text: 'أكملي اسمك ومحافظتك وعنوانك، ثم ادفعي نقداً عند استلام الطلب في باب المنزل.',
    hint: 'دفع عند الاستلام',
  },
]

export function StepsSection() {
  return (
    <section className="container-eva section-soft" aria-label="كيف تطلب؟" style={{ marginBlock: 'clamp(16px, 3vw, 32px)' }}>
      <SectionHeading eyebrow="ثلاث خطوات فقط" title="كيف تطلب؟" description="من اختيار القماش إلى باب المنزل" linkLabel="ابدئي التسوق" linkHref="/catalog" />
      <div className="steps-grid">
        {orderSteps.map((step) => (
          <article className="step-card glass-card" key={step.index}>
            <span className="step-index">{step.index}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <span className="chip" style={{ display: 'inline-flex', marginTop: 14 }}>{step.hint}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="center-action">
        <Link href="/catalog" className="button button-primary">تصفحي كل الأقمشة <ArrowLeft size={16} /></Link>
      </div>
    </section>
  )
}
