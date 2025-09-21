import { type NextRequest, NextResponse } from "next/server"
import { SupabaseStorage } from "@/lib/supabase-storage"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Supabase Presigned URL API called")

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

    console.log("[v0] Generating Supabase presigned URL for:", fileName, "type:", contentType)

    const storage = new SupabaseStorage()

    // Generate presigned URL for direct upload
    const uploadInfo = await storage.generatePresignedUrl(fileName, contentType || "application/octet-stream")

    console.log("[v0] Supabase presigned URL generated successfully")

    return NextResponse.json({
      success: true,
      uploadUrl: uploadInfo.uploadUrl,
      key: uploadInfo.key,
      fileName: uploadInfo.fileName,
    })
  } catch (error) {
    console.error("[v0] Supabase Presigned URL API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
