import { useEffect, useState, type ImgHTMLAttributes } from 'react'
import { PackageOpen } from 'lucide-react'
import { IMAGE_VARIANTS } from '@/lib/image-variants'
import './smart-image.css'

const DEFAULT_WIDTHS = [320, 640]

const isLocalFabric = (src: string) => /^(fabrics\\/[\\w-]+|products\\/[\\w-]+\\/[\\w-]+|home\\/[\\w-]+)\\.jpe?g$/i.test(src)

type SmartImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> & {
  src: string
  sizes?: string
  priority?: boolean
  intrinsicWidth?: number
  intrinsicHeight?: number
}

/**
 * Responsive image component with a real fallback state.
 * Remote images must forward onError too: storefront product photos are
 * hosted outside this Worker, so ignoring that event leaves a broken-image box.
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
  const [failed, setFailed] = useState(() => !src.trim())

  useEffect(() => {
    setFailed(!src.trim())
  }, [src])

  const handleError: SmartImageProps['onError'] = (event) => {
    const img = event.currentTarget
    const picture = img.parentElement
    const source = picture && picture.tagName === 'PICTURE' ? picture.querySelector('source') : null

    // A generated WebP variant may be missing while the original JPEG still exists.
    if (source) {
      source.remove()
      return
    }

    const failedSrc = img.getAttribute('src') || ''
    onError?.(event)

    // A parent may have supplied another source (for example a gallery image).
    // Only enter the visual fallback when no replacement was assigned.
    if ((img.getAttribute('src') || '') === failedSrc) setFailed(true)
  }

  if (!src.trim() || failed) {
    return (
      <span
        className={`smart-image-fallback ${className || ''}`.trim()}
        style={style}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      >
        <span className="smart-image-fallback__mark"><PackageOpen size={27} strokeWidth={1.6} /></span>
        <span className="smart-image-fallback__label">الصورة غير متاحة</span>
      </span>
    )
  }

  const shared = {
    className,
    style,
    width: intrinsicWidth,
    height: intrinsicHeight,
    sizes,
    decoding: 'async' as const,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    fetchPriority: priority ? ('high' as const) : ('auto' as const),
    onError: handleError,
    ...rest,
  }

  if (!isLocalFabric(src)) {
    return <img src={src} alt={alt} {...shared} />
  }

  const available = (IMAGE_VARIANTS[src] ?? DEFAULT_WIDTHS).filter((width) => width <= intrinsicWidth)
  if (available.length === 0) {
    return <img src={src} alt={alt} {...shared} />
  }

  const dir = src.slice(0, src.lastIndexOf('/') + 1)
  const fileBase = src.slice(src.lastIndexOf('/') + 1).replace(/\\.[a-z]+$/i, '')
  const srcSet = available.map((width) => `${dir}${fileBase}-${width}.webp ${width}w`).join(', ')

  return (
    <picture>
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img src={src} alt={alt} {...shared} />
    </picture>
  )
}
