import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import JSZip from "jszip"

export async function POST(request: NextRequest) {
  try {
    const { orderItemIds } = await request.json()

    if (!orderItemIds || !Array.isArray(orderItemIds) || orderItemIds.length === 0) {
      return NextResponse.json({ error: "Order item IDs are required" }, { status: 400 })
    }

    if (orderItemIds.length > 10) {
      return NextResponse.json({ error: "Maximum 10 items per bulk download" }, { status: 400 })
    }

    const supabase = createClient()

    // Verify user owns all order items
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const zip = new JSZip()
    const downloadPromises = []

    for (const orderItemId of orderItemIds) {
      // Generate download token for each item
      const { data: token, error } = await supabase.rpc("generate_download_token", {
        order_item_id_param: orderItemId,
      })

      if (error || !token) {
        console.error(`Failed to generate token for item ${orderItemId}:`, error)
        continue
      }

      // Verify and get file info
      const { data: downloadData, error: verifyError } = await supabase.rpc("verify_and_download", {
        token_param: token,
      })

      if (verifyError || !downloadData || downloadData.length === 0 || !downloadData[0].valid) {
        console.error(`Failed to verify token for item ${orderItemId}:`, verifyError)
        continue
      }

      const fileData = downloadData[0]

      // Add file to ZIP
      downloadPromises.push(
        fetch(fileData.file_url)
          .then((response) => response.arrayBuffer())
          .then((buffer) => {
            const fileName = fileData.file_url.split("/").pop() || `image_${orderItemId}`
            zip.file(fileName, buffer)
          })
          .catch((error) => {
            console.error(`Failed to fetch file for item ${orderItemId}:`, error)
          }),
      )
    }

    // Wait for all files to be added to ZIP
    await Promise.all(downloadPromises)

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: "arraybuffer" })

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="n3urali_downloads_${Date.now()}.zip"`,
        "Content-Length": zipBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Bulk download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
