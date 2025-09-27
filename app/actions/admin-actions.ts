"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_cache } from "next/cache"
import { revalidatePath, revalidateTag } from "next/cache"

const CACHE_TAGS = {
  IMAGES: "images",
  CATEGORIES: "categories",
  ORDERS: "orders",
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
      const supabase = await createClient()

      const { data: images, error: imagesError } = await supabase
        .from("images")
        .select(`
          id, title, description, price, file_path, original_url,
          thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url,
          is_featured, created_at, updated_at, category_id, license_id, active
        `)
        .eq("active", true)
        .order("created_at", { ascending: false })

      if (imagesError) {
        console.error("[v0] Database error in getCachedImages:", imagesError)
        if (imagesError.message.includes("does not exist") || imagesError.message.includes("schema cache")) {
          console.log("[v0] Database tables not found, returning empty array")
          return []
        }
        throw new Error(imagesError.message)
      }

      // Get categories and licenses separately
      const { data: categories } = await supabase.from("categories").select("id, name")
      const { data: licenses } = await supabase.from("licenses").select("id, name, description")

      // Create lookup maps
      const categoryMap = new Map(categories?.map((c) => [c.id, c]) || [])
      const licenseMap = new Map(licenses?.map((l) => [l.id, l]) || [])

      const transformedData =
        images?.map((item) => ({
          ...item,
          image_url: item.file_path || item.original_url,
          thumbnail_url:
            item.thumbnail_large_url || item.thumbnail_medium_url || item.thumbnail_small_url || item.file_path,
          featured: item.is_featured,
          categories: categoryMap.get(item.category_id),
          licenses: licenseMap.get(item.license_id),
          category_name: categoryMap.get(item.category_id)?.name,
          license_name: licenseMap.get(item.license_id)?.name,
          license_description: licenseMap.get(item.license_id)?.description,
        })) || []

      console.log(`[v0] getCachedImages: Retrieved ${transformedData.length} images`)
      return transformedData
    } catch (error) {
      console.error("[v0] Error in getCachedImages:", error)
      return []
    }
  },
  ["images"],
  {
    tags: [CACHE_TAGS.IMAGES],
    revalidate: 300, // 5 minutes
  },
)

const getCachedImagesPaginated = unstable_cache(
  async (page = 1, limit = 50, category?: string, featured?: boolean) => {
    const startTime = Date.now()
    const supabase = await createClient()
    const offset = (page - 1) * limit

    try {
      let query = supabase
        .from("images")
        .select(
          `
          id, title, description, price, file_path, original_url,
          thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url,
          is_featured, created_at, updated_at, category_id, license_id, active
        `,
          { count: "exact" },
        )
        .eq("active", true)

      // Handle category filtering by ID instead of name
      if (category) {
        // First get the category ID
        const { data: categoryData } = await supabase.from("categories").select("id").eq("name", category).single()

        if (categoryData) {
          query = query.eq("category_id", categoryData.id)
        }
      }

      if (featured !== undefined) {
        query = query.eq("is_featured", featured)
      }

      const {
        data: images,
        error,
        count,
      } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

      if (error) {
        console.error("[v0] Database error in getCachedImagesPaginated:", error)
        if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
          console.log("[v0] Database tables not found, returning empty result")
          return {
            images: [],
            pagination: {
              currentPage: page,
              totalPages: 0,
              totalCount: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          }
        }
        throw new Error(error.message)
      }

      // Get categories and licenses separately
      const { data: categories } = await supabase.from("categories").select("id, name")
      const { data: licenses } = await supabase.from("licenses").select("id, name, description")

      // Create lookup maps
      const categoryMap = new Map(categories?.map((c) => [c.id, c]) || [])
      const licenseMap = new Map(licenses?.map((l) => [l.id, l]) || [])

      const transformedData =
        images?.map((item) => ({
          ...item,
          image_url: item.file_path || item.original_url,
          thumbnail_url:
            item.thumbnail_large_url || item.thumbnail_medium_url || item.thumbnail_small_url || item.file_path,
          featured: item.is_featured,
          categories: categoryMap.get(item.category_id),
          licenses: licenseMap.get(item.license_id),
          category_name: categoryMap.get(item.category_id)?.name,
          license_name: licenseMap.get(item.license_id)?.name,
          license_description: licenseMap.get(item.license_id)?.description,
        })) || []

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / limit)

      logQueryPerformance("getCachedImagesPaginated", startTime, transformedData.length)

      return {
        images: transformedData,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      }
    } catch (error) {
      console.error("[v0] Error in getCachedImagesPaginated:", error)
      return {
        images: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }
    }
  },
  ["images-paginated"],
  {
    tags: [CACHE_TAGS.IMAGES],
    revalidate: 300,
  },
)

const getCachedCategories = unstable_cache(
  async () => {
    try {
      const supabase = await createClient()

      const { data: result, error } = await supabase.from("categories").select("*").order("name")

      if (error) {
        console.error("[v0] Database error in getCachedCategories:", error)
        throw new Error(error.message)
      }

      console.log(`[v0] getCachedCategories: Retrieved ${result?.length || 0} categories`)
      return result || []
    } catch (error) {
      console.error("[v0] Error in getCachedCategories:", error)
      throw error
    }
  },
  ["categories"],
  {
    tags: [CACHE_TAGS.CATEGORIES],
    revalidate: 3600, // 1 hour
  },
)

const getCachedCategoriesOptimized = unstable_cache(
  async () => {
    const startTime = Date.now()
    const supabase = await createClient()

    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name, description, active")
      .order("name")

    if (categoriesError) {
      console.error("[v0] Database error in getCachedCategoriesOptimized:", categoriesError)
      throw new Error(categoriesError.message)
    }

    // Get image counts separately
    const { data: imageCounts } = await supabase.from("images").select("category_id").eq("active", true)

    // Count images per category
    const countMap = new Map()
    imageCounts?.forEach((img) => {
      const count = countMap.get(img.category_id) || 0
      countMap.set(img.category_id, count + 1)
    })

    const result =
      categories?.map((category) => ({
        ...category,
        image_count: countMap.get(category.id) || 0,
        display_name:
          category.name === "equirectangular"
            ? "360 images"
            : category.name === "fisheye"
              ? "180 images"
              : category.name,
      })) || []

    logQueryPerformance("getCachedCategoriesOptimized", startTime, result.length)

    return result
  },
  ["categories-optimized"],
  {
    tags: [CACHE_TAGS.CATEGORIES],
    revalidate: 3600,
  },
)

const getCachedLicenses = unstable_cache(
  async () => {
    const supabase = await createClient()

    const { data: result, error } = await supabase.from("licenses").select("*").eq("active", true).order("price")

    if (error) {
      console.error("[v0] Database error in getCachedLicenses:", error)
      throw new Error(error.message)
    }

    return result || []
  },
  ["licenses-list"],
  {
    tags: [CACHE_TAGS.LICENSES],
    revalidate: CACHE_REVALIDATE.STATIC,
  },
)

const getCachedDatabaseStats = unstable_cache(
  async () => {
    const supabase = await createClient()

    const { data: result, error } = await supabase.rpc("get_database_stats")

    if (error) {
      console.error("[v0] Database error in getCachedDatabaseStats:", error)
      throw new Error(error.message)
    }

    return result[0]
  },
  ["database-stats"],
  {
    tags: [CACHE_TAGS.STATS],
    revalidate: CACHE_REVALIDATE.IMAGES,
  },
)

function compressBase64Image(base64String: string, maxSizeKB = 2000, preserveQuality = false): Promise<string> {
  return new Promise((resolve) => {
    try {
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

      if (sizeInKB <= maxSizeKB) {
        resolve(base64String)
        return
      }

      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!

        const compressionRatio = preserveQuality
          ? Math.sqrt((maxSizeKB * 1.5) / sizeInKB)
          : Math.sqrt(maxSizeKB / sizeInKB)

        const newWidth = Math.floor(img.width * compressionRatio)
        const newHeight = Math.floor(img.height * compressionRatio)

        canvas.width = newWidth
        canvas.height = newHeight

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
        resolve(base64String)
      }

      img.src = base64String
    } catch (error) {
      console.error("[v0] Error compressing image:", error)
      resolve(base64String)
    }
  })
}

function handleDatabaseError(error: any, functionName?: string): { success: false; error: string } {
  console.error(`[v0] Database error in ${functionName || "unknown function"}:`, error)

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

  if (error?.message && error.message.includes("Body exceeded")) {
    return {
      success: false,
      error: "Upload payload too large. Please use a smaller image or contact support.",
    }
  }

  if (error?.message && error.message.includes("Unexpected token")) {
    return {
      success: false,
      error: "Server error processing large file. Please try a smaller image or contact support.",
    }
  }

  if (error?.message && (error.message.includes("fetch") || error.message.includes("network"))) {
    return {
      success: false,
      error: "Network error during upload. Please check your connection and try again.",
    }
  }

  const errorMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Database operation failed"

  return {
    success: false,
    error: errorMessage,
  }
}

function invalidateCache(tags: string[]) {
  tags.forEach((tag) => {
    revalidateTag(tag)
  })
  revalidatePath("/", "layout")
}

export async function createImageWithCategory(formData: FormData) {
  const supabase = await createClient()
  const defaultLicense = await supabase.from("licenses").select("id").eq("name", "PRO").limit(1)

  if (defaultLicense.data && defaultLicense.data.length > 0) {
    formData.set("license_id", defaultLicense.data[0].id)
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

    const supabase = await createClient()

    const categoryResult = await supabase.from("categories").select("id").eq("name", imageData.category).limit(1)

    let categoryId: string

    if (categoryResult.data && categoryResult.data.length === 0) {
      console.log("[v0] Category not found, creating new category:", imageData.category)
      const newCategoryResult = await supabase
        .from("categories")
        .insert([
          {
            name: imageData.category,
            description: "Auto-created category for " + imageData.category,
            active: true,
          },
        ])
        .select("id")

      categoryId = newCategoryResult.data[0].id
    } else {
      categoryId = categoryResult.data[0].id
    }

    const licenseResult = await supabase.from("licenses").select("price").eq("id", imageData.license_id).limit(1)

    if (!licenseResult.data || licenseResult.data.length === 0) {
      return { success: false, error: "Invalid license selected" }
    }

    const price = licenseResult.data[0].price

    console.log("[v0] Inserting image with license_id:", imageData.license_id, "price:", price)
    const { data: result, error } = await supabase
      .from("images")
      .insert([
        {
          title: imageData.title,
          description: imageData.description,
          category_id: categoryId,
          license_id: imageData.license_id,
          price: price,
          image_url: imageData.image_url,
          thumbnail_url: imageData.thumbnail_url,
          resolution: imageData.resolution,
          format: imageData.format,
          active: true,
          featured: false,
        },
      ])
      .select("*")

    if (error) {
      console.error("[v0] Database error in createImageWithLicense:", error)
      throw new Error(error.message)
    }

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
    const imageUrlPreview = imageData.image_url
      ? `${imageData.image_url.substring(0, 50)}... (${Math.round(imageData.image_url.length / 1024)}KB)`
      : "No image URL"
    const thumbnailUrlPreview = imageData.thumbnail_url
      ? `${imageData.thumbnail_url.substring(0, 50)}... (${Math.round(imageData.thumbnail_url.length / 1024)}KB)`
      : "No thumbnail URL"

    console.log("[v0] Processing upload with data:", {
      ...imageData,
      image_url: imageUrlPreview,
      thumbnail_url: thumbnailUrlPreview,
      original_file_size: imageData.original_file_size
        ? `${(imageData.original_file_size / (1024 * 1024)).toFixed(2)}MB`
        : "unknown",
    })

    if (!imageData.image_url || !imageData.thumbnail_url) {
      return {
        success: false,
        error: "Missing required image data. Please ensure both image and thumbnail are provided.",
      }
    }

    const totalPayloadSize = imageData.image_url.length + imageData.thumbnail_url.length
    const payloadSizeMB = totalPayloadSize / (1024 * 1024)

    if (payloadSizeMB > 10) {
      console.log("[v0] Payload too large for database:", `${payloadSizeMB.toFixed(2)}MB`)
      return {
        success: false,
        error: `File too large for database storage (${payloadSizeMB.toFixed(1)}MB). Maximum supported size is 10MB. Please use a smaller image or compress the file before uploading.`,
      }
    }

    const supabase = await createClient()

    const categoryResult = await supabase.from("categories").select("id").eq("name", imageData.category_name).limit(1)

    let categoryId: string

    if (categoryResult.data && categoryResult.data.length === 0) {
      console.log("[v0] Category not found, creating new category:", imageData.category_name)
      const newCategoryResult = await supabase
        .from("categories")
        .insert([
          {
            name: imageData.category_name,
            description: "Auto-created category for " + imageData.category_name,
            active: true,
          },
        ])
        .select("id")

      categoryId = newCategoryResult.data[0].id
    } else {
      categoryId = categoryResult.data[0].id
    }

    console.log("[v0] Looking up default license...")

    let defaultLicense = await supabase.from("licenses").select("id").eq("name", "PRO").eq("active", true).limit(1)

    if (!defaultLicense.data || defaultLicense.data.length === 0) {
      console.log("[v0] No PRO license found, trying Standard...")
      defaultLicense = await supabase
        .from("licenses")
        .select("id")
        .ilike("name", "%standard%")
        .eq("active", true)
        .limit(1)
    }

    if (!defaultLicense.data || defaultLicense.data.length === 0) {
      console.log("[v0] No Standard license found, getting first active license...")
      defaultLicense = await supabase.from("licenses").select("id").eq("active", true).order("price").limit(1)
    }

    const licenseId = defaultLicense.data ? defaultLicense.data[0].id : null

    if (!licenseId) {
      console.log("[v0] No active licenses found in database")
      return { success: false, error: "No active licenses found. Please add at least one license to the system." }
    }

    console.log("[v0] Using license_id:", licenseId, "for upload")

    const { data: result, error } = await supabase
      .from("images")
      .insert([
        {
          title: imageData.title,
          description: imageData.description,
          category_id: categoryId,
          license_id: licenseId,
          price: imageData.price,
          image_url: imageData.image_url,
          thumbnail_url: imageData.thumbnail_url,
          active: true,
          featured: false,
          metadata: JSON.stringify({
            rights_type: imageData.rights_type,
            original_file_size: imageData.original_file_size,
            upload_timestamp: new Date().toISOString(),
            storage_type: "supabase_storage",
          }),
        },
      ])
      .select("*")

    if (error) {
      console.error("[v0] Database error in createImageWithCategoryObject:", error)
      throw new Error(error.message)
    }

    console.log("[v0] Image created successfully, ID:", result[0]?.id)

    invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES, CACHE_TAGS.STATS])
    revalidatePath("/simple-admin")

    return { success: true, data: result }
  } catch (error) {
    return handleDatabaseError(error, "createImageWithCategoryObject")
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
      data: [],
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
      data: {
        images: [],
        pagination: { currentPage: 1, totalPages: 1, totalCount: 0, hasNextPage: false, hasPreviousPage: false },
      },
    }
  }
}

export async function getOrders(userEmail?: string) {
  try {
    const supabase = await createClient()

    let result
    if (userEmail) {
      result = await supabase
        .from("orders")
        .select(`
          *, 
          order_items!inner(id, license_id, price, image_id, images(title, thumbnail_url))
        `)
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false })
    } else {
      result = await supabase
        .from("orders")
        .select(`
          *, 
          order_items!inner(id, license_id, price, image_id, images(title, thumbnail_url))
        `)
        .order("created_at", { ascending: false })
    }

    console.log("[v0] getOrders found", result.data?.length || 0, "orders for user:", userEmail || "all users")
    return { success: true, data: result.data || [] }
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
    const supabase = await createClient()
    const offset = (page - 1) * limit

    let result
    if (userEmail) {
      result = await supabase
        .from("orders")
        .select(`
          *, 
          order_items!inner(id, license_id, price, image_id, images(title, thumbnail_url))
        `)
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)
    } else {
      result = await supabase
        .from("orders")
        .select(`
          *, 
          order_items!inner(id, license_id, price, image_id, images(title, thumbnail_url))
        `)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)
    }

    logQueryPerformance("getOrdersOptimized", startTime, result.data?.length || 0)

    console.log("[v0] getOrdersOptimized found", result.data?.length || 0, "orders for user:", userEmail || "all users")
    return { success: true, data: result.data || [] }
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

export async function getLicenses() {
  try {
    const data = await getCachedLicenses()
    console.log("[v0] getLicenses returning", data.length, "licenses")
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Get licenses error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getDatabaseStats() {
  try {
    const data = await getCachedDatabaseStats()
    console.log("[v0] getDatabaseStats returning stats:", data)
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Get database stats error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function deleteImage(imageId: string) {
  try {
    console.log("[v0] Starting image deletion for ID:", imageId)
    const supabase = await createClient()

    const orderItemsCheck = await supabase.from("order_items").select("count").eq("image_id", imageId).single()

    const orderItemCount = Number.parseInt(orderItemsCheck.data?.count || "0")

    if (orderItemCount > 0) {
      console.log(`[v0] Cannot delete image ${imageId}: referenced by ${orderItemCount} order items`)
      return {
        success: false,
        error: `Cannot delete image: it is referenced by ${orderItemCount} order(s). Images that have been purchased cannot be deleted.`,
      }
    }

    const { data: result, error } = await supabase.from("images").delete().eq("id", imageId).select("*")

    if (error) {
      console.error("[v0] Database error in deleteImage:", error)
      throw new Error(error.message)
    }

    if (!result || result.length === 0) {
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

    const supabase = await createClient()

    const categoryResult = await supabase.from("categories").select("id").eq("name", imageData.category).limit(1)

    let categoryId: string

    if (categoryResult.data && categoryResult.data.length === 0) {
      console.log("[v0] Category not found, creating new category:", imageData.category)
      const newCategoryResult = await supabase
        .from("categories")
        .insert([
          {
            name: imageData.category,
            description: "Auto-created category for " + imageData.category,
            active: true,
          },
        ])
        .select("id")

      categoryId = newCategoryResult.data[0].id
    } else {
      categoryId = categoryResult.data[0].id
    }

    console.log("[v0] Updating image with license_id:", imageData.license_id, "price:", imageData.price)
    const { data: result, error } = await supabase
      .from("images")
      .update({
        title: imageData.title,
        description: imageData.description,
        category_id: categoryId,
        license_id: imageData.license_id,
        price: imageData.price,
        image_url: imageData.image_url,
        thumbnail_url: imageData.thumbnail_url,
        resolution: imageData.resolution,
        format: imageData.format,
      })
      .eq("id", imageId)
      .select("*")

    if (error) {
      console.error("[v0] Database error in updateImage:", error)
      throw new Error(error.message)
    }

    console.log("[v0] Image updated successfully with ID:", result[0]?.id)

    invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES, CACHE_TAGS.STATS])
    revalidatePath("/simple-admin")

    return { success: true, data: result }
  } catch (error) {
    return handleDatabaseError(error)
  }
}
