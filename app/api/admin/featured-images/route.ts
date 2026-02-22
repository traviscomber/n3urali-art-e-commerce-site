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
  const body = await request.json()

  // Handle creating new image from upload
  if (body.title && body.original_url) {
    const { data, error } = await supabase
      .from("images")
      .insert({
        title: body.title,
        description: body.description,
        original_url: body.original_url,
        upscaled_url: body.upscaled_url || body.original_url,
        thumbnail_medium_url: body.thumbnail_medium_url,
        thumbnail_small_url: body.thumbnail_small_url || body.thumbnail_medium_url,
        file_path: body.file_path,
        image_format: body.image_format,
        content_category: body.content_category,
        active: body.active !== false,
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data?.[0] }, { status: 201 })
  }

  // Handle featured collection updates (existing logic)
  const { imageIds } = body

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
