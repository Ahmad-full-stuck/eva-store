const rawWhatsApp = import.meta.env.VITE_WHATSAPP_NUMBER || '9647727282001'
const rawInstagram = import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com'
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

const safeInstagram = /^https?:\/\//i.test(rawInstagram) ? rawInstagram : `https://${rawInstagram.replace(/^\/+/, '')}`

export const siteConfig = {
  name: 'إيفا ستور للأقمشة',
  shortName: 'إيفا ستور',
  phone: localPhone,
  whatsappNumber: internationalWhatsApp,
  instagramUrl: safeInstagram,
  whatsappUrl: (message = 'مرحباً إيفا ستور، أحتاج مساعدة في اختيار الأقمشة'): string => `https://wa.me/${internationalWhatsApp}?text=${encodeURIComponent(message)}`,
  instagramText: 'إيفا ستور على إنستغرام',
}

export const apiUrl = (path: string): string => `${apiBase}${path.startsWith('/') ? path : `/${path}`}`

export const phoneDigits = digits
