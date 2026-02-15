import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { HeroHeader } from "@/components/hero-header"
import { HeroIntro } from "@/components/hero-intro"
import { HeroVideo } from "@/components/hero-video"
import { HeroCTA } from "@/components/hero-cta"
import { ImageGridFeatured } from "@/components/image-grid-featured"
import { SectionOrganizer } from "@/components/section-organizer"

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

export default async function HomePage() {
  const supabase = await createClient()

  // Get featured images
  const { data: featuredImages } = await supabase
    .from("images")
    .select("id, title, file_path, original_url, upscaled_url, price, image_format, thumbnail_medium_url")
    .eq("featured_collection", true)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <main className="min-h-screen w-full bg-background">
      {/* Hero Block Section */}
      <HeroHeader />
      <HeroIntro />
      <HeroVideo />
      <HeroCTA />

      {/* Featured Grid Section */}
      <ImageGridFeatured 
        images={featuredImages || []} 
        title="Featured Works"
      />

      {/* Navigation Section */}
      <SectionOrganizer />
    </main>
  )
}
