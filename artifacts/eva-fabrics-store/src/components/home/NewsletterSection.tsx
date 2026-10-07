import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, Mail } from 'lucide-react'
import { sendSimpleEmail } from '@/lib/email'
import { siteConfig } from '@/lib/site'
import { useSiteContent } from '@/lib/site-content'

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'sent'>('idle')
  const content = useSiteContent()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = email.trim()
    if (!isValidEmail(value)) {
      setStatus('error')
      return
    }
    setStatus('sent')
    void sendSimpleEmail({
      to: content.emailOrdersTo || 'wealiahmad.ali@gmail.com',
      action: content.emailFormSubmitAction || undefined,
      subject: 'اشتراك في نشرة إيفا ستور',
      body: `طلب اشتراك في النشرة من الموقع\nالبريد: ${value}`,
      fields: { email: value },
    })
  }

  return (
    <section className="container-eva section-block" aria-label="اشتراك بالنشرة">
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
            اشتراك بالبريد <ArrowLeft size={15} />
          </button>
        </form>
        <div id="newsletter-status" role="status" aria-live="polite" style={{ minHeight: 18, fontSize: 11.5 }}>
          {status === 'error' && 'يرجى إدخال بريد إلكتروني صحيح.'}
          {status === 'sent' && 'تم تسجيل بريدك في النشرة، ستصلك أحدث القطع والأخبار.'}
        </div>
        <p className="newsletter-note">
          أو اطلبي استشارة في اختيار القماش عبر{' '}
          <a href={siteConfig.emailUrl('استشارة في اختيار القماش', 'مرحباً، أريد استشارة في اختيار القماش المناسب.')} target="_blank" rel="noreferrer">
            البريد <Mail size={13} />
          </a>
        </p>
      </div>
    </section>
  )
}
