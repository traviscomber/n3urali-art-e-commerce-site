import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const downloadToken = params.token

    if (!downloadToken) {
      return NextResponse.json({ success: false, error: "Download token is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get download record with related data
    const { data: download, error: downloadError } = await supabase
      .from("downloads")
      .select(`
        *,
        order_items (
          images (
            id,
            title,
            original_url,
            file_path
          ),
          licenses (
            name,
            description
          )
        )
      `)
      .eq("download_token", downloadToken)
      .single()

    if (downloadError || !download) {
      return NextResponse.json({ success: false, error: "Invalid download token" }, { status: 404 })
    }

    // Check if download has expired
    if (new Date(download.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "Download link has expired" }, { status: 410 })
    }

    // Check download limits
    if (download.download_count >= (download.max_downloads || 5)) {
      return NextResponse.json({ success: false, error: "Download limit exceeded" }, { status: 429 })
    }

    // Update download count
    await supabase
      .from("downloads")
      .update({
        download_count: download.download_count + 1,
        downloaded_at: new Date().toISOString(),
      })
      .eq("id", download.id)

    const image = download.order_items?.images
    const license = download.order_items?.licenses

    if (!image) {
      return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 })
    }

    // In production, you would generate a signed URL or redirect to the actual file
    // For now, we'll return the download information
    return NextResponse.json({
      success: true,
      data: {
        image: {
          id: image.id,
          title: image.title,
          downloadUrl: image.original_url || image.file_path,
        },
        license: {
          name: license?.name || "Standard License",
          description: license?.description || "Standard commercial license",
        },
        downloadInfo: {
          downloadsRemaining: (download.max_downloads || 5) - (download.download_count + 1),
          expiresAt: download.expires_at,
        },
      },
    })
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
