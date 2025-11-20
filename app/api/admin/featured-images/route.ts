import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data: images, error } = await supabase
    .from("images")
    .select(
      "id, title, description, file_path, original_url, upscaled_url, thumbnail_medium_url, featured_collection, price, image_format",
    )
    .eq("active", true)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(images)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { imageIds } = await request.json()

  // First, unset all featured_collection flags
  await supabase.from("images").update({ featured_collection: false }).neq("id", "00000000-0000-0000-0000-000000000000")

  // Then set the selected images as featured
  if (imageIds && imageIds.length > 0) {
    const { error } = await supabase.from("images").update({ featured_collection: true }).in("id", imageIds)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
