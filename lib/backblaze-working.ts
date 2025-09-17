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
  downloadUrl: string // Added downloadUrl to the response interface
}

interface B2StartLargeFileResponse {
  fileId: string
}

interface B2GetUploadPartUrlResponse {
  fileId: string
  uploadUrl: string
  authorizationToken: string
}

interface B2FinishLargeFileResponse {
  fileId: string
  fileName: string
  downloadUrl: string
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

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        // Check if this is a server error response
        if (
          responseText.includes("A server error has occurred") ||
          responseText.includes("INTERNAL_FUNCTION_INVOCATION_FAILED")
        ) {
          console.warn("[v0] Backblaze server error detected, retrying authentication...")
          throw new Error("Backblaze server temporarily unavailable - please try again")
        }
        throw new Error(`Invalid JSON response from Backblaze: ${responseText.substring(0, 100)}...`)
      }

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

  private async uploadLargeFile(file: File, key: string): Promise<string> {
    try {
      console.log("[v0] Starting multipart upload for large file:", key)

      if (!this.authToken || !this.apiUrl) {
        await this.authenticate()
      }

      const bucketId = await this.getBucketId()

      // Step 1: Start large file upload
      console.log("[v0] Starting large file upload...")
      const startResponse = await fetch(`${this.apiUrl}/b2api/v3/b2_start_large_file`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucketId: bucketId,
          fileName: key,
          contentType: file.type || "application/octet-stream",
        }),
      })

      if (!startResponse.ok) {
        const errorText = await startResponse.text()
        throw new Error(`Failed to start large file upload: ${startResponse.status} - ${errorText}`)
      }

      const startData: B2StartLargeFileResponse = await startResponse.json()
      const fileId = startData.fileId
      console.log("[v0] Large file upload started, fileId:", fileId)

      // Step 2: Upload parts (10MB chunks)
      const chunkSize = 10 * 1024 * 1024 // 10MB chunks
      const totalChunks = Math.ceil(file.size / chunkSize)
      const partSha1Array: string[] = []
      const uploadedParts: { partNumber: number; sha1: string }[] = []

      console.log("[v0] Uploading", totalChunks, "parts of", chunkSize / 1024 / 1024, "MB each")

      for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
        const start = (partNumber - 1) * chunkSize
        const end = Math.min(start + chunkSize, file.size)
        const chunk = file.slice(start, end)

        console.log(`[v0] Uploading part ${partNumber}/${totalChunks} (${(chunk.size / 1024 / 1024).toFixed(2)}MB)`)

        // Get upload URL for this part
        const partUrlResponse = await fetch(`${this.apiUrl}/b2api/v3/b2_get_upload_part_url`, {
          method: "POST",
          headers: {
            Authorization: this.authToken!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId: fileId,
          }),
        })

        if (!partUrlResponse.ok) {
          const errorText = await partUrlResponse.text()
          throw new Error(`Failed to get upload part URL: ${partUrlResponse.status} - ${errorText}`)
        }

        const partUrlData: B2GetUploadPartUrlResponse = await partUrlResponse.json()

        // Calculate SHA1 for this part
        const partArrayBuffer = await chunk.arrayBuffer()
        const partHashBuffer = await crypto.subtle.digest("SHA-1", partArrayBuffer)
        const partHashArray = Array.from(new Uint8Array(partHashBuffer))
        const partSha1 = partHashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

        partSha1Array[partNumber - 1] = partSha1
        uploadedParts.push({ partNumber, sha1: partSha1 })

        console.log(`[v0] Part ${partNumber} SHA1:`, partSha1)

        // Upload the part
        const partResponse = await fetch(partUrlData.uploadUrl, {
          method: "POST",
          headers: {
            Authorization: partUrlData.authorizationToken,
            "X-Bz-Part-Number": partNumber.toString(),
            "X-Bz-Content-Sha1": partSha1,
          },
          body: chunk,
        })

        if (!partResponse.ok) {
          const errorText = await partResponse.text()
          throw new Error(`Failed to upload part ${partNumber}: ${partResponse.status} - ${errorText}`)
        }

        const partResult = await partResponse.json()
        console.log(`[v0] Part ${partNumber}/${totalChunks} uploaded successfully, response:`, Object.keys(partResult))
      }

      console.log(
        "[v0] Uploaded parts summary:",
        uploadedParts.map((p) => `Part ${p.partNumber}: ${p.sha1.substring(0, 8)}...`),
      )
      console.log("[v0] Final partSha1Array length:", partSha1Array.length)
      console.log(
        "[v0] Final partSha1Array:",
        partSha1Array.map((sha, i) => `${i + 1}: ${sha?.substring(0, 8)}...`),
      )

      // Step 3: Finish large file upload
      console.log("[v0] Finishing large file upload...")
      const finishResponse = await fetch(`${this.apiUrl}/b2api/v3/b2_finish_large_file`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: fileId,
          partSha1Array: partSha1Array,
        }),
      })

      if (!finishResponse.ok) {
        const errorText = await finishResponse.text()
        console.error("[v0] Finish large file failed with status:", finishResponse.status)
        console.error("[v0] Finish large file error response:", errorText)
        console.error("[v0] FileId used:", fileId)
        console.error("[v0] PartSha1Array sent:", partSha1Array)
        throw new Error(`Failed to finish large file upload: ${finishResponse.status} - ${errorText}`)
      }

      const finishData: B2FinishLargeFileResponse = await finishResponse.json()
      const publicUrl = this.getPublicUrl(key)

      console.log("[v0] Multipart upload completed successfully:", publicUrl)
      return publicUrl
    } catch (error: any) {
      console.error("[v0] Multipart upload failed:", error)
      throw new Error(`Multipart upload failed: ${error.message}`)
    }
  }

  async uploadFile(file: File, key: string): Promise<string> {
    try {
      console.log("[v0] Starting native B2 upload:", key)

      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > 50) {
        console.log(`[v0] File is ${fileSizeMB.toFixed(2)}MB, using multipart upload`)
        return await this.uploadLargeFile(file, key)
      }

      console.log(`[v0] File is ${fileSizeMB.toFixed(2)}MB, using single upload`)
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
        console.error("[v0] B2 upload failed with status:", response.status)
        console.error("[v0] B2 error response:", errorText)

        if (response.status === 413 || (errorText && errorText.includes("Request Entity Too Large"))) {
          console.log("[v0] File too large for single upload, switching to multipart...")
          return await this.uploadLargeFile(file, key)
        }

        throw new Error(`HTTP ${response.status}: ${errorText || "Unknown error"}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("[v0] B2 returned non-JSON response:", responseText)

        if (
          responseText &&
          (responseText.includes("FUNCTION_PAYLOAD_TOO_LARGE") || responseText.includes("Request Entity Too Large"))
        ) {
          console.log("[v0] Function payload too large, switching to multipart upload...")
          return await this.uploadLargeFile(file, key)
        }

        throw new Error(
          `Expected JSON response but got: ${contentType}. Response: ${responseText ? responseText.substring(0, 200) + "..." : "No response"}`,
        )
      }

      const result = await response.json()
      const publicUrl = result.downloadUrl || this.getPublicUrl(key)

      console.log("[v0] B2 upload successful:", publicUrl)
      console.log("[v0] Upload result keys:", Object.keys(result))
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
    if (!this.downloadUrl) {
      console.warn("[v0] Download URL not set, using fallback. This may cause 404 errors.")
      console.log("[v0] Current downloadUrl:", this.downloadUrl)
      console.log("[v0] Auth token exists:", !!this.authToken)
    }

    const baseUrl = this.downloadUrl || "https://f005.backblazeb2.com"
    const publicUrl = `${baseUrl}/file/${this.config.bucketName}/${key}`

    console.log("[v0] Constructed public URL:", publicUrl)
    console.log("[v0] Using base URL:", baseUrl)
    console.log("[v0] Download URL from auth:", this.downloadUrl)

    return publicUrl
  }

  getConfig() {
    return {
      bucketName: this.config.bucketName,
      keyId: this.config.keyId,
    }
  }

  async getAuthenticatedApiInfo() {
    if (!this.authToken || !this.apiUrl) {
      await this.authenticate()
    }

    return {
      authToken: this.authToken!,
      apiUrl: this.apiUrl!,
      accountId: this.config.keyId,
    }
  }

  async getPublicBucketId(): Promise<string> {
    return await this.getBucketId()
  }

  async configureBucketCORS(): Promise<void> {
    try {
      console.log("[v0] Configuring CORS for bucket:", this.config.bucketName)

      if (!this.authToken || !this.apiUrl) {
        await this.authenticate()
      }

      const bucketId = await this.getBucketId()

      const corsRules = [
        {
          corsRuleName: "downloadFromAnyOrigin",
          allowedOrigins: [
            "https://n3uralia360.art",
            "https://*.n3uralia360.art",
            "https://*.vercel.app",
            "http://localhost:3000",
            "http://localhost:3001",
          ],
          allowedHeaders: ["*"],
          allowedOperations: ["b2_download_file_by_id", "b2_download_file_by_name"],
          maxAgeSeconds: 3600,
        },
      ]

      const response = await fetch(`${this.apiUrl}/b2api/v3/b2_update_bucket`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: this.config.keyId,
          bucketId: bucketId,
          corsRules: corsRules,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to configure CORS: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("[v0] CORS configuration successful:", result)
    } catch (error: any) {
      console.error("[v0] CORS configuration failed:", error)
      throw new Error(`Failed to configure CORS: ${error.message}`)
    }
  }

  async getBucketCORS(): Promise<any> {
    try {
      if (!this.authToken || !this.apiUrl) {
        await this.authenticate()
      }

      const bucketId = await this.getBucketId()

      const response = await fetch(`${this.apiUrl}/b2api/v3/b2_get_bucket`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucketId: bucketId,
        }),
      })

      const responseText = await response.text()

      if (!response.ok) {
        if (response.status === 404 || responseText.includes("not_found")) {
          console.log("[v0] No CORS configuration found, returning empty array")
          return []
        }
        throw new Error(`Failed to get bucket CORS: ${response.status} - ${responseText}`)
      }

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        // Check if this is a server error response
        if (
          responseText.includes("A server error has occurred") ||
          responseText.includes("INTERNAL_FUNCTION_INVOCATION_FAILED")
        ) {
          console.warn("[v0] Backblaze server error during CORS check, returning empty array")
          return []
        }
        throw new Error(`Invalid JSON response from Backblaze: ${responseText.substring(0, 100)}...`)
      }

      console.log("[v0] Current CORS configuration:", result.corsRules)
      return result.corsRules || []
    } catch (error: any) {
      console.error("[v0] Failed to get CORS configuration:", error)
      if (
        error.message.includes("not_found") ||
        error.message.includes("404") ||
        error.message.includes("server temporarily unavailable")
      ) {
        console.log("[v0] CORS not configured yet or server error, returning empty array")
        return []
      }
      throw new Error(`Failed to get CORS configuration: ${error.message}`)
    }
  }

  async getAuthenticatedDownloadUrl(fileName: string): Promise<string> {
    try {
      if (!this.authToken || !this.downloadUrl) {
        await this.authenticate()
      }

      // For private buckets, we need to use the authenticated download URL
      // This includes the authorization token in the URL
      const authenticatedUrl = `${this.downloadUrl}/file/${this.config.bucketName}/${fileName}?Authorization=${this.authToken}`

      console.log("[v0] Generated authenticated download URL for:", fileName)
      return authenticatedUrl
    } catch (error: any) {
      console.error("[v0] Failed to generate authenticated download URL:", error)
      throw new Error(`Failed to generate authenticated download URL: ${error.message}`)
    }
  }

  convertToProxyUrl(originalUrl: string): string {
    try {
      // Extract the file path from the original Backblaze URL
      const urlPattern = /https:\/\/f\d+\.backblazeb2\.com\/file\/[^/]+\/(.+)/
      const match = originalUrl.match(urlPattern)

      if (match && match[1]) {
        const filePath = match[1]
        return `/api/image-proxy/${filePath}`
      }

      // If it's already a proxy URL or doesn't match the pattern, return as-is
      return originalUrl
    } catch (error) {
      console.error("[v0] Failed to convert URL to proxy:", error)
      return originalUrl
    }
  }
}
