"use server"

import { createNeonClient } from "@/lib/neon/client"
import { revalidatePath } from "next/cache"

function compressBase64Image(base64String: string, maxSizeKB = 500): Promise<string> {
  return new Promise((resolve) => {
    try {
      // If it's already a placeholder or external URL, return as-is
      if (!base64String.startsWith("data:image/")) {
        resolve(base64String)
        return
      }

      const sizeInKB = (base64String.length * 3) / 4 / 1024
      console.log(`[v0] Original image size: ${sizeInKB.toFixed(1)}KB`)

      // If image is already small enough, return as-is
      if (sizeInKB <= maxSizeKB) {
        resolve(base64String)
        return
      }

      // Create image element to get dimensions
      const img = new Image()
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!

        // Calculate new dimensions (reduce by ratio to target size)
        const compressionRatio = Math.sqrt(maxSizeKB / sizeInKB)
        const newWidth = Math.floor(img.width * compressionRatio)
        const newHeight = Math.floor(img.height * compressionRatio)

        canvas.width = newWidth
        canvas.height = newHeight

        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        // Try different quality levels until we get under the size limit
        let quality = 0.8
        let compressedBase64 = canvas.toDataURL("image/jpeg", quality)

        while ((compressedBase64.length * 3) / 4 / 1024 > maxSizeKB && quality > 0.1) {
          quality -= 0.1
          compressedBase64 = canvas.toDataURL("image/jpeg", quality)
        }

        const finalSizeKB = (compressedBase64.length * 3) / 4 / 1024
        console.log(`[v0] Compressed image size: ${finalSizeKB.toFixed(1)}KB (quality: ${quality})`)

        resolve(compressedBase64)
      }

      img.onerror = () => {
        console.error("[v0] Error loading image for compression")
        resolve(base64String) // Return original if compression fails
      }

      img.src = base64String
    } catch (error) {
      console.error("[v0] Error compressing image:", error)
      resolve(base64String) // Return original if compression fails
    }
  })
}

function handleDatabaseError(error: any): { success: false; error: string } {
  console.error("[v0] Database error:", error)

  // Handle HTML error responses (like "Request Entity Too Large")
  if (typeof error === "string" && error.includes("Request")) {
    return {
      success: false,
      error: "Image too large. Please use a smaller image (max 500KB).",
    }
  }

  // Handle JSON parsing errors
  if (error.message && error.message.includes("Unexpected token")) {
    return {
      success: false,
      error: "Server error: Image may be too large. Please try a smaller image.",
    }
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : "Database operation failed",
  }
}

export async function createImageWithCategory(formData: FormData) {
  try {
    const rawImageUrl = formData.get("file_url") as string
    const rawThumbnailUrl = formData.get("thumbnail_url") as string

    const compressedImageUrl = await compressBase64Image(rawImageUrl, 500)
    const compressedThumbnailUrl = await compressBase64Image(rawThumbnailUrl, 200)

    const imageData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      price: Number.parseFloat(formData.get("price") as string),
      image_url: compressedImageUrl,
      thumbnail_url: compressedThumbnailUrl,
    }

    console.log("[v0] Starting image creation with data:", {
      ...imageData,
      image_url: imageData.image_url.substring(0, 50) + "...",
      thumbnail_url: imageData.thumbnail_url.substring(0, 50) + "...",
    })

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

    console.log("[v0] Image created successfully with ID:", result[0]?.id)
    revalidatePath("/simple-admin")
    return { success: true, data: result }
  } catch (error) {
    return handleDatabaseError(error)
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
      WHERE active = true AND (name = 'equirectangular' OR name = 'fisheye')
      ORDER BY 
        CASE 
          WHEN name = 'equirectangular' THEN 1
          WHEN name = 'fisheye' THEN 2
          ELSE 3
        END
    `

    // Map the categories to use display names
    const mappedResult = result.map((category) => ({
      ...category,
      display_name:
        category.name === "equirectangular" ? "360 images" : category.name === "fisheye" ? "180 images" : category.name,
    }))

    return { success: true, data: mappedResult }
  } catch (error) {
    console.error("[v0] Get categories error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function deleteImage(imageId: string) {
  try {
    console.log("[v0] Starting image deletion for ID:", imageId)
    const sql = createNeonClient()

    // Delete the image from the database
    const result = await sql`
      DELETE FROM images 
      WHERE id = ${imageId}
      RETURNING *
    `

    if (result.length === 0) {
      console.log("[v0] No image found with ID:", imageId)
      return {
        success: false,
        error: "Image not found",
      }
    }

    console.log("[v0] Image deleted successfully:", result[0])
    revalidatePath("/simple-admin")
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function updateImage(formData: FormData) {
  try {
    const imageId = formData.get("id") as string
    const rawImageUrl = formData.get("file_url") as string
    const rawThumbnailUrl = formData.get("thumbnail_url") as string

    const compressedImageUrl = await compressBase64Image(rawImageUrl, 500)
    const compressedThumbnailUrl = await compressBase64Image(rawThumbnailUrl, 200)

    const imageData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      price: Number.parseFloat(formData.get("price") as string),
      image_url: compressedImageUrl,
      thumbnail_url: compressedThumbnailUrl,
    }

    console.log("[v0] Starting image update for ID:", imageId)
    const sql = createNeonClient()

    // Look up or create category
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
    } else {
      categoryId = categoryResult[0].id
    }

    // Update the image
    const result = await sql`
      UPDATE images 
      SET title = ${imageData.title}, 
          description = ${imageData.description}, 
          category_id = ${categoryId}, 
          price = ${imageData.price}, 
          image_url = ${imageData.image_url}, 
          thumbnail_url = ${imageData.thumbnail_url},
          updated_at = NOW()
      WHERE id = ${imageId}
      RETURNING *
    `

    if (result.length === 0) {
      return { success: false, error: "Image not found" }
    }

    console.log("[v0] Image updated successfully:", result[0].id)
    revalidatePath("/simple-admin")
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function toggleImageStatus(imageId: string, field: "active" | "featured", value: boolean) {
  try {
    console.log("[v0] Toggling image status:", imageId, field, value)
    const sql = createNeonClient()

    const result = await sql`
      UPDATE images 
      SET ${field} = ${value}, updated_at = NOW()
      WHERE id = ${imageId}
      RETURNING *
    `

    if (result.length === 0) {
      return { success: false, error: "Image not found" }
    }

    console.log("[v0] Image status updated successfully")
    revalidatePath("/simple-admin")
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    console.log("[v0] Updating order status:", orderId, "to", newStatus)
    const sql = createNeonClient()

    const result = await sql`
      UPDATE orders 
      SET status = ${newStatus}, updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING *
    `

    if (result.length === 0) {
      return { success: false, error: "Order not found" }
    }

    console.log("[v0] Order status updated successfully")
    revalidatePath("/simple-admin")
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function getUsers() {
  try {
    const sql = createNeonClient()

    const result = await sql`
      SELECT id, email, full_name, is_admin, created_at, updated_at
      FROM user_profiles
      ORDER BY created_at DESC
    `

    return { success: true, data: result }
  } catch (error) {
    console.error("[v0] Get users error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function toggleUserAdmin(userId: string, isAdmin: boolean) {
  try {
    console.log("[v0] Toggling user admin status:", userId, "to", isAdmin)
    const sql = createNeonClient()

    const result = await sql`
      UPDATE user_profiles 
      SET is_admin = ${isAdmin}, updated_at = NOW()
      WHERE id = ${userId}
      RETURNING *
    `

    if (result.length === 0) {
      return { success: false, error: "User not found" }
    }

    console.log("[v0] User admin status updated successfully")
    revalidatePath("/simple-admin")
    return { success: true, data: result[0] }
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function cleanupSampleImages() {
  try {
    console.log("[v0] Starting sample image cleanup...")
    const sql = createNeonClient()

    // Delete images that are clearly sample/placeholder data
    const result = await sql`
      DELETE FROM images 
      WHERE 
        image_url LIKE '%placeholder%' OR
        image_url LIKE '%example%' OR
        image_url LIKE '%sample%' OR
        image_url LIKE '%demo%' OR
        title LIKE '%sample%' OR
        title LIKE '%example%' OR
        title LIKE '%demo%' OR
        title LIKE '%placeholder%' OR
        description LIKE '%sample%' OR
        description LIKE '%example%' OR
        description LIKE '%demo%' OR
        description LIKE '%placeholder%'
      RETURNING id, title
    `

    console.log(
      `[v0] Deleted ${result.length} sample images:`,
      result.map((img) => ({ id: img.id, title: img.title })),
    )

    revalidatePath("/simple-admin")
    revalidatePath("/browse")
    revalidatePath("/gallery")

    return {
      success: true,
      data: result,
      message: `Successfully deleted ${result.length} sample images`,
    }
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function getDatabaseStats() {
  try {
    const sql = createNeonClient()

    const imageCount = await sql`SELECT COUNT(*) as count FROM images WHERE active = true`
    const categoryCount = await sql`SELECT COUNT(*) as count FROM categories WHERE active = true`
    const orderCount = await sql`SELECT COUNT(*) as count FROM orders`

    return {
      success: true,
      data: {
        images: imageCount[0].count,
        categories: categoryCount[0].count,
        orders: orderCount[0].count,
      },
    }
  } catch (error) {
    return handleDatabaseError(error)
  }
}
