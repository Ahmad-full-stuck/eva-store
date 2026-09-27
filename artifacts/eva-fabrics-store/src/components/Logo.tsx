import { Link } from 'wouter'
import { siteConfig } from '@/lib/site'

interface LogoProps {
  light?: boolean
}

export function Logo({ light = false }: LogoProps) {
  const classes = ['logo', light ? 'logo-light' : ''].filter(Boolean).join(' ')
  return (
    <Link href="/" className={classes} aria-label={`${siteConfig.name}، الصفحة الرئيسية`}>
      <svg className="logo-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <rect width="40" height="40" rx="10" fill="#0E6B45" />
        <path d="M9.5 32V20.5a10.5 10.5 0 0 1 21 0V32" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
        <rect x="17" y="23.5" width="6" height="8.5" rx="1.6" fill="#C05A11" />
      </svg>
      <span className="logo-copy">
        <strong>{siteConfig.name}</strong>
        <small>{siteConfig.tagline}</small>
      </span>
    </Link>
  )
}
