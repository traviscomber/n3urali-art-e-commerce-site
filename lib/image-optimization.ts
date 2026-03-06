/**
 * Advanced image optimization utility for high-quality 360° images
 * Supports multiple formats, responsive variants, and performance monitoring
 */

export interface ImageOptimizationConfig {
  enableWebP?: boolean
  enableLQIP?: boolean // Low Quality Image Placeholder
  responsive?: boolean
  lazyLoad?: boolean
  quality?: number // 0-100
  maxWidth?: number
  formats?: ('webp' | 'jpeg' | 'png')[]
}

export interface ImageVariant {
  size: 'thumbnail' | 'preview' | 'medium' | 'full' | 'original'
  width: number
  height: number
  quality: number
  format: 'webp' | 'jpeg'
}

export class ImageOptimizer {
  // Standard breakpoints for responsive images
  private static readonly BREAKPOINTS = {
    thumbnail: { width: 150, height: 150, quality: 60 },
    preview: { width: 400, height: 300, quality: 70 },
    medium: { width: 800, height: 600, quality: 80 },
    full: { width: 1920, height: 1440, quality: 85 },
    original: { width: 8192, height: 8192, quality: 95 },
  }

  /**
   * Generate responsive image variants
   */
  static getResponsiveVariants(
    originalUrl: string,
    config: ImageOptimizationConfig = {},
  ): Map<string, ImageVariant> {
    const variants = new Map<string, ImageVariant>()
    const formats = config.formats || ['webp', 'jpeg']

    // Generate variants for each breakpoint
    Object.entries(this.BREAKPOINTS).forEach(([size, dimensions]) => {
      formats.forEach((format) => {
        const variantKey = `${size}-${format}`
        variants.set(variantKey, {
          size: size as ImageVariant['size'],
          ...dimensions,
          format: format as 'webp' | 'jpeg',
        })
      })
    })

    return variants
  }

  /**
   * Generate srcSet string for responsive images
   */
  static generateSrcSet(
    imageId: string,
    format: 'webp' | 'jpeg' = 'jpeg',
  ): string {
    const sizes = [150, 400, 800, 1200, 1920, 2560, 4096]
    return sizes
      .map((width) => `/api/image-optimize?id=${imageId}&w=${width}&f=${format} ${width}w`)
      .join(', ')
  }

  /**
   * Generate Low Quality Image Placeholder (LQIP)
   */
  static generateLQIPUrl(imageId: string): string {
    // Generates a 30px blur placeholder
    return `/api/image-optimize?id=${imageId}&w=30&f=jpeg&blur=true`
  }

  /**
   * Generate picture element with WebP + JPEG fallback
   */
  static generatePictureElement(
    imageId: string,
    alt: string,
    width: number,
    height: number,
    lazyLoad = true,
  ): { webpSrcSet: string; jpegSrcSet: string; lqip: string } {
    return {
      webpSrcSet: this.generateSrcSet(imageId, 'webp'),
      jpegSrcSet: this.generateSrcSet(imageId, 'jpeg'),
      lqip: this.generateLQIPUrl(imageId),
    }
  }

  /**
   * Calculate responsive sizes for responsive images
   */
  static getResponsiveSizes(): string {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, (max-width: 1920px) 60vw, 50vw'
  }

  /**
   * Get optimal quality based on device pixel ratio and viewport
   */
  static getOptimalQuality(dpr: number, viewportWidth: number): number {
    if (viewportWidth < 640) return 70
    if (viewportWidth < 1024) return 75
    if (viewportWidth < 1920) return 80
    return Math.min(85 * dpr, 95) // Cap at 95 quality
  }

  /**
   * Generate cache key for image variant
   */
  static generateCacheKey(imageId: string, width: number, height: number, format: string): string {
    return `img_${imageId}_${width}x${height}_${format}`
  }

  /**
   * Get image loading strategy based on network conditions
   */
  static getLoadingStrategy(): 'eager' | 'lazy' {
    if (typeof navigator === 'undefined') return 'lazy'

    // Use eager loading for 4G/5G, lazy for slower connections
    const connection = (navigator as any).connection
    if (!connection) return 'lazy'

    const effectiveType = connection.effectiveType
    return ['4g', '5g'].includes(effectiveType) ? 'eager' : 'lazy'
  }

  /**
   * Preload critical images
   */
  static preloadImage(url: string, format: 'webp' | 'jpeg' = 'webp'): void {
    if (typeof document === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    link.type = `image/${format}`
    document.head.appendChild(link)
  }

  /**
   * Convert image to WebP with JPEG fallback
   */
  static async convertToWebP(
    file: File,
    quality = 80,
  ): Promise<{ webp: Blob; jpeg: Blob }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)

        canvas.toBlob(
          (webpBlob) => {
            if (!webpBlob) {
              reject(new Error('Failed to create WebP'))
              return
            }
            canvas.toBlob(
              (jpegBlob) => {
                if (!jpegBlob) {
                  reject(new Error('Failed to create JPEG'))
                  return
                }
                resolve({ webp: webpBlob, jpeg: jpegBlob })
              },
              'image/jpeg',
              quality / 100,
            )
          },
          'image/webp',
          quality / 100,
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Calculate compression ratio
   */
  static calculateCompressionRatio(originalSize: number, compressedSize: number): number {
    return ((1 - compressedSize / originalSize) * 100)
  }
}
