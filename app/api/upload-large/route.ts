import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { filename, fileSize, fileType } = await request.json()

    if (!filename || !fileSize) {
      return NextResponse.json({ error: "Missing filename or fileSize" }, { status: 400 })
    }

    const token = "vercel_blob_rw_0NpI635IzSq52HgK_O1tlS1gUX6IpzKF3SnhJP3P05phXU4"

    // Generate presigned URL for direct client upload
    const originalFilename = `original-${Date.now()}-${filename}`
    const thumbnailFilename = `thumbnail-${Date.now()}-${filename}`

    return NextResponse.json({
      originalFilename,
      thumbnailFilename,
      token,
      uploadEndpoint: "https://blob.vercel-storage.com",
    })
  } catch (error) {
    console.error("Large upload preparation error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to prepare large upload",
      },
      { status: 500 },
    )
  }
}
