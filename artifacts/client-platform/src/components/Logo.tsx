import { Link } from 'wouter'
import { useT } from '@/lib/i18n'
import { useSiteContent } from '@/lib/site-content'

interface LogoProps {
  light?: boolean
  glass?: boolean
}

export function Logo({ light = false, glass = false }: LogoProps) {
  const { t } = useT()
  const content = useSiteContent()
  const classes = ['logo', light ? 'logo-light' : '', glass ? 'glass-pill' : ''].filter(Boolean).join(' ')
  return (
    <Link href="/" className={classes} aria-label={t('core.logoHome')}>
      <span className="logo-symbol" aria-hidden="true">
        {content.tenantKey === 'mustafa-store' ? <img src="/mustafa-store-mark.svg" alt="" /> : content.tenantKey === 'aalam-alqalaa' ? <img src="/aalam-alqalaa-mark.svg" alt="" /> : <b>{content.monogram || (content.shortName || content.shopName || 'M').slice(0, 1)}</b>}
      </span>
      <span className="logo-copy">
        <strong>{content.shortName || content.shopName || t('core.logoName')}</strong>
        <small>{content.tagline || t('core.logoTag')}</small>
      </span>
    </Link>
  )
}
