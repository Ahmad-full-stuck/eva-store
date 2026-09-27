const rawWhatsApp = import.meta.env.VITE_WHATSAPP_NUMBER || '9647727282001'
const rawInstagram = import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/al_sifa.company'
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
  name: 'شركة اخوان الصفا',
  fullName: 'شركة اخوان الصفا للمواد الإنشائية والمواد الصحية والأصباغ',
  shortName: 'اخوان الصفا',
  latinName: 'AL SIFA COMPANY',
  tagline: 'مواد إنشائية · مواد صحية · أصباغ',
  phone: localPhone,
  whatsappNumber: internationalWhatsApp,
  instagramUrl: safeInstagram,
  whatsappUrl: (message = 'مرحباً اخوان الصفا، أحتاج استشارة وعرض سعر'): string => `https://wa.me/${internationalWhatsApp}?text=${encodeURIComponent(message)}`,
  instagramText: 'اخوان الصفا على إنستغرام',
}

export const apiUrl = (path: string): string => `${apiBase}${path.startsWith('/') ? path : `/${path}`}`

export const phoneDigits = digits
