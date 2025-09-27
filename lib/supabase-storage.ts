import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a service role client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export class SupabaseStorage {
  private bucket = "images"

  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    contentType = "application/octet-stream",
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log("[v0] Starting Supabase upload for:", fileName, "size:", fileBuffer.length)

      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const uniqueFileName = `${timestamp}-${fileName}`

      // Upload to Supabase storage
      const { data, error } = await supabaseAdmin.storage.from(this.bucket).upload(uniqueFileName, fileBuffer, {
        contentType,
        upsert: false,
      })

      if (error) {
        console.error("[v0] Supabase upload error:", error)
        return { success: false, error: error.message }
      }

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin.storage.from(this.bucket).getPublicUrl(uniqueFileName)

      const publicUrl = publicUrlData.publicUrl
      console.log("[v0] Supabase upload successful:", publicUrl)

      return { success: true, url: publicUrl }
    } catch (error) {
      console.error("[v0] Supabase upload error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async generatePresignedUrl(
    fileName: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<{
    uploadUrl: string
    key: string
    fileName: string
  }> {
    try {
      console.log("[v0] Generating Supabase presigned URL for:", fileName)

      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const uniqueFileName = `${timestamp}-${fileName}`

      // Create signed upload URL
      const { data, error } = await supabaseAdmin.storage.from(this.bucket).createSignedUploadUrl(uniqueFileName, {
        expiresIn,
      })

      if (error) {
        throw new Error(`Failed to create signed upload URL: ${error.message}`)
      }

      console.log("[v0] Generated Supabase presigned URL successfully")

      return {
        uploadUrl: data.signedUrl,
        key: uniqueFileName,
        fileName: uniqueFileName,
      }
    } catch (error) {
      console.error("[v0] Error generating Supabase presigned URL:", error)
      throw error
    }
  }

  async deleteFile(fileName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabaseAdmin.storage.from(this.bucket).remove([fileName])

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test by listing buckets
      const { data, error } = await supabaseAdmin.storage.listBuckets()

      if (error) {
        return { success: false, error: error.message }
      }

      // Check if our bucket exists
      const bucketExists = data.some((bucket) => bucket.name === this.bucket)
      if (!bucketExists) {
        return { success: false, error: `Bucket '${this.bucket}' not found` }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  getPublicUrl(fileName: string): string {
    const { data } = supabaseAdmin.storage.from(this.bucket).getPublicUrl(fileName)

    return data.publicUrl
  }
}
