/**
 * Centralized image URL handler for multiple storage origins
 * Handles conversion between Vercel Blob, Backblaze, Supabase, and proxy URLs
 */

export interface ImageUrlConfig {
  useProxy?: boolean
  fallbackToThumbnail?: boolean
}

export class ImageUrlHandler {
  private static readonly VERCEL_BLOB_PATTERN = /https:\/\/[^.]+\.public\.blob\.vercel-storage\.com\/(.+)/
  private static readonly BACKBLAZE_PATTERN = /https:\/\/f\d+\.backblazeb2\.com\/file\/[^/]+\/(.+)/
  private static readonly PROXY_PATTERN = /^\/api\/image-proxy\/(.+)/
  private static readonly SUPABASE_PATTERN = /https:\/\/[^.]+\.supabase\.co\/storage\/v1\/object\/public\/images\/(.+)/
  private static readonly BASE64_PATTERN = /^data:image\/[^;]+;base64,/

  /**
   * Convert any storage URL to the appropriate display URL
   */
  static convertToDisplayUrl(url: string, config: ImageUrlConfig = {}): string {
    if (!url) return url

    if (this.BASE64_PATTERN.test(url)) {
      console.log("[v0] Converting base64 data URL to blob URL")
      try {
        // Extract the base64 data and mime type
        const [header, data] = url.split(",")
        const mimeMatch = header.match(/data:([^;]+)/)
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg"

        // Convert base64 to blob
        const byteCharacters = atob(data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: mimeType })

        // Create blob URL
        const blobUrl = URL.createObjectURL(blob)
        console.log("[v0] Created blob URL from base64 data")
        return blobUrl
      } catch (error) {
        console.error("[v0] Error converting base64 to blob URL:", error)
        // Fallback to placeholder if conversion fails
        return `/placeholder.svg?height=400&width=400&query=image-conversion-error`
      }
    }

    // If it's already a proxy URL, return as-is
    if (this.PROXY_PATTERN.test(url)) {
      return url
    }

    const supabaseMatch = url.match(this.SUPABASE_PATTERN)
    if (supabaseMatch) {
      // In production, Supabase URLs should work directly
      // But add CORS headers for better compatibility
      console.log("[v0] Using Supabase URL directly:", url)
      return url
    }

    const blobMatch = url.match(this.VERCEL_BLOB_PATTERN)
    if (blobMatch) {
      console.log("[v0] Using Vercel Blob URL directly:", url)
      return url
    }

    // Handle Backblaze URLs - convert to proxy if requested
    const backblazeMatch = url.match(this.BACKBLAZE_PATTERN)
    if (backblazeMatch && config.useProxy !== false) {
      const filename = backblazeMatch[1]
      console.log("[v0] Converting Backblaze URL to proxy:", filename)
      return `/api/image-proxy/${filename}`
    }

    // Return original URL if no conversion needed
    return url
  }

  /**
   * Convert URLs for download purposes (handles authentication)
   */
  static convertToDownloadUrl(url: string): string {
    if (!url) return url

    // Handle Vercel Blob URLs - convert to Backblaze format
    const blobMatch = url.match(this.VERCEL_BLOB_PATTERN)
    if (blobMatch) {
      const filename = blobMatch[1]
      const backblazeUrl = `https://${process.env.B2_ENDPOINT}/file/${process.env.BACKBLAZE_BUCKET_NAME}/${filename}`
      console.log("[v0] Converting Vercel Blob URL to Backblaze for download:", backblazeUrl)
      return backblazeUrl
    }

    // Return original URL for Backblaze or other URLs
    return url
  }

  /**
   * Get storage provider from URL
   */
  static getStorageProvider(url: string): "vercel-blob" | "backblaze" | "supabase" | "proxy" | "unknown" {
    if (this.VERCEL_BLOB_PATTERN.test(url)) return "vercel-blob"
    if (this.BACKBLAZE_PATTERN.test(url)) return "backblaze"
    if (this.SUPABASE_PATTERN.test(url)) return "supabase"
    if (this.PROXY_PATTERN.test(url)) return "proxy"
    return "unknown"
  }

  /**
   * Extract filename from any storage URL
   */
  static extractFilename(url: string): string | null {
    const blobMatch = url.match(this.VERCEL_BLOB_PATTERN)
    if (blobMatch) return blobMatch[1]

    const backblazeMatch = url.match(this.BACKBLAZE_PATTERN)
    if (backblazeMatch) return backblazeMatch[1]

    const supabaseMatch = url.match(this.SUPABASE_PATTERN)
    if (supabaseMatch) return supabaseMatch[1]

    const proxyMatch = url.match(this.PROXY_PATTERN)
    if (proxyMatch) return proxyMatch[1]

    return null
  }

  /**
   * Handle multiple URLs with fallback logic
   */
  static convertWithFallback(
    primaryUrl: string,
    fallbackUrl?: string,
    config: ImageUrlConfig = {},
  ): { primary: string; fallback?: string } {
    const primary = this.convertToDisplayUrl(primaryUrl, config)
    const fallback = fallbackUrl ? this.convertToDisplayUrl(fallbackUrl, config) : undefined

    return { primary, fallback }
  }
}
