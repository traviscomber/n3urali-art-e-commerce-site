import type { Metadata } from "next"
import GalleryClient from "./gallery-client"
import { getImages, getCategories } from "@/app/actions/admin-actions"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Browse Premium 360° Assets | Licensed AI Environments for VR, Games & Production",
  description:
    "Curated collection of premium AI-generated 360° environments ready for immediate use. Heritage landmarks, futuristic cities, atmospheric variations. Full commercial licensing with indemnification. Perfect for game development, VR/AR, virtual production, metaverse, and architectural projects. 8K-16K resolution, instant download.",
  keywords: [
    "buy 360 panorama commercial license",
    "VR game environment assets",
    "licensed skybox images",
    "virtual production 360 backgrounds",
    "HDRI for architectural visualization",
    "metaverse environment assets",
    "game development skybox",
    "360 stock images commercial use",
    "heritage 360 photography",
    "futuristic panorama images",
    "licensed AI 360 imagery",
    "instant download panoramic assets",
  ],
  openGraph: {
    title: "Premium 360° Asset Gallery | Licensed for Commercial Use",
    description:
      "Browse curated, production-ready 360° environments. Instant download, full licensing, 16K resolution. Heritage, futuristic, and atmospheric collections.",
    type: "website",
    url: "https://www.n3uralia360.art/gallery",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium 360° Asset Gallery - Licensed & Production-Ready",
    description:
      "Curated AI-generated 360° environments for VR, games, and virtual production. Instant download with full commercial licensing.",
  },
  alternates: {
    canonical: "https://www.n3uralia360.art/gallery",
  },
}

export default async function GalleryPage() {
  // Fetch data on server side to prevent loading state on client
  const [imagesResult, categoriesResult] = await Promise.all([
    getImages().catch((error) => {
      console.error("Error fetching images:", error)
      return { success: false, error: error.message, data: [] }
    }),
    getCategories().catch((error) => {
      console.error("Error fetching categories:", error)
      return { success: false, error: error.message, data: [] }
    }),
  ])

  const initialImages = imagesResult.success ? imagesResult.data || [] : []
  const initialCategories = categoriesResult.success ? categoriesResult.data || [] : []

  return <GalleryClient initialImages={initialImages} initialCategories={initialCategories} />
}
