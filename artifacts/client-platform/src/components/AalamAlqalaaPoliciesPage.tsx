import { BadgeCheck, CreditCard, FileCheck2, MapPin, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { Link } from 'wouter'
import { useSiteContent } from '@/lib/site-content'
import './aalam-alqalaa-policies.css'

const policies = [
  {
    id:'prices',
    Icon:CreditCard,
    title:'الأسعار وتأكيد الطلب',
    intro:'الأسعار والتوفر قد يختلفان بحسب الموديل والسعة واللون ووقت الطلب.',
    points:[
      'يؤكد فريق عالم القلعة السعر النهائي والتوفر قبل اعتماد الطلب.',
      'لا يعتبر إرسال الطلب تأكيداً للسعر أو حجزاً للمخزون حتى تتواصل معك خدمة المتجر.',
      'تُراجع تفاصيل المنتج والملحقات المشمولة قبل إتمام الشراء.'
    ]
  },
  {
    id:'warranty',
    Icon:ShieldCheck,
    title:'الضمان الذهبي',
    intro:'بحسب ما تعلنه عالم القلعة، يتضمن الضمان الذهبي سنة استبدال بجهاز جديد عند وجود خلل مصنعي، وفق الشروط المعتمدة.',
    points:[
      'مدة الضمان المعلنة سنة واحدة.',
      'يشمل الاستبدال حالة الخلل المصنعي ووفق شروط الضمان المعتمدة.',
      'تختلف الشروط والاستثناءات بحسب المنتج؛ اطلب تفاصيل ضمان المنتج قبل الشراء.'
    ]
  },
  {
    id:'delivery',
    Icon:Truck,
    title:'التوصيل والاستلام',
    intro:'التوصيل متاح إلى جميع محافظات العراق، مع وجود خمسة فروع في بغداد.',
    points:[
      'تُحدد رسوم التوصيل وموعده عند تأكيد الطلب.',
      'تأكد من صحة رقم الهاتف والعنوان قبل إرسال الطلب.',
      'تواصل مع فريق المتجر لمعرفة خيار الاستلام من الفروع إن كان متاحاً للطلب.'
    ]
  },
  {
    id:'returns',
    Icon:PackageCheck,
    title:'الاستبدال والإرجاع',
    intro:'تُؤكد شروط الاستبدال والإرجاع الخاصة بكل منتج مباشرة من عالم القلعة قبل الشراء.',
    points:[
      'استفسر عن مدة وإجراءات الاستبدال والإرجاع قبل اعتماد الطلب.',
      'احتفظ بفاتورة الشراء وملحقات المنتج عند الحاجة إلى مراجعة خدمة ما بعد البيع.',
      'لا تُعد هذه الصفحة بديلاً عن شروط الضمان أو سياسة المتجر المعتمدة.'
    ]
  },
  {
    id:'privacy',
    Icon:FileCheck2,
    title:'الخصوصية واستخدام البيانات',
    intro:'تُستخدم بيانات التواصل والعنوان التي تدخلها في المتجر لمتابعة استفسارك أو طلبك والتواصل بشأنه.',
    points:[
      'أدخل البيانات اللازمة لإتمام طلبك فقط.',
      'لا تشارك بيانات الدفع أو كلمات المرور في حقل الملاحظات.',
      'تواصل مع المتجر عبر قنواته الرسمية لأي استفسار متعلق ببياناتك.'
    ]
  }
]

export function AalamAlqalaaPoliciesPage() {
  const content = useSiteContent()
  return (
    <main className="aalam-policy-page">
      <div className="aalam-policy-page__container">
        <div className="aalam-policy-page__eyebrow"><span /> CASTLE WORLD · معلومات تهمك</div>
        <h1>تسوّق وأنت تعرف التفاصيل.</h1>
        <p className="aalam-policy-page__intro">نوضح لك المعلومات الأساسية حول الأسعار والضمان والتوصيل. وأي شرط خاص بالمنتج يتم تأكيده مع فريق عالم القلعة قبل اعتماد الطلب.</p>
        <section className="aalam-policy-page__highlights">
          <div><span><BadgeCheck size={18}/></span><strong>منذ 2004</strong><small>خبرة وثقة</small></div>
          <div><span><ShieldCheck size={18}/></span><strong>سنة واحدة</strong><small>الضمان الذهبي وفق الشروط</small></div>
          <div><span><Truck size={18}/></span><strong>كل العراق</strong><small>التوصيل للمحافظات</small></div>
        </section>
        <div className="aalam-policy-page__list">
          {policies.map(({id,Icon,title,intro,points})=>(
            <details className="aalam-policy-card" id={id} key={id}>
              <summary><span className="aalam-policy-card__icon"><Icon size={20}/></span><span><strong>{title}</strong><small>{intro}</small></span><b>+</b></summary>
              <ul>{points.map(point=><li key={point}>{point}</li>)}</ul>
            </details>
          ))}
        </div>
        <div className="aalam-policy-page__contact">
          <span className="aalam-policy-page__pin"><MapPin size={20}/></span>
          <div><strong>تحتاج توضيحاً قبل الشراء؟</strong><p>{content.location || 'خمسة فروع في بغداد · توصيل إلى جميع محافظات العراق'}</p></div>
          <Link to="/contact">تواصل مع المتجر</Link>
        </div>
      </div>
    </main>
  )
}
