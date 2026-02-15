import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { HomepageHero } from "@/components/homepage-hero"
import { CategoryCardsGrid } from "@/components/category-cards-grid"
import { RealitiesSection } from "@/components/realities-section"
import { EnvironmentsSection } from "@/components/environments-section"

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

  // Fetch featured image for hero
  const { data: featuredImage } = await supabase
    .from("images")
    .select("id, title, original_url, upscaled_url, thumbnail_large_url")
    .eq("featured_collection", true)
    .eq("active", true)
    .single()

  // Fetch first image from each category for the category cards
  const categories = [
    { key: 'studio', title: 'STUDIO', label: 'Production', link: '/studio', accent: 'gold' as const },
    { key: 'realities', title: 'REALITIES', label: 'Stories', link: '/realities', accent: 'purple' as const },
    { key: 'environments', title: 'FULL DOME', label: 'Environments', link: '/environments', accent: 'green' as const },
    { key: 'theatre', title: 'THEATRE', label: 'Online', link: '/theatre', accent: 'orange' as const },
  ]

  const categoryCards = await Promise.all(
    categories.map(async (cat) => {
      const { data } = await supabase
        .from("images")
        .select("id, title, original_url, upscaled_url, thumbnail_large_url")
        .eq("content_category", cat.key)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      // Use fallback images for specific categories
      const fallbackImages: Record<string, string> = {
        realities: '/images/R3alities.png',
      }

      return {
        id: cat.key,
        title: cat.title,
        label: cat.label,
        link: cat.link,
        imageUrl: data?.upscaled_url || data?.original_url || fallbackImages[cat.key] || '',
        accentColor: cat.accent,
      }
    })
  )

  return (
    <main className="min-h-screen w-full bg-black">
      {/* Homepage Hero Section */}
      <HomepageHero
        featuredImage={
          featuredImage ? {
            url: featuredImage.upscaled_url || featuredImage.original_url || '',
            alt: featuredImage.title || 'Featured work'
          } : undefined
        }
      />

      {/* Category Cards Grid */}
      <CategoryCardsGrid cards={categoryCards} />

      {/* Realities Section */}
      <RealitiesSection />

      {/* Environments Section */}
      <EnvironmentsSection />
    </main>
  )
}
