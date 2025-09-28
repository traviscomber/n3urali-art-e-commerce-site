/**
 * Backblaze B2 Authentication and Presigned URL Generation
 */

interface BackblazeConfig {
  endpoint: string
  bucket: string
  region: string
  accessKeyId: string
  secretAccessKey: string
}

export class BackblazeAuth {
  private config: BackblazeConfig

  constructor() {
    this.config = {
      endpoint: process.env.B2_ENDPOINT || "https://s3.us-west-004.backblazeb2.com",
      bucket: process.env.BACKBLAZE_BUCKET_NAME || "Neuraliart",
      region: process.env.B2_REGION || "us-west-004",
      accessKeyId: process.env.BACKBLAZE_API_KEY!,
      secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY!,
    }

    if (!this.config.accessKeyId || !this.config.secretAccessKey) {
      throw new Error("Backblaze credentials are required")
    }
  }

  getConfig(): BackblazeConfig {
    return { ...this.config }
  }

  async generatePresignedUrl(key: string, contentType: string, expiresInSeconds = 600): Promise<string> {
    const { generatePresignedUrl } = await import("./s3-manual")
    return generatePresignedUrl(this.config.bucket, key, contentType, expiresInSeconds)
  }

  async authenticateRequest(url: string, method = "GET"): Promise<string> {
    // For simple authenticated requests, we can use basic auth
    const credentials = Buffer.from(`${this.config.accessKeyId}:${this.config.secretAccessKey}`).toString("base64")
    return `Basic ${credentials}`
  }
}
