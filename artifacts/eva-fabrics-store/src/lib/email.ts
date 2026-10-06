export interface OrderEmailData {
  orderNumber: string
  customerName: string
  phone: string
  email?: string
  governorate: string
  district: string
  address: string
  landmark?: string
  notes?: string
  items: Array<{
    productName: string
    colorName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  subtotal: number
  deliveryFee: number
  total: number
  createdAt: string
}

export interface OrderEmailConfig {
  to: string
  fromName?: string
  from?: string
  subject?: string
  template?: string
  provider?: 'mailto' | 'formsubmit'
  formSubmitAction?: string
}

export const formatMeters = (m: number): string => {
  const s = m.toFixed(1).replace(/\.0$/, '')
  return s === '0.5' || s === '1.5' || s === '2.5' || s === '3.5' || s === '4.5' || s === '5.5' ? `${s} م` : `${s} متر`
}

export const formatPrice = (p: number): string => (p >= 1000 && p % 1000 === 0 ? `${p / 1000} الف دينار عراقي` : `${p.toLocaleString('ar-IQ')} دينار عراقي`)

const defaultSubject = (data: OrderEmailData): string => `طلب جديد #${data.orderNumber}`

export const renderOrderTemplate = (template: string, data: OrderEmailData, config: OrderEmailConfig): string => {
  const items = data.items
    .map((item) => `- ${item.productName} (${item.colorName}) × ${formatMeters(item.quantity)} × ${formatPrice(item.unitPrice)} = ${formatPrice(item.totalPrice)}`)
    .join('\n')
  const vars: Record<string, string> = {
    orderNumber: data.orderNumber,
    name: data.customerName,
    phone: data.phone,
    email: data.email || '',
    governorate: data.governorate,
    district: data.district,
    address: data.address,
    landmark: data.landmark || '',
    notes: data.notes || '',
    items,
    subtotal: formatPrice(data.subtotal),
    delivery: formatPrice(data.deliveryFee),
    total: formatPrice(data.total),
    date: new Date(data.createdAt).toLocaleString('ar-IQ'),
    shop: config.fromName || '',
  }
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? vars[key] : match))
}

const bodyOf = (data: OrderEmailData, config: OrderEmailConfig): string => {
  const template = (config.template || '').trim()
  return template ? renderOrderTemplate(template, data, config) : defaultTemplate(data)
}

const defaultTemplate = (data: OrderEmailData): string => {
  const lines: string[] = []
  lines.push(`رقم الطلب: ${data.orderNumber}`)
  lines.push(`الاسم: ${data.customerName}`)
  lines.push(`الهاتف: ${data.phone}`)
  if (data.email) lines.push(`البريد الإلكتروني: ${data.email}`)
  lines.push(`المحافظة: ${data.governorate}`)
  lines.push(`القضاء/المنطقة: ${data.district}`)
  lines.push(`العنوان: ${data.address}`)
  if (data.landmark) lines.push(`معلم قريب: ${data.landmark}`)
  if (data.notes) lines.push(`ملاحظات: ${data.notes}`)
  lines.push('')
  lines.push('تفاصيل الطلب:')
  for (const item of data.items) {
    lines.push(`- ${item.productName} (${item.colorName}) × ${formatMeters(item.quantity)} × ${formatPrice(item.unitPrice)} = ${formatPrice(item.totalPrice)}`)
  }
  lines.push('')
  lines.push(`المجموع الفرعي: ${formatPrice(data.subtotal)}`)
  lines.push(`رسوم التوصيل: ${formatPrice(data.deliveryFee)}`)
  lines.push(`الإجمالي: ${formatPrice(data.total)}`)
  lines.push(`التاريخ: ${new Date(data.createdAt).toLocaleString('ar-IQ')}`)
  return lines.join('\n')
}

export const buildMailtoUrl = (data: OrderEmailData, config: OrderEmailConfig): string => {
  const to = config.to
  const subject = encodeURIComponent(config.subject || defaultSubject(data))
  const body = encodeURIComponent(bodyOf(data, config))
  return `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${body}`
}

export const sendOrderEmail = async (data: OrderEmailData, config: OrderEmailConfig): Promise<boolean> => {
  const provider = config.provider || 'mailto'
  if (provider === 'formsubmit') {
    const action = config.formSubmitAction || `https://formsubmit.co/${encodeURIComponent(config.to)}`
    try {
      const formData = new FormData()
      formData.append('_subject', config.subject || defaultSubject(data))
      if (config.from) formData.append('_replyto', config.from)
      formData.append('_captcha', 'false')
      formData.append('orderNumber', data.orderNumber)
      formData.append('name', data.customerName)
      formData.append('phone', data.phone)
      if (data.email) formData.append('email', data.email)
      formData.append('governorate', data.governorate)
      formData.append('district', data.district)
      formData.append('address', data.address)
      if (data.landmark) formData.append('landmark', data.landmark)
      if (data.notes) formData.append('notes', data.notes)
      formData.append('total', formatPrice(data.total))
      formData.append('message', bodyOf(data, config))
      await fetch(action, { method: 'POST', body: formData, mode: 'no-cors' })
      return true
    } catch {
      const url = buildMailtoUrl(data, config)
      try { window.location.href = url } catch { /* ignore */ }
      return false
    }
  }
  const url = buildMailtoUrl(data, config)
  try { window.location.href = url } catch { return false }
  return true
}
