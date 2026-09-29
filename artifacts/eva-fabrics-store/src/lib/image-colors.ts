type RGB = [number, number, number]

const isLocalFabric = (src: string): boolean => /^fabrics\/[\w-]+\.jpe?g$/i.test(src)

/** Analysis only needs colour, so sample the smallest WebP variant that ships with every fabric. */
const analysisSrc = (src: string): string => {
  if (!isLocalFabric(src)) return src
  const dir = src.slice(0, src.lastIndexOf('/') + 1)
  const base = src.slice(src.lastIndexOf('/') + 1).replace(/\.[a-z]+$/i, '')
  return `${dir}${base}-320.webp`
}

const hexToRgb = (hex: string): RGB => {
  const value = hex.replace('#', '').trim()
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value
  const num = Number.parseInt(full.slice(0, 6) || '0', 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

const distance = (a: RGB, b: RGB): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

const paletteCache = new Map<string, RGB[]>()

const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const image = new Image()
  image.decoding = 'async'
  image.onload = () => resolve(image)
  image.onerror = () => reject(new Error(`image failed: ${src}`))
  image.src = src
})

/** Dominant colours of an image, sampled from a 32px thumbnail. */
async function palette(src: string): Promise<RGB[]> {
  const cached = paletteCache.get(src)
  if (cached) return cached
  const image = await loadImage(analysisSrc(src))
  const size = 32
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []
  ctx.drawImage(image, 0, 0, size, size)
  const data = ctx.getImageData(0, 0, size, size).data
  const bins = new Map<number, { count: number; rgb: RGB }>()
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
    const bin = bins.get(key)
    if (bin) bin.count += 1
    else bins.set(key, { count: 1, rgb: [r, g, b] })
  }
  const total = (data.length / 4) || 1
  const result = [...bins.values()]
    .filter((bin) => bin.count / total >= 0.02)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((bin) => bin.rgb)
  paletteCache.set(src, result)
  return result
}

/**
 * Links every product colour to the gallery image that shows it best, so the
 * colour swatches can drive the gallery instead of only decorating it.
 */
export async function mapColorsToImages(
  images: string[],
  colors: { id: string; hex: string }[],
): Promise<Record<string, number>> {
  const sources = [...new Set(images.filter(Boolean))]
  if (sources.length === 0 || colors.length === 0) return {}
  let palettes: RGB[][]
  try {
    palettes = await Promise.all(sources.map((src) => palette(src)))
  } catch {
    return {}
  }
  const map: Record<string, number> = {}
  colors.forEach((color) => {
    const target = hexToRgb(color.hex)
    let best = -1
    let bestScore = Number.POSITIVE_INFINITY
    palettes.forEach((bins, index) => {
      if (!bins.length) return
      const score = Math.min(...bins.map((bin) => distance(target, bin)))
      if (score < bestScore) {
        bestScore = score
        best = index
      }
    })
    if (best >= 0) map[color.id] = best
  })
  return map
}
