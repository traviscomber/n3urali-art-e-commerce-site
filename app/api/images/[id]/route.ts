import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: image, error } = await supabase
      .from("images")
      .select(`
        id, title, description, price,
        original_url, thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url,
        is_featured, created_at,
        categories:category_id(name),
        licenses:license_id(name)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: image.id,
      title: image.title,
      description: image.description,
      price: image.price,
      original_url: image.original_url,
      thumbnail_small_url: image.thumbnail_small_url,
      thumbnail_medium_url: image.thumbnail_medium_url,
      thumbnail_large_url: image.thumbnail_large_url,
      is_featured: image.is_featured,
      created_at: image.created_at,
      category_name: image.categories?.name,
      license_name: image.licenses?.name,
    })
  } catch (error) {
    console.error("Error fetching image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
