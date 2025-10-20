"use server"

import { createClient } from "@/lib/supabase/server"

export interface FeaturedImage {
  id: string
  title: string
  thumbnail_small_url: string
  thumbnail_medium_url: string
  thumbnail_large_url: string
  original_url: string
  upscaled_url: string | null
  image_format: "dome" | "equirectangular" | "other"
  price: number
}

export async function getFeaturedImagesByFormat(format: "dome" | "equirectangular") {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("images")
      .select(
        "id, title, thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url, original_url, upscaled_url, image_format, price",
      )
      .eq("image_format", format)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error(`Error fetching ${format} images:`, error)
      return []
    }

    return data as FeaturedImage[]
  } catch (error) {
    console.error(`Error in getFeaturedImagesByFormat(${format}):`, error)
    return []
  }
}

export async function getFeaturedCollectionImages() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("images")
      .select(
        "id, title, thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url, original_url, upscaled_url, image_format, price",
      )
      .eq("featured_collection", true)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error fetching featured collection images:", error)
      return []
    }

    return data as FeaturedImage[]
  } catch (error) {
    console.error("Error in getFeaturedCollectionImages:", error)
    return []
  }
}
