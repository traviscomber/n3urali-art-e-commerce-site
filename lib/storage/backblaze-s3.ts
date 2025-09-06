export class BackblazeS3Storage {
  private keyId: string
  private applicationKey: string
  private bucketName: string
  private endpoint: string
  private region: string

  constructor(keyId: string, applicationKey: string, bucketName: string) {
    this.keyId = keyId
    this.applicationKey = applicationKey
    this.bucketName = bucketName
    this.endpoint = "s3.us-east-005.backblazeb2.com"
    this.region = "us-east-005" // Added region for AWS V4 signatures
  }

  private async sha256(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  private async hmacSha256(key: Uint8Array, data: string): Promise<Uint8Array> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer)
    return new Uint8Array(signature)
  }

  private async getSignatureKey(
    key: string,
    dateStamp: string,
    regionName: string,
    serviceName: string,
  ): Promise<Uint8Array> {
    const encoder = new TextEncoder()
    const kDate = await this.hmacSha256(encoder.encode("AWS4" + key), dateStamp)
    const kRegion = await this.hmacSha256(kDate, regionName)
    const kService = await this.hmacSha256(kRegion, serviceName)
    const kSigning = await this.hmacSha256(kService, "aws4_request")
    return kSigning
  }

  private async createAuthorizationHeader(
    method: string,
    uri: string,
    queryString: string,
    headers: Record<string, string>,
    payload: string,
  ): Promise<string> {
    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "")
    const dateStamp = amzDate.substr(0, 8)

    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map((key) => `${key.toLowerCase()}:${headers[key].trim()}\n`)
      .join("")

    const signedHeaders = Object.keys(headers)
      .sort()
      .map((key) => key.toLowerCase())
      .join(";")

    const payloadHash = await this.sha256(payload)

    const canonicalRequest = [method, uri, queryString, canonicalHeaders, signedHeaders, payloadHash].join("\n")

    const algorithm = "AWS4-HMAC-SHA256"
    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`
    const stringToSign = [algorithm, amzDate, credentialScope, await this.sha256(canonicalRequest)].join("\n")

    const signingKey = await this.getSignatureKey(this.applicationKey, dateStamp, this.region, "s3")
    const signature = await this.hmacSha256(signingKey, stringToSign)
    const signatureHex = Array.from(signature)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    const authorization = `${algorithm} Credential=${this.keyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`

    return authorization
  }

  async uploadFile(fileName: string, file: File, contentType: string): Promise<string> {
    try {
      console.log("[v0] Starting S3-compatible Backblaze upload for:", fileName)
      console.log("[v0] Using keyId (Access Key ID):", this.keyId)
      console.log("[v0] Using applicationKey length:", this.applicationKey.length)
      console.log("[v0] Using bucket:", this.bucketName)
      console.log("[v0] Using endpoint:", this.endpoint)
      console.log("[v0] Using region:", this.region)

      const url = `https://${this.endpoint}/${this.bucketName}/${fileName}`
      const uri = `/${this.bucketName}/${fileName}`

      const now = new Date()
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "")

      const headers = {
        host: this.endpoint,
        "x-amz-date": amzDate,
        "x-amz-content-sha256": "UNSIGNED-PAYLOAD", // For streaming uploads
        "content-type": contentType,
        "content-length": file.size.toString(),
      }

      const authorization = await this.createAuthorizationHeader("PUT", uri, "", headers, "UNSIGNED-PAYLOAD")

      console.log("[v0] Authorization header:", authorization)
      console.log("[v0] Request URL:", url)
      console.log("[v0] Request headers:", headers)

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          ...headers,
          Authorization: authorization,
        },
        body: file,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] S3 Backblaze upload error:", response.status, errorText)
        throw new Error(`S3 upload failed: ${response.status} - ${errorText}`)
      }

      const fileUrl = url
      console.log("[v0] S3 Backblaze upload successful:", fileUrl)
      return fileUrl
    } catch (error) {
      console.log("[v0] S3 Backblaze upload error:", error)
      throw error
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const url = `https://${this.endpoint}/${this.bucketName}/${fileName}`
      const uri = `/${this.bucketName}/${fileName}`

      const now = new Date()
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "")

      const headers = {
        host: this.endpoint,
        "x-amz-date": amzDate,
        "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
      }

      const authorization = await this.createAuthorizationHeader("DELETE", uri, "", headers, "UNSIGNED-PAYLOAD")

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          ...headers,
          Authorization: authorization,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`S3 delete failed: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.log("[v0] S3 Backblaze delete error:", error)
      throw error
    }
  }
}
