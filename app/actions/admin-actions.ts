"use server"

import { createNeonClient } from "@/lib/neon/client"
import { unstable_cache } from "next/cache"
import { revalidatePath, revalidateTag } from "next/cache" // Added revalidateTag import
import { put } from "@vercel/blob"
import { DropboxStorage } from "@/lib/storage/dropbox"

import { WorkingBackblazeStorage } from "@/lib/backblaze-working"
import { neon } from "@neondatabase/serverless"

const CACHE_TAGS = {
  IMAGES: "images",
  CATEGORIES: "categories",
  ORDERS: "orders",
  USERS: "users",
  LICENSES: "licenses",
  STATS: "stats",
} as const

const CACHE_REVALIDATE = {
  IMAGES: 300, // 5 minutes
  CATEGORIES: 3600, // 1 hour
  STATIC: 86400, // 24 hours
} as const

const PERFORMANCE_MONITORING = process.env.NODE_ENV === "development"

function logQueryPerformance(queryName: string, startTime: number, recordCount?: number) {
  if (PERFORMANCE_MONITORING) {
    const duration = Date.now() - startTime
    console.log(`[v0] Query Performance: ${queryName} - ${duration}ms${recordCount ? ` (${recordCount} records)` : ""}`)

    // Log slow queries (>500ms)
    if (duration > 500) {
      console.warn(`[v0] Slow Query Alert: ${queryName} took ${duration}ms`)
    }
  }
}

const getCachedImages = unstable_cache(
  async () => {
    try {
      const sql = createNeonClient()

      const result = await sql`
        SELECT 
          i.id, i.title, i.description, i.price, i.image_url, i.thumbnail_url,
          i.active, i.featured, i.created_at, i.updated_at,
          c.name as category_name, c.id as category_id,
          l.name as license_name, l.description as license_description
        FROM images i
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN licenses l ON i.license_id = l.id
        WHERE i.active = true
        ORDER BY i.featured DESC, i.created_at DESC
        LIMIT 100
      `

      return result
    } catch (error) {
      console.error("[v0] Database query error in getCachedImages:", error)
      return []
    }
  },
  ["images-list"],
  {
    revalidate: CACHE_REVALIDATE.IMAGES,
    tags: [CACHE_TAGS.IMAGES],
  },
)

const getCachedImagesPaginated = unstable_cache(
  async (page = 1, limit = 50, category?: string, featured?: boolean) => {
    const startTime = Date.now()
    const sql = createNeonClient()
    const offset = (page - 1) * limit

    let whereClause = "WHERE i.active = true"
    const params: any[] = []

    if (category) {
      whereClause += " AND c.name = $" + (params.length + 1)
      params.push(category)
    }

    if (featured !== undefined) {
      whereClause += " AND i.featured = $" + (params.length + 1)
      params.push(featured)
    }

    // Use parameterized query with proper indexing
    const result = await sql`
      SELECT 
        i.id, i.title, i.description, i.price, i.image_url, i.thumbnail_url,
        i.active, i.featured, i.created_at, i.updated_at,
        c.name as category_name, c.id as category_id,
        l.name as license_name, l.description as license_description
      FROM images i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN licenses l ON i.license_id = l.id
      ${sql.unsafe(whereClause)}
      ORDER BY i.featured DESC, i.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM images i
      LEFT JOIN categories c ON i.category_id = c.id
      ${sql.unsafe(whereClause)}
    `

    logQueryPerformance("getCachedImagesPaginated", startTime, result.length)

    return {
      images: result,
      pagination: {
        page,
        limit,
        total: Number.parseInt(countResult[0].total),
        totalPages: Math.ceil(Number.parseInt(countResult[0].total) / limit),
      },
    }
  },
  ["images-paginated"],
  {
    revalidate: CACHE_REVALIDATE.IMAGES,
    tags: [CACHE_TAGS.IMAGES],
  },
)

const getCachedCategories = unstable_cache(
  async () => {
    const sql = createNeonClient()

    const result = await sql`
      SELECT c.id, c.name, c.description, c.active,
             COUNT(i.id) as image_count
      FROM categories c
      LEFT JOIN images i ON c.id = i.category_id AND i.active = true
      WHERE c.active = true
      GROUP BY c.id, c.name, c.description, c.active
      ORDER BY c.name
    `

    return result.map((category) => ({
      ...category,
      display_name:
        category.name === "equirectangular" ? "360 images" : category.name === "fisheye" ? "180 images" : category.name,
    }))
  },
  ["categories-list"],
  {
    revalidate: CACHE_REVALIDATE.CATEGORIES,
    tags: [CACHE_TAGS.CATEGORIES],
  },
)

const getCachedCategoriesOptimized = unstable_cache(
  async () => {
    const startTime = Date.now()
    const sql = createNeonClient()

    // Optimized query using proper indexes
    const result = await sql`
      SELECT 
        c.id, c.name, c.description, c.active,
        COALESCE(img_counts.image_count, 0) as image_count
      FROM categories c
      LEFT JOIN (
        SELECT category_id, COUNT(*) as image_count
        FROM images 
        WHERE active = true
        GROUP BY category_id
      ) img_counts ON c.id = img_counts.category_id
      WHERE c.active = true
      ORDER BY c.name
    `

    logQueryPerformance("getCachedCategoriesOptimized", startTime, result.length)

    return result.map((category) => ({
      ...category,
      display_name:
        category.name === "equirectangular" ? "360 images" : category.name === "fisheye" ? "180 images" : category.name,
    }))
  },
  ["categories-optimized"],
  {
    revalidate: CACHE_REVALIDATE.CATEGORIES,
    tags: [CACHE_TAGS.CATEGORIES],
  },
)

const getCachedLicenses = unstable_cache(
  async () => {
    const sql = createNeonClient()

    const result = await sql`
      SELECT id, name, description, price, active
      FROM licenses
      WHERE active = true
      ORDER BY price ASC
    `

    return result
  },
  ["licenses-list"],
  {
    revalidate: CACHE_REVALIDATE.STATIC,
    tags: [CACHE_TAGS.LICENSES],
  },
)

const getCachedDatabaseStats = unstable_cache(
  async () => {
    const sql = createNeonClient()

    // Use a single query with subqueries for better performance
    const result = await sql`
      SELECT 
        (SELECT COUNT(*) FROM images WHERE active = true) as images,
        (SELECT COUNT(*) FROM categories WHERE active = true) as categories,
        (SELECT COUNT(*) FROM orders) as orders
    `

    return result[0]
  },
  ["database-stats"],
  {
    revalidate: CACHE_REVALIDATE.IMAGES,
    tags: [CACHE_TAGS.STATS],
  },
)

function compressBase64Image(base64String: string, maxSizeKB = 2000, preserveQuality = false): Promise<string> {
  return new Promise((resolve) => {
    try {
      // If it's already a placeholder or external URL, return as-is
      if (!base64String.startsWith("data:image/")) {
        resolve(base64String)
        return
      }

      const sizeInKB = (base64String.length * 3) / 4 / 1024
      console.log(`[v0] Original image size: ${sizeInKB.toFixed(1)}KB`)

      if (preserveQuality && sizeInKB <= maxSizeKB * 2) {
        console.log(`[v0] Preserving quality for premium image`)
        resolve(base64String)
        return
      }

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

        const compressionRatio = preserveQuality
          ? Math.sqrt((maxSizeKB * 1.5) / sizeInKB)
          : Math.sqrt(maxSizeKB / sizeInKB)

        const newWidth = Math.floor(img.width * compressionRatio)
        const newHeight = Math.floor(img.height * compressionRatio)

        canvas.width = newWidth
        canvas.height = newHeight

        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        let quality = preserveQuality ? 0.95 : 0.8
        let compressedBase64 = canvas.toDataURL("image/jpeg", quality)

        const targetSize = preserveQuality ? maxSizeKB * 1.5 : maxSizeKB
        const minQuality = preserveQuality ? 0.7 : 0.1

        while ((compressedBase64.length * 3) / 4 / 1024 > targetSize && quality > minQuality) {
          quality -= preserveQuality ? 0.05 : 0.1
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

function handleDatabaseError(error: any, functionName?: string): { success: false; error: string } {
  console.error(`[v0] Database error in ${functionName || "unknown function"}:`, error)

  // Handle Vercel serverless function payload limits
  if (typeof error === "string") {
    if (
      error.includes("Request Entity Too Large") ||
      error.includes("413") ||
      error.includes("FUNCTION_PAYLOAD_TOO_LARGE")
    ) {
      return {
        success: false,
        error:
          "File payload too large for serverless function. Maximum supported size is 10MB after compression. Please use a smaller image.",
      }
    }
    if (error.includes("timeout") || error.includes("TIMEOUT")) {
      return {
        success: false,
        error: "Upload timeout. Large files may take longer. Please try again or use a smaller file.",
      }
    }
  }

  // Handle Next.js server action body size limits
  if (error.message && error.message.includes("Body exceeded")) {
    return {
      success: false,
      error: "Upload payload too large. Please use a smaller image or contact support.",
    }
  }

  // Handle JSON parsing errors from large payloads
  if (error.message && error.message.includes("Unexpected token")) {
    return {
      success: false,
      error: "Server error processing large file. Please try a smaller image or contact support.",
    }
  }

  // Handle network errors
  if (error.message && (error.message.includes("fetch") || error.message.includes("network"))) {
    return {
      success: false,
      error: "Network error during upload. Please check your connection and try again.",
    }
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : "Database operation failed",
  }
}

function invalidateCache(tags: string[]) {
  tags.forEach((tag) => {
    revalidateTag(tag)
  })
  revalidatePath("/", "layout") // Keep this for additional cache clearing
}

export async function createImageWithCategory(formData: FormData) {
  // Get default PRO license
  const sql = createNeonClient()
  const defaultLicense = await sql`
    SELECT id FROM licenses WHERE name = 'PRO' LIMIT 1
  `

  if (defaultLicense.length > 0) {
    formData.set("license_id", defaultLicense[0].id)
  }

  return createImageWithLicense(formData)
}

export async function createImageWithLicense(formData: FormData) {
  try {
    const rawImageUrl = formData.get("file_url") as string
    const rawThumbnailUrl = formData.get("thumbnail_url") as string

    const compressedImageUrl = await compressBase64Image(rawImageUrl, 500)
    const compressedThumbnailUrl = await compressBase64Image(rawThumbnailUrl, 500, true)

    const imageData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      license_id: formData.get("license_id") as string,
      image_url: compressedImageUrl,
      thumbnail_url: compressedThumbnailUrl,
      resolution: (formData.get("resolution") as string) || "4096x4096",
      format: (formData.get("format") as string) || "JPG",
    }

    console.log("[v0] Starting image creation with license:", {
      ...imageData,
      image_url: imageData.image_url.substring(0, 50) + "...",
      thumbnail_url: imageData.thumbnail_url.substring(0, 50) + "...",
    })

    const sql = createNeonClient()

    // Look up category
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

    // Get license price
    const licenseResult = await sql`
      SELECT price FROM licenses WHERE id = ${imageData.license_id} LIMIT 1
    `

    if (licenseResult.length === 0) {
      return { success: false, error: "Invalid license selected" }
    }

    const price = licenseResult[0].price

    console.log("[v0] Inserting image with license_id:", imageData.license_id, "price:", price)
    const result = await sql`
      INSERT INTO images (title, description, category_id, license_id, price, image_url, thumbnail_url, 
                         resolution, format, active, featured)
      VALUES (${imageData.title}, ${imageData.description}, ${categoryId}, ${imageData.license_id}, 
              ${price}, ${imageData.image_url}, ${imageData.thumbnail_url}, 
              ${imageData.resolution}, ${imageData.format}, true, false)
      RETURNING *
    `

    console.log("[v0] Image created successfully with ID:", result[0]?.id)

    invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES, CACHE_TAGS.STATS])
    revalidatePath("/simple-admin")

    return { success: true, data: result }
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function createImageWithCategoryObject(imageData: {
  title: string
  description: string
  category_name: string
  rights_type: string
  image_url: string
  thumbnail_url: string
  price: number
  original_file_size?: number
}) {
  try {
    console.log("[v0] Processing upload with data:", {
      ...imageData,
      image_url: `${imageData.image_url.substring(0, 50)}... (${Math.round(imageData.image_url.length / 1024)}KB)`,
      thumbnail_url: `${imageData.thumbnail_url.substring(0, 50)}... (${Math.round(imageData.thumbnail_url.length / 1024)}KB)`,
      original_file_size: imageData.original_file_size
        ? `${(imageData.original_file_size / (1024 * 1024)).toFixed(2)}MB`
        : "unknown",
    })

    const totalPayloadSize = imageData.image_url.length + imageData.thumbnail_url.length
    const payloadSizeMB = totalPayloadSize / (1024 * 1024)

    console.log("[v0] Total payload size:", `${payloadSizeMB.toFixed(2)}MB`)

    if (payloadSizeMB > 10) {
      console.log("[v0] Payload too large for database:", `${payloadSizeMB.toFixed(2)}MB`)
      return {
        success: false,
        error: `File too large for database storage (${payloadSizeMB.toFixed(1)}MB). Maximum supported size is 10MB. Please use a smaller image or compress the file before uploading.`,
      }
    }

    const sql = createNeonClient()

    // Look up category
    console.log("[v0] Looking up category:", imageData.category_name)
    const categoryResult = await sql`
      SELECT id FROM categories WHERE name = ${imageData.category_name} LIMIT 1
    `

    let categoryId: string

    if (categoryResult.length === 0) {
      console.log("[v0] Category not found, creating new category:", imageData.category_name)
      const newCategoryResult = await sql`
        INSERT INTO categories (name, description, active)
        VALUES (${imageData.category_name}, ${"Auto-created category for " + imageData.category_name}, true)
        RETURNING id
      `
      categoryId = newCategoryResult[0].id
    } else {
      categoryId = categoryResult[0].id
    }

    // Get default PRO license
    const defaultLicense = await sql`
      SELECT id FROM licenses WHERE name = 'PRO' LIMIT 1
    `

    const licenseId = defaultLicense.length > 0 ? defaultLicense[0].id : null

    if (!licenseId) {
      return { success: false, error: "No default license found" }
    }

    console.log("[v0] Inserting image, license_id:", licenseId, "price:", imageData.price)

    let result
    try {
      result = await sql`
        INSERT INTO images (title, description, category_id, license_id, price, image_url, thumbnail_url, 
                           active, featured, metadata)
        VALUES (${imageData.title}, ${imageData.description}, ${categoryId}, ${licenseId}, 
                ${imageData.price}, ${imageData.image_url}, ${imageData.thumbnail_url}, 
                true, false, 
                ${JSON.stringify({
                  rights_type: imageData.rights_type,
                  original_file_size: imageData.original_file_size,
                  upload_timestamp: new Date().toISOString(),
                  storage_type: "neon_database", // Updated storage type to reflect Neon database storage
                })})
        RETURNING *
      `
    } catch (dbError: any) {
      console.log("[v0] Database insertion failed:", dbError.message || dbError)

      const errorMessage = dbError.message || String(dbError)

      if (
        errorMessage.includes("Request entity too large") ||
        errorMessage.includes("413") ||
        errorMessage.includes("payload") ||
        errorMessage.includes("body size") ||
        errorMessage.includes("Request En") ||
        errorMessage.includes("Unexpected token")
      ) {
        return {
          success: false,
          error: `Image file too large for database storage (${payloadSizeMB.toFixed(1)}MB). Please use a smaller image (max: 10MB) or compress the file before uploading.`,
        }
      }

      throw dbError // Re-throw if it's not a size-related error
    }

    console.log("[v0] Image created successfully, ID:", result[0]?.id)

    invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES, CACHE_TAGS.STATS])
    revalidatePath("/simple-admin")

    return { success: true, data: result }
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function getImages() {
  try {
    const data = await getCachedImages()
    return { success: true, data: Array.isArray(data) ? data : [] }
  } catch (error) {
    console.error("[v0] Get images error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [], // Added data field to ensure consistent response structure
    }
  }
}

export async function getImagesPaginated(page = 1, limit = 20, category?: string) {
  try {
    const startTime = Date.now()
    const data = await getCachedImagesPaginated(page, limit, category)

    logQueryPerformance("getImagesPaginated", startTime, data.images.length)

    return {
      success: true,
      data: {
        images: Array.isArray(data.images) ? data.images : [],
        pagination: data.pagination,
      },
    }
  } catch (error) {
    console.error("[v0] Get paginated images error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: { images: [], pagination: { page: 1, limit, total: 0, totalPages: 1 } },
    }
  }
}

export async function getOrders(userEmail?: string) {
  try {
    const sql = createNeonClient()

    let result
    if (userEmail) {
      result = await sql`
        SELECT o.*, 
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'license_id', oi.license_id,
                   'price', oi.price,
                   'image_id', oi.image_id,
                   'images', json_build_object(
                     'title', i.title,
                     'thumbnail_url', i.thumbnail_url
                   )
                 )
               ) as order_items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN images i ON oi.image_id = i.id
        WHERE o.user_email = ${userEmail}
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `
    } else {
      result = await sql`
        SELECT o.*, 
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'license_id', oi.license_id,
                   'price', oi.price,
                   'image_id', oi.image_id,
                   'images', json_build_object(
                     'title', i.title,
                     'thumbnail_url', i.thumbnail_url
                   )
                 )
               ) as order_items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN images i ON oi.image_id = i.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `
    }

    console.log("[v0] getOrders found", result.length, "orders for user:", userEmail || "all users")
    return { success: true, data: result }
  } catch (error) {
    console.error("[v0] Get orders error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getOrdersOptimized(userEmail?: string, page = 1, limit = 20) {
  try {
    const startTime = Date.now()
    const sql = createNeonClient()
    const offset = (page - 1) * limit

    let result
    if (userEmail) {
      result = await sql`
        SELECT o.*, 
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'license_id', oi.license_id,
                   'price', oi.price,
                   'image_id', oi.image_id,
                   'images', json_build_object(
                     'title', i.title,
                     'thumbnail_url', i.thumbnail_url
                   )
                 ) ORDER BY oi.created_at
               ) FILTER (WHERE oi.id IS NOT NULL) as order_items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN images i ON oi.image_id = i.id
        WHERE o.user_email = ${userEmail}
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      result = await sql`
        SELECT o.*, 
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'license_id', oi.license_id,
                   'price', oi.price,
                   'image_id', oi.image_id,
                   'images', json_build_object(
                     'title', i.title,
                     'thumbnail_url', i.thumbnail_url
                   )
                 ) ORDER BY oi.created_at
               ) FILTER (WHERE oi.id IS NOT NULL) as order_items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN images i ON oi.image_id = i.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    logQueryPerformance("getOrdersOptimized", startTime, result.length)

    console.log("[v0] getOrdersOptimized found", result.length, "orders for user:", userEmail || "all users")
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
    const data = await getCachedCategories()
    console.log(
      "[v0] getCategories returning",
      data.length,
      "categories:",
      data.map((c) => c.name),
    )
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Get categories error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getCategoriesOptimized() {
  try {
    const data = await getCachedCategoriesOptimized()
    console.log(
      "[v0] getCategoriesOptimized returning",
      data.length,
      "categories:",
      data.map((c) => c.name),
    )
    return { success: true, data }
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

    invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES, CACHE_TAGS.STATS])
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
    const compressedThumbnailUrl = await compressBase64Image(rawThumbnailUrl, 500, true)

    const imageData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      license_id: formData.get("license_id") as string,
      price: Number.parseFloat(formData.get("price") as string),
      image_url: compressedImageUrl,
      thumbnail_url: compressedThumbnailUrl,
      resolution: (formData.get("resolution") as string) || "4096x4096",
      format: (formData.get("format") as string) || "JPG",
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
          license_id = ${imageData.license_id},
          price = ${imageData.price}, 
          image_url = ${imageData.image_url}, 
          thumbnail_url = ${imageData.thumbnail_url},
          resolution = ${imageData.resolution},
          format = ${imageData.format},
          updated_at = NOW()
      WHERE id = ${imageId}
      RETURNING *
    `

    if (result.length === 0) {
      return { success: false, error: "Image not found" }
    }

    console.log("[v0] Image updated successfully:", result[0].id)

    invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES])
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

    invalidateCache([CACHE_TAGS.IMAGES])
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
      data: [], // Added data field to ensure consistent response structure
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

    invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES, CACHE_TAGS.STATS])
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
    const data = await getCachedDatabaseStats()
    return { success: true, data }
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function getLicenses() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const licenses = await sql`
      SELECT id, name, description, price, active
      FROM licenses
      WHERE active = true
      ORDER BY name
    `

    console.log(
      "[v0] getLicenses returning",
      licenses.length,
      "licenses:",
      licenses.map((l) => l.name),
    )
    return { success: true, data: licenses }
  } catch (error) {
    console.error("[v0] Get licenses error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [], // Added data field to ensure consistent response structure
    }
  }
}

export async function updateImageDetails(
  imageId: string,
  updates: {
    title: string
    price: number
    description?: string
    category?: string
    rightsType?: string
  },
) {
  try {
    console.log("[v0] Updating image details for ID:", imageId, "with:", updates)
    const sql = createNeonClient()

    // If category is provided, look up or create the category
    let categoryId: string | undefined
    if (updates.category) {
      console.log("[v0] Looking up category:", updates.category)
      const categoryResult = await sql`
        SELECT id FROM categories WHERE name = ${updates.category} LIMIT 1
      `

      if (categoryResult.length === 0) {
        console.log("[v0] Category not found, creating new category:", updates.category)
        const newCategoryResult = await sql`
          INSERT INTO categories (name, description, active)
          VALUES (${updates.category}, ${"Auto-created category for " + updates.category}, true)
          RETURNING id
        `
        categoryId = newCategoryResult[0].id
      } else {
        categoryId = categoryResult[0].id
      }
    }

    // Build metadata object for rights type
    let metadataUpdate = null
    if (updates.rightsType) {
      metadataUpdate = JSON.stringify({ rights_type: updates.rightsType })
    }

    // Execute update with proper parameterized query
    let result
    if (categoryId && metadataUpdate) {
      result = await sql`
        UPDATE images 
        SET title = ${updates.title},
            price = ${updates.price},
            description = ${updates.description || null},
            category_id = ${categoryId},
            metadata = COALESCE(metadata, '{}') || ${metadataUpdate}::jsonb,
            updated_at = NOW()
        WHERE id = ${imageId}
        RETURNING *
      `
    } else if (categoryId) {
      result = await sql`
        UPDATE images 
        SET title = ${updates.title},
            price = ${updates.price},
            description = ${updates.description || null},
            category_id = ${categoryId},
            updated_at = NOW()
        WHERE id = ${imageId}
        RETURNING *
      `
    } else if (metadataUpdate) {
      result = await sql`
        UPDATE images 
        SET title = ${updates.title},
            price = ${updates.price},
            description = ${updates.description || null},
            metadata = COALESCE(metadata, '{}') || ${metadataUpdate}::jsonb,
            updated_at = NOW()
        WHERE id = ${imageId}
        RETURNING *
      `
    } else {
      result = await sql`
        UPDATE images 
        SET title = ${updates.title},
            price = ${updates.price},
            description = ${updates.description || null},
            updated_at = NOW()
        WHERE id = ${imageId}
        RETURNING *
      `
    }

    if (result.length === 0) {
      return { success: false, error: "Image not found" }
    }

    console.log("[v0] Image details updated successfully:", result[0].id)

    invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES])
    revalidatePath("/simple-admin")

    return { success: true, data: result[0] }
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function getDatabaseHealth() {
  try {
    const startTime = Date.now()
    const sql = createNeonClient()

    // Check database connectivity and basic stats
    const healthCheck = await sql`
      SELECT 
        NOW() as server_time,
        version() as postgres_version,
        current_database() as database_name
    `

    // Get table sizes for monitoring
    const tableSizes = await sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `

    logQueryPerformance("getDatabaseHealth", startTime)

    return {
      success: true,
      data: {
        health: healthCheck[0],
        tableSizes: tableSizes,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function createChunkedUpload(fileData: {
  filename: string
  totalSize: number
  mimeType: string
  totalChunks: number
}) {
  try {
    const sql = createNeonClient()

    const result = await sql`
      INSERT INTO chunked_images (original_filename, total_chunks, total_size, mime_type, upload_status)
      VALUES (${fileData.filename}, ${fileData.totalChunks}, ${fileData.totalSize}, ${fileData.mimeType}, 'uploading')
      RETURNING id
    `

    console.log("[v0] Created chunked upload session:", result[0].id)
    return { success: true, data: { uploadId: result[0].id } }
  } catch (error) {
    return handleDatabaseError(error, "createChunkedUpload")
  }
}

export async function uploadChunk(uploadId: string, chunkIndex: number, chunkData: string) {
  try {
    const sql = createNeonClient()

    const chunkSize = Math.floor((chunkData.length * 3) / 4) // Convert base64 to bytes

    await sql`
      INSERT INTO image_chunks (image_id, chunk_index, chunk_data, chunk_size)
      VALUES (${uploadId}, ${chunkIndex}, ${chunkData}, ${chunkSize})
      ON CONFLICT (image_id, chunk_index) 
      DO UPDATE SET chunk_data = EXCLUDED.chunk_data, chunk_size = EXCLUDED.chunk_size
    `

    console.log("[v0] Uploaded chunk", chunkIndex, "for upload", uploadId, "size:", Math.round(chunkSize / 1024), "KB")
    return { success: true }
  } catch (error) {
    return handleDatabaseError(error, "uploadChunk")
  }
}

export async function completeChunkedUpload(
  uploadId: string,
  imageMetadata: {
    title: string
    description: string
    category_name: string
    rights_type: string
    price: number
  },
) {
  try {
    const sql = createNeonClient()

    // Get all chunks for this upload
    const chunks = await sql`
      SELECT chunk_index, chunk_data 
      FROM image_chunks 
      WHERE image_id = ${uploadId} 
      ORDER BY chunk_index
    `

    // Get upload metadata
    const uploadInfo = await sql`
      SELECT * FROM chunked_images WHERE id = ${uploadId}
    `

    if (uploadInfo.length === 0) {
      return { success: false, error: "Upload session not found" }
    }

    if (chunks.length !== uploadInfo[0].total_chunks) {
      return { success: false, error: `Missing chunks. Expected ${uploadInfo[0].total_chunks}, got ${chunks.length}` }
    }

    // Reassemble the image
    const fullImageData = chunks.map((chunk) => chunk.chunk_data).join("")

    // Create thumbnail from reassembled image
    const thumbnailDataUrl = await createThumbnailFromBase64(fullImageData)

    // Create the image record using existing function
    const imageData = {
      title: imageMetadata.title,
      description: imageMetadata.description,
      category_name: imageMetadata.category_name,
      rights_type: imageMetadata.rights_type,
      price: imageMetadata.price,
      image_url: fullImageData,
      thumbnail_url: thumbnailDataUrl,
      original_file_size: uploadInfo[0].total_size,
    }

    const result = await createImageWithCategoryObject(imageData)

    if (result.success) {
      // Mark upload as complete and cleanup chunks
      await sql`
        UPDATE chunked_images 
        SET upload_status = 'complete', completed_at = NOW() 
        WHERE id = ${uploadId}
      `

      // Clean up chunks after successful image creation
      await sql`DELETE FROM image_chunks WHERE image_id = ${uploadId}`

      console.log("[v0] Completed chunked upload and created image:", result.data[0]?.id)
    }

    return result
  } catch (error) {
    return handleDatabaseError(error, "completeChunkedUpload")
  }
}

async function createThumbnailFromBase64(base64Data: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      const maxThumbnailSize = 600
      const ratio = Math.min(maxThumbnailSize / img.width, maxThumbnailSize / img.height)

      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(blob!)
        },
        "image/jpeg",
        0.95,
      )
    }
    img.src = base64Data
  })
}

export async function createImageWithCategoryObjectChunked(imageData: {
  title: string
  description: string
  category_name: string
  rights_type: string
  image_url: string
  thumbnail_url: string
  price: number
  original_file_size?: number
}) {
  try {
    const totalPayloadSize = imageData.image_url.length + imageData.thumbnail_url.length
    const payloadSizeMB = totalPayloadSize / (1024 * 1024)

    console.log("[v0] Processing upload with payload size:", `${payloadSizeMB.toFixed(2)}MB`)

    // If payload is larger than 10MB, use chunked upload
    if (payloadSizeMB > 10) {
      console.log("[v0] Using chunked upload for large file:", `${payloadSizeMB.toFixed(2)}MB`)

      const chunkSize = 2 * 1024 * 1024 // 2MB chunks in base64 characters
      const imageChunks = []

      // Split image into chunks
      for (let i = 0; i < imageData.image_url.length; i += chunkSize) {
        imageChunks.push(imageData.image_url.slice(i, i + chunkSize))
      }

      // Create chunked upload session
      const uploadSession = await createChunkedUpload({
        filename: `${imageData.title}.jpg`,
        totalSize: imageData.original_file_size || 0,
        mimeType: "image/jpeg",
        totalChunks: imageChunks.length,
      })

      if (!uploadSession.success) {
        return uploadSession
      }

      // Upload each chunk
      for (let i = 0; i < imageChunks.length; i++) {
        const chunkResult = await uploadChunk(uploadSession.data.uploadId, i, imageChunks[i])
        if (!chunkResult.success) {
          return chunkResult
        }
      }

      // Complete the upload
      return await completeChunkedUpload(uploadSession.data.uploadId, {
        title: imageData.title,
        description: imageData.description,
        category_name: imageData.category_name,
        rights_type: imageData.rights_type,
        price: imageData.price,
      })
    } else {
      // Use regular upload for smaller files
      return await createImageWithCategoryObject(imageData)
    }
  } catch (error) {
    return handleDatabaseError(error, "createImageWithCategoryObjectChunked")
  }
}

export async function uploadToBackblaze(
  file: File,
  imageType: "full" | "thumbnail" = "full",
  category?: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("[v0] Backblaze env check - keyId exists:", !!process.env.BACKBLAZE_API_KEY)
    console.log("[v0] Backblaze env check - applicationKey exists:", !!process.env.BACKBLAZE_APPLICATION_KEY)
    console.log("[v0] Backblaze env check - bucketName:", process.env.BACKBLAZE_BUCKET_NAME)

    const backblaze = new WorkingBackblazeStorage()

    const fileSizeMB = file.size / (1024 * 1024)
    console.log(`[v0] Uploading ${imageType} image to Backblaze:`, `${fileSizeMB.toFixed(2)}MB`)

    // Generate organized folder structure
    const timestamp = Date.now()
    const uuid = crypto.randomUUID()
    const fileName = `${uuid}-${timestamp}_${file.name}`

    const baseFolder = imageType === "full" ? "full-images" : "thumbnails"
    const categoryFolder = category ? category.toLowerCase().replace(/[^a-z0-9]/g, "-") : "uncategorized"
    const folderPath = `${baseFolder}/${categoryFolder}`
    const key = `${folderPath}/${fileName}`

    console.log("[v0] Starting Backblaze upload for:", fileName, "in folder:", folderPath)

    const publicUrl = await backblaze.uploadFile(file, key)

    console.log("[v0] Backblaze upload successful:", publicUrl)
    return {
      success: true,
      url: publicUrl,
    }
  } catch (error: any) {
    console.log("[v0] Backblaze upload error:", error.message)
    return {
      success: false,
      error: `Failed to upload to Backblaze: ${error.message}`,
    }
  }
}

async function createThumbnailFile(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      const maxSize = 400 // Slightly larger thumbnail for better quality
      let { width, height } = img

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], `thumb_${file.name}`, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
              resolve(thumbnailFile)
            } else {
              reject(new Error("Could not create thumbnail blob"))
            }
          },
          "image/jpeg",
          0.85,
        )
      } else {
        reject(new Error("Could not get canvas context"))
      }
    }

    img.onerror = () => reject(new Error("Could not load image"))
    img.src = URL.createObjectURL(file)
  })
}

export async function uploadToBlob(file: File): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN

    console.log("[v0] Blob env check - token exists:", !!token)

    if (!token) {
      console.log("[v0] Blob upload error: BLOB_READ_WRITE_TOKEN environment variable is not configured")
      return {
        success: false,
        error: "BLOB_READ_WRITE_TOKEN environment variable is not configured",
      }
    }

    const fallbackToken = token || "vercel_blob_rw_0NpI635IzSq52HgK_O1tlS1gUX6IpzKF3SnhJP3P05phXU4"

    const { url } = await put(file.name, file, {
      access: "public",
      token: fallbackToken, // Use fallback token
    })

    return {
      success: true,
      data: {
        url,
        size: file.size,
      },
    }
  } catch (error: any) {
    console.log("[v0] Blob upload error:", error.message)
    return {
      success: false,
      error: `Failed to upload to Blob storage: ${error.message}`,
    }
  }
}

export async function uploadToDropbox(file: File): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const accessToken = process.env.DROPBOX_ACCESS_TOKEN
    if (!accessToken) {
      console.log("[v0] Dropbox upload error: DROPBOX_ACCESS_TOKEN environment variable is not configured")
      return {
        success: false,
        error: "DROPBOX_ACCESS_TOKEN environment variable is not configured",
      }
    }

    const dropbox = new DropboxStorage({ accessToken })

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await dropbox.uploadFile(buffer, file.name)

    if (!result.success) {
      throw new Error(result.error || "Dropbox upload failed")
    }

    return {
      success: true,
      data: {
        url: result.url,
        path: result.path,
        size: file.size,
      },
    }
  } catch (error: any) {
    console.log("[v0] Dropbox upload error:", error.message)
    return {
      success: false,
      error: `Failed to upload to Dropbox: ${error.message}`,
    }
  }
}

async function createThumbnailFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      const maxSize = 300
      let { width, height } = img

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL("image/jpeg", 0.8))
      } else {
        reject(new Error("Could not get canvas context"))
      }
    }

    img.onerror = () => reject(new Error("Could not load image"))
    img.src = URL.createObjectURL(file)
  })
}

export async function createImageWithHybridStorage(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const licenseId = formData.get("license_id") as string

    console.log("[v0] Upload request - category:", category, "licenseId:", licenseId)

    const fileSizeMB = file.size / (1024 * 1024)
    console.log(`[v0] Using Backblaze storage for file: ${fileSizeMB.toFixed(2)}MB`)

    const fullImageResult = await uploadToBackblaze(file, "full", category)
    if (!fullImageResult.success) {
      return { success: false, error: fullImageResult.error }
    }

    // Create and upload thumbnail with category
    const thumbnailFile = await createThumbnailFile(file)
    const thumbnailResult = await uploadToBackblaze(thumbnailFile, "thumbnail", category)
    if (!thumbnailResult.success) {
      return { success: false, error: thumbnailResult.error }
    }

    const sql = createNeonClient()

    async function getCategoryByName(categoryName: string): Promise<{ success: boolean; category?: any }> {
      try {
        console.log("[v0] Looking up category:", categoryName)
        const categoryResult = await sql`
          SELECT id FROM categories WHERE name = ${categoryName} LIMIT 1
        `
        console.log("[v0] Category lookup result:", categoryResult)
        if (categoryResult.length === 0) {
          return { success: false }
        }
        return { success: true, category: { id: categoryResult[0].id } }
      } catch (error) {
        console.error("[v0] Error looking up category:", error)
        return { success: false }
      }
    }

    async function getLicenseById(licenseId: string): Promise<{ success: boolean; license?: any }> {
      try {
        console.log("[v0] Looking up license:", licenseId)
        const result = await sql`
          SELECT id, name, description, price, active 
          FROM licenses 
          WHERE id = ${licenseId} AND active = true
        `
        console.log("[v0] License lookup result:", result)

        if (result.length > 0) {
          return { success: true, license: result[0] }
        }

        return { success: false }
      } catch (error) {
        console.error("[v0] Error looking up license:", error)
        return { success: false }
      }
    }

    const categoryResult = await getCategoryByName(category)
    if (!categoryResult.success) {
      console.log("[v0] Category lookup failed for:", category)
      return { success: false, error: `Category not found: ${category}` }
    }

    const licenseResult = await getLicenseById(licenseId)
    if (!licenseResult.success) {
      console.log("[v0] License lookup failed for:", licenseId)
      return { success: false, error: `License not found: ${licenseId}` }
    }

    console.log("[v0] Using license ID:", licenseResult.license?.id)

    const imageData = {
      title,
      description,
      price: 99, // TODO: Get price from license
      category_id: categoryResult.category!.id,
      license_id: licenseResult.license!.id,
      tags: [], // TODO: Add tags
      storage_type: "backblaze_b2" as const,
      file_url: fullImageResult.url!, // Original full-resolution file in full-images/
      thumbnail_url: thumbnailResult.url!, // Thumbnail in thumbnails/
      file_size: file.size,
      file_type: file.type,
      width: null,
      height: null,
    }

    async function createImageInDatabase(
      imageData: any,
    ): Promise<{ success: boolean; message: string; imageId?: string }> {
      try {
        const tagsArray = Array.isArray(imageData.tags) && imageData.tags.length > 0 ? imageData.tags : null

        console.log("[v0] Inserting image into database...")
        const result = await sql`
          INSERT INTO images (title, description, category_id, license_id, price, image_url, thumbnail_url, 
                             active, featured, metadata, tags)
          VALUES (
            ${imageData.title}, ${imageData.description}, ${imageData.category_id}, ${imageData.license_id}, 
            ${imageData.price}, ${imageData.file_url}, ${imageData.thumbnail_url},
            true, false, 
            ${JSON.stringify({
              storage_type: imageData.storage_type,
              folder_structure: {
                full_image: "full-images/",
                thumbnail: "thumbnails/",
              },
              file_size: imageData.file_size,
              file_type: imageData.file_type,
              width: imageData.width,
              height: imageData.height,
            })},
            ${tagsArray}
          )
          RETURNING id
        `
        console.log("[v0] Database insert successful, ID:", result[0].id)
        return { success: true, message: "Image created successfully", imageId: result[0].id }
      } catch (dbError: any) {
        console.error("[v0] Database insertion failed:", dbError)
        return { success: false, message: dbError.message || "Database error" }
      }
    }

    console.log("[v0] Inserting image with organized Backblaze storage")
    const result = await createImageInDatabase(imageData)

    if (result.success) {
      console.log("[v0] Image created successfully with organized storage, ID:", result.imageId)
      invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES, CACHE_TAGS.STATS])
      revalidatePath("/simple-admin")
      return {
        success: true,
        message: "Image uploaded successfully with organized storage",
        imageId: result.imageId,
      }
    } else {
      return { success: false, error: result.message }
    }
  } catch (error: any) {
    console.error("[v0] Error in createImageWithHybridStorage:", error)
    return {
      success: false,
      error: `Upload failed: ${error.message || error.toString()}`,
    }
  }
}

export async function migrateFilesToOptimalStorage() {
  try {
    console.log("[v0] Starting file migration to optimal storage...")

    const sql = createNeonClient()

    // Get all images with their metadata
    const images = await sql`
      SELECT id, title, image_url, thumbnail_url, metadata
      FROM images 
      WHERE active = true
    `

    console.log(`[v0] Found ${images.length} images to analyze`)

    let migratedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const image of images) {
      try {
        let metadata = {}
        if (image.metadata) {
          if (typeof image.metadata === "string") {
            metadata = JSON.parse(image.metadata)
          } else if (typeof image.metadata === "object") {
            metadata = image.metadata
          }
        }

        const currentStorageType = metadata.storage_type
        const originalFileSize = metadata.original_file_size

        console.log(`[v0] Analyzing image ${image.id}: ${image.title}`)
        console.log(`[v0] - Storage type: ${currentStorageType || "undefined"}`)
        console.log(`[v0] - Original file size: ${originalFileSize || "undefined"}`)
        console.log(`[v0] - Image URL type: ${image.image_url?.startsWith("data:") ? "base64" : "blob"}`)

        // If no storage_type is set, determine it from the URL format
        let actualStorageType = currentStorageType
        if (!actualStorageType) {
          if (image.image_url?.startsWith("data:")) {
            actualStorageType = "neon_database"
          } else if (image.image_url?.includes("blob.vercel-storage.com")) {
            actualStorageType = "vercel_blob"
          }
        }

        // Skip if already in database storage
        if (actualStorageType === "neon_database") {
          console.log(`[v0] - Skipping: Already in database storage`)
          skippedCount++
          continue
        }

        let fileSizeMB = 0
        if (originalFileSize) {
          fileSizeMB = originalFileSize / (1024 * 1024)
        } else if (actualStorageType === "vercel_blob") {
          // Try to get file size from Blob storage
          try {
            const headResponse = await fetch(image.image_url, { method: "HEAD" })
            if (headResponse.ok) {
              const contentLength = headResponse.headers.get("content-length")
              if (contentLength) {
                fileSizeMB = Number.parseInt(contentLength) / (1024 * 1024)
                console.log(`[v0] - Determined file size from Blob: ${fileSizeMB.toFixed(2)}MB`)
              }
            }
          } catch (error) {
            console.log(`[v0] - Could not determine file size, skipping`)
            skippedCount++
            continue
          }
        }

        // Only migrate files under 40MB that are currently in Blob storage
        if (fileSizeMB < 40 && actualStorageType === "vercel_blob") {
          console.log(`[v0] Migrating image ${image.id}: ${image.title} (${fileSizeMB.toFixed(2)}MB)`)

          // Download the image from Blob storage
          const imageResponse = await fetch(image.image_url)
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
          }

          const imageBlob = await imageResponse.blob()
          const imageDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(imageBlob)
          })

          // Download the thumbnail from Blob storage
          const thumbnailResponse = await fetch(image.thumbnail_url)
          if (!thumbnailResponse.ok) {
            throw new Error(`Failed to fetch thumbnail: ${thumbnailResponse.statusText}`)
          }

          const thumbnailBlob = await thumbnailResponse.blob()
          const thumbnailDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(thumbnailBlob)
          })

          // Update the database record with base64 data
          const updatedMetadata = {
            ...metadata,
            storage_type: "neon_database",
            original_file_size: imageBlob.size,
            migrated_from: "vercel_blob",
            migration_timestamp: new Date().toISOString(),
          }

          await sql`
            UPDATE images 
            SET image_url = ${imageDataUrl},
                thumbnail_url = ${thumbnailDataUrl},
                metadata = ${JSON.stringify(updatedMetadata)}
            WHERE id = ${image.id}
          `

          migratedCount++
          console.log(`[v0] Successfully migrated image ${image.id}`)
        } else {
          console.log(`[v0] - Skipping: File too large (${fileSizeMB.toFixed(2)}MB) or not in Blob storage`)
          skippedCount++
        }
      } catch (error) {
        console.error(`[v0] Error migrating image ${image.id}:`, error)
        errorCount++
      }
    }

    console.log(`[v0] Migration completed: ${migratedCount} migrated, ${skippedCount} skipped, ${errorCount} errors`)

    // Invalidate cache after migration
    invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES, CACHE_TAGS.STATS])

    return {
      success: true,
      data: {
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errorCount,
        total: images.length,
      },
    }
  } catch (error) {
    return handleDatabaseError(error, "migrateFilesToOptimalStorage")
  }
}

export { getCachedImagesPaginated, getCachedCategoriesOptimized }
