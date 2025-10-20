"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Collection {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  bundle_price: number
  is_auto_curated: boolean
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
}) {
  const supabase = await createClient()

  // Create collection
  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .insert({
      title: data.title,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      bundle_price: data.bundle_price,
      is_auto_curated: false,
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
  },
) {
  const supabase = await createClient()

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
  const supabase = await createClient()

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
  const supabase = await createClient()

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
