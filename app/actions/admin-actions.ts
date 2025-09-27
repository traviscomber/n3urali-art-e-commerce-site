"use server"

import { createClient } from "@supabase/supabase-js"
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

function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

const PERFORMANCE_MONITORING = true // Always enable for debugging

function logQueryPerformance(queryName: string, startTime: number, recordCount?: number) {
  const duration = Date.now() - startTime
  console.log(`[v0] Query Performance: ${queryName} - ${duration}ms${recordCount ? ` (${recordCount} records)` : ""}`)

  // Log slow queries (>500ms)
  if (duration > 500) {
    console.warn(`[v0] Slow Query Alert: ${queryName} took ${duration}ms`)
  }
}

const getCachedImages = unstable_cache(
  async () => {
    try {
      const supabase = createSupabaseServerClient()

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
        console.error("[v0] Error fetching images:", imagesError)
        return []
      }

      const processedImages = images.map((image: any) => {
        console.log(`[v0] Processing image ${image.id}: originalUrl=${image.original_url?.substring(0, 50)}...`)

        const thumbnailUrl =
          image.thumbnail_medium_url || image.thumbnail_small_url || image.thumbnail_large_url || image.original_url

        return {
          id: image.id,
          title: image.title || "Untitled",
          description: image.description || "",
          category_name: image.categories?.name || "Uncategorized",
          category_id: image.category_id,
          license_name: image.licenses?.name || "Standard",
          price: image.price || 0,
          original_url: image.original_url,
          thumbnail_medium_url: image.thumbnail_medium_url,
          thumbnail_small_url: image.thumbnail_small_url,
          thumbnail_large_url: image.thumbnail_large_url,
          thumbnail_url: thumbnailUrl,
          image_url: image.original_url,
          active: image.is_featured !== false,
          featured: image.is_featured,
          created_at: image.created_at,
        }
      })

      console.log("[v0] Fetched", processedImages.length, "images from database")
      return processedImages
    } catch (error) {
      console.error("[v0] Error in getCachedImages:", error)
      return []
    }
  },
  ["admin-images"],
  {
    revalidate: CACHE_REVALIDATE.IMAGES,
    tags: [CACHE_TAGS.IMAGES],
  },
)

const getCachedCategories = unstable_cache(
  async () => {
    try {
      console.log("[v0] getCachedCategories: Starting category fetch...")

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !serviceRoleKey) {
        console.error("[v0] Missing Supabase environment variables:", {
          hasUrl: !!supabaseUrl,
          hasKey: !!serviceRoleKey,
        })
        return []
      }

      const supabase = createSupabaseServerClient()
      console.log("[v0] getCachedCategories: Supabase client created")

      const { data: result, error } = await supabase.from("categories").select("*").order("name")

      if (error) {
        console.error("[v0] Database error in getCachedCategories:", error)
        return []
      }

      console.log(`[v0] getCachedCategories: Retrieved ${result?.length || 0} categories`)
      return result || []
    } catch (error) {
      console.error("[v0] Error in getCachedCategories:", error)
      return []
    }
  },
  ["categories"],
  {
    tags: [CACHE_TAGS.CATEGORIES],
    revalidate: 3600, // 1 hour
  },
)

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
      data: [],
    }
  }
}

export async function getOrders(userEmail?: string) {
  try {
    const supabase = createSupabaseServerClient()

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

export async function getLicenses() {
  try {
    const supabase = createSupabaseServerClient()
    const { data: result, error } = await supabase.from("licenses").select("*").order("name")

    if (error) {
      console.error("[v0] Database error in getLicenses:", error)
      return {
        success: false,
        error: error.message,
        data: [],
      }
    }

    console.log("[v0] getLicenses returning", result?.length || 0, "licenses")
    return { success: true, data: result || [] }
  } catch (error) {
    console.error("[v0] Get licenses error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    }
  }
}

export async function getDatabaseStats() {
  try {
    const supabase = createSupabaseServerClient()

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
    return { success: true, data: stats }
  } catch (error) {
    console.error("[v0] Database error in getDatabaseStats:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: {
        total_images: 0,
        total_categories: 0,
        total_licenses: 0,
        total_orders: 0,
        total_revenue: 0,
        featured_images: 0,
      },
    }
  }
}

export async function deleteImage(imageId: string) {
  try {
    console.log("[v0] Starting image deletion for ID:", imageId)
    const supabase = createSupabaseServerClient()

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

export async function updateImageDetails(
  imageId: string,
  details: {
    title: string
    price: number
    description: string
    category: string
    rightsType: string
  },
) {
  try {
    console.log("[v0] updateImageDetails called with:", { imageId, details })
    const supabase = createSupabaseServerClient()

    // Get category ID from category name
    const categoryResult = await supabase.from("categories").select("id").eq("name", details.category).limit(1)

    let categoryId: string
    if (categoryResult.data && categoryResult.data.length > 0) {
      categoryId = categoryResult.data[0].id
    } else {
      console.log("[v0] Category not found, creating new category:", details.category)

      const newCategoryResult = await supabase
        .from("categories")
        .insert([
          {
            name: details.category,
            description: `Auto-created category for ${details.category}`,
          },
        ])
        .select("id")

      if (newCategoryResult.data && newCategoryResult.data.length > 0) {
        categoryId = newCategoryResult.data[0].id
      } else {
        console.error("[v0] Failed to create category:", newCategoryResult.error)
        return {
          success: false,
          error: `Failed to create category "${details.category}": ${newCategoryResult.error?.message || "Unknown error"}`,
        }
      }
    }

    // Update the image
    const { data: result, error } = await supabase
      .from("images")
      .update({
        title: details.title,
        description: details.description,
        category_id: categoryId,
        price: details.price,
      })
      .eq("id", imageId)
      .select("*")

    if (error) {
      console.error("[v0] Database error in updateImageDetails:", error)
      throw new Error(error.message)
    }

    console.log("[v0] Image details updated successfully:", result[0]?.id)
    invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES, CACHE_TAGS.STATS])
    revalidatePath("/simple-admin")

    return { success: true, data: result }
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function createImageWithCategory(formData: FormData) {
  try {
    const supabase = createSupabaseServerClient()

    // Get default license
    const defaultLicense = await supabase.from("licenses").select("id").eq("name", "Non-Exclusive").limit(1)

    if (defaultLicense.data && defaultLicense.data.length > 0) {
      formData.set("license_id", defaultLicense.data[0].id)
    } else {
      // If no Non-Exclusive license, try to get any license
      const anyLicense = await supabase.from("licenses").select("id").limit(1)
      if (anyLicense.data && anyLicense.data.length > 0) {
        formData.set("license_id", anyLicense.data[0].id)
      } else {
        return {
          success: false,
          error: "No licenses found in the system. Please add at least one license.",
        }
      }
    }

    const imageData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      license_id: formData.get("license_id") as string,
      price: Number.parseFloat(formData.get("price") as string) || 0,
      image_url: formData.get("image_url") as string,
      thumbnail_url: formData.get("thumbnail_url") as string,
      resolution: (formData.get("resolution") as string) || "4096x4096",
      format: (formData.get("format") as string) || "JPG",
    }

    console.log("[v0] Starting image creation with category:", {
      ...imageData,
      image_url: imageData.image_url?.substring(0, 50) + "...",
      thumbnail_url: imageData.thumbnail_url?.substring(0, 50) + "...",
    })

    // Get or create category
    const categoryResult = await supabase.from("categories").select("id").eq("name", imageData.category).limit(1)

    let categoryId: string

    if (categoryResult.data && categoryResult.data.length > 0) {
      categoryId = categoryResult.data[0].id
    } else {
      console.log("[v0] Category not found, creating new category:", imageData.category)
      const newCategoryResult = await supabase
        .from("categories")
        .insert([
          {
            name: imageData.category,
            description: "Auto-created category for " + imageData.category,
          },
        ])
        .select("id")

      if (newCategoryResult.data && newCategoryResult.data.length > 0) {
        categoryId = newCategoryResult.data[0].id
      } else {
        console.error("[v0] Failed to create category:", newCategoryResult.error)
        return {
          success: false,
          error: `Failed to create category "${imageData.category}": ${newCategoryResult.error?.message || "Unknown error"}`,
        }
      }
    }

    // Insert the image
    const { data: result, error } = await supabase
      .from("images")
      .insert([
        {
          title: imageData.title,
          description: imageData.description,
          category_id: categoryId,
          license_id: imageData.license_id,
          price: imageData.price,
          original_url: imageData.image_url,
          file_path: imageData.image_url,
          thumbnail_small_url: imageData.thumbnail_url,
          thumbnail_medium_url: imageData.thumbnail_url,
          thumbnail_large_url: imageData.thumbnail_url,
          resolution: imageData.resolution,
          format: imageData.format,
          is_featured: false,
        },
      ])
      .select("*")

    if (error) {
      console.error("[v0] Database error in createImageWithCategory:", error)
      throw new Error(error.message)
    }

    console.log("[v0] Image created successfully with ID:", result[0]?.id)

    invalidateCache([CACHE_TAGS.IMAGES, CACHE_TAGS.CATEGORIES, CACHE_TAGS.STATS])
    revalidatePath("/simple-admin")

    return { success: true, data: result }
  } catch (error) {
    return handleDatabaseError(error, "createImageWithCategory")
  }
}
