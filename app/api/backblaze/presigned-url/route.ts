import { type NextRequest, NextResponse } from "next/server"
import { BackblazeAuth } from "@/lib/backblaze-auth"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Presigned URL API called")

    const body = await request.json()
    const { fileName, contentType } = body

    if (!fileName) {
      return NextResponse.json(
        {
          success: false,
          error: "fileName is required",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Generating presigned URL for:", fileName, "type:", contentType)

    const backblaze = new BackblazeAuth()

    // Generate a unique key for the file
    const key = `uploads/${crypto.randomUUID()}-${fileName}`

    // Get upload URL and auth token for direct upload
    const uploadInfo = await backblaze.generatePresignedUrl(key, contentType || "application/octet-stream")

    console.log("[v0] Presigned URL generated successfully")

    return NextResponse.json({
      success: true,
      uploadUrl: uploadInfo.uploadUrl, // Extract just the URL
      key,
      fileName,
      authToken: uploadInfo.authToken, // Also provide auth token for headers
      bucketId: uploadInfo.bucketId,
    })
  } catch (error) {
    console.error("[v0] Presigned URL API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
