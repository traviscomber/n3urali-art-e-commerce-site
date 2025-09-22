import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"
import { ImageUrlHandler } from "@/lib/image-url-handler"

export async function POST(request: NextRequest, { params }: { params: { imageId: string } }) {
  try {
    console.log("[v0] Download API called for image:", params.imageId)

    const body = await request.json()
    const { order_item_id, license_id } = body

    const supabase = await createSupabaseServerClient()
    const { data: orderCheck, error } = await supabase
      .from("order_items")
      .select(`
        *,
        orders!inner(status),
        images!inner(image_url, original_file_url, title, thumbnail_url)
      `)
      .eq("id", order_item_id)
      .eq("image_id", params.imageId)
      .eq("orders.status", "completed")

    if (error) {
      throw error
    }

    if (!orderCheck || orderCheck.length === 0) {
      return NextResponse.json({ error: "Order not found or not completed" }, { status: 404 })
    }

    const orderItem = orderCheck[0]
    console.log("[v0] Download prepared for:", orderItem.images.title)

    const downloadUrl = orderItem.images.original_file_url || orderItem.images.image_url

    if (downloadUrl) {
      try {
        const finalDownloadUrl = ImageUrlHandler.convertToDownloadUrl(downloadUrl)
        console.log("[v0] Attempting to download from URL:", finalDownloadUrl)

        const response = await fetch(finalDownloadUrl)

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
        }

        const imageBuffer = await response.arrayBuffer()
        const contentType =
          response.headers.get("content-type") || (finalDownloadUrl.includes(".png") ? "image/png" : "image/jpeg")

        const cleanTitle = orderItem.images.title.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_")
        const fileExtension = contentType.includes("png") ? "png" : "jpg"

        const isOriginal =
          orderItem.images.original_file_url && orderItem.images.original_file_url !== orderItem.images.image_url
        const filename = isOriginal ? `${cleanTitle}_original.${fileExtension}` : `${cleanTitle}.${fileExtension}`

        console.log("[v0] Serving download:", filename)

        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": imageBuffer.byteLength.toString(),
            "Cache-Control": "no-cache",
          },
        })
      } catch (imageError) {
        console.error("[v0] Primary download failed, trying thumbnail:", imageError)

        try {
          const thumbnailDownloadUrl = ImageUrlHandler.convertToDownloadUrl(orderItem.images.thumbnail_url)
          const thumbnailResponse = await fetch(thumbnailDownloadUrl)

          if (!thumbnailResponse.ok) {
            throw new Error(`Failed to fetch thumbnail: ${thumbnailResponse.status} ${thumbnailResponse.statusText}`)
          }

          const thumbnailBuffer = await thumbnailResponse.arrayBuffer()
          const contentType =
            thumbnailResponse.headers.get("content-type") ||
            (thumbnailDownloadUrl.includes(".png") ? "image/png" : "image/jpeg")

          const cleanTitle = orderItem.images.title.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_")
          const fileExtension = contentType.includes("png") ? "png" : "jpg"

          console.log("[v0] Serving thumbnail download as fallback")

          return new NextResponse(thumbnailBuffer, {
            headers: {
              "Content-Type": contentType,
              "Content-Disposition": `attachment; filename="${cleanTitle}_preview.${fileExtension}"`,
              "Content-Length": thumbnailBuffer.byteLength.toString(),
              "Cache-Control": "no-cache",
            },
          })
        } catch (thumbnailError) {
          console.error("[v0] Both downloads failed:", thumbnailError)
          return NextResponse.json(
            {
              error: "Image file not available for download",
              details: "Unable to access the image file from storage",
            },
            { status: 404 },
          )
        }
      }
    } else {
      console.error("[v0] No image URL found for order item:", order_item_id)
      return NextResponse.json({ error: "Image URL not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("[v0] Download API error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
