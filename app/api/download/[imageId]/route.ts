import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { ImageUrlHandler } from "@/lib/image-url-handler"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { imageId: string } }) {
  try {
    console.log("[v0] Download API called for image:", params.imageId)

    const body = await request.json()
    const { order_item_id, license_id } = body

    const orderCheck = await sql`
      SELECT oi.*, o.status, i.image_url, i.title, i.thumbnail_url
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN images i ON oi.image_id = i.id
      WHERE oi.id = ${order_item_id} 
      AND oi.image_id = ${params.imageId}
      AND o.status = 'completed'
    `

    if (orderCheck.length === 0) {
      return NextResponse.json({ error: "Order not found or not completed" }, { status: 404 })
    }

    const orderItem = orderCheck[0]
    console.log("[v0] Download prepared for:", orderItem.title)

    if (orderItem.image_url) {
      try {
        const downloadUrl = ImageUrlHandler.convertToDownloadUrl(orderItem.image_url)
        console.log("[v0] Attempting to download from URL:", downloadUrl)

        const response = await fetch(downloadUrl)

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
        }

        const imageBuffer = await response.arrayBuffer()
        const contentType =
          response.headers.get("content-type") || (downloadUrl.includes(".png") ? "image/png" : "image/jpeg")

        const cleanTitle = orderItem.title.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_")
        const fileExtension = contentType.includes("png") ? "png" : "jpg"

        console.log("[v0] Serving download:", `${cleanTitle}.${fileExtension}`)

        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${cleanTitle}.${fileExtension}"`,
            "Content-Length": imageBuffer.byteLength.toString(),
            "Cache-Control": "no-cache",
          },
        })
      } catch (imageError) {
        console.error("[v0] Primary image download failed, trying thumbnail:", imageError)

        try {
          const thumbnailDownloadUrl = ImageUrlHandler.convertToDownloadUrl(orderItem.thumbnail_url)
          const thumbnailResponse = await fetch(thumbnailDownloadUrl)

          if (!thumbnailResponse.ok) {
            throw new Error(`Failed to fetch thumbnail: ${thumbnailResponse.status} ${thumbnailResponse.statusText}`)
          }

          const thumbnailBuffer = await thumbnailResponse.arrayBuffer()
          const contentType =
            thumbnailResponse.headers.get("content-type") ||
            (thumbnailDownloadUrl.includes(".png") ? "image/png" : "image/jpeg")

          const cleanTitle = orderItem.title.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_")
          const fileExtension = contentType.includes("png") ? "png" : "jpg"

          console.log("[v0] Serving thumbnail download as fallback")

          return new NextResponse(thumbnailBuffer, {
            headers: {
              "Content-Type": contentType,
              "Content-Disposition": `attachment; filename="${cleanTitle}_thumbnail.${fileExtension}"`,
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
