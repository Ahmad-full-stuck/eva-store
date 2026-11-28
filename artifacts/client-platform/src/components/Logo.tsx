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
  const tenantKey = content.tenantKey || (typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : '')
  const classes = ['logo', light ? 'logo-light' : '', glass ? 'glass-pill' : ''].filter(Boolean).join(' ')
  return (
    <Link href="/" className={classes} aria-label={t('core.logoHome')}>
      <span className={"logo-symbol" + (tenantKey === "amira-iraq" || tenantKey === "arin-fashion95" ? " logo-symbol-brand" : "")} aria-hidden="true">
        {tenantKey === 'mustafa-store' ? <img src="/mustafa-store-mark.svg" alt="" /> : tenantKey === 'aalam-alqalaa' ? <img src="/aalam-alqalaa-mark.svg" alt="" /> : tenantKey === 'amira-iraq' ? <img src="/amira-iraq-mark.svg" alt="" /> : tenantKey === 'arin-fashion95' ? <img src="/arin-fashion95-mark.svg" alt="" /> : <b>{content.monogram || (content.shortName || content.shopName || 'M').slice(0, 1)}</b>}
      </span>
      <span className="logo-copy">
        <strong>{content.shortName || content.shopName || t('core.logoName')}</strong>
        <small>{content.tagline || t('core.logoTag')}</small>
      </span>
    </Link>
  )
}
