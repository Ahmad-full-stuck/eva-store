import { ArrowLeft, Camera } from 'lucide-react'
import { Link } from 'wouter'
import { useSiteContent } from '@/lib/site-content'

export function PromoBar() {
  const content = useSiteContent()
  return (
    <div className="container-eva" style={{ marginBlock: 'clamp(14px, 3vw, 30px)' }}>
      <section className="promo-bar" aria-label={content.promoLead}>
        <span className="glass-pill"><Camera size={13} />{content.promoPill}</span>
        <p><strong>{content.promoLead}</strong> {content.promoText}</p>
        <Link href="/catalog" className="button button-primary button-small">تصفّح الأجهزة <ArrowLeft size={14} /></Link>
      </section>
    </div>
  )
}
