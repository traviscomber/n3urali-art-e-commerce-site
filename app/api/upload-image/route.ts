import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const thumbnail = formData.get("thumbnail") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const timestamp = Date.now()
    const originalFilename = `original-${timestamp}-${file.name}`
    const originalBlob = await put(originalFilename, file, {
      access: "public",
    })

    let thumbnailUrl = null
    if (thumbnail) {
      const thumbnailFilename = `thumbnail-${timestamp}-${file.name}`
      const thumbnailBlob = await put(thumbnailFilename, thumbnail, {
        access: "public",
      })
      thumbnailUrl = thumbnailBlob.url
    }

    return NextResponse.json({
      originalUrl: originalBlob.url,
      thumbnailUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
