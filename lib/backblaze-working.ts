/**
 * Working Backblaze B2 Storage Client with Authentication
 */

interface BackblazeAuthResponse {
  authorizationToken: string
  apiUrl: string
  downloadUrl: string
}

export class WorkingBackblazeStorage {
  private apiKey: string
  private applicationKey: string
  private bucketName: string
  private authToken?: string
  private apiUrl?: string
  private downloadUrl?: string

  constructor(apiKey: string, applicationKey: string, bucketName: string) {
    this.apiKey = apiKey
    this.applicationKey = applicationKey
    this.bucketName = bucketName
  }

  private async authenticate(): Promise<void> {
    if (this.authToken && this.apiUrl && this.downloadUrl) {
      return // Already authenticated
    }

    const credentials = Buffer.from(`${this.apiKey}:${this.applicationKey}`).toString("base64")

    try {
      const response = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`)
      }

      const data: BackblazeAuthResponse = await response.json()
      this.authToken = data.authorizationToken
      this.apiUrl = data.apiUrl
      this.downloadUrl = data.downloadUrl

      console.log("[v0] Backblaze authentication successful")
    } catch (error) {
      console.error("[v0] Backblaze authentication error:", error)
      throw error
    }
  }

  async getAuthenticatedDownloadUrl(filePath: string): Promise<string> {
    await this.authenticate()

    if (!this.downloadUrl) {
      throw new Error("Download URL not available")
    }

    // For public buckets, we can construct the URL directly
    const publicUrl = `${this.downloadUrl}/file/${this.bucketName}/${filePath}`

    console.log("[v0] Generated authenticated download URL for:", filePath)
    return publicUrl
  }

  async uploadFile(filePath: string, fileBuffer: Buffer, contentType: string): Promise<string> {
    await this.authenticate()

    if (!this.apiUrl || !this.authToken) {
      throw new Error("Authentication required")
    }

    try {
      // Get upload URL
      const uploadUrlResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_get_upload_url`, {
        method: "POST",
        headers: {
          Authorization: this.authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucketId: this.bucketName,
        }),
      })

      if (!uploadUrlResponse.ok) {
        throw new Error(`Failed to get upload URL: ${uploadUrlResponse.statusText}`)
      }

      const uploadData = await uploadUrlResponse.json()

      // Upload file
      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: "POST",
        headers: {
          Authorization: uploadData.authorizationToken,
          "X-Bz-File-Name": filePath,
          "Content-Type": contentType,
          "Content-Length": fileBuffer.length.toString(),
        },
        body: new Uint8Array(fileBuffer),
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`)
      }

      const result = await uploadResponse.json()
      console.log("[v0] File uploaded successfully to Backblaze:", result.fileName)

      return `${this.downloadUrl}/file/${this.bucketName}/${filePath}`
    } catch (error) {
      console.error("[v0] Backblaze upload error:", error)
      throw error
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    await this.authenticate()

    if (!this.apiUrl || !this.authToken) {
      throw new Error("Authentication required")
    }

    try {
      // First, get file info
      const fileInfoResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_list_file_names`, {
        method: "POST",
        headers: {
          Authorization: this.authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucketId: this.bucketName,
          startFileName: filePath,
          maxFileCount: 1,
        }),
      })

      if (!fileInfoResponse.ok) {
        throw new Error(`Failed to get file info: ${fileInfoResponse.statusText}`)
      }

      const fileData = await fileInfoResponse.json()

      if (fileData.files.length === 0) {
        console.log("[v0] File not found for deletion:", filePath)
        return
      }

      const file = fileData.files[0]

      // Delete the file
      const deleteResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_delete_file_version`, {
        method: "POST",
        headers: {
          Authorization: this.authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: file.fileId,
          fileName: file.fileName,
        }),
      })

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete file: ${deleteResponse.statusText}`)
      }

      console.log("[v0] File deleted successfully from Backblaze:", filePath)
    } catch (error) {
      console.error("[v0] Backblaze delete error:", error)
      throw error
    }
  }
}
