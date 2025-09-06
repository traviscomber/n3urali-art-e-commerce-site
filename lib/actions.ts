"use server"

import { neon } from "@neondatabase/serverless"
import { revalidatePath } from "next/cache"

const sql = neon(process.env.DATABASE_URL!, {
  disableWarningInBrowsers: true,
})

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
    console.log("[v0] Testing database connection...")
    const result = await sql`SELECT 1 as test`
    console.log("[v0] Database connection successful:", result)
    return { success: true, data: result }
  } catch (error) {
    console.error("[v0] Database connection failed:", error)
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

    // First, get or create the category
    let categoryId: string

    try {
      // Try to find existing category
      console.log("[v0] Searching for category:", imageData.category)
      const existingCategories = await sql`
        SELECT id FROM categories WHERE name = ${imageData.category} LIMIT 1
      `

      if (existingCategories.length > 0) {
        categoryId = existingCategories[0].id
        console.log("[v0] Found existing category:", categoryId)
      } else {
        // Create new category
        console.log("[v0] Creating new category:", imageData.category)
        const newCategories = await sql`
          INSERT INTO categories (name, description, active, created_at, updated_at)
          VALUES (
            ${imageData.category},
            ${"Auto-created category for " + imageData.category},
            true,
            NOW(),
            NOW()
          )
          RETURNING id
        `
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

    // Create the image record
    try {
      console.log("[v0] Inserting image into database...")
      const images = await sql`
        INSERT INTO images (
          title, 
          description, 
          category_id, 
          price, 
          image_url, 
          thumbnail_url, 
          active, 
          featured,
          created_at,
          updated_at
        )
        VALUES (
          ${imageData.title},
          ${imageData.description || null},
          ${categoryId},
          ${imageData.price},
          ${imageData.file_url},
          ${imageData.thumbnail_url || imageData.file_url},
          true,
          false,
          NOW(),
          NOW()
        )
        RETURNING *
      `

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

    const images = await sql`
      SELECT 
        i.id,
        i.title,
        i.description,
        i.price,
        i.image_url as file_url,
        i.thumbnail_url,
        i.active,
        i.featured,
        i.created_at,
        i.updated_at,
        c.name as category
      FROM images i
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.created_at DESC
    `

    console.log("[v0] Successfully fetched", images.length, "images")
    return {
      success: true,
      data: images,
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
      // Get or create the category
      const existingCategories = await sql`
        SELECT id FROM categories WHERE name = ${updateData.category} LIMIT 1
      `

      if (existingCategories.length > 0) {
        categoryId = existingCategories[0].id
      } else {
        // Create new category
        const newCategories = await sql`
          INSERT INTO categories (name, description, active, created_at, updated_at)
          VALUES (
            ${updateData.category},
            ${"Auto-created category for " + updateData.category},
            true,
            NOW(),
            NOW()
          )
          RETURNING id
        `
        categoryId = newCategories[0].id
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

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = NOW()`)

    if (updateFields.length === 1) {
      // Only updated_at
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

    const updatedImages = await sql.unsafe(updateQuery, updateValues)
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

    await sql`
      DELETE FROM images WHERE id = ${imageId}
    `

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
