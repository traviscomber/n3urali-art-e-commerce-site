import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { HomepageHero } from "@/components/homepage-hero"
import { CategoryCardsGrid } from "@/components/category-cards-grid"
import { RealitiesSection } from "@/components/realities-section"
import { EnvironmentsSection } from "@/components/environments-section"
import { TheatreSection } from "@/components/theatre-section"

export const metadata: Metadata = {
  title: "n3uralia360 — Immersive Worlds. Cultural Stories.",
  description:
    "N3uralia is a cultural immersive media studio. We author experiences across dome installations, VR environments, performance loops, and spatial media. Each work begins with deep cultural research and unfolds through collaborative artistic vision.",
  keywords: [
    "immersive art",
    "cultural storytelling",
    "360 environments",
    "dome installation",
    "VR experience",
    "spatial media",
  ],
}

export const revalidate = 3600

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured collection with video URL
  const { data: featuredCollection } = await supabase
    .from("collections")
    .select("id, title, description, video_url, featured_image_url")
    .eq("is_featured", true)
    .eq("is_active", true)
    .single()

  // Fetch first image from each category for the category cards
  const categories = [
    { key: 'studio', title: 'STUDIO', label: 'Production', link: '/studio', accent: 'gold' as const },
    { key: 'realities', title: 'REALITIES', label: 'Stories', link: '/realities', accent: 'purple' as const },
    { key: 'environments', title: 'FULL DOME', label: 'Environments', link: '/environments', accent: 'green' as const },
    { key: 'theatre', title: 'THEATRE', label: 'Online', link: '/theatre', accent: 'orange' as const },
  ]

  // Fallback images for each category - using button design images
  const fallbackImages: Record<string, string | null> = {
    realities: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/R3alities%20-SfYHWLGoctbhyfsR3b6Y6eGISXCeyG.png',
    studio: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Studio-MYfrERBxbjcFc5gyFXzjZftIbU5kOt.png',
    environments: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Enve%CC%81s-EyBbx4EwgsTeVeUjU70EbUa9ZnVUDs.png',
    theatre: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatre-MypQBeV3eTXC7HBzjUM9NmWTs2cRkO.png',
  }

  const categoryCards = await Promise.all(
    categories.map(async (cat) => {
      // For theatre, always use the fallback button design image
      if (cat.key === 'theatre') {
        return {
          id: cat.key,
          title: cat.title,
          label: cat.label,
          link: cat.link,
          imageUrl: fallbackImages[cat.key],
          accentColor: cat.accent,
        }
      }

      const { data } = await supabase
        .from("images")
        .select("id, title, original_url, upscaled_url, thumbnail_large_url")
        .eq("content_category", cat.key)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      const imageUrl = data?.upscaled_url || data?.original_url || fallbackImages[cat.key]

      return {
        id: cat.key,
        title: cat.title,
        label: cat.label,
        link: cat.link,
        imageUrl: imageUrl || null,
        accentColor: cat.accent,
      }
    })
  )

  return (
    <main className="min-h-screen w-full bg-black">
      {/* Homepage Hero Section */}
      <HomepageHero
        videoUrl={featuredCollection?.video_url || 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/cogvideo_1770587069211.mp4'}
      />

      {/* Category Cards Grid */}
      <CategoryCardsGrid cards={categoryCards.filter(card => card.imageUrl)} />

      {/* Realities Section */}
      <RealitiesSection />

      {/* Environments Section */}
      <EnvironmentsSection />

      {/* Theatre Section */}
      <TheatreSection />
    </main>
  )
}
