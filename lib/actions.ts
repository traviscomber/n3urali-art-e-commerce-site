"use server"

import { createSupabaseServerClient } from "@/lib/database"
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

export async function testDatabaseConnection() {
  try {
    console.log("[v0] Testing Supabase connection...")
    const supabase = await createSupabaseServerClient()
    const { data: result, error } = await supabase.from("categories").select("count").limit(1)

    if (error) {
      throw error
    }

    console.log("[v0] Supabase connection successful:", result)
    return { success: true, data: result }
  } catch (error) {
    console.error("[v0] Supabase connection failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Connection failed" }
  }
}

export async function createImage(imageData: ImageData) {
  try {
    console.log("[v0] Starting createImage with data:", {
      title: imageData.title,
      category: imageData.category,
      price: imageData.price,
      hasFileUrl: !!imageData.file_url,
      fileUrlLength: imageData.file_url?.length,
    })

    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      console.error("[v0] Database connection failed before creating image")
      return {
        success: false,
        data: null,
        error: "Database connection failed: " + connectionTest.error,
      }
    }

    const supabase = await createSupabaseServerClient()

    let categoryId: string

    try {
      console.log("[v0] Searching for category:", imageData.category)
      const { data: existingCategories, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("name", imageData.category)
        .limit(1)

      if (categoryError) {
        throw categoryError
      }

      if (existingCategories && existingCategories.length > 0) {
        categoryId = existingCategories[0].id
        console.log("[v0] Found existing category:", categoryId)
      } else {
        console.log("[v0] Creating new category:", imageData.category)
        const { data: newCategories, error: createError } = await supabase
          .from("categories")
          .insert([
            {
              name: imageData.category,
              description: "Auto-created category for " + imageData.category,
              active: true,
            },
          ])
          .select("id")

        if (createError) {
          throw createError
        }

        categoryId = newCategories[0].id
        console.log("[v0] Created new category:", categoryId)
      }
    } catch (categoryError) {
      console.error("[v0] Error handling category:", categoryError)
      return {
        success: false,
        data: null,
        error: "Category error: " + (categoryError instanceof Error ? categoryError.message : "Unknown category error"),
      }
    }

    if (!imageData.title || !imageData.file_url || !categoryId) {
      console.error("[v0] Missing required fields:", {
        hasTitle: !!imageData.title,
        hasFileUrl: !!imageData.file_url,
        hasCategoryId: !!categoryId,
      })
      return {
        success: false,
        data: null,
        error: "Missing required fields for image creation",
      }
    }

    try {
      console.log("[v0] Inserting image into database...")
      const { data: images, error: insertError } = await supabase
        .from("images")
        .insert([
          {
            title: imageData.title,
            description: imageData.description || null,
            category_id: categoryId,
            price: imageData.price,
            image_url: imageData.file_url,
            thumbnail_url: imageData.thumbnail_url || imageData.file_url,
            active: true,
            featured: false,
          },
        ])
        .select("*")

      if (insertError) {
        throw insertError
      }

      const createdImage = images[0]
      console.log("[v0] Successfully created image:", createdImage.id)

      revalidatePath("/simple-admin")
      revalidatePath("/gallery")

      return {
        success: true,
        data: createdImage,
        error: null,
      }
    } catch (insertError) {
      console.error("[v0] Error inserting image:", insertError)
      return {
        success: false,
        data: null,
        error:
          "Database insert error: " + (insertError instanceof Error ? insertError.message : "Unknown insert error"),
      }
    }
  } catch (error) {
    console.error("[v0] Error creating image:", error)
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

    const supabase = await createSupabaseServerClient()
    const { data: images, error } = await supabase
      .from("images")
      .select(`
        id,
        title,
        description,
        price,
        image_url,
        thumbnail_url,
        active,
        featured,
        created_at,
        updated_at,
        categories(name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    const transformedImages =
      images?.map((image) => ({
        ...image,
        file_url: image.image_url,
        category: image.categories?.name,
      })) || []

    console.log("[v0] Successfully fetched", transformedImages.length, "images")
    return {
      success: true,
      data: transformedImages,
      error: null,
    }
  } catch (error) {
    console.error("[v0] Error in getImages:", error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch images",
    }
  }
}

export async function updateImage(imageId: string, updateData: ImageUpdateData) {
  try {
    console.log("[v0] Starting updateImage for:", imageId)

    let categoryId: string | undefined

    if (updateData.category) {
      const supabase = await createSupabaseServerClient()
      const existingCategories = await supabase.from("categories").select("id").eq("name", updateData.category).limit(1)

      if (existingCategories.data && existingCategories.data.length > 0) {
        categoryId = existingCategories.data[0].id
      } else {
        const newCategories = await supabase
          .from("categories")
          .insert([
            {
              name: updateData.category,
              description: "Auto-created category for " + updateData.category,
              active: true,
            },
          ])
          .select("id")

        categoryId = newCategories.data[0].id
      }
    }

    const updateFields: string[] = []
    const updateValues: any[] = []

    if (updateData.title !== undefined) {
      updateFields.push(`title = $${updateValues.length + 1}`)
      updateValues.push(updateData.title)
    }
    if (updateData.description !== undefined) {
      updateFields.push(`description = $${updateValues.length + 1}`)
      updateValues.push(updateData.description)
    }
    if (categoryId) {
      updateFields.push(`category_id = $${updateValues.length + 1}`)
      updateValues.push(categoryId)
    }
    if (updateData.price !== undefined) {
      updateFields.push(`price = $${updateValues.length + 1}`)
      updateValues.push(updateData.price)
    }
    if (updateData.file_url !== undefined) {
      updateFields.push(`image_url = $${updateValues.length + 1}`)
      updateValues.push(updateData.file_url)
    }
    if (updateData.thumbnail_url !== undefined) {
      updateFields.push(`thumbnail_url = $${updateValues.length + 1}`)
      updateValues.push(updateData.thumbnail_url)
    }
    if (updateData.active !== undefined) {
      updateFields.push(`active = $${updateValues.length + 1}`)
      updateValues.push(updateData.active)
    }
    if (updateData.featured !== undefined) {
      updateFields.push(`featured = $${updateValues.length + 1}`)
      updateValues.push(updateData.featured)
    }

    updateFields.push(`updated_at = NOW()`)

    if (updateFields.length === 1) {
      console.log("[v0] No fields to update")
      return {
        success: true,
        data: null,
        error: null,
      }
    }

    const updateQuery = `
      UPDATE images 
      SET ${updateFields.join(", ")} 
      WHERE id = $${updateValues.length + 1}
      RETURNING *
    `
    updateValues.push(imageId)

    const supabase = await createSupabaseServerClient()
    const { data: updatedImages, error: updateError } = await supabase.unsafe(updateQuery, updateValues)

    if (updateError) {
      throw updateError
    }

    const updatedImage = updatedImages[0]

    console.log("[v0] Successfully updated image:", updatedImage.id)

    revalidatePath("/simple-admin")
    revalidatePath("/gallery")

    return {
      success: true,
      data: updatedImage,
      error: null,
    }
  } catch (error) {
    console.error("[v0] Error updating image:", error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to update image",
    }
  }
}

export async function deleteImage(imageId: string) {
  try {
    console.log("[v0] Starting deleteImage for:", imageId)

    const supabase = await createSupabaseServerClient()
    const { error: deleteError } = await supabase.from("images").delete().eq("id", imageId)

    if (deleteError) {
      throw deleteError
    }

    console.log("[v0] Successfully deleted image:", imageId)

    revalidatePath("/simple-admin")
    revalidatePath("/gallery")

    return {
      success: true,
      error: null,
    }
  } catch (error) {
    console.error("[v0] Error deleting image:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete image",
    }
  }
}
