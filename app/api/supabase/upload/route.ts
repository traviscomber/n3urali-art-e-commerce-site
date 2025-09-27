import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Supabase upload API called")

    const contentLength = request.headers.get("content-length")
    console.log("[v0] Content length:", contentLength)

    // Increased file size limit for high-quality images
    const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB limit for high-quality images

    if (contentLength && Number.parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File size exceeds 100MB limit.",
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
          error: "File size exceeds 100MB limit.",
        },
        { status: 413 },
      )
    }

    console.log("[v0] Initializing Supabase service role client...")
    const supabase = createServiceRoleClient()

    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const fileExtension = file.name.split(".").pop()
    const uniqueFileName = `${timestamp}-${crypto.randomUUID()}.${fileExtension}`
    const filePath = `uploads/high-quality/${uniqueFileName}`

    console.log("[v0] Generated file path:", filePath)

    // Convert file to buffer for upload
    const fileBuffer = await file.arrayBuffer()

    console.log("[v0] Uploading file to Supabase storage...")

    try {
      // Upload to Supabase storage bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("images") // Make sure this bucket exists in Supabase
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("[v0] Supabase upload error:", uploadError)

        if (uploadError.message.includes("Bucket not found")) {
          return NextResponse.json(
            {
              success: false,
              error: "Storage bucket 'images' not found. Please create the bucket in Supabase dashboard.",
            },
            { status: 500 },
          )
        }

        if (uploadError.message.includes("Unauthorized")) {
          return NextResponse.json(
            {
              success: false,
              error: "Unauthorized access to storage. Please check service role key permissions.",
            },
            { status: 401 },
          )
        }

        return NextResponse.json(
          {
            success: false,
            error: `Upload failed: ${uploadError.message}`,
          },
          { status: 500 },
        )
      }

      console.log("[v0] File uploaded successfully:", uploadData.path)

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      console.log("[v0] Public URL generated:", publicUrl)

      return NextResponse.json({
        success: true,
        url: publicUrl,
        path: filePath,
        key: filePath,
        message: "File uploaded successfully to Supabase storage in high quality.",
      })
    } catch (storageError) {
      console.error("[v0] Storage API error:", storageError)

      if (storageError instanceof Error && storageError.message.includes("Unexpected token")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Supabase storage API returned invalid response. The 'images' bucket may not exist or service role key may be invalid.",
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: `Storage API error: ${storageError instanceof Error ? storageError.message : "Unknown error"}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Supabase upload API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
