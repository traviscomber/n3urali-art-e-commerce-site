import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const thumbnail = formData.get("thumbnail") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check if file is too large for serverless function
    if (file.size > 4 * 1024 * 1024) {
      // 4MB limit
      return NextResponse.json(
        {
          error: "File too large for server upload. Use client-side upload.",
          useClientUpload: true,
          fileSize: file.size,
        },
        { status: 413 },
      )
    }

    const token = "vercel_blob_rw_0NpI635IzSq52HgK_O1tlS1gUX6IpzKF3SnhJP3P05phXU4"

    const originalBlob = await put(`original-${Date.now()}-${file.name}`, file, {
      access: "public",
      token: token,
    })

    let thumbnailUrl = null
    if (thumbnail) {
      const thumbnailBlob = await put(`thumbnail-${Date.now()}-${thumbnail.name}`, thumbnail, {
        access: "public",
        token: token,
      })
      thumbnailUrl = thumbnailBlob.url
    }

    return NextResponse.json({
      originalUrl: originalBlob.url,
      thumbnailUrl: thumbnailUrl,
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
