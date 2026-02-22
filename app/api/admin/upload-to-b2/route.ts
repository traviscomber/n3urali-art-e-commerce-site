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

    // Upload to Backblaze
    const b2Result = await uploadToBackblaze(Buffer.from(buffer), filePath)

    console.log("[v0] B2 result:", b2Result)

    if (!b2Result.success) {
      console.error("[v0] B2 upload failed:", b2Result.error)
      return NextResponse.json({ error: b2Result.error }, { status: 500 })
    }

    // Also save locally to /public/images for direct access (same as working images)
    try {
      const localPath = join(process.cwd(), "public", "images", fileName)
      await writeFile(localPath, Buffer.from(buffer))
      console.log("[v0] File saved locally to:", localPath)
    } catch (localError) {
      console.warn("[v0] Warning: Could not save file locally, using B2 only:", localError)
    }

    // Use LOCAL URL (same pattern as working images) instead of Backblaze URL
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
    
    console.log("[v0] Returning response with local URL:", responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] B2 upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
