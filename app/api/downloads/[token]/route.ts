import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const downloadToken = params.token

    if (!downloadToken) {
      return NextResponse.json({ success: false, error: "Download token is required" }, { status: 400 })
    }

    console.log("[v0] Processing download for token:", downloadToken)

    const supabase = createSupabaseServerClient()

    const { data: download, error: downloadError } = await supabase
      .from("downloads")
      .select(`
        *,
        order_items!inner(
          *,
          images!inner(
            id,
            title,
            original_url,
            file_path
          ),
          licenses!inner(
            name,
            description
          ),
          orders!inner(
            user_email,
            status
          )
        )
      `)
      .eq("download_token", downloadToken)
      .single()

    if (downloadError || !download) {
      console.log("[v0] Download not found:", downloadError)
      return NextResponse.json({ success: false, error: "Invalid download token" }, { status: 404 })
    }

    // Check if download has expired
    if (new Date(download.expires_at) < new Date()) {
      console.log("[v0] Download expired:", download.expires_at)
      return NextResponse.json({ success: false, error: "Download link has expired" }, { status: 410 })
    }

    const orderItem = download.order_items
    const downloadCount = orderItem.download_count || 0
    const downloadLimit = orderItem.download_limit || 5

    if (downloadCount >= downloadLimit) {
      console.log("[v0] Download limit exceeded:", downloadCount, ">=", downloadLimit)
      return NextResponse.json({ success: false, error: "Download limit exceeded" }, { status: 429 })
    }

    // Check if order is completed
    if (orderItem.orders.status !== "completed") {
      console.log("[v0] Order not completed:", orderItem.orders.status)
      return NextResponse.json({ success: false, error: "Order not completed" }, { status: 403 })
    }

    const { error: updateOrderItemError } = await supabase
      .from("order_items")
      .update({
        download_count: downloadCount + 1,
      })
      .eq("id", download.order_item_id)

    if (updateOrderItemError) {
      console.error("[v0] Failed to update order item download count:", updateOrderItemError)
    }

    // Update downloads table
    const { error: updateDownloadError } = await supabase
      .from("downloads")
      .update({
        download_count: (download.download_count || 0) + 1,
        downloaded_at: new Date().toISOString(),
      })
      .eq("id", download.id)

    if (updateDownloadError) {
      console.error("[v0] Failed to update download record:", updateDownloadError)
    }

    const image = orderItem.images
    const license = orderItem.licenses

    if (!image) {
      return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 })
    }

    console.log("[v0] Download successful for:", image.title)

    const fileUrl = image.original_url || image.file_path
    if (!fileUrl) {
      return NextResponse.json({ success: false, error: "File URL not available" }, { status: 404 })
    }

    try {
      // Fetch the file from storage
      const fileResponse = await fetch(fileUrl)
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file: ${fileResponse.status}`)
      }

      const fileBuffer = await fileResponse.arrayBuffer()
      const fileName = `${image.title.replace(/[^a-zA-Z0-9]/g, "_")}_${license?.name || "Standard"}.jpg`

      // Return the file with proper headers
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Length": fileBuffer.byteLength.toString(),
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
    } catch (fileError) {
      console.error("[v0] File serving error:", fileError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to serve file. Please try again or contact support.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Download error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Download failed",
      },
      { status: 500 },
    )
  }
}
