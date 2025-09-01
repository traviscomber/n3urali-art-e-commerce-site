"use server"

import { createClient } from "@/lib/supabase/server"
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
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Authentication required for admin operations")
    }

    let categoryId: string

    const { data: existingCategory, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", imageData.category)
      .single()

    if (categoryError && categoryError.code !== "PGRST116") {
      throw categoryError
    }

    if (existingCategory) {
      categoryId = existingCategory.id
    } else {
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
    const supabase = await createClient()

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

    if (error) {
      throw error
    }

    const transformedData =
      data?.map((image) => ({
        ...image,
        category: image.categories?.name || "Uncategorized",
      })) || []

    return transformedData
  } catch (error) {
    console.error("Error in getImages:", error)
    return []
  }
}

export async function updateImage(imageId: string, updateData: ImageUpdateData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Authentication required for admin operations")
    }

    let finalUpdateData = { ...updateData }

    if (updateData.category) {
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

      finalUpdateData = {
        ...updateData,
        category_id: categoryId,
      }
      delete finalUpdateData.category
    }

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
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Authentication required for admin operations")
    }

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
      data: null,
      error: error instanceof Error ? error.message : "Failed to delete image",
    }
  }
}
