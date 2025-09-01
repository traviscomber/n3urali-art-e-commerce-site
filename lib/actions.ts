"use server"

import { sql } from "@/lib/neon/client"
import { revalidatePath } from "next/cache"

export interface ImageData {
  title: string
  description?: string
  category: string
  price: number
  image_url: string
  thumbnail_url?: string
}

export interface ImageUpdateData {
  title?: string
  description?: string
  category?: string
  price?: number
  image_url?: string
  thumbnail_url?: string
  active?: boolean
  featured?: boolean
}

export async function createImage(imageData: ImageData) {
  try {
    console.log("[v0] createImage called with data:", JSON.stringify(imageData, null, 2))

    console.log("[v0] Testing database connection...")
    await sql`SELECT 1 as test`
    console.log("[v0] Database connection successful")

    let categoryId: string

    console.log("[v0] Checking if category exists:", imageData.category)
    // Check if category exists
    const existingCategory = await sql`
      SELECT id FROM categories WHERE name = ${imageData.category} LIMIT 1
    `
    console.log("[v0] Category query result:", existingCategory)

    if (existingCategory.length > 0) {
      categoryId = existingCategory[0].id
      console.log("[v0] Using existing category ID:", categoryId)
    } else {
      console.log("[v0] Creating new category:", imageData.category)
      // Create new category
      const newCategory = await sql`
        INSERT INTO categories (id, name, description, active, created_at, updated_at)
        VALUES (gen_random_uuid(), ${imageData.category}, ${"Auto-created category for " + imageData.category}, true, NOW(), NOW())
        RETURNING id
      `
      categoryId = newCategory[0].id
      console.log("[v0] Created new category with ID:", categoryId)
    }

    console.log("[v0] Inserting image with category ID:", categoryId)
    const result = await sql`
      INSERT INTO images (
        id, title, description, category_id, price, image_url, 
        thumbnail_url, active, featured, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(), ${imageData.title}, ${imageData.description || null}, 
        ${categoryId}, ${imageData.price}, ${imageData.image_url}, 
        ${imageData.thumbnail_url || imageData.image_url}, 
        true, false, NOW(), NOW()
      )
      RETURNING *
    `
    console.log("[v0] Image inserted successfully:", result[0])

    revalidatePath("/simple-admin")
    revalidatePath("/gallery")

    return {
      success: true,
      data: result[0],
      error: null,
    }
  } catch (error) {
    console.error("[v0] Error creating image:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create image"
    console.error("[v0] Error message:", errorMessage)

    return {
      success: false,
      data: null,
      error: errorMessage,
    }
  }
}

export async function getImages() {
  try {
    const data = await sql`
      SELECT 
        i.id, i.title, i.description, i.price, i.image_url, 
        i.thumbnail_url, i.active, i.featured, i.created_at, i.updated_at,
        c.name as category
      FROM images i
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.created_at DESC
    `

    return data || []
  } catch (error) {
    console.error("Error in getImages:", error)
    return []
  }
}

export async function updateImage(imageId: string, updateData: ImageUpdateData) {
  try {
    const finalUpdateData = { ...updateData }

    if (updateData.category) {
      let categoryId: string

      const existingCategory = await sql`
        SELECT id FROM categories WHERE name = ${updateData.category} LIMIT 1
      `

      if (existingCategory.length > 0) {
        categoryId = existingCategory[0].id
      } else {
        const newCategory = await sql`
          INSERT INTO categories (id, name, description, active, created_at, updated_at)
          VALUES (gen_random_uuid(), ${updateData.category}, ${"Auto-created category for " + updateData.category}, true, NOW(), NOW())
          RETURNING id
        `
        categoryId = newCategory[0].id
      }

      finalUpdateData.category_id = categoryId
      delete finalUpdateData.category
    }

    // Build dynamic update query
    const updateFields = Object.keys(finalUpdateData).filter((key) => key !== "category")
    const setClause = updateFields.map((field) => `${field} = $${updateFields.indexOf(field) + 2}`).join(", ")
    const values = [imageId, ...updateFields.map((field) => finalUpdateData[field as keyof ImageUpdateData])]

    const result = await sql`
      UPDATE images 
      SET ${sql.unsafe(setClause)}, updated_at = NOW()
      WHERE id = ${imageId}
      RETURNING *
    `

    revalidatePath("/simple-admin")
    revalidatePath("/gallery")

    return {
      success: true,
      data: result[0],
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
    await sql`DELETE FROM images WHERE id = ${imageId}`

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

export async function getCategories() {
  try {
    const data = await sql`
      SELECT * FROM categories 
      WHERE active = true 
      ORDER BY name ASC
    `

    return data || []
  } catch (error) {
    console.error("Error in getCategories:", error)
    return []
  }
}
