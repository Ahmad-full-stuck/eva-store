import type { Product } from '@/types'

export interface DiscoveryInput {
  garment?: string
  stretch?: string
  tone?: string
  limit?: number
}

export interface DiscoveryMatch {
  slug: string
  name: string
  score: number
  reasons: string[]
}

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'

const flat = (...values: unknown[]): string =>
  values
    .map((value) => (typeof value === 'string' ? value : value === undefined || value === null ? '' : String(value)))
    .join(' ')
    .replace(/[٠-٩]/g, (digit) => String(AR_DIGITS.indexOf(digit)))
    .toLowerCase()

const has = (source: string, words: string[]): boolean => words.some((word) => source.includes(word))

interface ProductProfile {
  source: string
  brand: string
  has5G: boolean
}

const profileOf = (product: Product): ProductProfile => {
  const specs = product.specs as unknown as Record<string, unknown>
  return {
    source: flat(product.name, product.type, product.description, specs.composition, specs.width, specs.weight, specs.stretch, specs.opacity, specs.finish, specs.care, specs.use),
    brand: flat(product.type, product.categoryId),
    has5G: Boolean(specs.isStretch),
  }
}

export function runDiscovery(products: Product[], input: DiscoveryInput): DiscoveryMatch[] {
  const brand = (input.garment || '').trim().toLowerCase()
  const priority = (input.tone || '').trim().toLowerCase()
  const needs5G = input.stretch === 'yes'
  const scored = products.map((product) => {
    const profile = profileOf(product)
    let score = product.isFeatured ? 15 : 0
    const reasons: string[] = []
    if (brand && brand !== 'any' && brand !== 'لا أفضل علامة محددة') {
      const matches = profile.brand.includes(brand) || profile.source.includes(brand)
      score += matches ? 55 : -8
      if (matches) reasons.push('disc.brandMatch')
    }
    if (needs5G) {
      score += profile.has5G ? 18 : -24
      if (profile.has5G) reasons.push('disc.has5G')
    }
    if (priority.includes('تصوير') || priority.includes('photography')) {
      const matches = /كاميرا|camera|تصوير|photo/i.test(profile.source)
      score += matches ? 22 : 0
      if (matches) reasons.push('disc.camera')
    } else if (priority.includes('أداء') || priority.includes('performance')) {
      const matches = /معالج|processor|أداء|gaming|ألعاب/i.test(profile.source)
      score += matches ? 22 : 0
      if (matches) reasons.push('disc.performance')
    } else if (priority.includes('بطارية') || priority.includes('battery')) {
      const matches = /بطارية|battery|شحن|charging/i.test(profile.source)
      score += matches ? 22 : 0
      if (matches) reasons.push('disc.battery')
    } else if (priority.includes('يومي') || priority.includes('everyday')) {
      score += 8
      reasons.push('disc.everyday')
    }
    return { slug: product.slug, name: product.name, score, reasons: reasons.slice(0, 3) }
  }).sort((a,b) => b.score-a.score)
  const limit = Math.min(Math.max(Number(input.limit) || 6, 1), 24)
  return scored.slice(0, limit)
}
