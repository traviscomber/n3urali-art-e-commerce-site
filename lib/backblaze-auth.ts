/**
 * Backblaze B2 S3-Compatible Authentication
 * Built from scratch following official Backblaze documentation
 */

interface BackblazeConfig {
  accessKeyId: string
  secretAccessKey: string
  region: string
  endpoint: string
  bucket: string
}

export class BackblazeAuth {
  private config: BackblazeConfig

  constructor() {
    this.config = {
      accessKeyId: process.env.BACKBLAZE_API_KEY!,
      secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY!,
      region: process.env.B2_REGION || "us-east-005",
      endpoint: process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com",
      bucket: process.env.BACKBLAZE_BUCKET_NAME!,
    }

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

  private async createSignature(
    method: string,
    path: string,
    queryParams: Record<string, string>,
    headers: Record<string, string>,
    payload = "",
  ): Promise<string> {
    const date = new Date()
    const dateStamp = date.toISOString().slice(0, 10).replace(/-/g, "")
    const timeStamp = date.toISOString().replace(/[:-]|\.\d{3}/g, "")

    // Canonical request
    const canonicalUri = path
    const canonicalQueryString = Object.keys(queryParams)
      .sort()
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
      .join("&")

    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map((key) => `${key.toLowerCase()}:${headers[key]}\n`)
      .join("")

    const signedHeaders = Object.keys(headers)
      .sort()
      .map((key) => key.toLowerCase())
      .join(";")

    const payloadHash = await this.sha256(payload)

    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n")

    // String to sign
    const algorithm = "AWS4-HMAC-SHA256"
    const credentialScope = `${dateStamp}/${this.config.region}/s3/aws4_request`
    const stringToSign = [algorithm, timeStamp, credentialScope, await this.sha256(canonicalRequest)].join("\n")

    // Calculate signature
    const signingKey = await this.getSignatureKey(dateStamp)
    const signature = await this.hmacSha256(signingKey, stringToSign)

    return `${algorithm} Credential=${this.config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
  }

  private async getSignatureKey(dateStamp: string): Promise<CryptoKey> {
    const kDate = await this.hmacSha256KeyExtractable(`AWS4${this.config.secretAccessKey}`, dateStamp)
    const kRegion = await this.hmacSha256KeyExtractable(kDate, this.config.region)
    const kService = await this.hmacSha256KeyExtractable(kRegion, "s3")
    return await this.hmacSha256Key(kService, "aws4_request")
  }

  private async hmacSha256KeyExtractable(key: string | CryptoKey, data: string): Promise<CryptoKey> {
    const keyData = typeof key === "string" ? new TextEncoder().encode(key) : await crypto.subtle.exportKey("raw", key)
    return await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      true, // extractable = true for intermediate keys
      ["sign"],
    )
  }

  private async hmacSha256Key(key: string | CryptoKey, data: string): Promise<CryptoKey> {
    const keyData = typeof key === "string" ? new TextEncoder().encode(key) : await crypto.subtle.exportKey("raw", key)
    return await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false, // extractable = false for final key
      ["sign"],
    )
  }

  private async hmacSha256(key: CryptoKey, data: string): Promise<string> {
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }

  private async sha256(data: string): Promise<string> {
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data))
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }

  async generatePresignedUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    const date = new Date()
    const dateStamp = date.toISOString().slice(0, 10).replace(/-/g, "")
    const timeStamp = date.toISOString().replace(/[:-]|\.\d{3}/g, "")

    const credentialScope = `${dateStamp}/${this.config.region}/s3/aws4_request`
    const credential = `${this.config.accessKeyId}/${credentialScope}`

    const queryParams = {
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": credential,
      "X-Amz-Date": timeStamp,
      "X-Amz-Expires": expiresIn.toString(),
      "X-Amz-SignedHeaders": "host",
    }

    const headers = {
      host: new URL(this.config.endpoint).host,
    }

    const signature = await this.createSignature(
      "PUT",
      `/${this.config.bucket}/${key}`,
      queryParams,
      headers,
      "UNSIGNED-PAYLOAD",
    )
    const authSignature = signature.split("Signature=")[1]

    queryParams["X-Amz-Signature"] = authSignature

    const queryString = Object.keys(queryParams)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
      .join("&")

    return `${this.config.endpoint}/${this.config.bucket}/${key}?${queryString}`
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const testKey = `test-${Date.now()}.txt`
      const presignedUrl = await this.generatePresignedUrl(testKey, "text/plain", 300)

      // Test if we can generate a valid presigned URL
      if (presignedUrl && presignedUrl.startsWith(this.config.endpoint)) {
        return { success: true }
      } else {
        return { success: false, error: "Invalid presigned URL generated" }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  getConfig() {
    return { ...this.config }
  }
}

export { BackblazeAuth as BackblazeStorage }
