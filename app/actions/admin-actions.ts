"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { revalidatePath } from "next/cache"

export async function bulkUpdateFeaturedCollection(imageIds: string[], featured: boolean) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("images")
      .update({ featured_collection: featured })
      .in("id", imageIds)
      .select()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update images" }
  }
}

export async function updateImageFeaturedSettings(
  imageId: string,
  settings: {
    image_format?: "dome" | "equirectangular" | null
    featured_collection?: boolean
    upscaled_url?: string | null
  }
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("images")
      .update(settings)
      .eq("id", imageId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update image" }
  }
}

export async function getFeaturedGalleryStats() {
  const supabase = await createClient()

  try {
    // Get count of dome images
    const { count: domeCount } = await supabase
      .from("images")
      .select("*", { count: "exact", head: true })
      .eq("image_format", "dome")
      .eq("active", true)

    // Get count of equirectangular images
    const { count: equirectangularCount } = await supabase
      .from("images")
      .select("*", { count: "exact", head: true })
      .eq("image_format", "equirectangular")
      .eq("active", true)

    // Get count of featured collection images
    const { count: collectionCount } = await supabase
      .from("images")
      .select("*", { count: "exact", head: true })
      .eq("featured_collection", true)
      .eq("active", true)

    return {
      success: true,
      stats: {
        dome: domeCount || 0,
        equirectangular: equirectangularCount || 0,
        collection: collectionCount || 0,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get stats",
      stats: { dome: 0, equirectangular: 0, collection: 0 },
    }
  }
}

export async function getImageById(imageId: string) {
  try {
    const supabase = await createClient()

    const { data: image, error } = await supabase
      .from("images")
      .select(`
        id,
        title,
        description,
        price,
        original_url,
        original_file_url,
        thumbnail_medium_url,
        file_path,
        active,
        is_featured,
        featured_collection,
        category_id,
        license_id,
        created_at,
        updated_at,
        categories(name),
        licenses(name)
      `)
      .eq("id", imageId)
      .single()

    if (error) {
      console.error("[v0] getImageById error:", error)
      return { success: false, error: error.message }
    }

    if (!image) {
      console.error("[v0] getImageById: No image found for ID:", imageId)
      return { success: false, error: "Image not found" }
    }

    let imageUrl = image.original_url || image.original_file_url
    
    if (!imageUrl && image.file_path) {
      // Check if file_path is already a full URL
      if (image.file_path.startsWith('http://') || image.file_path.startsWith('https://')) {
        imageUrl = image.file_path
      } else {
        // It's a relative path, construct the full URL
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${image.file_path}`
      }
    }
    
    let thumbnailUrl = image.thumbnail_medium_url
    if (!thumbnailUrl) {
      // Use imageUrl as fallback for thumbnail
      thumbnailUrl = imageUrl
    } else if (thumbnailUrl && !thumbnailUrl.startsWith('http://') && !thumbnailUrl.startsWith('https://')) {
      // Construct full URL if thumbnail is a relative path
      thumbnailUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${thumbnailUrl}`
    }

    console.log("[v0] getImageById computed URLs:", {
      imageUrl,
      thumbnailUrl,
    })

    const transformedImage = {
      id: image.id,
      title: image.title,
      description: image.description,
      price: image.price,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      category_name: image.categories?.name || 'Uncategorized',
      license_name: image.licenses?.name || 'Standard License',
      active: image.active,
      is_featured: image.is_featured,
      featured_collection: image.featured_collection,
      category_id: image.category_id,
      license_id: image.license_id,
      file_path: image.file_path,
      created_at: image.created_at,
      updated_at: image.updated_at,
    }

    return { success: true, data: transformedImage }
  } catch (error) {
    console.error("[v0] getImageById catch error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch image" 
    }
  }
}

export async function getImages() {
  try {
    const supabase = await createClient()
    const { data: images, error } = await supabase
      .from("images")
      .select(`
        id,
        title,
        description,
        price,
        original_url,
        original_file_url,
        thumbnail_medium_url,
        file_path,
        active,
        is_featured,
        featured_collection,
        category_id,
        license_id,
        created_at,
        updated_at,
        categories(name)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    const transformedImages = images?.map((image: any) => {
      // Check if file_path is already a full URL
      const isFilePathFullUrl = image.file_path?.startsWith("http://") || image.file_path?.startsWith("https://")
      
      // Compute image_url from available fields
      let imageUrl = image.original_url || image.original_file_url
      if (!imageUrl && image.file_path && isFilePathFullUrl) {
        imageUrl = image.file_path
      }
      
      // Compute thumbnail_url from available fields
      let thumbnailUrl = image.thumbnail_medium_url
      if (!thumbnailUrl) {
        // Fallback to imageUrl if no thumbnail
        thumbnailUrl = imageUrl
      }
      
      return {
        ...image,
        image_url: imageUrl, // Map to expected property name
        thumbnail_url: thumbnailUrl, // Map to expected property name
        category_name: image.categories?.name || 'Uncategorized',
      }
    }) || []

    console.log('[v0] getImages: Fetched', transformedImages.length, 'images')
    return { success: true, data: transformedImages }
  } catch (error) {
    console.error("[v0] getImages error:", error)
    return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to fetch images" }
  }
}

export async function getCategories() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("[v0] getCategories error:", error)
    return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to fetch categories" }
  }
}

export async function getLicenses() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("licenses")
      .select("*")
      .order("name", { ascending: true })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("[v0] getLicenses error:", error)
    return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to fetch licenses" }
  }
}

export async function getDatabaseStats() {
  try {
    const supabase = await createClient()

    const [imagesResult, categoriesResult, ordersResult] = await Promise.all([
      supabase.from("images").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
    ])

    return {
      success: true,
      data: {
        images: imagesResult.count || 0,
        categories: categoriesResult.count || 0,
        orders: ordersResult.count || 0,
      },
    }
  } catch (error) {
    console.error("[v0] getDatabaseStats error:", error)
    return { success: false, data: { images: 0, categories: 0, orders: 0 }, error: error instanceof Error ? error.message : "Failed to fetch stats" }
  }
}

export async function createImageWithCategoryObject(imageData: any) {
  try {
    console.log("[v0] createImageWithCategoryObject: Starting with data:", {
      title: imageData.title,
      category_id: imageData.category_id,
      has_image_url: !!imageData.image_url,
      has_thumbnail_url: !!imageData.thumbnail_url,
      has_file_path: !!imageData.file_path, // Added file_path logging
    })

    const supabase = createServiceRoleClient()

    const dbRecord = {
      title: imageData.title,
      description: imageData.description || null,
      category_id: imageData.category_id,
      license_id: imageData.license_id || null,
      price: imageData.price,
      original_url: imageData.image_url || imageData.original_url,
      original_file_url: imageData.original_file_url || null,
      thumbnail_medium_url: imageData.thumbnail_url || imageData.thumbnail_medium_url,
      file_path: imageData.file_path || imageData.image_url || 'unknown', // Fallback to image_url or 'unknown' to satisfy NOT NULL
      active: imageData.active ?? true,
      is_featured: imageData.featured ?? false,
    }

    console.log("[v0] createImageWithCategoryObject: Inserting record:", {
      ...dbRecord,
      original_url: dbRecord.original_url?.substring(0, 50) + "...",
      thumbnail_medium_url: dbRecord.thumbnail_medium_url?.substring(0, 50) + "...",
      file_path: dbRecord.file_path?.substring(0, 50) + "...", // Added file_path logging
    })

    const { data: image, error } = await supabase
      .from("images")
      .insert([dbRecord])
      .select()
      .single()

    if (error) {
      console.error("[v0] createImageWithCategoryObject: Insert error:", error)
      throw error
    }

    console.log("[v0] createImageWithCategoryObject: Success! Created image ID:", image.id)

    revalidatePath("/simple-admin")
    revalidatePath("/gallery")

    return { success: true, data: image }
  } catch (error) {
    console.error("[v0] createImageWithCategoryObject error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create image" }
  }
}

export const createImageWithCategory = createImageWithCategoryObject

export async function updateImageDetails(imageId: string, updateData: any) {
  try {
    const supabase = await createClient()

    const { data: existingImage, error: checkError } = await supabase
      .from("images")
      .select("id")
      .eq("id", imageId)
      .maybeSingle()

    if (checkError) {
      console.error("[v0] updateImageDetails check error:", checkError)
      throw checkError
    }

    if (!existingImage) {
      console.error("[v0] updateImageDetails: Image not found:", imageId)
      return { success: false, error: "Image not found. It may have been deleted." }
    }

    const { data, error } = await supabase
      .from("images")
      .update({
        title: updateData.title,
        description: updateData.description,
        price: updateData.price,
        updated_at: new Date().toISOString(),
      })
      .eq("id", imageId)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/simple-admin")
    revalidatePath("/gallery")

    return { success: true, data }
  } catch (error) {
    console.error("[v0] updateImageDetails error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update image" }
  }
}

export async function deleteImage(imageId: string) {
  try {
    const supabase = createServiceRoleClient()

    // Check if image exists first
    const { data: image, error: fetchError } = await supabase
      .from("images")
      .select("id, title")
      .eq("id", imageId)
      .single()

    if (fetchError || !image) {
      return { success: false, error: "Image not found" }
    }

    // Perform the delete
    const { error: deleteError } = await supabase
      .from("images")
      .delete()
      .eq("id", imageId)

    if (deleteError) throw deleteError

    revalidatePath("/simple-admin")
    revalidatePath("/gallery")

    return { success: true }
  } catch (error) {
    console.error("[v0] deleteImage error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete image" }
  }
}

export async function cleanupSampleImages() {
  try {
    const supabase = await createClient()

    const { data: deletedImages, error } = await supabase
      .from("images")
      .delete()
      .or("title.ilike.%sample%,title.ilike.%placeholder%,title.ilike.%test%")
      .select()

    if (error) throw error

    revalidatePath("/simple-admin")
    revalidatePath("/gallery")

    return { success: true, data: deletedImages || [], message: `Deleted ${deletedImages?.length || 0} sample images` }
  } catch (error) {
    console.error("[v0] cleanupSampleImages error:", error)
    return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to cleanup images" }
  }
}

export async function migrateFilesToOptimalStorage() {
  try {
    // Placeholder function - not yet implemented
    return {
      success: true,
      data: { migrated: 0, skipped: 0, errors: 0, total: 0 },
      message: "File migration not implemented yet"
    }
  } catch (error) {
    console.error("[v0] migrateFilesToOptimalStorage error:", error)
    return { success: false, data: { migrated: 0, skipped: 0, errors: 0, total: 0 }, error: error instanceof Error ? error.message : "Migration failed" }
  }
}

export async function migrateExistingTags() {
  try {
    // Placeholder function - not yet implemented
    return { success: true, message: "Tag migration not implemented yet" }
  } catch (error) {
    console.error("[v0] migrateExistingTags error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Tag migration failed" }
  }
}

export async function getOrders(userEmail: string) {
  try {
    const supabase = await createClient()
    
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        total_amount,
        created_at,
        user_email,
        order_items (
          id,
          price,
          images (
            id,
            title,
            thumbnail_medium_url,
            original_url
          )
        )
      `)
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data: orders || [] }
  } catch (error) {
    console.error("[v0] getOrders error:", error)
    return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to fetch orders" }
  }
}
