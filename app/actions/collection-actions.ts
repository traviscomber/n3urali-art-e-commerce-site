"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Collection {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  bundle_price: number
  is_auto_curated: boolean
  code: string
  is_active: boolean
  music_url?: string // Added music_url parameter
}

export interface CollectionImage {
  id: string
  position: number
  image: {
    id: string
    title: string
    description: string | null
    thumbnail_medium_url: string | null
    thumbnail_small_url: string | null
    file_path: string | null
    original_url: string | null
    price: number
    image_format: string | null
  }
}

// Get the currently active collection
export async function getActiveCollection(): Promise<{
  collection: Collection | null
  images: CollectionImage[]
}> {
  const supabase = await createClient()

  // Try to get active collection (will fail gracefully if table doesn't exist)
  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", new Date().toISOString())
    .gte("end_date", new Date().toISOString())
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle() // Changed from .single() to .maybeSingle() to return null instead of throwing error

  // If we have a valid collection, get its images
  if (collection && !collectionError) {
    const images = await getCollectionImages(collection.id)
    return { collection, images }
  }

  // Fallback: Use the old featured_collection flag system
  console.log("[v0] No scheduled collection found, falling back to featured_collection flag")
  const { data: featuredImages, error: featuredError } = await supabase
    .from("images")
    .select("*")
    .eq("featured_collection", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20)

  if (featuredError || !featuredImages) {
    console.error("[v0] Error fetching featured images:", featuredError)
    return { collection: null, images: [] }
  }

  // Transform featured images to match CollectionImage format
  const transformedImages: CollectionImage[] = featuredImages.map((img, index) => ({
    id: img.id,
    position: index + 1,
    image: {
      id: img.id,
      title: img.title,
      description: img.description,
      thumbnail_medium_url: img.thumbnail_medium_url,
      thumbnail_small_url: img.thumbnail_small_url,
      file_path: img.file_path,
      original_url: img.original_url,
      price: img.price,
      image_format: img.image_format,
    },
  }))

  return { collection: null, images: transformedImages }
}

// Get images for a specific collection
async function getCollectionImages(collectionId: string): Promise<CollectionImage[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("collection_images")
    .select(`
      id,
      position,
      image:images (
        id,
        title,
        description,
        thumbnail_medium_url,
        thumbnail_small_url,
        file_path,
        original_url,
        price,
        image_format
      )
    `)
    .eq("collection_id", collectionId)
    .order("position", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching collection images:", error)
    return []
  }

  return data as CollectionImage[]
}

// Create a new collection
export async function createCollection(data: {
  title: string
  description: string
  start_date: string
  end_date: string
  bundle_price: number
  image_ids: string[]
  code?: string // Optional, will auto-generate if not provided
  music_url?: string // Added music_url parameter
}) {
  const supabase = createAdminClient()

  // Auto-generate code if not provided
  const collectionCode = data.code || (await generateCollectionCode())

  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .insert({
      code: collectionCode,
      title: data.title,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      bundle_price: data.bundle_price,
      is_auto_curated: false,
      is_active: true,
      music_url: data.music_url || null,
    })
    .select()
    .single()

  if (collectionError) {
    return { success: false, error: collectionError.message }
  }

  // Add images to collection
  const collectionImages = data.image_ids.map((imageId, index) => ({
    collection_id: collection.id,
    image_id: imageId,
    position: index + 1,
  }))

  const { error: imagesError } = await supabase.from("collection_images").insert(collectionImages)

  if (imagesError) {
    return { success: false, error: imagesError.message }
  }

  revalidatePath("/collection")
  revalidatePath("/simple-admin")

  return { success: true, collection }
}

// Update collection
export async function updateCollection(
  collectionId: string,
  data: {
    title?: string
    description?: string
    start_date?: string
    end_date?: string
    bundle_price?: number
    is_active?: boolean
    music_url?: string | null // Added music_url parameter
  },
) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("collections").update(data).eq("id", collectionId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/collection")
  revalidatePath("/simple-admin")

  return { success: true }
}

// Delete collection
export async function deleteCollection(collectionId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("collections").delete().eq("id", collectionId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/collection")
  revalidatePath("/simple-admin")

  return { success: true }
}

// Get all collections (for admin)
export async function getAllCollections() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("collections")
    .select("*, collection_images(count)")
    .order("start_date", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching collections:", error)
    return []
  }

  return data
}

// Auto-generate collection code function
export async function generateCollectionCode(prefix = "COL"): Promise<string> {
  const supabase = createAdminClient()

  // Get the latest collection with this prefix
  const { data: collections } = await supabase
    .from("collections")
    .select("code")
    .like("code", `${prefix}-%`)
    .order("created_at", { ascending: false })
    .limit(1)

  if (!collections || collections.length === 0) {
    return `${prefix}-001`
  }

  // Extract number from last code and increment
  const lastCode = collections[0].code
  if (!lastCode) return `${prefix}-001`

  const match = lastCode.match(/-(\d+)$/)
  if (!match) return `${prefix}-001`

  const nextNumber = Number.parseInt(match[1]) + 1
  return `${prefix}-${nextNumber.toString().padStart(3, "0")}`
}

// Update collection images function for reordering/adding/removing images
export async function updateCollectionImages(collectionId: string, imageIds: string[]) {
  const supabase = createAdminClient()

  // Delete existing collection images
  const { error: deleteError } = await supabase.from("collection_images").delete().eq("collection_id", collectionId)

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  // Insert new collection images with updated positions
  const collectionImages = imageIds.map((imageId, index) => ({
    collection_id: collectionId,
    image_id: imageId,
    position: index + 1,
  }))

  const { error: insertError } = await supabase.from("collection_images").insert(collectionImages)

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  const { data: calculatedPrice, error: priceError } = await supabase.rpc(
    'calculate_collection_bundle_price',
    { collection_id_param: collectionId }
  )

  if (!priceError && calculatedPrice !== null) {
    await supabase
      .from('collections')
      .update({ 
        bundle_price: calculatedPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', collectionId)
  }

  revalidatePath("/collection")
  revalidatePath("/simple-admin")

  return { success: true }
}

// Get collection with images for editing
export async function getCollectionWithImages(collectionId: string) {
  const supabase = createAdminClient()

  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("*")
    .eq("id", collectionId)
    .single()

  if (collectionError) {
    return { success: false, error: collectionError.message, data: null }
  }

  const images = await getCollectionImages(collectionId)

  return {
    success: true,
    data: {
      ...collection,
      images,
    },
  }
}

// Bulk operations
export async function bulkUpdateCollectionStatus(collectionIds: string[], isActive: boolean) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("collections").update({ is_active: isActive }).in("id", collectionIds)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/collection")
  revalidatePath("/simple-admin")

  return { success: true }
}

export async function duplicateCollection(collectionId: string) {
  const supabase = createAdminClient()

  // Get original collection
  const { data: original, error: fetchError } = await supabase
    .from("collections")
    .select("*")
    .eq("id", collectionId)
    .single()

  if (fetchError || !original) {
    return { success: false, error: "Collection not found" }
  }

  // Get original images
  const originalImages = await getCollectionImages(collectionId)
  const imageIds = originalImages.map((ci) => ci.image.id)

  // Create duplicate with new code
  const newCode = await generateCollectionCode()
  const result = await createCollection({
    title: `${original.title} (Copy)`,
    description: original.description || "",
    start_date: original.start_date,
    end_date: original.end_date,
    bundle_price: original.bundle_price,
    image_ids: imageIds,
    code: newCode,
    music_url: original.music_url // Include music_url in the duplicate
  })

  return result
}

// Fetch collection by code with music_url
export async function getCollectionByCode(code: string) {
  const supabase = await createClient()

  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .single()

  if (collectionError || !collection) {
    return { success: false, error: "Collection not found", data: null }
  }

  const images = await getCollectionImages(collection.id)

  return {
    success: true,
    data: {
      ...collection,
      images,
    },
  }
}

// Fetch all active collections with music_url for listing page
export async function getAllActiveCollections() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching active collections:", error)
    return []
  }

  // Get image counts and first images for each collection
  const collectionsWithImages = await Promise.all(
    data.map(async (collection) => {
      const images = await getCollectionImages(collection.id)
      return {
        ...collection,
        imageCount: images.length,
        previewImages: images.slice(0, 6),
      }
    })
  )

  return collectionsWithImages
}
