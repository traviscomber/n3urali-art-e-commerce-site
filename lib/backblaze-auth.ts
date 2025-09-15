interface BackblazeConfig {
  accessKeyId: string
  secretAccessKey: string
  region: string
  endpoint: string
  bucket: string
}

interface B2AuthResponse {
  authorizationToken: string
  apiUrl: string
  downloadUrl: string
}

interface B2UploadUrlResponse {
  bucketId: string
  uploadUrl: string
  authorizationToken: string
}

interface B2LargeFileResponse {
  fileId: string
}

interface B2UploadPartUrlResponse {
  fileId: string
  uploadUrl: string
  authorizationToken: string
}

export class BackblazeAuth {
  private config: BackblazeConfig
  private authToken: string | null = null
  private apiUrl: string | null = null
  private bucketId: string | null = null

  constructor() {
    const rawEndpoint = process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com"
    let endpoint = rawEndpoint

    // Ensure endpoint has protocol
    if (!rawEndpoint.startsWith("http://") && !rawEndpoint.startsWith("https://")) {
      endpoint = `https://${rawEndpoint}`
    }

    // Validate the endpoint URL
    try {
      new URL(endpoint)
    } catch (error) {
      console.error("[v0] Invalid B2_ENDPOINT:", rawEndpoint)
      endpoint = "https://s3.us-east-005.backblazeb2.com"
    }

    this.config = {
      accessKeyId: process.env.BACKBLAZE_API_KEY!,
      secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY!,
      region: process.env.B2_REGION || "us-east-005",
      endpoint,
      bucket: process.env.BACKBLAZE_BUCKET_NAME!,
    }

    console.log("[v0] Backblaze config endpoint:", this.config.endpoint)
    this.validateConfig()
  }

  private validateConfig() {
    const required = ["accessKeyId", "secretAccessKey", "bucket"]
    for (const field of required) {
      if (!this.config[field as keyof BackblazeConfig]) {
        throw new Error(`Missing required Backblaze configuration: ${field}`)
      }
    }
  }

  private async authenticate(): Promise<void> {
    if (this.authToken && this.apiUrl) {
      return // Already authenticated
    }

    const credentials = btoa(`${this.config.accessKeyId}:${this.config.secretAccessKey}`)

    try {
      const response = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`)
      }

      const data: B2AuthResponse = await response.json()
      this.authToken = data.authorizationToken
      this.apiUrl = data.apiUrl

      console.log("[v0] B2 authentication successful")
    } catch (error) {
      console.error("[v0] B2 authentication failed:", error)
      throw error
    }
  }

  private async getBucketId(): Promise<string> {
    if (this.bucketId) {
      return this.bucketId
    }

    await this.authenticate()

    try {
      const response = await fetch(`${this.apiUrl}/b2api/v2/b2_list_buckets`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: this.config.accessKeyId,
          bucketName: this.config.bucket,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get bucket ID: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (data.buckets && data.buckets.length > 0) {
        this.bucketId = data.buckets[0].bucketId
        return this.bucketId
      } else {
        throw new Error(`Bucket ${this.config.bucket} not found`)
      }
    } catch (error) {
      console.error("[v0] Failed to get bucket ID:", error)
      throw error
    }
  }

  private async uploadSmallFile(
    key: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      await this.authenticate()
      const bucketId = await this.getBucketId()

      // Get upload URL
      const uploadUrlResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_get_upload_url`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bucketId }),
      })

      if (!uploadUrlResponse.ok) {
        throw new Error(`Failed to get upload URL: ${uploadUrlResponse.status}`)
      }

      const uploadUrlData: B2UploadUrlResponse = await uploadUrlResponse.json()

      // Calculate SHA1 hash
      const sha1Hash = await this.calculateSHA1(fileBuffer)

      // Upload file
      const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
        method: "POST",
        headers: {
          Authorization: uploadUrlData.authorizationToken,
          "X-Bz-File-Name": encodeURIComponent(key),
          "Content-Type": contentType,
          "Content-Length": fileBuffer.length.toString(),
          "X-Bz-Content-Sha1": sha1Hash,
        },
        body: fileBuffer,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`)
      }

      const uploadResult = await uploadResponse.json()
      const publicUrl = `${this.config.endpoint}/${this.config.bucket}/${key}`

      console.log("[v0] Small file uploaded successfully to:", publicUrl)
      return { success: true, url: publicUrl }
    } catch (error) {
      console.error("[v0] Small file upload error:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  private async uploadLargeFile(
    key: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log("[v0] uploadLargeFile: Starting method")
      await this.authenticate()
      console.log("[v0] uploadLargeFile: Authentication complete")
      const bucketId = await this.getBucketId()
      console.log("[v0] uploadLargeFile: Got bucket ID:", bucketId)

      console.log("[v0] Starting large file multipart upload...")

      // Step 1: Start large file
      console.log("[v0] uploadLargeFile: Starting large file request")
      const startResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_start_large_file`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucketId,
          fileName: key,
          contentType,
        }),
      })

      if (!startResponse.ok) {
        console.log("[v0] uploadLargeFile: Start large file failed with status:", startResponse.status)
        const errorText = await startResponse.text()
        console.log("[v0] uploadLargeFile: Start large file error text:", errorText)
        throw new Error(`Failed to start large file: ${startResponse.status} - ${errorText}`)
      }

      console.log("[v0] uploadLargeFile: Start large file successful")
      const startData: B2LargeFileResponse = await startResponse.json()
      const fileId = startData.fileId
      console.log("[v0] uploadLargeFile: Got file ID:", fileId)

      // Step 2: Upload parts (5MB chunks)
      const chunkSize = 5 * 1024 * 1024 // 5MB
      const totalChunks = Math.ceil(fileBuffer.length / chunkSize)
      const partSha1Array: string[] = []

      console.log("[v0] Uploading", totalChunks, "parts...")

      for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
        console.log(`[v0] uploadLargeFile: Processing part ${partNumber}/${totalChunks}`)
        const start = (partNumber - 1) * chunkSize
        const end = Math.min(start + chunkSize, fileBuffer.length)
        const chunk = fileBuffer.subarray(start, end)
        console.log(`[v0] uploadLargeFile: Chunk ${partNumber} size:`, chunk.length)

        // Get upload part URL
        console.log(`[v0] uploadLargeFile: Getting upload part URL for part ${partNumber}`)
        const partUrlResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_get_upload_part_url`, {
          method: "POST",
          headers: {
            Authorization: this.authToken!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileId }),
        })

        if (!partUrlResponse.ok) {
          console.log(
            `[v0] uploadLargeFile: Get upload part URL failed for part ${partNumber}:`,
            partUrlResponse.status,
          )
          const errorText = await partUrlResponse.text()
          console.log(`[v0] uploadLargeFile: Get upload part URL error text:`, errorText)
          throw new Error(`Failed to get upload part URL: ${partUrlResponse.status} - ${errorText}`)
        }

        console.log(`[v0] uploadLargeFile: Got upload part URL for part ${partNumber}`)
        const partUrlData: B2UploadPartUrlResponse = await partUrlResponse.json()

        // Calculate SHA1 for this part
        console.log(`[v0] uploadLargeFile: Calculating SHA1 for part ${partNumber}`)
        const partSha1 = await this.calculateSHA1(chunk)
        partSha1Array.push(partSha1)
        console.log(`[v0] uploadLargeFile: SHA1 calculated for part ${partNumber}:`, partSha1)

        // Upload part with improved error handling
        console.log(`[v0] uploadLargeFile: Uploading part ${partNumber}`)

        let partResponse: Response
        try {
          partResponse = await fetch(partUrlData.uploadUrl, {
            method: "POST",
            headers: {
              Authorization: partUrlData.authorizationToken,
              "X-Bz-Part-Number": partNumber.toString(),
              "Content-Length": chunk.length.toString(),
              "X-Bz-Content-Sha1": partSha1,
            },
            body: chunk,
          })
        } catch (fetchError: unknown) {
          console.log(`[v0] uploadLargeFile: Fetch error for part ${partNumber}:`, fetchError)

          // Handle the error more safely to avoid getAll issues
          let errorMessage = "Unknown network error"
          if (fetchError instanceof Error) {
            errorMessage = fetchError.message
          } else if (typeof fetchError === "string") {
            errorMessage = fetchError
          } else if (fetchError && typeof fetchError === "object") {
            // Safely extract error information without calling getAll
            errorMessage = String(fetchError)
          }

          console.log(`[v0] uploadLargeFile: Processed error message:`, errorMessage)
          throw new Error(`Network error uploading part ${partNumber}: ${errorMessage}`)
        }

        if (!partResponse.ok) {
          console.log(`[v0] uploadLargeFile: Upload part ${partNumber} failed:`, partResponse.status)
          let errorText = "Unknown error"
          try {
            errorText = await partResponse.text()
          } catch (textError) {
            console.log(`[v0] uploadLargeFile: Could not read error text:`, textError)
          }
          console.log(`[v0] uploadLargeFile: Upload part ${partNumber} error text:`, errorText)
          throw new Error(`Failed to upload part ${partNumber}: ${partResponse.status} - ${errorText}`)
        }

        console.log("[v0] Uploaded part", partNumber, "of", totalChunks)
      }

      // Step 3: Finish large file
      console.log("[v0] uploadLargeFile: Finishing large file upload")
      const finishResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_finish_large_file`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          partSha1Array,
        }),
      })

      if (!finishResponse.ok) {
        console.log("[v0] uploadLargeFile: Finish large file failed:", finishResponse.status)
        const errorText = await finishResponse.text()
        console.log("[v0] uploadLargeFile: Finish large file error text:", errorText)
        throw new Error(`Failed to finish large file: ${finishResponse.status} - ${errorText}`)
      }

      console.log("[v0] uploadLargeFile: Large file upload completed successfully")
      const publicUrl = `${this.config.endpoint}/${this.config.bucket}/${key}`
      console.log("[v0] Large file uploaded successfully to:", publicUrl)
      return { success: true, url: publicUrl }
    } catch (error: unknown) {
      console.error("[v0] Large file upload error:", error)

      let errorMessage = "Unknown error"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      } else if (error && typeof error === "object") {
        // Safely convert error object to string without calling methods that might not exist
        errorMessage = String(error)
      }

      console.error("[v0] Processed error message:", errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  private async calculateSHA1(buffer: Buffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest("SHA-1", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  async uploadFile(
    key: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log("[v0] Starting upload to Backblaze B2...")
      console.log("[v0] File size:", fileBuffer.length, "bytes")

      // Use multipart upload for files larger than 5MB
      const fiveMB = 5 * 1024 * 1024
      if (fileBuffer.length > fiveMB) {
        console.log("[v0] Using multipart upload for large file...")
        return await this.uploadLargeFile(key, fileBuffer, contentType)
      } else {
        console.log("[v0] Using single upload for small file...")
        return await this.uploadSmallFile(key, fileBuffer, contentType)
      }
    } catch (error) {
      console.error("[v0] Upload error:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  async generatePresignedUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    console.log("[v0] Generating presigned URL for key:", key)

    try {
      await this.authenticate()
      const bucketId = await this.getBucketId()

      // Get upload URL for presigned URL generation
      const uploadUrlResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_get_upload_url`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bucketId }),
      })

      if (!uploadUrlResponse.ok) {
        throw new Error(`Failed to get upload URL: ${uploadUrlResponse.status}`)
      }

      const uploadUrlData: B2UploadUrlResponse = await uploadUrlResponse.json()
      console.log("[v0] Generated presigned URL successfully")
      return uploadUrlData.uploadUrl
    } catch (error) {
      console.error("[v0] Error generating presigned URL:", error)
      throw error
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.authenticate()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  getConfig() {
    return { ...this.config }
  }
}

export { BackblazeAuth as BackblazeStorage }
