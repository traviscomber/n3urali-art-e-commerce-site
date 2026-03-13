import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { LANDING_PAGE_IMAGES } from "@/lib/constants/image-urls"
import { HomepageHero } from "@/components/homepage-hero"
import { CategoryCardsGrid } from "@/components/category-cards-grid"
import { ShowsSection } from "@/components/shows-section"
import { EnvironmentsSection } from "@/components/environments-section"
import { ElementalsSection } from "@/components/elementals-section"
import { TheatreSection } from "@/components/theatre-section"
import { GrandFinaleSection } from "@/components/grand-finale-section"

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
  console.log('[v0] HomePage - Starting render')
  const supabase = await createClient()
  console.log('[v0] HomePage - Supabase client created')

  // Fetch featured collection with video URL
  let featuredCollection = null
  try {
    const { data } = await supabase
      .from("collections")
      .select("id, title, description, video_url, featured_image_url")
      .eq("is_featured", true)
      .eq("is_active", true)
      .single()
    
    featuredCollection = data
  } catch (err) {
    console.error('[v0] Error fetching featured collection:', err)
    featuredCollection = null
  }
  
  console.log('[v0] HomePage - Featured collection fetched')

  // Fallback images for each category - using button design images
  const fallbackImages: Record<string, string | null> = LANDING_PAGE_IMAGES

  // Fetch first image from each category for the category cards
  const categories = [
    { key: 'studio', title: 'STUDIO', label: 'Production', link: '/studio', accent: 'gold' as const },
    { key: 'shows', title: 'SHOWS', label: 'Stories', link: '/shows', accent: 'purple' as const },
    { key: 'environments', title: 'FULL DOME', label: 'Environments', link: '/environments', accent: 'green' as const },
    { key: 'theatre', title: 'THEATRE', label: 'Online', link: '/theatre', accent: 'orange' as const },
  ]

  console.log('[v0] HomePage - Starting category cards')
  
  const categoryCards = await Promise.all(
    categories.map(async (cat) => {
      try {
        // For theatre and shows, always use the fallback button design image
        if (cat.key === 'theatre' || cat.key === 'shows') {
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
      } catch (err) {
        console.error(`[v0] Error loading category ${cat.key}:`, err)
        return {
          id: cat.key,
          title: cat.title,
          label: cat.label,
          link: cat.link,
          imageUrl: fallbackImages[cat.key],
          accentColor: cat.accent,
        }
      }
    })
  )
  
  console.log('[v0] HomePage - Category cards complete, rendering...')

  return (
    <main className="min-h-screen w-full bg-black">
      {/* Homepage Hero Section */}
      <HomepageHero
        videoUrl={featuredCollection?.video_url || 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/cogvideo_1770587069211.mp4'}
      />

      {/* Category Cards Grid */}
      <CategoryCardsGrid cards={categoryCards.filter(card => card.imageUrl)} />

      {/* Shows Section */}
      <ShowsSection />

      {/* Environments Section */}
      <EnvironmentsSection />

      {/* Elementals Section - Nature, Culture, Mythic, Art */}
      <ElementalsSection />

      {/* Theatre Section */}
      <TheatreSection />

      {/* Grand Finale Section */}
      <GrandFinaleSection />
    </main>
  )
}
