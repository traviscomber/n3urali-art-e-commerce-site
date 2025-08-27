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

    // In a real implementation, you would:
    // 1. Fetch the actual file from secure storage (S3, etc.)
    // 2. Stream the file to the user
    // 3. Remove watermarks if applicable

    // For now, redirect to the file URL
    return NextResponse.redirect(downloadData.file_url)
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
