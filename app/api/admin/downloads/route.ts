import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: downloads, error } = await supabase
      .from("downloads")
      .select(`
        *,
        order_items (
          images (title),
          licenses (name)
        )
      `)
      .order("downloaded_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Transform the data to include image and license details
    const transformedDownloads =
      downloads?.map((download) => ({
        ...download,
        image_title: download.order_items?.images?.title || "Unknown Image",
        license_name: download.order_items?.licenses?.name || "Unknown License",
      })) || []

    return NextResponse.json({ success: true, downloads: transformedDownloads })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
