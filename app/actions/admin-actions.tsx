"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_cache } from "next/cache"
import { revalidatePath, revalidateTag } from "next/cache"
import { ImageUrlHandler } from "@/lib/image-url-handler"

const CACHE_TAGS = {
  IMAGES: "images",
  CATEGORIES: "categories",
  ORDERS: "orders",
  LICENSES: "licenses",
  STATS: "stats",
  TAG_CATEGORIES: "tag_categories",
  TAGS: "tags",
  IMAGE_TAGS: "image_tags",
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

function sanitizeString(str: string | null | undefined): string {
  if (!str) return ""

  try {
    // Remove or escape problematic characters
    return str
      .replace(/\\/g, "\\\\") // Escape backslashes
      .replace(/"/g, '\\"') // Escape quotes
      .replace(/\n/g, "\\n") // Escape newlines
      .replace(/\r/g, "\\r") // Escape carriage returns
      .replace(/\t/g, "\\t") // Escape tabs
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Remove control characters
      .substring(0, 10000) // Limit string length to prevent huge payloads
  } catch (error) {
    console.error("[v0] Error sanitizing string:", error)
    return ""
  }
}

function sanitizeImageData(image: any): any {
  try {
    return {
      ...image,
      title: sanitizeString(image.title),
      description: sanitizeString(image.description),
      file_path: sanitizeString(image.file_path),
      image_url: sanitizeString(image.image_url),
      thumbnail_url: sanitizeString(image.thumbnail_url),
      category_name: sanitizeString(image.category_name),
      license_name: sanitizeString(image.license_name),
      license_description: sanitizeString(image.license_description),
      original_file_url: sanitizeString(image.original_file_url), // Sanitize original_file_url
      categories: image.categories
        ? {
            ...image.categories,
            name: sanitizeString(image.categories.name),
            description: sanitizeString(image.categories.description),
          }
        : undefined,
      licenses: image.licenses
        ? {
            ...image.licenses,
            name: sanitizeString(image.licenses.name),
            description: sanitizeString(image.licenses.description),
          }
        : undefined,
    }
  } catch (error) {
    console.error("[v0] Error sanitizing image data:", error)
    return null
  }
}

const getCachedImages = unstable_cache(
  async () => {
    try {
      const supabase = await createClient()

      const { data: images, error: imagesError } = await supabase
        .from("images")
        .select(`
          id, title, description, price, file_path,
          thumbnail_large_url, thumbnail_medium_url, thumbnail_small_url, original_url,
          is_featured, created_at, updated_at, category_id, license_id, tags, original_file_url,
          image_format, featured_collection, upscaled_url
        `)
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

      const transformedData = (images || [])
        .map((item) => {
          try {
            const imageData = {
              ...item,
              // Keep all the original URLs from the database
              image_url: item.file_path,
              thumbnail_url: item.thumbnail_large_url || item.thumbnail_medium_url || item.thumbnail_small_url || item.file_path,
              active: true,
              featured: item.is_featured,
              categories: categoryMap.get(item.category_id),
              licenses: licenseMap.get(item.license_id),
              category_name: categoryMap.get(item.category_id)?.name,
              license_name: licenseMap.get(item.license_id)?.name,
              license_description: licenseMap.get(item.license_id)?.description,
            }

            console.log(`[v0] Image ${item.id} URLs:`, {
              file_path: item.file_path?.substring(0, 80),
              thumbnail_large: item.thumbnail_large_url?.substring(0, 80),
              upscaled: item.upscaled_url?.substring(0, 80),
              original: item.original_url?.substring(0, 80),
            })
            // </CHANGE>

            // Sanitize all string fields
            return sanitizeImageData(imageData)
          } catch (error) {
            console.error(`[v0] Error transforming image ${item.id}:`, error)
            return null
          }
        })
        .filter((item) => item !== null)

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
      let query = supabase.from("images").select(
        `
          id, title, description, price, file_path,
          thumbnail_large_url, thumbnail_medium_url, thumbnail_small_url, original_url,
          is_featured, created_at, updated_at, category_id, license_id, tags, original_file_url,
          image_format, featured_collection, upscaled_url
        `,
        { count: "exact" },
      )

      if (category) {
        // First get the category ID using case-insensitive match
        const { data: categoryData } = await supabase.from("categories").select("id").ilike("name", category).single()

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
        images?.map((item) => {
          return {
            ...item,
            image_url: item.file_path,
            thumbnail_url: item.thumbnail_large_url || item.thumbnail_medium_url || item.thumbnail_small_url || item.file_path,
            active: true, // Default to active since we don't have this column
            featured: item.is_featured,
            categories: categoryMap.get(item.category_id),
            licenses: licenseMap.get(item.license_id),
            category_name: categoryMap.get(item.category_id)?.name,
            license_name: licenseMap.get(item.license_id)?.name,
            license_description: licenseMap.get(item.license_id)?.description,
          }
          // </CHANGE>
        }) || []

      // Sanitize transformed data before returning
      const sanitizedData = transformedData.map(sanitizeImageData).filter((item) => item !== null)

      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / limit)

      logQueryPerformance("getCachedImagesPaginated", startTime, sanitizedData.length)

      return {
        images: sanitizedData,
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

      // Don't filter categories - return all of them
      // The display name handling is done in the UI components
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

    const filteredCategories = categories?.filter((category) => {
      const lowercaseName = category.name.toLowerCase()
      if (lowercaseName === "equirectangular" || lowercaseName === "fisheye" || lowercaseName === "standard") {
        return category.name[0] === category.name[0].toUpperCase()
      }
      return true
    })

    // Get image counts separately
    const { data: imageCounts } = await supabase.from("images").select("category_id").eq("active", true)

    // Count images per category
    const countMap = new Map()
    imageCounts?.forEach((img) => {
      const count = countMap.get(img.category_id) || 0
      countMap.set(img.category_id, count + 1)
    })

    const result =
      filteredCategories?.map((category) => ({
        ...category,
        image_count: countMap.get(category.id) || 0,
        display_name:
          category.name === "Equirectangular"
            ? "360 images"
            : category.name === "Fisheye"
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

    const { data: result, error } = await supabase.from("licenses").select("*").eq("active", true).order("name")

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

const getCachedTagCategories = unstable_cache(
  async () => {
    try {
      const supabase = await createClient()

      const { data: result, error } = await supabase
        .from("tag_categories")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })

      if (error) {
        console.error("[v0] Database error in getCachedTagCategories:", error)
        throw new Error(error.message)
      }

      console.log(`[v0] getCachedTagCategories: Retrieved ${result?.length || 0} tag categories`)
      return result || []
    } catch (error) {
      console.error("[v0] Error in getCachedTagCategories:", error)
      return []
    }
  },
  ["tag-categories"],
  {
    tags: [CACHE_TAGS.TAG_CATEGORIES],
    revalidate: CACHE_REVALIDATE.CATEGORIES,
  },
)

const getCachedTags = unstable_cache(
  async (categoryId?: string) => {
    try {
      const supabase = await createClient()

      let query = supabase
        .from("tags")
        .select(`
          *,
          tag_categories!inner(name, color, icon)
        `)
        .eq("active", true)
        .order("usage_count", { ascending: false })

      if (categoryId) {
        query = query.eq("category_id", categoryId)
      }

      const { data: result, error } = await query

      if (error) {
        console.error("[v0] Database error in getCachedTags:", error)
        throw new Error(error.message)
      }

      console.log(`[v0] getCachedTags: Retrieved ${result?.length || 0} tags`)
      return result || []
    } catch (error) {
      console.error("[v0] Error in getCachedTags:", error)
      return []
    }
  },
  ["tags"],
  {
    tags: [CACHE_TAGS.TAGS],
    revalidate: CACHE_REVALIDATE.IMAGES,
  },
)

const getCachedImageTags = unstable_cache(
  async (imageId: string) => {
    try {
      const supabase = await createClient()

      const { data: result, error } = await supabase
        .from("image_tags")
        .select(`
          *,
          tags!inner(name, slug, description, category_id),
          tags!inner(tag_categories!inner(name, color))
        `)
        .eq("image_id", imageId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Database error in getCachedImageTags:", error)
        throw new Error(error.message)
      }

      console.log(`[v0] getCachedImageTags: Retrieved ${result?.length || 0} tags for image ${imageId}`)
      return result || []
    } catch (error) {
      console.error("[v0] Error in getCachedImageTags:", error)
      return []
    }
  },
  ["image-tags"],
  {
    tags: [CACHE_TAGS.IMAGE_TAGS],
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
  category_name?: string // Made optional since we might receive category_id instead
  category_id?: string // Added category_id field
  rights_type: string
  image_url: string
  thumbnail_url: string
  price: number
  original_file_size?: number
  original_file_url?: string // Added original_file_url field
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
      original_file_url: imageData.original_file_url || "not provided", // Log original_file_url
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

    let categoryId: string

    if (imageData.category_id) {
      // If category_id is provided, use it directly
      categoryId = imageData.category_id
      console.log("[v0] Using provided category_id:", categoryId)
    } else if (imageData.category_name) {
      // If category_name is provided, look up the ID
      const categoryResult = await supabase.from("categories").select("id").eq("name", imageData.category_name).limit(1)

      if (categoryResult.data && categoryResult.data.length === 0) {
        console.log("[v0] Category not found, creating new category:", imageData.category_name)
        const newCategoryResult = await supabase
          .from("categories")
          .insert([
            {
              name: imageData.category_name,
              description: "Auto-created category for " + imageData.category_name,
            },
          ])
          .select("id")

        if (newCategoryResult.error) {
          throw new Error(newCategoryResult.error.message)
        }
        categoryId = newCategoryResult.data[0].id
      } else {
        categoryId = categoryResult.data[0].id
      }
    } else {
      return {
        success: false,
        error: "Either category_id or category_name must be provided",
      }
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
      defaultLicense = await supabase.from("licenses").select("id").eq("active", true).order("name").limit(1)
    }

    const licenseId = defaultLicense.data ? defaultLicense.data[0].id : null

    if (!licenseId) {
      console.log("[v0] No active licenses found in database")
      return { success: false, error: "No active licenses found. Please add at least one license to the system." }
    }

    console.log("[v0] Using license_id:", licenseId, "for upload")

    const sanitizedImageData = sanitizeImageData({
      title: imageData.title,
      description: imageData.description,
      category_id: categoryId,
      license_id: licenseId,
      price: imageData.price,
      file_path: imageData.image_url, // Use image_url as file_path for now
      thumbnail_url: imageData.thumbnail_url,
      original_file_url: imageData.original_file_url || null, // Include original_file_url
      is_featured: false,
      active: true,
    })

    if (!sanitizedImageData) {
      return { success: false, error: "Failed to sanitize image data." }
    }

    const { data: result, error } = await supabase
      .from("images")
      .insert([
        {
          ...sanitizedImageData,
          file_path: sanitizedImageData.image_url,
          original_file_url: sanitizedImageData.original_file_url, // Explicitly include original_file_url
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
          order_items!inner(id, license_id, price, image_id, images(title, thumbnail_url, original_file_url))
        `)
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false })
    } else {
      result = await supabase
        .from("orders")
        .select(`
          *,
          order_items!inner(id, license_id, price, image_id, images(title, thumbnail_url, original_file_url))
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
          order_items!inner(id, license_id, price, image_id, images(title, thumbnail_url, original_file_url))
        `)
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)
    } else {
      result = await supabase
        .from("orders")
        .select(`
          *,
          order_items!inner(id, license_id, price, image_id, images(title, thumbnail_url, original_file_url))
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

export async function getTagCategories() {
  try {
    const data = await getCachedTagCategories()
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Get tag categories error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    }
  }
}

export async function getTags(categoryId?: string) {
  try {
    const data = await getCachedTags(categoryId)
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Get tags error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    }
  }
}

export async function createTag(tagData: {
  name: string
  description?: string
  category_id: string
  synonyms?: string[]
  is_featured?: boolean
}) {
  try {
    console.log("[v0] Creating tag:", tagData)
    const supabase = await createClient()

    // Generate slug from name
    const slug = tagData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    const { data: result, error } = await supabase
      .from("tags")
      .insert([
        {
          name: tagData.name,
          slug: slug,
          description: tagData.description || "",
          category_id: tagData.category_id,
          synonyms: tagData.synonyms || [],
          is_featured: tagData.is_featured || false,
          active: true,
        },
      ])
      .select("*")

    if (error) {
      console.error("[v0] Database error in createTag:", error)
      throw new Error(error.message)
    }

    console.log("[v0] Tag created successfully:", result[0])

    invalidateCache([CACHE_TAGS.TAGS])
    revalidatePath("/simple-admin")

    return { success: true, data: result[0] }
  } catch (error) {
    return handleDatabaseError(error, "createTag")
  }
}

export async function updateTag(
  tagId: string,
  tagData: {
    name?: string
    description?: string
    category_id?: string
    synonyms?: string[]
    is_featured?: boolean
    active?: boolean
  },
) {
  try {
    console.log(`[v0] Updating tag ${tagId} with data:`, tagData)
    const supabase = await createClient()

    const updateData: any = { ...tagData }

    // Generate new slug if name is being updated
    if (tagData.name) {
      updateData.slug = tagData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    }

    const { data: result, error } = await supabase.from("tags").update(updateData).eq("id", tagId).select("*")

    if (error) {
      console.error("[v0] Database error in updateTag:", error)
      throw new Error(error.message)
    }

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Tag not found",
      }
    }

    console.log("[v0] Tag updated successfully:", result[0])

    invalidateCache([CACHE_TAGS.TAGS, CACHE_TAGS.IMAGE_TAGS])
    revalidatePath("/simple-admin")

    return { success: true, data: result[0] }
  } catch (error) {
    return handleDatabaseError(error, "updateTag")
  }
}

export async function deleteTag(tagId: string) {
  try {
    console.log("[v0] Starting tag deletion for ID:", tagId)
    const supabase = await createClient()

    // Check if tag is being used by any images
    const { data: imageTagsCheck, error: checkError } = await supabase
      .from("image_tags")
      .select("count")
      .eq("tag_id", tagId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("[v0] Error checking tag usage:", checkError)
      throw new Error(checkError.message)
    }

    const usageCount = Number.parseInt(imageTagsCheck?.count || "0")

    if (usageCount > 0) {
      console.log(`[v0] Cannot delete tag ${tagId}: used by ${usageCount} images`)
      return {
        success: false,
        error: `Cannot delete tag: it is used by ${usageCount} image(s). Remove the tag from all images first.`,
      }
    }

    const { data: result, error } = await supabase.from("tags").delete().eq("id", tagId).select("*")

    if (error) {
      console.error("[v0] Database error in deleteTag:", error)
      throw new Error(error.message)
    }

    if (!result || result.length === 0) {
      console.log("[v0] No tag found with ID:", tagId)
      return {
        success: false,
        error: "Tag not found",
      }
    }

    console.log("[v0] Tag deleted successfully:", result[0])

    invalidateCache([CACHE_TAGS.TAGS])
    revalidatePath("/simple-admin")

    return { success: true, data: result[0] }
  } catch (error) {
    return handleDatabaseError(error, "deleteTag")
  }
}

export async function getImageTags(imageId: string) {
  try {
    const data = await getCachedImageTags(imageId)
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Get image tags error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    }
  }
}

export async function updateImageTags(imageId: string, tagIds: string[]) {
  try {
    console.log(`[v0] Updating tags for image ${imageId}:`, tagIds)
    const supabase = await createClient()

    // First, remove all existing tags for this image
    const { error: deleteError } = await supabase.from("image_tags").delete().eq("image_id", imageId)

    if (deleteError) {
      console.error("[v0] Error removing existing image tags:", deleteError)
      throw new Error(deleteError.message)
    }

    // Then, add the new tags
    if (tagIds.length > 0) {
      const imageTagsData = tagIds.map((tagId) => ({
        image_id: imageId,
        tag_id: tagId,
        source: "manual",
        confidence: 1.0,
      }))

      const { data: result, error: insertError } = await supabase.from("image_tags").insert(imageTagsData).select("*")

      if (insertError) {
        console.error("[v0] Error inserting new image tags:", insertError)
        throw new Error(insertError.message)
      }

      console.log(`[v0] Successfully updated ${result.length} tags for image ${imageId}`)
    }

    // Update usage counts for affected tags
    await updateTagUsageCounts(tagIds)

    invalidateCache([CACHE_TAGS.IMAGE_TAGS, CACHE_TAGS.TAGS, CACHE_TAGS.IMAGES])
    revalidatePath("/simple-admin")

    return { success: true, message: `Updated ${tagIds.length} tags for image` }
  } catch (error) {
    return handleDatabaseError(error, "updateImageTags")
  }
}

export async function suggestTagsForImage(imageData: {
  title: string
  description?: string
  category_name?: string
}) {
  try {
    console.log("[v0] Generating tag suggestions for:", imageData.title)
    const supabase = await createClient()

    // Use the database function to suggest tags
    const { data: suggestions, error } = await supabase.rpc("suggest_tags_for_image", {
      image_title: imageData.title,
      image_description: imageData.description || "",
      category_name: imageData.category_name,
    })

    if (error) {
      console.error("[v0] Error generating tag suggestions:", error)
      throw new Error(error.message)
    }

    // Get the actual tag objects for the suggested tag names
    const { data: suggestedTags, error: tagsError } = await supabase
      .from("tags")
      .select("*")
      .in("name", suggestions || [])
      .eq("active", true)

    if (tagsError) {
      console.error("[v0] Error fetching suggested tags:", tagsError)
      throw new Error(tagsError.message)
    }

    console.log(`[v0] Generated ${suggestedTags?.length || 0} tag suggestions`)

    return { success: true, data: suggestedTags || [] }
  } catch (error) {
    return handleDatabaseError(error, "suggestTagsForImage")
  }
}

export async function migrateExistingTags() {
  try {
    console.log("[v0] Starting migration of existing array-based tags")
    const supabase = await createClient()

    // Call the database migration function
    const { data: result, error } = await supabase.rpc("migrate_existing_tags")

    if (error) {
      console.error("[v0] Error migrating existing tags:", error)
      throw new Error(error.message)
    }

    const migratedCount = result || 0
    console.log(`[v0] Successfully migrated ${migratedCount} tag relationships`)

    invalidateCache([CACHE_TAGS.TAGS, CACHE_TAGS.IMAGE_TAGS])
    revalidatePath("/simple-admin")

    return {
      success: true,
      message: `Successfully migrated ${migratedCount} tag relationships from array-based system`,
      data: { migrated_count: migratedCount },
    }
  } catch (error) {
    return handleDatabaseError(error, "migrateExistingTags")
  }
}

export async function createTagCategory(categoryData: {
  name: string
  description?: string
  color?: string
  icon?: string
  sort_order?: number
}) {
  try {
    console.log("[v0] Creating tag category:", categoryData)
    const supabase = await createClient()

    const { data: result, error } = await supabase
      .from("tag_categories")
      .insert([
        {
          name: categoryData.name,
          description: categoryData.description || "",
          color: categoryData.color || "#6B7280",
          icon: categoryData.icon || "Tag",
          sort_order: categoryData.sort_order || 0,
          active: true,
        },
      ])
      .select("*")

    if (error) {
      console.error("[v0] Database error in createTagCategory:", error)
      throw new Error(error.message)
    }

    console.log("[v0] Tag category created successfully:", result[0])

    invalidateCache([CACHE_TAGS.TAG_CATEGORIES])
    revalidatePath("/simple-admin")

    return { success: true, data: result[0] }
  } catch (error) {
    return handleDatabaseError(error, "createTagCategory")
  }
}

export async function bulkTagSuggestion() {
  try {
    console.log("[v0] Starting bulk tag suggestion for all images")
    const supabase = await createClient()

    // Get all images that don't have tags in the new system
    const { data: images, error: imagesError } = await supabase
      .from("images")
      .select(`
        id, title, description,
        categories!inner(name)
      `)
      .eq("active", true)

    if (imagesError) {
      console.error("[v0] Error fetching images for bulk tagging:", imagesError)
      throw new Error(imagesError.message)
    }

    if (!images || images.length === 0) {
      return {
        success: true,
        message: "No images found for bulk tag suggestion",
        data: { processed: 0, tagged: 0 },
      }
    }

    let processed = 0
    let tagged = 0

    for (const image of images) {
      try {
        // Check if image already has tags in new system
        const { data: existingTags } = await supabase.from("image_tags").select("id").eq("image_id", image.id).limit(1)

        if (existingTags && existingTags.length > 0) {
          processed++
          continue // Skip images that already have tags
        }

        // Generate suggestions for this image
        const suggestions = await suggestTagsForImage({
          title: image.title,
          description: image.description,
          category_name: image.categories?.name,
        })

        if (suggestions.success && suggestions.data.length > 0) {
          // Apply the suggested tags
          const tagIds = suggestions.data.map((tag: any) => tag.id)
          const updateResult = await updateImageTags(image.id, tagIds)

          if (updateResult.success) {
            tagged++
          }
        }

        processed++
      } catch (error) {
        console.error(`[v0] Error processing image ${image.id}:`, error)
        processed++
      }
    }

    const message = `Bulk tag suggestion completed: ${tagged} images tagged out of ${processed} processed`
    console.log(`[v0] ${message}`)

    return {
      success: true,
      message,
      data: { processed, tagged },
    }
  } catch (error) {
    return handleDatabaseError(error, "bulkTagSuggestion")
  }
}

async function updateTagUsageCounts(tagIds: string[]) {
  try {
    const supabase = await createClient()

    for (const tagId of tagIds) {
      const { data: count } = await supabase.from("image_tags").select("id", { count: "exact" }).eq("tag_id", tagId)

      await supabase
        .from("tags")
        .update({ usage_count: count || 0 })
        .eq("id", tagId)
    }
  } catch (error) {
    console.error("[v0] Error updating tag usage counts:", error)
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

export async function updateImageDetails(
  imageId: string,
  updateData: {
    title: string
    price: number
    description: string
    category: string
    rightsType: string
  },
) {
  try {
    console.log(`[v0] Updating image ${imageId} with data:`, updateData)
    const supabase = await createClient()

    const categoryResult = await supabase.from("categories").select("id").ilike("name", updateData.category).limit(1)

    if (!categoryResult.data || categoryResult.data.length === 0) {
      return {
        success: false,
        error: `Category '${updateData.category}' not found`,
      }
    }

    const categoryId = categoryResult.data[0].id

    const { data: result, error } = await supabase
      .from("images")
      .update({
        title: updateData.title,
        description: updateData.description,
        category_id: categoryId,
        price: updateData.price,
        updated_at: new Date().toISOString(),
      })
      .eq("id", imageId)
      .select("*")

    if (error) {
      console.error("[v0] Database error in updateImageDetails:", error)
      throw new Error(error.message)
    }

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Image not found",
      }
    }

    console.log("[v0] Image updated successfully:", result[0])

    invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES, CACHE_TAGS.STATS])
    revalidatePath("/simple-admin")

    return { success: true, data: result[0] }
  } catch (error) {
    return handleDatabaseError(error, "updateImageDetails")
  }
}

export async function cleanupSampleImages() {
  try {
    console.log("[v0] Starting cleanup of sample images")
    const supabase = await createClient()

    // Find images that are likely samples/placeholders
    const { data: sampleImages, error: findError } = await supabase
      .from("images")
      .select("id, title, description, file_path, original_file_url") // Include original_file_url
      .or(
        "title.ilike.%sample%,title.ilike.%placeholder%,title.ilike.%test%,description.ilike.%sample%,description.ilike.%placeholder%,file_path.ilike.%placeholder%",
      )

    if (findError) {
      console.error("[v0] Error finding sample images:", findError)
      throw new Error(findError.message)
    }

    if (!sampleImages || sampleImages.length === 0) {
      return {
        success: true,
        message: "No sample images found to cleanup",
        data: [],
      }
    }

    console.log(`[v0] Found ${sampleImages.length} sample images to delete`)

    // Check if any of these images are in orders (prevent deletion)
    const imageIds = sampleImages.map((img) => img.id)
    const { data: orderItems } = await supabase.from("order_items").select("image_id").in("image_id", imageIds)

    const protectedImageIds = new Set(orderItems?.map((item) => item.image_id) || [])
    const imagesToDelete = sampleImages.filter((img) => !protectedImageIds.has(img.id))

    if (imagesToDelete.length === 0) {
      return {
        success: true,
        message: "All sample images are protected (have orders), none deleted",
        data: [],
      }
    }

    // Delete the safe-to-delete images
    const { data: deletedImages, error: deleteError } = await supabase
      .from("images")
      .delete()
      .in(
        "id",
        imagesToDelete.map((img) => img.id),
      )
      .select("*")

    if (deleteError) {
      console.error("[v0] Error deleting sample images:", deleteError)
      throw new Error(deleteError.message)
    }

    console.log(`[v0] Successfully deleted ${deletedImages?.length || 0} sample images`)

    invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES, CACHE_TAGS.STATS])
    revalidatePath("/simple-admin")

    return {
      success: true,
      message: `Successfully deleted ${deletedImages?.length || 0} sample images${protectedImageIds.size > 0 ? ` (${protectedImageIds.size} protected by orders)` : ""}`,
      data: deletedImages || [],
    }
  } catch (error) {
    return handleDatabaseError(error, "cleanupSampleImages")
  }
}

export async function migrateFilesToOptimalStorage() {
  try {
    console.log("[v0] Starting file migration to optimal storage")
    const supabase = await createClient()

    // Get all images to analyze their storage
    const { data: images, error: fetchError } = await supabase
      .from("images")
      .select("id, title, file_path, original_file_url") // Include original_file_url

    if (fetchError) {
      console.error("[v0] Error fetching images for migration:", fetchError)
      throw new Error(fetchError.message)
    }

    if (!images || images.length === 0) {
      return {
        success: true,
        message: "No images found to migrate",
        data: { migrated: 0, skipped: 0, errors: 0, total: 0 },
      }
    }

    let migrated = 0
    let skipped = 0
    let errors = 0
    const total = images.length

    console.log(`[v0] Analyzing ${total} images for migration`)

    for (const image of images) {
      try {
        // Skip if already using optimal storage patterns
        if (
          image.file_path?.includes("uploads/high-quality/") ||
          image.file_path?.startsWith("data:image/") ||
          image.original_file_url?.startsWith("data:image/")
        ) {
          // Check original_file_url as well
          skipped++
          continue
        }

        // For now, just mark as processed since we don't have actual file size data
        // In a real implementation, you would:
        // 1. Check file size from storage
        // 2. Move files <40MB to database storage (base64)
        // 3. Keep files >40MB in Supabase storage

        console.log(`[v0] Would migrate image ${image.id}: ${image.title}`)
        migrated++
      } catch (error) {
        console.error(`[v0] Error processing image ${image.id}:`, error)
        errors++
      }
    }

    const message = `Migration analysis completed: ${migrated} files would be optimized, ${skipped} already optimal, ${errors} errors out of ${total} total files`
    console.log(`[v0] ${message}`)

    return {
      success: true,
      message,
      data: { migrated, skipped, errors, total },
    }
  } catch (error) {
    return handleDatabaseError(error, "migrateFilesToOptimalStorage")
  }
}

export async function updateImageFeaturedSettings(
  imageId: string,
  settings: {
    image_format?: "dome" | "equirectangular" | null
    featured_collection?: boolean
    upscaled_url?: string | null
  },
) {
  try {
    console.log(`[v0] Updating featured settings for image ${imageId}:`, settings)
    const supabase = await createClient()

    const { data: result, error } = await supabase
      .from("images")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", imageId)
      .select("*")

    if (error) {
      console.error("[v0] Database error in updateImageFeaturedSettings:", error)
      throw new Error(error.message)
    }

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Image not found",
      }
    }

    console.log("[v0] Image featured settings updated successfully")

    invalidateCache([CACHE_TAGS.IMAGES])
    revalidatePath("/simple-admin")
    revalidatePath("/")

    return { success: true, data: result[0] }
  } catch (error) {
    return handleDatabaseError(error, "updateImageFeaturedSettings")
  }
}

export async function bulkUpdateFeaturedCollection(imageIds: string[], featured: boolean) {
  try {
    console.log(`[v0] Bulk updating featured_collection for ${imageIds.length} images to ${featured}`)
    const supabase = await createClient()

    // If setting to featured, check the limit
    if (featured) {
      const { data: currentFeatured } = await supabase
        .from("images")
        .select("id")
        .eq("featured_collection", true)
        .eq("active", true)

      const currentCount = currentFeatured?.length || 0
      const newTotal = currentCount + imageIds.length

      if (newTotal > 20) {
        return {
          success: false,
          error: `Cannot add ${imageIds.length} images. Featured collection limit is 20 (currently ${currentCount} featured).`,
        }
      }
    }

    const { data: result, error } = await supabase
      .from("images")
      .update({
        featured_collection: featured,
        updated_at: new Date().toISOString(),
      })
      .in("id", imageIds)
      .select("id")

    if (error) {
      console.error("[v0] Database error in bulkUpdateFeaturedCollection:", error)
      throw new Error(error.message)
    }

    console.log(`[v0] Successfully updated ${result?.length || 0} images`)

    invalidateCache([CACHE_TAGS.IMAGES])
    revalidatePath("/simple-admin")
    revalidatePath("/")

    return { success: true, data: result }
  } catch (error) {
    return handleDatabaseError(error, "bulkUpdateFeaturedCollection")
  }
}

export async function getFeaturedGalleryStats() {
  try {
    const supabase = await createClient()

    const [domeResult, equirectangularResult, collectionResult] = await Promise.all([
      supabase.from("images").select("id", { count: "exact" }).eq("image_format", "dome").eq("active", true),
      supabase.from("images").select("id", { count: "exact" }).eq("image_format", "equirectangular").eq("active", true),
      supabase.from("images").select("id", { count: "exact" }).eq("featured_collection", true).eq("active", true),
    ])

    const stats = {
      dome: domeResult.count || 0,
      equirectangular: equirectangularResult.count || 0,
      collection: collectionResult.count || 0,
    }

    console.log("[v0] Featured gallery stats:", stats)

    return { success: true, stats }
  } catch (error) {
    console.error("[v0] Error getting featured gallery stats:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stats: { dome: 0, equirectangular: 0, collection: 0 },
    }
  }
}
