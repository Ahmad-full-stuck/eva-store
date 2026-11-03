import { ArrowLeft, Instagram } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { siteConfig } from '@/lib/site'

export function NewsletterSection() {
  const { t } = useT()
  return (
    <section className="container-eva section-block newsletter-section" aria-label={t('home.newsletter.aria')}>
      <div className="newsletter-copy">
        <span className="eyebrow">{t('home.newsletter.eyebrow')}</span>
        <h2>{t('home.newsletter.title')}</h2>
        <p>{t('home.newsletter.text')}</p>
      </div>
      <div className="newsletter-form-wrap">
        <a className="button button-primary" href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">
          <Instagram size={17} /> {t('home.newsletter.noteLink')} <ArrowLeft size={15} />
        </a>
      </div>
    </section>
  )
}
