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
  private static readonly SUPABASE_PATTERN = /https:\/\/[^.]+\.supabase\.co\/storage\/v1\/object\/public\/(.+)/

  /**
   * Convert any storage URL to the appropriate display URL
   */
  static convertToDisplayUrl(url: string, config: ImageUrlConfig = {}): string {
    if (!url) return url

    console.log("[v0] Converting URL to display format:", url)

    // If it's already a Supabase URL, return as-is
    if (this.SUPABASE_PATTERN.test(url)) {
      console.log("[v0] URL is already Supabase, returning as-is")
      return url
    }

    // Extract filename from any storage URL
    const filename = this.extractFilename(url)
    if (filename) {
      const supabaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${filename}`
      console.log("[v0] Converted to Supabase URL:", supabaseUrl)
      return supabaseUrl
    }

    // Return original URL if no conversion possible
    console.log("[v0] No conversion possible, returning original URL")
    return url
  }

  /**
   * Convert URLs for download purposes (handles authentication)
   */
  static convertToDownloadUrl(url: string): string {
    if (!url) return url

    // Convert to Supabase storage URL
    const filename = this.extractFilename(url)
    if (filename) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${filename}`
    }

    return url
  }

  /**
   * Get storage provider from URL
   */
  static getStorageProvider(url: string): "vercel-blob" | "backblaze" | "proxy" | "supabase" | "unknown" {
    if (this.VERCEL_BLOB_PATTERN.test(url)) return "vercel-blob"
    if (this.BACKBLAZE_PATTERN.test(url)) return "backblaze"
    if (this.PROXY_PATTERN.test(url)) return "proxy"
    if (this.SUPABASE_PATTERN.test(url)) return "supabase"
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

    const proxyMatch = url.match(this.PROXY_PATTERN)
    if (proxyMatch) return proxyMatch[1]

    const supabaseMatch = url.match(this.SUPABASE_PATTERN)
    if (supabaseMatch) return supabaseMatch[1]

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
