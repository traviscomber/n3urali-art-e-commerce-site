import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { ClientWrapper } from "./client-wrapper"

export const metadata: Metadata = {
  title: "n3uralia360.art - Premium AI-Generated 360° Environments | Ready-to-Use Assets",
  description:
    "Stop generating, start creating. Premium 360° environments (8K-16K) powered by proprietary AI algorithms. Instant download, full commercial licensing, indemnification included. Perfect for VR/AR, game development, virtual production, metaverse, and architectural visualization. No prompts, no limits, no copyright uncertainty.",
  keywords: [
    "premium 360 assets",
    "buy 360 panorama",
    "VR game skybox",
    "licensed AI imagery",
    "360 stock photography",
    "production ready HDRI",
    "commercial 360 license",
    "virtual production backgrounds",
    "metaverse environments",
    "architectural visualization assets",
    "AI generated 360",
    "game development skybox",
    "instant download panorama",
  ],
  openGraph: {
    title: "n3uralia360.art - Premium 360° AI Assets for Professionals",
    description:
      "Instant, production-ready 360° environments. Full licensing, 16K resolution, algorithmically perfected. For VR, games, virtual production, and metaverse projects.",
    url: "https://n3uralia360.art",
    images: [
      {
        url: "https://n3uralia360.art/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "n3uralia360.art - Premium AI-Generated 360° Environments",
      },
    ],
  },
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
  console.log("[v0] Homepage load started")
  const startTime = Date.now()

  const supabase = await createClient()
  console.log("[v0] Supabase client created:", Date.now() - startTime, "ms")

  const { data: featuredImages } = await supabase
    .from("images")
    .select(
      "id, title, description, file_path, original_url, upscaled_url, price, image_format, thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url",
    )
    .eq("featured_collection", true)
    .eq("active", true)
    .order("created_at", { ascending: false })

  console.log("[v0] Featured images fetched:", Date.now() - startTime, "ms", featuredImages?.length, "images")

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

    collectionImages = shuffled.slice(0, Math.min(20, shuffled.length))
  }

  collectionImages?.forEach((img) => usedImageIds.add(img.id))

  const { data: allActiveImages } = await supabase
    .from("images")
    .select(
      "id, title, description, thumbnail_medium_url, thumbnail_small_url, thumbnail_large_url, file_path, original_url, upscaled_url, image_format, price",
    )
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(100)

  console.log("[v0] All active images fetched:", Date.now() - startTime, "ms", allActiveImages?.length, "images")

  const availableForDaily = allActiveImages?.filter((img) => !usedImageIds.has(img.id)) || []
  const dailyImages = availableForDaily.length > 0 ? getDailyImageSelection(availableForDaily, 16) : []

  console.log("[v0] Homepage data processing complete:", Date.now() - startTime, "ms")

  return (
    <ClientWrapper
      imageOfTheDay={featuredImages?.[0] || null}
      auctionImages={auctionImages || []}
      collectionImages={collectionImages || []}
      dailyImages={dailyImages}
    />
  )
}
