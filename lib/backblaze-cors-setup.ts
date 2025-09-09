import { WorkingBackblazeStorage } from "./backblaze-working"

interface CorsRule {
  corsRuleName: string
  allowedOrigins: string[]
  allowedHeaders?: string[]
  allowedOperations: string[]
  exposeHeaders?: string[]
  maxAgeSeconds: number
}

export class BackblazeCorsManager {
  private storage: WorkingBackblazeStorage

  constructor() {
    this.storage = new WorkingBackblazeStorage()
  }

  async setupCorsForImageAccess(allowedDomains: string[] = ["*"]) {
    try {
      console.log("[v0] Setting up CORS for Backblaze bucket...")

      const corsRules: CorsRule[] = [
        {
          corsRuleName: "allowImageDownloads",
          allowedOrigins: allowedDomains,
          allowedHeaders: ["range", "authorization", "content-type"],
          allowedOperations: ["b2_download_file_by_name", "b2_download_file_by_id"],
          exposeHeaders: ["x-bz-content-sha1", "content-length", "content-type"],
          maxAgeSeconds: 3600,
        },
      ]

      const apiInfo = await this.storage.getAuthenticatedApiInfo()
      const bucketId = await this.storage.getPublicBucketId()

      const updateBucketUrl = `${apiInfo.apiUrl}/b2api/v3/b2_update_bucket`

      const updateResponse = await fetch(updateBucketUrl, {
        method: "POST",
        headers: {
          Authorization: apiInfo.authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: apiInfo.accountId,
          bucketId: bucketId,
          corsRules: corsRules,
        }),
      })

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text()
        throw new Error(`Failed to update CORS rules: ${updateResponse.status} - ${errorText}`)
      }

      const result = await updateResponse.json()
      console.log("[v0] CORS rules updated successfully:", result.corsRules)

      return {
        success: true,
        corsRules: result.corsRules,
        message: "CORS configuration updated successfully",
      }
    } catch (error) {
      console.error("[v0] CORS setup failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to configure CORS",
      }
    }
  }

  async getCurrentCorsRules() {
    try {
      const apiInfo = await this.storage.getAuthenticatedApiInfo()
      const bucketId = await this.storage.getPublicBucketId()

      const listBucketsUrl = `${apiInfo.apiUrl}/b2api/v3/b2_list_buckets`

      const response = await fetch(listBucketsUrl, {
        method: "POST",
        headers: {
          Authorization: apiInfo.authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: apiInfo.accountId,
          bucketId: bucketId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get bucket info: ${response.status}`)
      }

      const result = await response.json()
      const bucket = result.buckets.find((b: any) => b.bucketId === bucketId)

      return {
        success: true,
        corsRules: bucket?.corsRules || [],
        bucketType: bucket?.bucketType || "unknown",
      }
    } catch (error) {
      console.error("[v0] Failed to get CORS rules:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}
