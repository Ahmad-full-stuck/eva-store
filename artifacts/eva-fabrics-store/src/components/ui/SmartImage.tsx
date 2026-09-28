import type { ImgHTMLAttributes } from 'react'

const WIDTHS = [320, 640, 1024]

const isLocalFabric = (src: string) => /^fabrics\/[\w-]+\.jpe?g$/i.test(src)

type SmartImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> & {
  src: string
  sizes?: string
  priority?: boolean
  intrinsicWidth?: number
  intrinsicHeight?: number
}

/**
 * Serves WebP at the smallest width that still looks sharp, keeps the JPEG
 * as the fallback, and reserves the box so nothing shifts while loading.
 * A <picture> never falls back on its own when a variant 404s, so an
 * onError handler drops the <source> and lets the JPEG take over.
 */
export function SmartImage({
  src,
  alt,
  sizes = '(max-width: 820px) 92vw, 40vw',
  priority = false,
  intrinsicWidth = 1024,
  intrinsicHeight = 1024,
  className,
  style,
  onError,
  ...rest
}: SmartImageProps) {
  const shared = {
    className,
    style,
    width: intrinsicWidth,
    height: intrinsicHeight,
    decoding: 'async' as const,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    fetchPriority: priority ? ('high' as const) : ('auto' as const),
    ...rest,
  }

  const handleError: SmartImageProps['onError'] = (event) => {
    onError?.(event)
    const img = event.currentTarget
    const picture = img.parentElement
    const source = picture && picture.tagName === 'PICTURE' ? picture.querySelector('source') : null
    if (!source) return
    source.remove()
    img.src = src
  }

  if (!isLocalFabric(src)) {
    return <img src={src} alt={alt} decoding="async" loading={priority ? 'eager' : 'lazy'} className={className} style={style} width={intrinsicWidth} height={intrinsicHeight} {...rest} />
  }

  const dir = src.slice(0, src.lastIndexOf('/') + 1)
  const fileBase = src.slice(src.lastIndexOf('/') + 1).replace(/\.[a-z]+$/i, '')
  const available = WIDTHS.filter((w) => w <= intrinsicWidth)
  const srcSet = available.map((w) => `${dir}${fileBase}-${w}.webp ${w}w`).join(', ')

  return (
    <picture>
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img src={src} alt={alt} sizes={sizes} onError={handleError} {...shared} />
    </picture>
  )
}
