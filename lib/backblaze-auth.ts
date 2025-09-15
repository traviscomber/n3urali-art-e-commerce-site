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

      const fileArrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength,
      )

      console.log("[v0] About to upload small file with fetch...")

      const uploadHeaders: Record<string, string> = {
        Authorization: uploadUrlData.authorizationToken,
        "X-Bz-File-Name": encodeURIComponent(key),
        "Content-Type": contentType,
        "X-Bz-Content-Sha1": sha1Hash,
      }

      // Upload file
      const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
        method: "POST",
        headers: uploadHeaders,
        body: fileArrayBuffer,
      })

      console.log("[v0] Small file upload fetch completed, status:", uploadResponse.status)

      if (!uploadResponse.ok) {
        let errorText = "Unknown error"
        try {
          errorText = await uploadResponse.text()
        } catch (textError) {
          console.error("[v0] Could not read error response:", textError)
          errorText = `HTTP ${uploadResponse.status} ${uploadResponse.statusText}`
        }
        throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`)
      }

      let uploadResult: any
      try {
        const responseText = await uploadResponse.text()
        console.log("[v0] Small file upload response text:", responseText)

        if (responseText.trim().startsWith("{")) {
          // Looks like JSON, try to parse it
          uploadResult = JSON.parse(responseText)
          console.log("[v0] Small file upload response parsed as JSON:", uploadResult)
        } else {
          // Not JSON, this might be an error message
          console.log("[v0] Small file upload response is not JSON:", responseText)
          throw new Error(`Upload returned non-JSON response: ${responseText}`)
        }
      } catch (parseError) {
        console.error("[v0] Failed to parse small file upload response:", parseError)
        throw parseError
      }

      const publicUrl = `${this.config.endpoint}/${this.config.bucket}/${key}`

      console.log("[v0] Small file uploaded successfully to:", publicUrl)
      return { success: true, url: publicUrl }
    } catch (error) {
      console.error("[v0] Small file upload error:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      return { success: false, error: errorMessage }
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

      // Step 2: Upload parts (5MB chunks minimum required by Backblaze)
      const chunkSize = 5 * 1024 * 1024 // 5MB - minimum required by Backblaze for multipart uploads
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
        console.log(`[v0] uploadLargeFile: SHA1 calculated for part ${partNumber}:`, partSha1)

        console.log(`[v0] uploadLargeFile: Uploading part ${partNumber}`)

        try {
          console.log(`[v0] uploadLargeFile: About to fetch part upload URL for part ${partNumber}`)

          const chunkArrayBuffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength)

          const partHeaders: Record<string, string> = {
            Authorization: partUrlData.authorizationToken,
            "X-Bz-Part-Number": partNumber.toString(),
            "X-Bz-Content-Sha1": partSha1,
          }

          const partResponse = await fetch(partUrlData.uploadUrl, {
            method: "POST",
            headers: partHeaders,
            body: chunkArrayBuffer,
          })

          console.log(`[v0] uploadLargeFile: Part ${partNumber} fetch completed, status:`, partResponse.status)

          if (!partResponse.ok) {
            console.log(`[v0] uploadLargeFile: Upload part ${partNumber} failed:`, partResponse.status)
            let errorText = "Unknown error"
            try {
              console.log(`[v0] uploadLargeFile: Attempting to read error response text for part ${partNumber}`)
              errorText = await partResponse.text()
              console.log(`[v0] uploadLargeFile: Error response text for part ${partNumber}:`, errorText)
            } catch (textError) {
              console.log(`[v0] uploadLargeFile: Could not read error text for part ${partNumber}:`, textError)
            }
            throw new Error(`Failed to upload part ${partNumber}: ${partResponse.status} - ${errorText}`)
          }

          let partResponseData: any
          let responseSha1: string

          try {
            // First try to parse as JSON
            const responseText = await partResponse.text()
            console.log(`[v0] uploadLargeFile: Part ${partNumber} response text:`, responseText)

            if (responseText.trim().startsWith("{")) {
              // Looks like JSON, try to parse it
              partResponseData = JSON.parse(responseText)
              responseSha1 = partResponseData.contentSha1
              console.log(`[v0] uploadLargeFile: Part ${partNumber} response SHA1 from JSON:`, responseSha1)
            } else {
              // Not JSON, this might be an error message
              console.log(`[v0] uploadLargeFile: Part ${partNumber} response is not JSON:`, responseText)
              throw new Error(`Part upload returned non-JSON response: ${responseText}`)
            }
          } catch (parseError) {
            console.error(`[v0] uploadLargeFile: Failed to parse part ${partNumber} response:`, parseError)
            // If we can't parse the response, use our calculated SHA1 as fallback
            console.log(`[v0] uploadLargeFile: Using calculated SHA1 as fallback for part ${partNumber}:`, partSha1)
            responseSha1 = partSha1
          }

          partSha1Array.push(responseSha1)
          console.log("Uploaded part", partNumber, "of", totalChunks)
        } catch (partError) {
          console.error(`[v0] uploadLargeFile: Detailed error uploading part ${partNumber}:`)
          console.error(`[v0] uploadLargeFile: Error type:`, typeof partError)
          console.error(`[v0] uploadLargeFile: Error constructor:`, partError?.constructor?.name)
          console.error(
            `[v0] uploadLargeFile: Error message:`,
            partError instanceof Error ? partError.message : String(partError),
          )
          console.error(`[v0] uploadLargeFile: Full error object:`, partError)
          throw partError
        }
      }

      // Step 3: Finish large file
      console.log("[v0] uploadLargeFile: Finishing large file upload")
      console.log("[v0] uploadLargeFile: Using SHA1 array:", partSha1Array)
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

      console.error("[v0] Error type:", typeof error)
      console.error("[v0] Error constructor:", error?.constructor?.name)
      console.error("[v0] Error instanceof Error:", error instanceof Error)

      let errorMessage = "Unknown error"
      if (error instanceof Error) {
        errorMessage = error.message
        console.error("[v0] Error stack:", error.stack)
      } else if (typeof error === "string") {
        errorMessage = error
      } else {
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

      // This ensures we have enough data to create proper 5MB chunks
      const tenMB = 10 * 1024 * 1024
      if (fileBuffer.length > tenMB) {
        console.log("[v0] Using multipart upload for large file...")
        return await this.uploadLargeFile(key, fileBuffer, contentType)
      } else {
        console.log("[v0] Using single upload for file...")
        return await this.uploadSmallFile(key, fileBuffer, contentType)
      }
    } catch (error) {
      console.error("[v0] Upload error:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  async generatePresignedUrl(
    key: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<{
    uploadUrl: string
    authToken: string
    bucketId: string
  }> {
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

      return {
        uploadUrl: uploadUrlData.uploadUrl,
        authToken: uploadUrlData.authorizationToken,
        bucketId: uploadUrlData.bucketId,
      }
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
