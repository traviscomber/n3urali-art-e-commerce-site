import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { ClientWrapper } from "./client-wrapper"

export const metadata: Metadata = {
  title: "n3uralia360 — Immersive Worlds. Cultural Stories.",
  description:
    "N3uralia is a cultural immersive media studio. We author experiences across dome installations, VR environments, performance loops, and spatial media. Each work begins with deep cultural research and unfolds through collaborative artistic vision. Explore curated collections or commission custom immersive works for museums, planetariums, and institutions.",
  keywords: [
    "immersive art",
    "cultural storytelling",
    "360 environments",
    "dome installation",
    "VR experience",
    "performance loops",
    "spatial media",
    "cultural narratives",
    "immersive experience",
    "artistic vision",
    "contemporary art",
    "cultural research",
  ],
  openGraph: {
    title: "n3uralia360 — Immersive Worlds. Cultural Stories.",
    description:
      "A cultural media studio creating immersive experiences across dome installations, VR, performance loops, and spatial media. Human-led artistic vision meets cultural narrative.",
    url: "https://n3uralia360.art",
    images: [
      {
        url: "https://n3uralia360.art/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "n3uralia360 — Immersive Worlds",
      },
    ],
  },
}

export const revalidate = 600

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
    .select("id, title, file_path, original_url, upscaled_url, price, image_format, thumbnail_medium_url")
    .eq("featured_collection", true)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(30)

  const auctionImages: typeof featuredImages = []
  if (featuredImages && featuredImages.length > 0) {
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)

    const auctionCount = Math.min(5, featuredImages.length)
    for (let i = 0; i < auctionCount; i++) {
      const imageIndex = (dayOfYear + i) % featuredImages.length
      auctionImages.push(featuredImages[imageIndex])
    }
  }

  const remainingFeaturedImages =
    featuredImages?.filter((img) => !auctionImages.some((auctionImg) => auctionImg.id === img.id)) || []

  const usedImageIds = new Set(auctionImages.map((img) => img.id).filter(Boolean))
  let collectionImages: typeof featuredImages = []
  if (remainingFeaturedImages.length > 0) {
    const today = new Date()
    const weekOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (86400000 * 7))

    const shuffled = [...remainingFeaturedImages]
    const seed = weekOfYear

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = ((seed + i) * 9301 + 49297) % shuffled.length
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    collectionImages = shuffled.slice(0, Math.min(15, shuffled.length))
  }

  collectionImages?.forEach((img) => usedImageIds.add(img.id))

  const { data: allActiveImages } = await supabase
    .from("images")
    .select("id, title, thumbnail_medium_url, file_path, original_url, upscaled_url, image_format, price")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(30)

  const availableForDaily = allActiveImages?.filter((img) => !usedImageIds.has(img.id)) || []
  const dailyImages = availableForDaily.length > 0 ? getDailyImageSelection(availableForDaily, 12) : []

  return (
    <ClientWrapper
      imageOfTheDay={featuredImages?.[0] || null}
      auctionImages={auctionImages || []}
      collectionImages={collectionImages || []}
      dailyImages={dailyImages}
    />
  )
}
