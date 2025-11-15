import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("[v0] Fetching images without Backblaze URLs...")

    const supabase = await createClient()

    const { data: images, error } = await supabase
      .from("images")
      .select("id, title, original_file_url, thumbnail_large_url, price")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching images:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("[v0] Found", images?.length || 0, "total images")

    return NextResponse.json({
      success: true,
      images: images || [],
    })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
