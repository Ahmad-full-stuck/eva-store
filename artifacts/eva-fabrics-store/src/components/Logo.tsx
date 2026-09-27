import { Link } from 'wouter'

interface LogoProps {
  light?: boolean
  glass?: boolean
}

export function Logo({ light = false, glass = false }: LogoProps) {
  const classes = ['logo', light ? 'logo-light' : '', glass ? 'glass-pill' : ''].filter(Boolean).join(' ')
  return (
    <Link href="/" className={classes} aria-label="إيفا ستور، الصفحة الرئيسية">
      <span className="logo-symbol" aria-hidden="true">
        <span />
      </span>
      <span className="logo-copy">
        <strong>إيفا ستور</strong>
        <small>للأقمشة</small>
      </span>
    </Link>
  )
}
