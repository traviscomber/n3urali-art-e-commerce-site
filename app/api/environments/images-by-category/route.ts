import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryName = searchParams.get("category")

  if (!categoryName) {
    return NextResponse.json(
      { error: "Category name required" },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    // First get the category ID by name
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", categoryName)
      .single()

    if (categoryError || !categoryData) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    // Then get all active images for that category
    const { data: images, error: imagesError } = await supabase
      .from("images")
      .select("id, title, thumbnail_medium_url, category_id")
      .eq("category_id", categoryData.id)
      .eq("active", true)
      .order("created_at", { ascending: false })

    if (imagesError) {
      return NextResponse.json(
        { error: "Failed to fetch images" },
        { status: 500 }
      )
    }

    return NextResponse.json({ images, categoryId: categoryData.id })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
