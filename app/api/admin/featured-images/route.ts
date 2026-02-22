import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const showAll = searchParams.get("all") === "true"

  const query = supabase
    .from("images")
    .select(
      "id, title, description, file_path, original_url, upscaled_url, thumbnail_medium_url, featured_collection, price, image_format, active, content_category",
    )

  // If showAll is not set, filter for active images
  if (!showAll) {
    query.eq("active", true)
  }

  const { data: images, error } = await query.order("created_at", { ascending: false })

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
