import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"
import { ImageUrlHandler } from "@/lib/image-url-handler"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    console.log("[v0] Download verification started")
    const token = params.token

    if (!token) {
      return NextResponse.json({ error: "Download token is required" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const { data: downloadData, error } = await supabase
      .from("downloads")
      .select(`
        *,
        order_items!inner(
          order_id,
          image_id,
          orders!inner(status)
        ),
        images!inner(
          original_url,
          image_url,
          title
        )
      `)
      .eq("download_token", token)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !downloadData || downloadData.order_items.orders.status !== "completed") {
      console.log("[v0] Invalid or expired token")
      return NextResponse.json({ error: "Invalid or expired download token" }, { status: 403 })
    }

    const imageData = downloadData.images
    const originalImageUrl = imageData.original_url || imageData.image_url
    const imageTitle = imageData.title

    await supabase
      .from("downloads")
      .update({
        download_count: downloadData.download_count + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq("id", downloadData.id)

    try {
      const downloadUrl = ImageUrlHandler.convertToDownloadUrl(originalImageUrl)
      console.log("[v0] Fetching image from:", downloadUrl)

      const imageResponse = await fetch(downloadUrl, {
        headers: { "User-Agent": "N3urali-Download-Service/1.0" },
        signal: AbortSignal.timeout(30000),
      })

      if (!imageResponse.ok) {
        console.error("[v0] Failed to fetch image:", imageResponse.status)
        return NextResponse.redirect(downloadUrl)
      }

      const imageBuffer = await imageResponse.arrayBuffer()

      if (imageBuffer.byteLength === 0) {
        throw new Error("Empty image buffer")
      }

      return createDownloadResponse(imageBuffer, imageTitle, imageResponse.headers.get("content-type"))
    } catch (fetchError) {
      console.error("[v0] Error fetching image file:", fetchError)
      return NextResponse.redirect(originalImageUrl)
    }
  } catch (error) {
    console.error("[v0] Download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function createDownloadResponse(
  imageBuffer: ArrayBuffer,
  imageTitle: string,
  contentType: string | null,
): NextResponse {
  const headers = new Headers()
  headers.set("Content-Type", contentType || "image/jpeg")
  headers.set("Content-Disposition", `attachment; filename="${sanitizeFilename(imageTitle)}.jpg"`)
  headers.set("Content-Length", imageBuffer.byteLength.toString())
  headers.set("Cache-Control", "no-cache, no-store, must-revalidate")

  return new NextResponse(imageBuffer, { headers })
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\-_\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 100)
}
