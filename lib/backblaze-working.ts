interface BackblazeConfig {
  keyId: string
  applicationKey: string
  bucketName: string
}

interface B2AuthResponse {
  authorizationToken: string
  apiUrl: string
  downloadUrl: string
  allowed?: {
    bucketId?: string
    bucketName?: string
  }
}

interface B2Bucket {
  bucketId: string
  bucketName: string
  bucketType: string
}

interface B2ListBucketsResponse {
  buckets: B2Bucket[]
}

interface B2UploadUrlResponse {
  bucketId: string
  uploadUrl: string
  authorizationToken: string
}

export class WorkingBackblazeStorage {
  private config: BackblazeConfig
  private authToken: string | null = null
  private apiUrl: string | null = null
  private downloadUrl: string | null = null
  private bucketId: string | null = null

  constructor() {
    this.config = {
      keyId: process.env.BACKBLAZE_API_KEY!,
      applicationKey: process.env.BACKBLAZE_APPLICATION_KEY!,
      bucketName: process.env.BACKBLAZE_BUCKET_NAME!,
    }

    // Validate required configuration
    if (!this.config.keyId) {
      throw new Error("BACKBLAZE_API_KEY environment variable is required")
    }
    if (!this.config.applicationKey) {
      throw new Error("BACKBLAZE_APPLICATION_KEY environment variable is required")
    }
    if (!this.config.bucketName) {
      throw new Error("BACKBLAZE_BUCKET_NAME environment variable is required")
    }
  }

  private async authenticate(): Promise<B2AuthResponse> {
    try {
      console.log("[v0] Authenticating with Backblaze B2 API...")

      console.log("[v0] Using keyId:", this.config.keyId)
      console.log("[v0] ApplicationKey length:", this.config.applicationKey?.length)
      console.log("[v0] ApplicationKey first 10 chars:", this.config.applicationKey?.substring(0, 10))

      // Validate credentials format
      if (!this.config.keyId || this.config.keyId.length < 10) {
        throw new Error("Invalid keyId format - must be at least 10 characters")
      }
      if (!this.config.applicationKey || this.config.applicationKey.length < 20) {
        throw new Error("Invalid applicationKey format - must be at least 20 characters")
      }

      // Use Buffer for more reliable Base64 encoding
      const authString = `${this.config.keyId}:${this.config.applicationKey}`
      const credentials = Buffer.from(authString, "utf8").toString("base64")
      console.log("[v0] Auth string length:", authString.length)
      console.log("[v0] Base64 credentials length:", credentials.length)

      const response = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      const responseText = await response.text()
      console.log("[v0] B2 auth response status:", response.status)
      console.log("[v0] B2 auth response:", responseText)

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} - ${responseText}`)
      }

      const data = JSON.parse(responseText)
      console.log("[v0] B2 authentication successful, response keys:", Object.keys(data))

      this.authToken = data.authorizationToken
      this.apiUrl = data.apiUrl || data.apiInfo?.storageApi?.apiUrl
      this.downloadUrl = data.downloadUrl || data.apiInfo?.storageApi?.downloadUrl

      console.log("[v0] Auth token length:", this.authToken?.length)
      console.log("[v0] API URL:", this.apiUrl)
      console.log("[v0] Download URL:", this.downloadUrl)

      return data
    } catch (error: any) {
      console.error("[v0] B2 authentication failed:", error)
      throw new Error(`Failed to authenticate with Backblaze: ${error.message}`)
    }
  }

  private async getBucketId(): Promise<string> {
    if (this.bucketId) {
      return this.bucketId
    }

    if (!this.authToken || !this.apiUrl) {
      await this.authenticate()
    }

    console.log("[v0] Getting bucket ID for bucket:", this.config.bucketName)

    const response = await fetch(`${this.apiUrl}/b2api/v3/b2_list_buckets`, {
      method: "POST",
      headers: {
        Authorization: this.authToken!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: this.config.keyId,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] List buckets response:", errorText)
      throw new Error(`Failed to list buckets: ${response.status} - ${errorText}`)
    }

    const data: B2ListBucketsResponse = await response.json()
    console.log(
      "[v0] Found buckets:",
      data.buckets?.map((b) => b.bucketName),
    )

    const bucket = data.buckets.find((b) => b.bucketName === this.config.bucketName)

    if (!bucket) {
      throw new Error(
        `Bucket '${this.config.bucketName}' not found. Available buckets: ${data.buckets?.map((b) => b.bucketName).join(", ")}`,
      )
    }

    this.bucketId = bucket.bucketId
    console.log("[v0] Found bucket ID:", this.bucketId)
    return this.bucketId
  }

  private async getUploadUrl(): Promise<B2UploadUrlResponse> {
    try {
      if (!this.authToken || !this.apiUrl) {
        await this.authenticate()
      }

      const bucketId = await this.getBucketId()

      console.log("[v0] Getting upload URL from B2...")

      const response = await fetch(`${this.apiUrl}/b2api/v3/b2_get_upload_url`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucketId: bucketId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get upload URL: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("[v0] Got upload URL successfully")
      return data
    } catch (error: any) {
      console.error("[v0] Failed to get upload URL:", error)
      throw new Error(`Failed to get upload URL: ${error.message}`)
    }
  }

  private async calculateSHA1(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-1", arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return hashHex
  }

  async uploadFile(file: File, key: string): Promise<string> {
    try {
      console.log("[v0] Starting native B2 upload:", key)

      const uploadInfo = await this.getUploadUrl()

      console.log("[v0] Calculating SHA1 hash for file...")
      const sha1Hash = await this.calculateSHA1(file)
      console.log("[v0] SHA1 hash calculated:", sha1Hash)

      const response = await fetch(uploadInfo.uploadUrl, {
        method: "POST",
        headers: {
          Authorization: uploadInfo.authorizationToken,
          "X-Bz-File-Name": encodeURIComponent(key),
          "Content-Type": file.type || "application/octet-stream",
          "X-Bz-Content-Sha1": sha1Hash,
        },
        body: file,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      const publicUrl = `${this.downloadUrl}/file/${this.config.bucketName}/${key}`

      console.log("[v0] B2 upload successful:", publicUrl)
      return publicUrl
    } catch (error: any) {
      console.error("[v0] B2 upload failed:", error)
      throw new Error(`Upload failed: ${error.message}`)
    }
  }

  async generatePresignedUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    try {
      console.log("[v0] B2 API doesn't use presigned URLs, using direct upload instead")
      const uploadInfo = await this.getUploadUrl()
      return uploadInfo.uploadUrl
    } catch (error: any) {
      console.error("[v0] Failed to get upload URL:", error)
      throw new Error(`Failed to get upload URL: ${error.message}`)
    }
  }

  getPublicUrl(key: string): string {
    const baseUrl = this.downloadUrl || "https://f005.backblazeb2.com"
    return `${baseUrl}/file/${this.config.bucketName}/${key}`
  }

  getConfig() {
    return {
      bucketName: this.config.bucketName,
      keyId: this.config.keyId,
    }
  }
}
