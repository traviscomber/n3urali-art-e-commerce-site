import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'thumbnail' or undefined for full image

    // Fetch the image data from database
    const supabase = await createSupabaseServerClient()

    const { data: image, error } = await supabase
      .from("images")
      .select("original_url, thumbnail_medium_url, thumbnail_small_url")
      .eq("id", params.id)
      .single()

    if (error || !image) {
      return new NextResponse("Image not found", { status: 404 })
    }

    // Get the appropriate base64 data
    let base64Data = ""
    if (type === "thumbnail") {
      base64Data = image.thumbnail_medium_url || image.thumbnail_small_url || image.original_url
    } else {
      base64Data = image.original_url
    }

    if (!base64Data || !base64Data.startsWith("data:image/")) {
      return new NextResponse("Invalid image data", { status: 400 })
    }

    // Extract the base64 content and mime type
    const [header, data] = base64Data.split(",")
    const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/jpeg"

    // Convert base64 to buffer
    const buffer = Buffer.from(data, "base64")

    // Return the image with proper headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error serving base64 image:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
