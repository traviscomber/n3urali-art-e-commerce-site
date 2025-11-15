import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { imageId, originalFileUrl } = await request.json()

    if (!imageId || !originalFileUrl) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Updating Backblaze URL for image:", imageId)

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("images")
      .update({ original_file_url: originalFileUrl })
      .eq("id", imageId)
      .select("id, title, original_file_url")

    if (error) {
      console.error("[v0] Error updating image:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 })
    }

    console.log("[v0] Successfully updated Backblaze URL for:", data[0].title)

    return NextResponse.json({
      success: true,
      image: data[0],
    })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
