import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryName = searchParams.get("category")

  console.log('[v0] API: images-by-category called with:', categoryName)

  if (!categoryName) {
    console.log('[v0] API: No category name provided')
    return NextResponse.json(
      { error: "Category name required" },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    // First get the category ID by name
    console.log('[v0] API: Querying categories table for:', categoryName)
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", categoryName)
      .single()

    console.log('[v0] API: Category query result:', { categoryData, categoryError })

    if (categoryError || !categoryData) {
      console.log('[v0] API: Category not found for name:', categoryName)
      return NextResponse.json(
        { error: "Category not found", categoryName },
        { status: 404 }
      )
    }

    // Then get all active images for that category
    console.log('[v0] API: Querying images for category_id:', categoryData.id)
    const { data: images, error: imagesError } = await supabase
      .from("images")
      .select("id, title, thumbnail_medium_url, category_id")
      .eq("category_id", categoryData.id)
      .eq("active", true)
      .order("created_at", { ascending: false })

    console.log('[v0] API: Images query result:', { imageCount: images?.length, imagesError })
    console.log('[v0] API: Returning', images?.length || 0, 'images')

    if (imagesError) {
      console.log('[v0] API: Images query error:', imagesError)
      return NextResponse.json(
        { error: "Failed to fetch images" },
        { status: 500 }
      )
    }

    return NextResponse.json({ images, categoryId: categoryData.id })
  } catch (error) {
    console.error('[v0] API: Caught error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
