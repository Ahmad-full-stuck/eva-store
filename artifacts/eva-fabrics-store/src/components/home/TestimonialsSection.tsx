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
    name: 'مروة الجبوري',
    city: 'بغداد',
    context: 'كريب سبانديكس',
    rating: 5,
    text: 'طلبت كريب سبانديكس لفستان يومي، اللون مطابق للصورة والتمدد مريح طوال اليوم. وصلني الطلب خلال يومين إلى بغداد.',
  },
  {
    name: 'سارة عبد الله',
    city: 'البصرة',
    context: 'تافتا مطرزة',
    rating: 5,
    text: 'التافتا المطرزة ثابتة والتطريز لم يتفكك بعد الغسيل. شرحو لي طريقة العناية بالقماش قبل أن أؤكد الطلب.',
  },
  {
    name: 'نور الهدى كريم',
    city: 'أربيل',
    context: 'لينن قطن',
    rating: 4,
    text: 'اللينن خفيف ومناسب للصيف، وبدأت بنصف متر كتجربة. نصحوني بالبطانة كما هو مكتوب في المواصفات وكانت النصيحة صحيحة.',
  },
  {
    name: 'ضياء فاضل',
    city: 'النجف',
    context: 'تويل سبانديكس',
    rating: 5,
    text: 'التويل ثابت ولا يحتاج كي كثيراً، والدفع عند الاستلام سهّل عليّ تجربة الخامة قبل إتمام المبلغ كاملاً.',
  },
  {
    name: 'آيات حسن',
    city: 'كربلاء',
    context: 'ترتر هولوغرام',
    rating: 5,
    text: 'لمعة الترتر أنيقة وليست صارخة، واستخدمته في فستان سهرة ونال إعجاب الجميع. الكمية كانت متوفرة فور الطلب.',
  },
  {
    name: 'رفل مهدي',
    city: 'نينوى',
    context: 'جاكار مزهر',
    rating: 5,
    text: 'الجاكار قوامه واضح ويمنح القطعة شكلاً رسمياً، وصلني مع شرح للكمية المطلوبة وفاتورة واضحة دون أي تعقيد.',
  },
]

export function TestimonialsSection() {
  return (
    <section className="container-eva section-soft" aria-label="آراء العملاء" style={{ marginBlock: 'clamp(16px, 3vw, 32px)' }}>
      <SectionHeading eyebrow="آراء العملاء" title="عميلات إيفا يتحدثن" description="تجارب حقيقية مع الخامة والخدمة والطلب" linkLabel="تواصلي معنا" linkHref="/contact" />
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
