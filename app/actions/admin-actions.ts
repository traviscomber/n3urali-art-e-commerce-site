"use server"

import { createNeonClient } from "@/lib/neon/client"
import { unstable_cache } from "next/cache"
import { revalidatePath, revalidateTag } from "next/cache" // Added revalidateTag import

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

    // Build query with proper parameterization
    let query
    let countQuery

    if (category && featured !== undefined) {
      // Both category and featured filters
      query = sql`
        SELECT 
          i.id, i.title, i.description, i.price, i.image_url, i.thumbnail_url,
          i.active, i.featured, i.created_at, i.updated_at,
          c.name as category_name, c.id as category_id,
          l.name as license_name, l.description as license_description
        FROM images i
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN licenses l ON i.license_id = l.id
        WHERE i.active = true AND c.name = ${category} AND i.featured = ${featured}
        ORDER BY i.featured DESC, i.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countQuery = sql`
        SELECT COUNT(*) as total
        FROM images i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.active = true AND c.name = ${category} AND i.featured = ${featured}
      `
    } else if (category) {
      // Only category filter
      query = sql`
        SELECT 
          i.id, i.title, i.description, i.price, i.image_url, i.thumbnail_url,
          i.active, i.featured, i.created_at, i.updated_at,
          c.name as category_name, c.id as category_id,
          l.name as license_name, l.description as license_description
        FROM images i
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN licenses l ON i.license_id = l.id
        WHERE i.active = true AND c.name = ${category}
        ORDER BY i.featured DESC, i.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countQuery = sql`
        SELECT COUNT(*) as total
        FROM images i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.active = true AND c.name = ${category}
      `
    } else if (featured !== undefined) {
      // Only featured filter
      query = sql`
        SELECT 
          i.id, i.title, i.description, i.price, i.image_url, i.thumbnail_url,
          i.active, i.featured, i.created_at, i.updated_at,
          c.name as category_name, c.id as category_id,
          l.name as license_name, l.description as license_description
        FROM images i
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN licenses l ON i.license_id = l.id
        WHERE i.active = true AND i.featured = ${featured}
        ORDER BY i.featured DESC, i.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countQuery = sql`
        SELECT COUNT(*) as total
        FROM images i
        WHERE i.active = true AND i.featured = ${featured}
      `
    } else {
      // No filters
      query = sql`
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
        LIMIT ${limit} OFFSET ${offset}
      `
      countQuery = sql`
        SELECT COUNT(*) as total
        FROM images i
        WHERE i.active = true
      `
    }

    // Execute both queries in parallel for better performance
    const [result, countResult] = await Promise.all([query, countQuery])

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
      price: Number.parseFloat(formData.get("price") as string),
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

    console.log("[v0] Starting image update with license:", {
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

    console.log("[v0] Updating image with license_id:", imageData.license_id, "price:", imageData.price)
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
          format = ${imageData.format}
      WHERE id = ${imageId}
      RETURNING *
    `

    console.log("[v0] Image updated successfully with ID:", result[0]?.id)

    invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES, CACHE_TAGS.STATS])
    revalidatePath("/simple-admin")

    return { success: true, data: result }
  } catch (error) {
    return handleDatabaseError(error)
  }
}
