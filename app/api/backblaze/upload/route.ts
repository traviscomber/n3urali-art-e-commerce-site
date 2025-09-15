import { type NextRequest, NextResponse } from "next/server"
import { BackblazeAuth } from "@/lib/backblaze-auth"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Backblaze upload API called")

    const contentLength = request.headers.get("content-length")
    console.log("[v0] Content length:", contentLength)

    const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB limit

    if (contentLength && Number.parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error:
            "File size exceeds 15MB limit. For larger files, please upload manually and add the URL in admin panel.",
        },
        { status: 413 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("[v0] No file provided")
      return NextResponse.json(
        {
          success: false,
          error: "File is required",
        },
        { status: 400 },
      )
    }

    console.log("[v0] File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error:
            "File size exceeds 15MB limit. For larger files, please upload manually and add the URL in admin panel.",
        },
        { status: 413 },
      )
    }

    console.log("[v0] Initializing Backblaze auth...")

    const requiredEnvVars = {
      BACKBLAZE_API_KEY: process.env.BACKBLAZE_API_KEY,
      BACKBLAZE_APPLICATION_KEY: process.env.BACKBLAZE_APPLICATION_KEY,
      BACKBLAZE_BUCKET_NAME: process.env.BACKBLAZE_BUCKET_NAME,
      B2_REGION: process.env.B2_REGION,
      B2_ENDPOINT: process.env.B2_ENDPOINT,
    }

    console.log("[v0] Environment variables check:", {
      BACKBLAZE_API_KEY: !!requiredEnvVars.BACKBLAZE_API_KEY,
      BACKBLAZE_APPLICATION_KEY: !!requiredEnvVars.BACKBLAZE_APPLICATION_KEY,
      BACKBLAZE_BUCKET_NAME: !!requiredEnvVars.BACKBLAZE_BUCKET_NAME,
      B2_REGION: !!requiredEnvVars.B2_REGION,
      B2_ENDPOINT: !!requiredEnvVars.B2_ENDPOINT,
    })

    const backblaze = new BackblazeAuth()
    console.log("[v0] Backblaze auth initialized")

    const key = `uploads/${crypto.randomUUID()}-${file.name}`
    console.log("[v0] Generated key:", key)

    console.log("[v0] Uploading file to Backblaze...")
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const uploadResult = await backblaze.uploadFile(key, fileBuffer, file.type)

    if (!uploadResult.success) {
      console.error("[v0] Upload failed:", uploadResult.error)
      return NextResponse.json(
        {
          success: false,
          error: uploadResult.error || "Upload failed",
        },
        { status: 500 },
      )
    }

    console.log("[v0] File uploaded successfully to:", uploadResult.url)

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      key,
      message: "File uploaded successfully. This will be used for thumbnails and previews.",
    })
  } catch (error) {
    console.error("[v0] Backblaze upload API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
