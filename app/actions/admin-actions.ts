"use server"

import { createClient } from "@supabase/supabase-js"

const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  console.log("[v0] Supabase URL:", supabaseUrl ? "✓ Available" : "✗ Missing")
  console.log("[v0] Service Role Key:", serviceRoleKey ? "✓ Available" : "✗ Missing")

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function createImageWithCategory(imageData: {
  title: string
  description: string
  category: string
  price: number
  file_url: string
  preview_url: string
  thumbnail_url: string
}) {
  try {
    console.log("[v0] Starting image creation with data:", imageData)
    const supabase = createAdminClient()

    console.log("[v0] Looking up category:", imageData.category)
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", imageData.category)
      .single()

    let categoryId: string

    if (categoryError || !categoryData) {
      console.log("[v0] Category not found, creating new category:", imageData.category)
      // Create new category if it doesn't exist
      const { data: newCategory, error: createError } = await supabase
        .from("categories")
        .insert([
          {
            name: imageData.category,
            description: `Auto-created category for ${imageData.category}`,
            active: true,
            sort_order: 0,
          },
        ])
        .select("id")
        .single()

      if (createError) {
        console.error("[v0] Category creation error:", createError)
        throw new Error(`Failed to create category: ${createError.message}`)
      }

      categoryId = newCategory.id
      console.log("[v0] Created new category with ID:", categoryId)
    } else {
      categoryId = categoryData.id
      console.log("[v0] Found existing category with ID:", categoryId)
    }

    console.log("[v0] Inserting image with category_id:", categoryId)
    const { data, error } = await supabase
      .from("images")
      .insert([
        {
          title: imageData.title,
          description: imageData.description,
          category_id: categoryId, // Use category_id UUID instead of category string
          price: imageData.price,
          file_url: imageData.file_url,
          preview_url: imageData.preview_url,
          thumbnail_url: imageData.thumbnail_url,
          active: true,
          featured: false,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Image insertion error:", error)
      console.error("[v0] Error details:", JSON.stringify(error, null, 2))
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("[v0] Image created successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Server action error:", error)

    if (error instanceof SyntaxError && error.message.includes("Unexpected token")) {
      console.error("[v0] JSON parsing error - likely invalid API response")
      return {
        success: false,
        error: "Database connection error. Please check Supabase configuration.",
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
