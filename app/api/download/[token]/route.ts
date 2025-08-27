import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json({ error: "Download token is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Verify and process download using database function
    const { data, error } = await supabase.rpc("verify_and_download", {
      token_param: token,
    })

    if (error || !data || data.length === 0 || !data[0].valid) {
      return NextResponse.json(
        {
          error: "Invalid or expired download token",
        },
        { status: 403 },
      )
    }

    const downloadData = data[0]

    // Log the download
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await supabase.from("download_logs").insert({
      order_item_id: downloadData.order_item_id,
      user_email: "system", // Will be updated by RLS
      ip_address: clientIP,
      user_agent: userAgent,
    })

    try {
      // Fetch the file from storage (this could be S3, Supabase Storage, etc.)
      const fileResponse = await fetch(downloadData.file_url)

      if (!fileResponse.ok) {
        throw new Error("File not found")
      }

      // Get file info
      const contentType = fileResponse.headers.get("content-type") || "application/octet-stream"
      const contentLength = fileResponse.headers.get("content-length")
      const fileName = downloadData.file_url.split("/").pop() || "download"

      // Create secure download response with proper headers
      const headers = new Headers({
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "X-Download-Token": token, // For tracking
      })

      if (contentLength) {
        headers.set("Content-Length", contentLength)
      }

      // Stream the file to the user
      const fileStream = fileResponse.body

      return new NextResponse(fileStream, {
        status: 200,
        headers,
      })
    } catch (fileError) {
      console.error("File streaming error:", fileError)
      // Fallback to redirect if streaming fails
      return NextResponse.redirect(downloadData.file_url)
    }
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
