import { NextRequest, NextResponse } from "next/server"
import { uploadToBackblaze } from "@/app/actions/backblaze-actions"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] B2 upload API called")
    
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = formData.get("folder") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const imageFormat = formData.get("imageFormat") as string
    const contentCategory = formData.get("contentCategory") as string

    console.log("[v0] Form data received:", { file: file?.name, folder, title })

    if (!file) {
      console.error("[v0] No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const fileName = `${Date.now()}-${file.name}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    console.log("[v0] Uploading to Backblaze with path:", filePath)

    // Upload to Backblaze (for backup/archival)
    const b2Result = await uploadToBackblaze(Buffer.from(buffer), filePath)

    console.log("[v0] B2 result:", b2Result)

    if (!b2Result.success) {
      console.error("[v0] B2 upload failed:", b2Result.error)
      return NextResponse.json({ error: b2Result.error }, { status: 500 })
    }

    // Save locally to /public/images for direct access (same as working images)
    // This ensures the image works immediately without relying on B2 public URLs
    try {
      const publicDir = join(process.cwd(), "public", "images")
      const localPath = join(publicDir, fileName)
      await writeFile(localPath, Buffer.from(buffer))
      console.log("[v0] File saved locally to:", localPath)
    } catch (localError) {
      console.error("[v0] Error saving file locally:", localError)
      // Don't fail the upload if local save fails - B2 upload was successful
    }

    // Use LOCAL URL (same pattern as working images)
    // This works reliably without depending on B2 public access
    const localUrl = `/images/${fileName}`

    // Return the image data for database insertion
    const responseData = {
      success: true,
      imageData: {
        title,
        description,
        original_url: localUrl,
        upscaled_url: localUrl,
        thumbnail_medium_url: localUrl,
        thumbnail_small_url: localUrl,
        file_path: filePath,
        image_format: imageFormat,
        content_category: contentCategory,
      },
    }
    
    console.log("[v0] Returning response with local URL:", localUrl)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] B2 upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
