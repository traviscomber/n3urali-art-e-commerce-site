import { S3Client, PutObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3"

export class BackblazeAWSStorage {
  private s3Client: S3Client
  private bucketName: string

  constructor(keyId: string, applicationKey: string, bucketName: string, region = "us-east-005") {
    this.bucketName = bucketName

    this.s3Client = new S3Client({
      region,
      endpoint: `https://s3.${region}.backblazeb2.com`,
      credentials: {
        accessKeyId: keyId,
        secretAccessKey: applicationKey,
      },
      forcePathStyle: true, // Required for Backblaze B2
    })
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log("[v0] Testing Backblaze connection with AWS SDK...")
      await this.s3Client.send(
        new HeadBucketCommand({
          Bucket: this.bucketName,
        }),
      )
      console.log("[v0] Backblaze connection test successful")
      return true
    } catch (error) {
      console.error("[v0] Backblaze connection test failed:", error)
      return false
    }
  }

  async uploadFile(file: File, filename: string): Promise<string> {
    try {
      console.log("[v0] Starting Backblaze upload with AWS SDK...")
      console.log("[v0] File size:", file.size, "bytes")
      console.log("[v0] Filename:", filename)
      console.log("[v0] Bucket:", this.bucketName)

      const key = `uploads/${filename}`

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: file.type || "application/octet-stream",
        ACL: "private",
      })

      const result = await this.s3Client.send(command)
      console.log("[v0] Upload result:", result)

      const publicUrl = `https://s3.us-east-005.backblazeb2.com/${this.bucketName}/${key}`
      console.log("[v0] Generated public URL:", publicUrl)

      return publicUrl
    } catch (error) {
      console.error("[v0] Backblaze upload error:", error)
      throw new Error(`Backblaze upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}
