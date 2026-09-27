import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react'
import { siteConfig } from '@/lib/site'

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'sent'>('idle')

  const subscribeUrl = siteConfig.whatsappUrl(
    email.trim()
      ? `مرحباً اخوان الصفا، أرغب بالاشتراك في النشرة عبر البريد: ${email.trim()}`
      : 'مرحباً اخوان الصفا، أرغب بالاشتراك في نشرة المواد',
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
          <span className="eyebrow"><Mail size={14} />نشرة الصفا</span>
          <h2>جديد المواد يصل إلى بريدك أولاً</h2>
          <p>مورد جديد، مخزون متجدد، أو عرض لفترة محدودة، نرسله لك عند حدوثه فقط.</p>
        </div>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email" className="sr-only">البريد الإلكتروني</label>
          <input
            id="newsletter-email"
            className="glass-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setStatus('idle')
            }}
            aria-invalid={status === 'error'}
            aria-describedby="newsletter-status"
          />
          <button type="submit" className="button button-primary">
            اشترك بالنشرة <ArrowLeft size={15} />
          </button>
        </form>
        <div id="newsletter-status" role="status" aria-live="polite" style={{ minHeight: 18, fontSize: 11 }}>
          {status === 'error' && 'يرجى إدخال بريد إلكتروني صحيح.'}
          {status === 'sent' && 'فتحنا لك واتساب لإتمام الاشتراك.'}
        </div>
        <p className="newsletter-note">
          أو اطلب استشارة في اختيار المواد عبر{' '}
          <a href={siteConfig.whatsappUrl()} target="_blank" rel="noreferrer">
            واتساب <MessageCircle size={13} />
          </a>
        </p>
      </div>
    </section>
  )
}
