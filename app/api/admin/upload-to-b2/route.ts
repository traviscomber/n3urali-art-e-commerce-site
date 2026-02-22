import { NextRequest, NextResponse } from "next/server"
import { uploadToBackblaze } from "@/app/actions/backblaze-actions"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = formData.get("folder") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const imageFormat = formData.get("imageFormat") as string
    const contentCategory = formData.get("contentCategory") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const fileName = `${Date.now()}-${file.name}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload to Backblaze
    const b2Result = await uploadToBackblaze(Buffer.from(buffer), filePath)

    if (!b2Result.success) {
      return NextResponse.json({ error: b2Result.error }, { status: 500 })
    }

    // Return the image data for database insertion
    return NextResponse.json({
      success: true,
      imageData: {
        title,
        description,
        original_url: b2Result.url,
        file_path: filePath,
        image_format: imageFormat,
        content_category: contentCategory,
        thumbnail_medium_url: b2Result.url,
        thumbnail_small_url: b2Result.url,
      },
    })
  } catch (error) {
    console.error("[v0] B2 upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
