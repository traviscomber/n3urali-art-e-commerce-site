import { type NextRequest, NextResponse } from "next/server"
import { BackblazeAuth } from "@/lib/backblaze-auth"

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json()

    if (!filename || !contentType) {
      return NextResponse.json(
        {
          success: false,
          error: "filename and contentType are required",
        },
        { status: 400 },
      )
    }

    const backblaze = new BackblazeAuth()
    const key = `uploads/${crypto.randomUUID()}-${filename}`
    const presignedUrl = await backblaze.generatePresignedUrl(key, contentType)

    return NextResponse.json({
      success: true,
      presignedUrl,
      key,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
