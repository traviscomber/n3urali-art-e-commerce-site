import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { ClientWrapper } from "./client-wrapper"

export const metadata: Metadata = {
  title: "n3uralia360.art - Premium 360° Imagery",
  description:
    "Curated collection of premium 360° dome and equirectangular images for VR, projection mapping, and visualization.",
}

export const revalidate = 300

function getDailyImageSelection(images: any[], count: number): any[] {
  if (images.length <= count) return images

  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()

  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000
    return x - Math.floor(x)
  }

  const indices = images.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  return indices.slice(0, count).map((i) => images[i])
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredImages } = await supabase
    .from("images")
    .select(
      "id, title, file_path, original_url, upscaled_url, price, image_format, thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url",
    )
    .eq("featured_collection", true)
    .eq("active", true)
    .order("created_at", { ascending: false })

  let imageOfTheDay = null
  if (featuredImages && featuredImages.length > 0) {
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
    const imageIndex = dayOfYear % featuredImages.length
    imageOfTheDay = featuredImages[imageIndex]
  }

  let collectionImages: typeof featuredImages = []
  if (featuredImages && featuredImages.length > 0) {
    const today = new Date()
    const weekOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (86400000 * 7))

    const shuffled = [...featuredImages]
    const seed = weekOfYear

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = ((seed + i) * 9301 + 49297) % shuffled.length
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    collectionImages = shuffled.slice(0, Math.min(20, shuffled.length))
  }

  let auctionImages: typeof featuredImages = []
  if (featuredImages && featuredImages.length > 0) {
    const today = new Date()
    const hourOfDay = today.getHours()

    const shuffled = [...featuredImages]
    const seed = hourOfDay * 1000

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = ((seed + i) * 9301 + 49297) % shuffled.length
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    auctionImages = shuffled.slice(0, Math.min(15, shuffled.length))
  }

  const { data: allActiveImages } = await supabase
    .from("images")
    .select(
      "id, title, thumbnail_medium_url, thumbnail_small_url, thumbnail_large_url, file_path, original_url, upscaled_url, image_format, price",
    )
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(50)

  const dailyImages = allActiveImages ? getDailyImageSelection(allActiveImages, 16) : []

  return (
    <ClientWrapper
      imageOfTheDay={imageOfTheDay}
      collectionImages={collectionImages || []}
      auctionImages={auctionImages || []}
      dailyImages={dailyImages}
    />
  )
}
