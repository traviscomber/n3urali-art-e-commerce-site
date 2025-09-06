export class BackblazeSimpleStorage {
  private keyId: string
  private applicationKey: string
  private bucketName: string
  private authToken?: string
  private apiUrl?: string
  private downloadUrl?: string
  private bucketId?: string

  constructor(keyId: string, applicationKey: string, bucketName: string) {
    this.keyId = keyId
    this.applicationKey = applicationKey
    this.bucketName = bucketName
  }

  private async authenticate(): Promise<void> {
    console.log("[v0] Authenticating with Backblaze B2...")

    const credentials = btoa(`${this.keyId}:${this.applicationKey}`)

    try {
      const response = await fetch("https://api001.backblazeb2.com/b2api/v3/b2_authorize_account", {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] B2 auth error:", response.status, errorText)
        throw new Error(`Authentication failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("[v0] B2 authentication successful")

      this.authToken = data.authorizationToken
      this.apiUrl = data.apiInfo?.storageApi?.apiUrl || data.apiUrl
      this.downloadUrl = data.apiInfo?.storageApi?.downloadUrl || data.downloadUrl
    } catch (error) {
      console.log("[v0] B2 authentication error:", error)
      throw error
    }
  }

  private async getBucketId(): Promise<string> {
    if (this.bucketId) return this.bucketId

    if (!this.authToken || !this.apiUrl) {
      await this.authenticate()
    }

    console.log("[v0] Getting bucket ID for:", this.bucketName)

    try {
      const response = await fetch(`${this.apiUrl}/b2api/v3/b2_list_buckets`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: this.keyId.substring(0, 12),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] List buckets error:", response.status, errorText)
        throw new Error(`Failed to list buckets: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const bucket = data.buckets?.find((b: any) => b.bucketName === this.bucketName)

      if (!bucket) {
        throw new Error(`Bucket '${this.bucketName}' not found`)
      }

      this.bucketId = bucket.bucketId
      console.log("[v0] Found bucket ID:", this.bucketId)
      return this.bucketId
    } catch (error) {
      console.log("[v0] Get bucket ID error:", error)
      throw error
    }
  }

  async uploadFile(fileName: string, file: File, contentType: string): Promise<string> {
    console.log("[v0] Starting B2 upload for:", fileName)

    try {
      const bucketId = await this.getBucketId()

      const uploadUrlResponse = await fetch(`${this.apiUrl}/b2api/v3/b2_get_upload_url`, {
        method: "POST",
        headers: {
          Authorization: this.authToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucketId: bucketId,
        }),
      })

      if (!uploadUrlResponse.ok) {
        const errorText = await uploadUrlResponse.text()
        throw new Error(`Failed to get upload URL: ${uploadUrlResponse.status} - ${errorText}`)
      }

      const uploadData = await uploadUrlResponse.json()

      // Upload file
      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: "POST",
        headers: {
          Authorization: uploadData.authorizationToken,
          "X-Bz-File-Name": encodeURIComponent(fileName),
          "Content-Type": contentType,
          "X-Bz-Content-Sha1": "unverified",
        },
        body: file,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`)
      }

      const uploadResult = await uploadResponse.json()
      const fileUrl = `${this.downloadUrl}/file/${this.bucketName}/${fileName}`

      console.log("[v0] B2 upload successful:", fileUrl)
      return fileUrl
    } catch (error) {
      console.log("[v0] B2 upload error:", error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.authenticate()
      await this.getBucketId()
      return true
    } catch (error) {
      console.log("[v0] B2 connection test failed:", error)
      return false
    }
  }
}
