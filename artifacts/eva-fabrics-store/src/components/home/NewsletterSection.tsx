import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react'
import { siteConfig } from '@/lib/site'
import { useSiteContent } from '@/lib/site-content'

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'sent'>('idle')
  const content = useSiteContent()

  const subscribeUrl = siteConfig.whatsappUrl(
    email.trim()
      ? `مرحباً إيفا ستور، أرغب بالاشتراك في النشرة عبر البريد: ${email.trim()}`
      : 'مرحباً إيفا ستور، أرغب بالاشتراك في نشرة الأقمشة',
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = email.trim()
    if (!isValidEmail(value)) {
      setStatus('error')
      return
    }
    setStatus('sent')
    window.open(subscribeUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="container-eva section-block" aria-label="النشرة البريدية">
      <div className="newsletter-card">
        <div>
          <span className="eyebrow"><Mail size={14} />{content.newsletterEyebrow}</span>
          <h2>{content.newsletterTitle}</h2>
          <p>{content.newsletterText}</p>
        </div>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email" className="sr-only">البريد الإلكتروني</label>
          <input
            id="newsletter-email"
            className="glass-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="بريدك الإلكتروني"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setStatus('idle')
            }}
            aria-invalid={status === 'error'}
            aria-describedby="newsletter-status"
          />
          <button type="submit" className="button button-primary">
            اشتركي بالنشرة <ArrowLeft size={15} />
          </button>
        </form>
        <div id="newsletter-status" role="status" aria-live="polite" style={{ minHeight: 18, fontSize: 11.5 }}>
          {status === 'error' && 'يرجى إدخال بريد إلكتروني صحيح.'}
          {status === 'sent' && 'فتحنا لك واتساب لإتمام الاشتراك.'}
        </div>
        <p className="newsletter-note">
          أو اطلبي استشارة في اختيار القماش عبر{' '}
          <a href={siteConfig.whatsappUrl()} target="_blank" rel="noreferrer">
            واتساب <MessageCircle size={13} />
          </a>
        </p>
      </div>
    </section>
  )
}
