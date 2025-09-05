"use server"

import { createNeonClient } from "@/lib/neon/client"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function createHighQualityImage(imageData: {
  title: string
  description: string
  category_name: string
  rights_type: string
  price: number
  file: File
  resolution: string
}) {
  try {
    console.log(
      `[v0] Starting high-quality upload for ${imageData.file.name} (${(imageData.file.size / (1024 * 1024)).toFixed(2)}MB)`,
    )

    // Create server folders if they don't exist
    const baseUploadDir = join(process.cwd(), "public", "uploads")
    const highQualityDir = join(baseUploadDir, "high-quality")
    const thumbnailsDir = join(baseUploadDir, "thumbnails")
    const categoryDir = join(highQualityDir, imageData.category_name.toLowerCase())

    // Ensure directories exist
    if (!existsSync(baseUploadDir)) await mkdir(baseUploadDir, { recursive: true })
    if (!existsSync(highQualityDir)) await mkdir(highQualityDir, { recursive: true })
    if (!existsSync(thumbnailsDir)) await mkdir(thumbnailsDir, { recursive: true })
    if (!existsSync(categoryDir)) await mkdir(categoryDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = imageData.file.name.split(".").pop()?.toLowerCase() || "jpg"
    const safeTitle = imageData.title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50)
    const filename = `${safeTitle}_${timestamp}.${fileExtension}`

    // File paths
    const highQualityPath = join(categoryDir, filename)
    const thumbnailPath = join(thumbnailsDir, `thumb_${filename}`)

    // Convert File to Buffer for server-side storage
    const bytes = await imageData.file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save original high-quality image
    await writeFile(highQualityPath, buffer)
    console.log(`[v0] Saved high-quality image: ${highQualityPath}`)

    // Create thumbnail (compressed version)
    const thumbnailBuffer = await createThumbnail(buffer, fileExtension)
    await writeFile(thumbnailPath, thumbnailBuffer)
    console.log(`[v0] Created thumbnail: ${thumbnailPath}`)

    // Store in database with file paths instead of base64
    const sql = createNeonClient()

    // Look up or create category
    const categoryResult = await sql`
      SELECT id FROM categories WHERE name = ${imageData.category_name} LIMIT 1
    `

    let categoryId: string
    if (categoryResult.length === 0) {
      const newCategoryResult = await sql`
        INSERT INTO categories (name, description, active)
        VALUES (${imageData.category_name}, ${"High-quality category for " + imageData.category_name}, true)
        RETURNING id
      `
      categoryId = newCategoryResult[0].id
    } else {
      categoryId = categoryResult[0].id
    }

    // Get default PRO license
    const defaultLicense = await sql`
      SELECT id FROM licenses WHERE name = 'PRO' LIMIT 1
    `
    const licenseId = defaultLicense.length > 0 ? defaultLicense[0].id : null

    if (!licenseId) {
      return { success: false, error: "No default license found" }
    }

    // Store with file paths for high-quality images
    const webPath = `/uploads/high-quality/${imageData.category_name.toLowerCase()}/${filename}`
    const thumbnailWebPath = `/uploads/thumbnails/thumb_${filename}`

    const result = await sql`
      INSERT INTO images (
        title, description, category_id, license_id, price, 
        image_url, thumbnail_url, resolution, format, active, featured, metadata
      )
      VALUES (
        ${imageData.title}, ${imageData.description}, ${categoryId}, ${licenseId}, ${imageData.price},
        ${webPath}, ${thumbnailWebPath}, ${imageData.resolution}, ${fileExtension.toUpperCase()}, 
        true, false,
        ${JSON.stringify({
          rights_type: imageData.rights_type,
          original_file_size: imageData.file.size,
          upload_timestamp: new Date().toISOString(),
          storage_type: "high-quality-file",
          file_path: highQualityPath,
          thumbnail_path: thumbnailPath,
        })}
      )
      RETURNING *
    `

    console.log(`[v0] High-quality image stored successfully with ID: ${result[0]?.id}`)
    revalidatePath("/simple-admin")
    return { success: true, data: result }
  } catch (error) {
    console.error("[v0] High-quality upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "High-quality upload failed",
    }
  }
}

async function createThumbnail(imageBuffer: Buffer, fileExtension: string): Promise<Buffer> {
  // For now, return a smaller version - in production you'd use sharp or similar
  // This is a placeholder that returns the original buffer
  // In a real implementation, you'd resize the image here
  return imageBuffer
}

export async function getStorageInfo() {
  try {
    const baseUploadDir = join(process.cwd(), "public", "uploads")
    const highQualityDir = join(baseUploadDir, "high-quality")

    const folders = {
      baseDir: baseUploadDir,
      highQualityDir: highQualityDir,
      exists: existsSync(highQualityDir),
    }

    return { success: true, data: folders }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Storage info error",
    }
  }
}
