export interface DropboxConfig {
  accessToken: string
  refreshToken?: string
  clientId?: string
  clientSecret?: string
}

export interface DropboxUploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export class DropboxStorage {
  private accessToken: string
  private baseUrl = "https://api.dropboxapi.com/2"
  private contentUrl = "https://content.dropboxapi.com/2"

  constructor(config: DropboxConfig) {
    this.accessToken = config.accessToken
  }

  async uploadFile(
    file: Buffer | Uint8Array,
    filename: string,
    folder = "/n3urali-images",
  ): Promise<DropboxUploadResult> {
    try {
      const path = `${folder}/${filename}`

      // Upload file to Dropbox
      const uploadResponse = await fetch(`${this.contentUrl}/files/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/octet-stream",
          "Dropbox-API-Arg": JSON.stringify({
            path: path,
            mode: "add",
            autorename: true,
          }),
        },
        body: file,
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.text()
        return { success: false, error: `Upload failed: ${error}` }
      }

      const uploadResult = await uploadResponse.json()

      // Create shared link
      const shareResponse = await fetch(`${this.baseUrl}/sharing/create_shared_link_with_settings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: uploadResult.path_display,
          settings: {
            requested_visibility: "public",
          },
        }),
      })

      if (!shareResponse.ok) {
        // If shared link creation fails, still return success with path
        return {
          success: true,
          path: uploadResult.path_display,
          url: uploadResult.path_display,
        }
      }

      const shareResult = await shareResponse.json()
      // Convert Dropbox share URL to direct download URL
      const directUrl = shareResult.url.replace("?dl=0", "?raw=1")

      return {
        success: true,
        url: directUrl,
        path: uploadResult.path_display,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/files/delete_v2`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path }),
      })

      return response.ok
    } catch (error) {
      console.error("Dropbox delete error:", error)
      return false
    }
  }

  async getFileInfo(path: string) {
    try {
      const response = await fetch(`${this.baseUrl}/files/get_metadata`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path }),
      })

      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error("Dropbox get file info error:", error)
      return null
    }
  }
}
