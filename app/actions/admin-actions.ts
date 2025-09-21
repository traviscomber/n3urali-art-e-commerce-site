"use server"

import { createSupabaseServerClient } from "@/lib/database"
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
      const supabase = await createSupabaseServerClient()

      const { data: images, error: imagesError } = await supabase
        .from("images")
        .select(`
          id, title, description, price, file_path,
          thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url, original_url,
          is_featured, created_at, updated_at, category_id, license_id,
          categories:category_id(id, name),
          licenses:license_id(id, name, description)
        `)
        .order("created_at", { ascending: false })

      if (imagesError) {
        console.error("[v0] Database error in getCachedImages:", imagesError)
        if (imagesError.message.includes("does not exist") || imagesError.message.includes("schema cache")) {
          return []
        }
        throw new Error(imagesError.message)
      }

      const transformedData =
        images?.map((item) => ({
          ...item,
          image_url: item.original_url || item.file_path,
          thumbnail_url: item.thumbnail_medium_url || item.thumbnail_small_url || item.original_url || item.file_path,
          active: true,
          featured: item.is_featured,
          categories: item.categories,
          licenses: item.licenses,
          category_name: item.categories?.name,
          license_name: item.licenses?.name,
          license_description: item.licenses?.description,
        })) || []

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
    const supabase = await createSupabaseServerClient()
    const offset = (page - 1) * limit

    try {
      // Build the main query with JOINs for better performance
      let query = supabase.from("images").select(
        `
          id, title, description, price, file_path,
          thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url, original_url,
          is_featured, created_at, updated_at, category_id, license_id,
          categories:category_id(id, name),
          licenses:license_id(id, name, description)
        `,
        { count: "exact" },
      )

      // Handle category filtering by name with a subquery
      if (category) {
        query = query.eq("categories.name", category)
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

      // Transform data with proper URL handling
      const transformedData =
        images?.map((item) => ({
          ...item,
          image_url: item.original_url || item.file_path,
          thumbnail_url: item.thumbnail_medium_url || item.thumbnail_small_url || item.original_url || item.file_path,
          active: true,
          featured: item.is_featured,
          categories: item.categories,
          licenses: item.licenses,
          category_name: item.categories?.name,
          license_name: item.licenses?.name,
          license_description: item.licenses?.description,
        })) || []

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / limit)

      const duration = Date.now() - startTime
      if (duration > 500) {
        console.warn(`[v0] Slow Query Alert: getCachedImagesPaginated took ${duration}ms`)
      }

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
      const supabase = await createSupabaseServerClient()

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
    const supabase = await createSupabaseServerClient()

    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name, description")
      .order("name")

    if (categoriesError) {
      console.error("[v0] Database error in getCachedCategoriesOptimized:", categoriesError)
      throw new Error(categoriesError.message)
    }

    // Get image counts separately - no active column filter
    const { data: imageCounts } = await supabase.from("images").select("category_id")

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
    const supabase = await createSupabaseServerClient()

    const { data: result, error } = await supabase.from("licenses").select("*").order("name")

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
    try {
      const supabase = await createSupabaseServerClient()

      const [{ count: imageCount }, { count: categoryCount }, { count: licenseCount }, { count: orderCount }] =
        await Promise.all([
          supabase.from("images").select("*", { count: "exact", head: true }),
          supabase.from("categories").select("*", { count: "exact", head: true }),
          supabase.from("licenses").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("*", { count: "exact", head: true }),
        ])

      // Get total revenue from orders
      const { data: revenueData } = await supabase.from("orders").select("total_amount")

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      // Get featured images count
      const { count: featuredCount } = await supabase
        .from("images")
        .select("*", { count: "exact", head: true })
        .eq("is_featured", true)

      const stats = {
        total_images: imageCount || 0,
        total_categories: categoryCount || 0,
        total_licenses: licenseCount || 0,
        total_orders: orderCount || 0,
        total_revenue: totalRevenue,
        featured_images: featuredCount || 0,
      }

      console.log("[v0] Database stats calculated:", stats)
      return stats
    } catch (error) {
      console.error("[v0] Database error in getCachedDatabaseStats:", error)
      // Return default stats instead of throwing
      return {
        total_images: 0,
        total_categories: 0,
        total_licenses: 0,
        total_orders: 0,
        total_revenue: 0,
        featured_images: 0,
      }
    }
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

function handleDatabaseError(error: any, functionName?: string) {
  console.error(`[v0] Database error in ${functionName || "unknown function"}:`, error)

  if (typeof error === "string" && error) {
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
    if (error.includes("CORS")) {
      return {
        success: false,
        error: "CORS error. Please check your domain configuration.",
      }
    }
    if (error.includes("413") || error.includes("Payload Too Large")) {
      return {
        success: false,
        error: "File too large. Please use a smaller file.",
      }
    }
    if (error.includes("Network")) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
      }
    }
  }

  // Handle Error objects
  if (error instanceof Error && error.message) {
    const message = error.message
    if (
      message.includes("Request Entity Too Large") ||
      message.includes("413") ||
      message.includes("FUNCTION_PAYLOAD_TOO_LARGE")
    ) {
      return {
        success: false,
        error:
          "File payload too large for serverless function. Maximum supported size is 10MB after compression. Please use a smaller image.",
      }
    }
    if (message.includes("timeout") || message.includes("TIMEOUT")) {
      return {
        success: false,
        error: "Upload timeout. Large files may take longer. Please try again or use a smaller file.",
      }
    }
  }

  // Default error response
  return {
    success: false,
    error: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
  }
}

function invalidateCache(tags: string[]) {
  tags.forEach((tag) => {
    revalidateTag(tag)
  })
  revalidatePath("/", "layout")
}

export async function createImageWithCategory(formData: FormData) {
  const supabase = await createSupabaseServerClient()
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

    const supabase = await createSupabaseServerClient()

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

    const supabase = await createSupabaseServerClient()

    const categoryResult = await supabase.from("categories").select("id").eq("name", imageData.category_name).limit(1)

    let categoryId: string

    if (categoryResult.data && categoryResult.data.length === 0) {
      console.log("[v0] Category not found, creating new category:", imageData.category_name)

      const categoryName = imageData.category_name?.trim()
      if (!categoryName) {
        console.log("[v0] Empty category name provided, using default")
        imageData.category_name = "Uncategorized"
      }

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

      if (newCategoryResult.error) {
        console.error("[v0] Failed to create category:", newCategoryResult.error)
        return {
          success: false,
          error: `Failed to create category "${imageData.category_name}": ${newCategoryResult.error.message}`,
        }
      }

      if (!newCategoryResult.data || newCategoryResult.data.length === 0) {
        console.error("[v0] Category creation returned no data")
        return {
          success: false,
          error: `Failed to create category "${imageData.category_name}". Please try again.`,
        }
      }

      categoryId = newCategoryResult.data[0].id
    } else {
      if (!categoryResult.data || categoryResult.data.length === 0) {
        console.error("[v0] Category lookup failed")
        return {
          success: false,
          error: "Failed to find or create category. Please try again.",
        }
      }
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

export async function createImageWithEnhancedThumbnails(imageData: {
  title: string
  description: string
  category_name: string
  rights_type: string
  image_url: string
  thumbnail_url: string
  thumbnail_small_url?: string
  thumbnail_medium_url?: string
  thumbnail_large_url?: string
  original_file_url?: string
  price: number
  original_file_size?: number
}) {
  try {
    console.log("[v0] Processing enhanced thumbnail upload:", {
      title: imageData.title,
      category: imageData.category_name,
      has_small_thumb: !!imageData.thumbnail_small_url,
      has_medium_thumb: !!imageData.thumbnail_medium_url,
      has_large_thumb: !!imageData.thumbnail_large_url,
      file_size: imageData.original_file_size
        ? `${(imageData.original_file_size / (1024 * 1024)).toFixed(2)}MB`
        : "unknown",
    })

    const supabase = createSupabaseServerClient()

    const categoryName = imageData.category_name?.trim() || "Uncategorized"
    console.log("[v0] Using category name:", categoryName)

    // Get or create category
    const categoryResult = await supabase.from("categories").select("id").eq("name", categoryName).limit(1)

    let categoryId: string

    if (categoryResult.data && categoryResult.data.length === 0) {
      console.log("[v0] Category not found, creating new category:", categoryName)
      const newCategoryResult = await supabase
        .from("categories")
        .insert([
          {
            name: categoryName,
            description: "Auto-created category for " + categoryName,
            active: true,
          },
        ])
        .select("id")

      if (!newCategoryResult.data || newCategoryResult.data.length === 0) {
        console.error("[v0] Failed to create category:", newCategoryResult.error)
        return {
          success: false,
          error: "Failed to create category: " + (newCategoryResult.error?.message || "Unknown error"),
        }
      }

      categoryId = newCategoryResult.data[0].id
    } else {
      if (!categoryResult.data || categoryResult.data.length === 0) {
        console.error("[v0] Category query returned null data")
        return { success: false, error: "Failed to find or create category" }
      }
      categoryId = categoryResult.data[0].id
    }

    console.log("[v0] Looking up licenses...")

    // First, get all available licenses to debug
    const allLicensesResult = await supabase.from("licenses").select("id, name").order("created_at")
    console.log("[v0] All available licenses:", allLicensesResult.data)

    if (!allLicensesResult.data || allLicensesResult.data.length === 0) {
      console.error("[v0] No licenses found in database")
      return {
        success: false,
        error: "No licenses found. Please add at least one license to the system.",
      }
    }

    // Try to find a "Personal" license first, then "Standard", then any license
    let licenseId: string | null = null

    const personalLicense = allLicensesResult.data.find((license) => license.name.toLowerCase().includes("personal"))

    if (personalLicense) {
      licenseId = personalLicense.id
      console.log("[v0] Using Personal license:", personalLicense.name)
    } else {
      const standardLicense = allLicensesResult.data.find((license) => license.name.toLowerCase().includes("standard"))

      if (standardLicense) {
        licenseId = standardLicense.id
        console.log("[v0] Using Standard license:", standardLicense.name)
      } else {
        // Use the first available license
        licenseId = allLicensesResult.data[0].id
        console.log("[v0] Using first available license:", allLicensesResult.data[0].name)
      }
    }

    if (!licenseId) {
      console.error("[v0] Could not determine license ID")
      return {
        success: false,
        error: "Could not determine license. Please check license configuration.",
      }
    }

    const { data: result, error } = await supabase
      .from("images")
      .insert([
        {
          title: imageData.title,
          description: imageData.description,
          category_id: categoryId,
          license_id: licenseId,
          price: imageData.price,
          file_path: imageData.original_file_url || imageData.image_url,
          original_url: imageData.original_file_url,
          thumbnail_small_url: imageData.thumbnail_small_url,
          thumbnail_medium_url: imageData.thumbnail_medium_url,
          thumbnail_large_url: imageData.thumbnail_large_url,
          is_featured: false,
        },
      ])
      .select("*")

    if (error) {
      console.error("[v0] Database error in createImageWithEnhancedThumbnails:", error)
      throw new Error(error.message)
    }

    if (!result || result.length === 0) {
      console.error("[v0] Image creation returned no data")
      return { success: false, error: "Failed to create image record" }
    }

    console.log("[v0] Enhanced thumbnails image created successfully:", result[0].id)
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("[v0] Error in createImageWithEnhancedThumbnails:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
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

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn(`[v0] Slow Query Alert: getImagesPaginated took ${duration}ms`)
    }

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
      error: error instanceof Error ? error.message : "Failed to fetch images",
      data: {
        images: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    }
  }
}

export async function getOrders(userEmail?: string) {
  try {
    const supabase = await createSupabaseServerClient()

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
    const supabase = await createSupabaseServerClient()
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
    const supabase = await createSupabaseServerClient()

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

    const supabase = await createSupabaseServerClient()

    const categoryResult = await supabase.from("categories").select("id").eq("name", imageData.category).limit(1)

    let categoryId: string

    if (categoryResult.data && categoryResult.data.length === 0) {
      console.log("[v0] Category not found, creating new category:", imageData.category)

      const categoryName = imageData.category?.trim()
      if (!categoryName) {
        console.log("[v0] Empty category name provided, using default")
        imageData.category = "Uncategorized"
      }

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

      if (newCategoryResult.error) {
        console.error("[v0] Failed to create category:", newCategoryResult.error)
        return {
          success: false,
          error: `Failed to create category "${imageData.category}": ${newCategoryResult.error.message}`,
        }
      }

      if (!newCategoryResult.data || newCategoryResult.data.length === 0) {
        console.error("[v0] Category creation returned no data")
        return {
          success: false,
          error: `Failed to create category "${imageData.category}". Please try again.`,
        }
      }

      categoryId = newCategoryResult.data[0].id
    } else {
      if (!categoryResult.data || categoryResult.data.length === 0) {
        console.error("[v0] Category lookup failed")
        return {
          success: false,
          error: "Failed to find or create category. Please try again.",
        }
      }
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
