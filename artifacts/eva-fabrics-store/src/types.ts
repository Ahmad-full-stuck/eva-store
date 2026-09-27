export interface ProductColor {
  id: string
  name: string
  hex: string
  available: boolean
  stockMeters: number
}

export interface ProductSpecs {
  composition: string
  width: string
  weight: string
  stretch: string
  isStretch: boolean
  opacity: string
  finish: string
  care: string
  use: string
}

export interface ProductFaq {
  question: string
  answer: string
}

export interface Product {
  id: string
  slug: string
  name: string
  type: string
  categoryId: string
  description: string
  price: number
  compareAtPrice?: number
  image: string
  images: string[]
  colors: ProductColor[]
  specs: ProductSpecs
  faqs: ProductFaq[]
  isNew: boolean
  isFeatured: boolean
  stockMeters: number
  createdAt: string
}

export interface Category {
  id: string
  slug: string
  name: string
  description: string
  image: string
  accent: string
}

export interface SiteRoute {
  id: string
  label: string
  path: string
  header: boolean
}

export type DataSource = 'api' | 'fallback' | 'mixed'

export interface StorefrontData {
  products: Product[]
  categories: Category[]
  routes: SiteRoute[]
  source: DataSource
}

export interface CartItem {
  product: Product
  color: ProductColor
  length: number
}

export interface CheckoutForm {
  name: string
  phone: string
  email: string
  governorate: string
  district: string
  address: string
  notes: string
}

export interface OrderItemPayload {
  productId: string
  productSlug: string
  productName: string
  colorId: string
  color: string
  colorName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderPayload {
  customerName: string
  phone: string
  email?: string
  governorate: string
  district: string
  address: string
  notes?: string
  items: OrderItemPayload[]
  subtotal: number
  deliveryFee: number
  total: number
}
