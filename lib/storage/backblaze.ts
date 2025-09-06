interface BackblazeAuthResponse {
  authorizationToken: string
  apiInfo: {
    storageApi: {
      apiUrl: string
      downloadUrl: string
    }
  }
  accountId: string
}

interface BackblazeUploadUrlResponse {
  bucketId: string
  uploadUrl: string
  authorizationToken: string
}

interface BackblazeUploadResponse {
  fileId: string
  fileName: string
  contentLength: number
  contentSha1: string
  fileInfo: Record<string, string>
}

interface BackblazeStartLargeFileResponse {
  fileId: string
}

interface BackblazeGetUploadPartUrlResponse {
  fileId: string
  uploadUrl: string
  authorizationToken: string
}

interface BackblazeUploadPartResponse {
  fileId: string
  partNumber: number
  contentLength: number
  contentSha1: string
}

export class BackblazeStorage {
  private keyId: string
  private applicationKey: string
  private bucketName: string
  private authToken?: string
  private apiUrl?: string
  private downloadUrl?: string
  private accountId?: string
  private readonly CHUNK_SIZE = 10 * 1024 * 1024 // 10MB chunks

  constructor(keyId: string, applicationKey: string, bucketName: string) {
    this.keyId = keyId
    this.applicationKey = applicationKey
    this.bucketName = bucketName
  }

  private async authenticate(): Promise<void> {
    if (this.authToken && this.apiUrl && this.accountId) {
      return // Already authenticated
    }

    console.log("[v0] Backblaze auth - keyId:", this.keyId)
    console.log("[v0] Backblaze auth - applicationKey length:", this.applicationKey.length)
    console.log("[v0] Backblaze auth - applicationKey first 10 chars:", this.applicationKey.substring(0, 10))

    const credentialsString = `${this.keyId}:${this.applicationKey}`
    console.log("[v0] Backblaze auth - credentials string length:", credentialsString.length)

    const credentials = btoa(credentialsString)
    console.log("[v0] Backblaze auth - base64 credentials length:", credentials.length)
    console.log("[v0] Backblaze auth - base64 credentials first 20 chars:", credentials.substring(0, 20))

    try {
      const response = await fetch("https://api001.backblazeb2.com/b2api/v3/b2_authorize_account", {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
          "User-Agent": "N3uraliart/1.0",
        },
      })

      console.log("[v0] Backblaze auth response status:", response.status)
      console.log("[v0] Backblaze auth response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Backblaze auth response:", response.status, errorText)

        try {
          const errorJson = JSON.parse(errorText)
          console.error("[v0] Backblaze auth error details:", errorJson)
        } catch (parseError) {
          console.error("[v0] Backblaze auth error (raw):", errorText)
        }

        throw new Error(`Backblaze authentication failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data: BackblazeAuthResponse = await response.json()
      this.authToken = data.authorizationToken
      this.apiUrl = data.apiInfo.storageApi.apiUrl
      this.downloadUrl = data.apiInfo.storageApi.downloadUrl
      this.accountId = data.accountId

      console.log("[v0] Backblaze authentication successful")
      console.log("[v0] Backblaze auth token length:", this.authToken.length)
      console.log("[v0] Backblaze API URL:", this.apiUrl)
      console.log("[v0] Backblaze account ID:", this.accountId)
    } catch (error) {
      console.error("[v0] Backblaze authentication error:", error)
      throw error
    }
  }

  private async getBucketId(): Promise<string> {
    await this.authenticate()

    try {
      const response = await fetch(`${this.apiUrl}/b2api/v3/b2_list_buckets`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: this.accountId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to list buckets: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      const bucket = data.buckets.find((b: any) => b.bucketName === this.bucketName)

      if (!bucket) {
        throw new Error(
          `Bucket '${this.bucketName}' not found. Available buckets: ${data.buckets.map((b: any) => b.bucketName).join(", ")}`,
        )
      }

      return bucket.bucketId
    } catch (error) {
      console.error("[v0] Backblaze getBucketId error:", error)
      throw error
    }
  }

  private async getUploadUrl(bucketId: string): Promise<BackblazeUploadUrlResponse> {
    await this.authenticate()

    try {
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
        throw new Error(`Failed to get upload URL: ${response.status} ${response.statusText} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("[v0] Backblaze getUploadUrl error:", error)
      throw error
    }
  }

  async uploadLargeFile(
    fileName: string,
    fileBuffer: Buffer,
    contentType = "application/octet-stream",
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    try {
      console.log(
        "[v0] Starting chunked Backblaze upload for:",
        fileName,
        `(${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB)`,
      )

      const bucketId = await this.getBucketId()

      // Start large file upload
      const startResponse = await fetch(`${this.apiUrl}/b2api/v3/b2_start_large_file`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucketId: bucketId,
          fileName: fileName,
          contentType: contentType,
        }),
      })

      if (!startResponse.ok) {
        const errorText = await startResponse.text()
        throw new Error(`Failed to start large file upload: ${startResponse.status} - ${errorText}`)
      }

      const startResult: BackblazeStartLargeFileResponse = await startResponse.json()
      const fileId = startResult.fileId

      // Upload parts
      const totalChunks = Math.ceil(fileBuffer.length / this.CHUNK_SIZE)
      const partSha1Array: string[] = []

      console.log("[v0] Uploading", totalChunks, "chunks...")

      for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
        const start = (partNumber - 1) * this.CHUNK_SIZE
        const end = Math.min(start + this.CHUNK_SIZE, fileBuffer.length)
        const chunk = fileBuffer.subarray(start, end)

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

        const partUrlResult: BackblazeGetUploadPartUrlResponse = await partUrlResponse.json()

        // Calculate SHA1 for this chunk
        const crypto = await import("crypto")
        const sha1 = crypto.createHash("sha1").update(chunk).digest("hex")
        partSha1Array.push(sha1)

        // Upload the part
        const uploadPartResponse = await fetch(partUrlResult.uploadUrl, {
          method: "POST",
          headers: {
            Authorization: partUrlResult.authorizationToken,
            "X-Bz-Part-Number": partNumber.toString(),
            "Content-Length": chunk.length.toString(),
            "X-Bz-Content-Sha1": sha1,
          },
          body: chunk,
        })

        if (!uploadPartResponse.ok) {
          const errorText = await uploadPartResponse.text()
          throw new Error(`Failed to upload part ${partNumber}: ${uploadPartResponse.status} - ${errorText}`)
        }

        // Report progress
        if (onProgress) {
          const progress = (partNumber / totalChunks) * 100
          onProgress(progress)
        }

        console.log("[v0] Uploaded chunk", partNumber, "of", totalChunks)
      }

      // Finish large file upload
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
        throw new Error(`Failed to finish large file upload: ${finishResponse.status} - ${errorText}`)
      }

      const finishResult = await finishResponse.json()
      console.log("[v0] Chunked Backblaze upload successful:", finishResult.fileName)

      return `${this.downloadUrl}/file/${this.bucketName}/${fileName}`
    } catch (error) {
      console.error("[v0] Backblaze chunked upload error:", error)
      throw error
    }
  }

  async uploadFile(fileName: string, fileBuffer: Buffer, contentType = "application/octet-stream"): Promise<string> {
    const fileSizeMB = fileBuffer.length / (1024 * 1024)
    if (fileSizeMB > 100) {
      console.log("[v0] Using chunked upload for large file:", `${fileSizeMB.toFixed(2)}MB`)
      return this.uploadLargeFile(fileName, fileBuffer, contentType)
    }

    try {
      console.log("[v0] Starting Backblaze upload for:", fileName)
      const bucketId = await this.getBucketId()
      console.log("[v0] Got bucket ID:", bucketId)

      const uploadInfo = await this.getUploadUrl(bucketId)
      console.log("[v0] Got upload URL")

      // Calculate SHA1 hash
      const crypto = await import("crypto")
      const sha1 = crypto.createHash("sha1").update(fileBuffer).digest("hex")

      const response = await fetch(uploadInfo.uploadUrl, {
        method: "POST",
        headers: {
          Authorization: uploadInfo.authorizationToken,
          "X-Bz-File-Name": encodeURIComponent(fileName),
          "Content-Type": contentType,
          "Content-Length": fileBuffer.length.toString(),
          "X-Bz-Content-Sha1": sha1,
        },
        body: fileBuffer,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const uploadResult: BackblazeUploadResponse = await response.json()
      console.log("[v0] Backblaze upload successful:", uploadResult.fileName)

      // Return the public download URL
      return `${this.downloadUrl}/file/${this.bucketName}/${fileName}`
    } catch (error) {
      console.error("[v0] Backblaze upload error:", error)
      throw error
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.authenticate()

      // First, get file info to get the file ID
      const response = await fetch(`${this.apiUrl}/b2api/v2/b2_list_file_names`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucketId: await this.getBucketId(),
          startFileName: fileName,
          maxFileCount: 1,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to find file: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      const file = data.files.find((f: any) => f.fileName === fileName)

      if (!file) {
        throw new Error(`File '${fileName}' not found`)
      }

      // Delete the file
      const deleteResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_delete_file_version`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: file.fileId,
          fileName: fileName,
        }),
      })

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text()
        throw new Error(`Failed to delete file: ${deleteResponse.status} ${deleteResponse.statusText} - ${errorText}`)
      }
    } catch (error) {
      console.error("[v0] Backblaze delete error:", error)
      throw error
    }
  }

  async getFileUrl(fileName: string): Promise<string> {
    await this.authenticate()
    return `${this.downloadUrl}/file/${this.bucketName}/${fileName}`
  }
}
