"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export interface ImageData {
  title: string
  description?: string
  category: string
  price: number
  file_url: string
  preview_url?: string
  thumbnail_url?: string
}

export interface ImageUpdateData {
  title?: string
  description?: string
  category?: string
  price?: number
  file_url?: string
  preview_url?: string
  thumbnail_url?: string
  active?: boolean
  featured?: boolean
}

export async function createImage(imageData: ImageData) {
  try {
    const supabase = createAdminClient()

    // First, get or create the category
    let categoryId: string

    // Try to find existing category
    const { data: existingCategory, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", imageData.category)
      .single()

    if (categoryError && categoryError.code !== "PGRST116") {
      // PGRST116 is "not found" error, other errors are actual problems
      throw categoryError
    }

    if (existingCategory) {
      categoryId = existingCategory.id
    } else {
      // Create new category
      const { data: newCategory, error: createCategoryError } = await supabase
        .from("categories")
        .insert({
          name: imageData.category,
          description: `Auto-created category for ${imageData.category}`,
          active: true,
        })
        .select("id")
        .single()

      if (createCategoryError) {
        throw createCategoryError
      }

      categoryId = newCategory.id
    }

    // Create the image record
    const { data, error } = await supabase
      .from("images")
      .insert({
        title: imageData.title,
        description: imageData.description || null,
        category_id: categoryId,
        price: imageData.price,
        file_url: imageData.file_url,
        preview_url: imageData.preview_url || imageData.file_url,
        thumbnail_url: imageData.thumbnail_url || imageData.file_url,
        active: true,
        featured: false,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath("/simple-admin")
    revalidatePath("/gallery")

    return {
      success: true,
      data,
      error: null,
    }
  } catch (error) {
    console.error("Error creating image:", error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to create image",
    }
  }
}

export async function getImages() {
  try {
    console.log("[v0] Starting getImages server action")
    const supabase = createAdminClient()
    console.log("[v0] Admin client created, attempting database query")

    const { data, error } = await supabase
      .from("images")
      .select(`
        id,
        title,
        description,
        price,
        file_url,
        preview_url,
        thumbnail_url,
        active,
        featured,
        created_at,
        updated_at,
        categories (
          name
        )
      `)
      .order("created_at", { ascending: false })

    console.log("[v0] Database query completed")
    console.log("[v0] Query error:", error)
    console.log("[v0] Query data length:", data?.length || 0)

    if (error) {
      console.error("[v0] Database error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw error
    }

    // Transform the data to include category name directly
    const transformedData =
      data?.map((image) => ({
        ...image,
        category: image.categories?.name || "Uncategorized",
      })) || []

    console.log("[v0] Successfully fetched", transformedData.length, "images")
    return {
      success: true,
      data: transformedData,
      error: null,
    }
  } catch (error) {
    console.error("[v0] Error in getImages:", error)
    if (error instanceof Error) {
      console.error("[v0] Error name:", error.name)
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch images",
    }
  }
}

export async function updateImage(imageId: string, updateData: ImageUpdateData) {
  try {
    const supabase = createAdminClient()

    // If category is being updated, handle the category_id lookup
    let finalUpdateData = { ...updateData }

    if (updateData.category) {
      // Get or create the category
      let categoryId: string

      const { data: existingCategory, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("name", updateData.category)
        .single()

      if (categoryError && categoryError.code !== "PGRST116") {
        throw categoryError
      }

      if (existingCategory) {
        categoryId = existingCategory.id
      } else {
        // Create new category
        const { data: newCategory, error: createCategoryError } = await supabase
          .from("categories")
          .insert({
            name: updateData.category,
            description: `Auto-created category for ${updateData.category}`,
            active: true,
          })
          .select("id")
          .single()

        if (createCategoryError) {
          throw createCategoryError
        }

        categoryId = newCategory.id
      }

      // Replace category name with category_id
      finalUpdateData = {
        ...updateData,
        category_id: categoryId,
      }
      delete finalUpdateData.category
    }

    // Add updated_at timestamp
    finalUpdateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase.from("images").update(finalUpdateData).eq("id", imageId).select().single()

    if (error) {
      throw error
    }

    revalidatePath("/simple-admin")
    revalidatePath("/gallery")

    return {
      success: true,
      data,
      error: null,
    }
  } catch (error) {
    console.error("Error updating image:", error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to update image",
    }
  }
}

export async function deleteImage(imageId: string) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from("images").delete().eq("id", imageId)

    if (error) {
      throw error
    }

    revalidatePath("/simple-admin")
    revalidatePath("/gallery")

    return {
      success: true,
      error: null,
    }
  } catch (error) {
    console.error("Error deleting image:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete image",
    }
  }
}
