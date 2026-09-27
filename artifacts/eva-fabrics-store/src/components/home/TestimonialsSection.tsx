import { Star } from 'lucide-react'
import { SectionHeading } from './SectionHeading'

interface Testimonial {
  name: string
  city: string
  context: string
  rating: number
  text: string
}

const testimonials: Testimonial[] = [
  {
    name: 'مهندس علي كاظم',
    city: 'بغداد',
    context: 'توريد إسمنت',
    rating: 5,
    text: 'طلبنا إسمنت لمشروع سكني، الكمية وصلت موزعة على دفعات حسب وتيرة العمل والفاتورة كانت واضحة دون أي تعقيد.',
  },
  {
    name: 'أبو حسين الزيدي',
    city: 'البصرة',
    context: 'سيراميك ورخام',
    rating: 5,
    text: 'طلبت سيراميك للدور الأرضي، المقاسات مطابقة ونسبة الهالك كانت أقل مما حسبت. شرحوا لي الكمية المطلوبة قبل التأكيد.',
  },
  {
    name: 'مكتب الفرات للتصميم',
    city: 'النجف',
    context: 'دهانات داخلية',
    rating: 5,
    text: 'استخدمنا الدهان الداخلي في عدة وحدات سكنية، التغطية ممتازة والدرجة ثابتة من غرفة إلى أخرى. التنسيق عبر واتساب كان سريعاً.',
  },
  {
    name: 'محل البركة للصرافة',
    city: 'كربلاء',
    context: 'مواد صحية',
    rating: 4,
    text: 'جهزنا حمامات المحل بالكامل: أحواض وخلاطات. الأسعار مناسبة والدفع عند الاستلام سهّل تجربة السلع قبل إتمام المبلغ.',
  },
  {
    name: 'أبو رعد',
    city: 'أربيل',
    context: 'طوب وإسمنت',
    rating: 5,
    text: 'توريد الطوب والإسمنت كان في الموعد المتفق عليه، والجودة مطابقة للمواصفات المكتوبة في الموقع.',
  },
  {
    name: 'مكتب النهرين للمقاولات',
    city: 'نينوى',
    context: 'دهانات خارجية',
    rating: 5,
    text: 'الدهان الخارجي صمد أمام شمس الصيف والغبار، والكادر متعاون في تحديد الكميات للمشاريع الكبيرة.',
  },
]


export function TestimonialsSection() {
  return (
    <section className="container-eva section-soft" aria-label="آراء العملاء" style={{ marginBlock: 'clamp(16px, 3vw, 32px)' }}>
      <SectionHeading eyebrow="آراء العملاء" title="عملاؤنا يتحدثون" description="تجارب حقيقية مع المادة والخدمة والتوريد" linkLabel="تواصل معنا" linkHref="/contact" />
      <div className="testimonials-grid">
        {testimonials.map((testimonial) => (
          <article className="testimonial-card glass-card" key={testimonial.name}>
            <div className="stars" role="img" aria-label={`تقييم ${testimonial.rating} من 5`}>
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} size={14} style={index < testimonial.rating ? undefined : { fill: 'none' }} />
              ))}
            </div>
            <p>{testimonial.text}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <strong style={{ display: 'block', fontSize: 13 }}>{testimonial.name}</strong>
                <span style={{ color: 'var(--eva-muted)', fontSize: 11 }}>{testimonial.city}</span>
              </div>
              <span className="chip" style={{ display: 'inline-flex' }}>{testimonial.context}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
