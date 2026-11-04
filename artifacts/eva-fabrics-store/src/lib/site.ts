const adminContent = (): Record<string, string> => {
  try {
    const raw = window.localStorage.getItem('lamha-admin-content')
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, string>) : {}
  } catch {
    return {}
  }
}

const rawWhatsApp = import.meta.env.VITE_WHATSAPP_NUMBER || '9647727282001'
const rawInstagram = import.meta.env.VITE_INSTAGRAM_URL || ''
const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

const digits = (value: string): string => value.replace(/[^0-9]/g, '')

const internationalWhatsApp = (() => {
  let value = digits(rawWhatsApp)
  if (value.startsWith('00')) value = value.slice(2)
  if (value.startsWith('0')) value = `964${value.slice(1)}`
  if (!value.startsWith('964') && value.length > 0) value = `964${value}`
  return value || '9647727282001'
})()

const localPhone = (() => {
  if (internationalWhatsApp.startsWith('9647')) return `0${internationalWhatsApp.slice(4)}`
  return rawWhatsApp
})()

const safeInstagram = /^https:\/\/www\.instagram\.com\/[A-Za-z0-9._]+\/?$/i.test(rawInstagram) ? rawInstagram : ''

export const siteConfig = {
  get name() { return adminContent().shopName || 'لَمْحة للحماية الذكية' },
  shortName: 'لَمْحة',
  get phone() { return adminContent().phone || localPhone },
  get instagramUrl() { return adminContent().instagram || safeInstagram },
  get contactEmail() { return adminContent().emailOrdersTo || '' },
  emailUrl: (subject = 'استفسار من لَمْحة', body = 'مرحباً لَمْحة، أريد الاستفسار عن أجهزة المراقبة.'): string => `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  instagramText: 'لَمْحة على إنستغرام',
}

export const apiUrl = (path: string): string => `${apiBase}${path.startsWith('/') ? path : `/${path}`}`

export const phoneDigits = digits

const isTouchDevice = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches

export const telProps = (phone: string): { href?: string } => ({ href: isTouchDevice() ? `tel:${phone}` : undefined })
