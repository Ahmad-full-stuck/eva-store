type RGB = [number, number, number]

export interface ColorImageMaps {
  colorToImage: Record<string, number>
  imageToColor: Record<string, string>
}

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

const tokenize = (value: string): string[] => value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

const GENERIC_TOKENS = new Set([
  'cover', 'hero', 'main', 'photo', 'photos', 'img', 'image', 'fabric', 'fabrics',
  'new', 'pic', 'shot', 'studio', 'full', 'front', 'back', 'detail', 'zoom',
])

const MIN_TOKEN_LENGTH = 3
const PALETTE_MAX_DISTANCE = 55
const PALETTE_MIN_SHARE = 0.1

type PaletteBin = { rgb: RGB; share: number }

const paletteCache = new Map<string, PaletteBin[]>()

const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const image = new Image()
  image.decoding = 'async'
  image.onload = () => resolve(image)
  image.onerror = () => reject(new Error(`image failed: ${src}`))
  image.src = src
})

/** Dominant colours of an image, sampled from a 32px thumbnail. */
async function palette(src: string): Promise<PaletteBin[]> {
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
    .map((bin) => ({ rgb: bin.rgb, share: bin.count / total }))
  paletteCache.set(src, result)
  return result
}

const fileNameTokens = (src: string): string[] => {
  const base = src.slice(src.lastIndexOf('/') + 1).replace(/\.[a-z]+$/i, '')
  return tokenize(base)
}

/**
 * Links every product colour to the gallery image that shows it.
 * Tier 1 (deterministic): colour id ↔ file name (e.g. `blue-grey` → `harvard-bluegrey.jpg`).
 * Tier 2 (visual): dominant-colour distance, only when it is a confident match.
 * Returns both directions so the gallery can drive colour selection too.
 */
export async function mapColorsToImages(
  images: string[],
  colors: { id: string; hex: string }[],
  slug = '',
): Promise<ColorImageMaps> {
  const sources = [...new Set(images.filter(Boolean))]
  const empty: ColorImageMaps = { colorToImage: {}, imageToColor: {} }
  if (sources.length === 0 || colors.length === 0) return empty

  const slugTokens = new Set(tokenize(slug))
  const files = sources.map((src) => {
    const all = fileNameTokens(src)
    const tokens = all.filter((token) => !GENERIC_TOKENS.has(token) && !slugTokens.has(token))
    return { tokens, concat: tokens.join('') }
  })

  const scored: { color: number; file: number; score: number }[] = []
  colors.forEach((color, colorIndex) => {
    const idTokens = tokenize(color.id).filter((token) => !GENERIC_TOKENS.has(token))
    const idConcat = idTokens.join('')
    files.forEach((file, fileIndex) => {
      let score = 0
      if (idConcat.length >= MIN_TOKEN_LENGTH && file.concat.includes(idConcat)) score += 100
      let hits = 0
      for (const token of idTokens) {
        if (token.length < MIN_TOKEN_LENGTH) continue
        if (file.tokens.includes(token)) { score += 10; hits += 1 }
        else if (file.concat.includes(token)) { score += 4; hits += 1 }
      }
      if (idTokens.length && hits === 0) score -= 6
      if (score >= 10) scored.push({ color: colorIndex, file: fileIndex, score })
    })
  })

  scored.sort((a, b) => b.score - a.score)
  const colorToIndex: Record<string, number> = {}
  const usedFiles = new Set<number>()
  const claimedColors = new Set<number>()
  for (const item of scored) {
    if (claimedColors.has(item.color) || usedFiles.has(item.file)) continue
    claimedColors.add(item.color)
    usedFiles.add(item.file)
    colorToIndex[colors[item.color].id] = item.file
  }

  const pending = colors.filter((color) => colorToIndex[color.id] === undefined)
  if (pending.length) {
    const palettes = await Promise.all(sources.map((src) => palette(src).catch(() => [] as PaletteBin[])))
    for (const color of pending) {
      const target = hexToRgb(color.hex)
      let best = -1
      let bestScore = Number.POSITIVE_INFINITY
      palettes.forEach((bins, index) => {
        const strong = bins.filter((bin) => bin.share >= PALETTE_MIN_SHARE)
        if (!strong.length || usedFiles.has(index)) return
        const score = Math.min(...strong.map((bin) => distance(target, bin.rgb)))
        if (score < bestScore) {
          bestScore = score
          best = index
        }
      })
      if (best >= 0 && bestScore <= PALETTE_MAX_DISTANCE) {
        usedFiles.add(best)
        colorToIndex[color.id] = best
      }
    }
  }

  const colorToImage: Record<string, number> = { ...colorToIndex }
  const imageToColor: Record<string, string> = {}
  Object.entries(colorToIndex).forEach(([colorId, index]) => {
    if (imageToColor[String(index)] === undefined) imageToColor[String(index)] = colorId
  })
  return { colorToImage, imageToColor }
}

const mapsCache = new Map<string, Promise<ColorImageMaps>>()

/** Memoised wrapper so cards and the product page analyse each product once per session. */
export function cachedColorMaps(
  images: string[],
  colors: { id: string; hex: string }[],
  slug: string,
): Promise<ColorImageMaps> {
  const key = `${slug}|${[...new Set(images.filter(Boolean))].join(',')}`
  let maps = mapsCache.get(key)
  if (!maps) {
    maps = mapColorsToImages(images, colors, slug)
    mapsCache.set(key, maps)
  }
  return maps
}
