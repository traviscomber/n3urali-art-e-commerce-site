import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const thumbnail = formData.get("thumbnail") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size - limit to 50MB for base64 storage
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
        },
        { status: 400 },
      )
    }

    // Convert original file to base64 without compression
    const originalArrayBuffer = await file.arrayBuffer()
    const originalBase64 = Buffer.from(originalArrayBuffer).toString("base64")
    const originalDataUrl = `data:${file.type};base64,${originalBase64}`

    // Convert thumbnail to base64 if provided
    let thumbnailDataUrl = null
    if (thumbnail) {
      const thumbnailArrayBuffer = await thumbnail.arrayBuffer()
      const thumbnailBase64 = Buffer.from(thumbnailArrayBuffer).toString("base64")
      thumbnailDataUrl = `data:${thumbnail.type};base64,${thumbnailBase64}`
    }

    return NextResponse.json({
      originalUrl: originalDataUrl,
      thumbnailUrl: thumbnailDataUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    )
  }
}
