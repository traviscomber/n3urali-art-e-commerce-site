"use server"

import { createNeonClient } from "@/lib/neon/client"
import { revalidatePath } from "next/cache"

export async function createImageWithCategory(formData: FormData) {
  try {
    const imageData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      price: Number.parseFloat(formData.get("price") as string),
      image_url: formData.get("file_url") as string,
      thumbnail_url: formData.get("thumbnail_url") as string,
    }

    console.log("[v0] Starting image creation with data:", imageData)
    const sql = createNeonClient()

    console.log("[v0] Looking up category:", imageData.category)
    const categoryResult = await sql`
      SELECT id FROM categories WHERE name = ${imageData.category} LIMIT 1
    `

    let categoryId: string

    if (categoryResult.length === 0) {
      console.log("[v0] Category not found, creating new category:", imageData.category)
      const newCategoryResult = await sql`
        INSERT INTO categories (name, description, active)
        VALUES (${imageData.category}, ${"Auto-created category for " + imageData.category}, true)
        RETURNING id
      `
      categoryId = newCategoryResult[0].id
      console.log("[v0] Created new category with ID:", categoryId)
    } else {
      categoryId = categoryResult[0].id
      console.log("[v0] Found existing category with ID:", categoryId)
    }

    console.log("[v0] Inserting image with category_id:", categoryId)
    const result = await sql`
      INSERT INTO images (title, description, category_id, price, image_url, thumbnail_url, active, featured)
      VALUES (${imageData.title}, ${imageData.description}, ${categoryId}, ${imageData.price}, 
              ${imageData.image_url}, ${imageData.thumbnail_url}, true, false)
      RETURNING *
    `

    console.log("[v0] Image created successfully:", result)
    revalidatePath("/simple-admin")
    return { success: true, data: result }
  } catch (error) {
    console.error("[v0] Server action error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getImages() {
  try {
    const sql = createNeonClient()

    const result = await sql`
      SELECT i.*, c.name as category_name, c.id as category_id
      FROM images i
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.created_at DESC
    `

    return { success: true, data: result }
  } catch (error) {
    console.error("[v0] Get images error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getOrders() {
  try {
    const sql = createNeonClient()

    const result = await sql`
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'license_name', l.name,
                 'license_id', oi.license_id,
                 'price', oi.price,
                 'image_title', i.title,
                 'image_thumbnail', i.thumbnail_url
               )
             ) as order_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN images i ON oi.image_id = i.id
      LEFT JOIN licenses l ON oi.license_id = l.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `

    return { success: true, data: result }
  } catch (error) {
    console.error("[v0] Get orders error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getCategories() {
  try {
    const sql = createNeonClient()

    const result = await sql`
      SELECT id, name, description, active
      FROM categories
      WHERE active = true
      ORDER BY name ASC
    `

    return { success: true, data: result }
  } catch (error) {
    console.error("[v0] Get categories error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
