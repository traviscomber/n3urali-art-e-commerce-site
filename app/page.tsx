import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { HeroBlock } from "@/components/hero-block-new"
import { SectionBlock } from "@/components/section-block-new"
import { FeaturedCollectionsBlock } from "@/components/featured-collections-block-new"
import { CommissionBlock } from "@/components/commission-block-new"

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

  // Fetch images for each section category
  const categories = ['studio', 'environments', 'realities', 'theatre']
  const sectionData: Record<string, any[]> = {}

  for (const category of categories) {
    const { data } = await supabase
      .from("images")
      .select("id, title, thumbnail_medium_url, original_url, upscaled_url")
      .eq("content_category", category)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(3)

    sectionData[category] = data || []
  }

  // Fetch featured collections with their images
  const { data: collections } = await supabase
    .from("collections")
    .select(
      `
      id, code, title, description,
      collection_images(
        image_id,
        images(id, title, thumbnail_medium_url, original_url, upscaled_url)
      )
    `
    )
    .eq("is_active", true)
    .limit(4)
    .order("created_at", { ascending: false })

  return (
    <main className="min-h-screen w-full bg-background">
      {/* Hero Block */}
      <HeroBlock featuredImage={featuredImage || undefined} />

      {/* Studio Section */}
      <SectionBlock
        sectionName="studio"
        title="Studio"
        description="Creative workspace and production environment where immersive experiences come to life through collaborative artistic vision."
        images={sectionData.studio}
        viewAllLink="/categories/studio"
        viewAllText="Explore Studio Works"
      />

      {/* Environments Section */}
      <SectionBlock
        sectionName="environments"
        title="Environments"
        description="360-degree immersive environments designed for projection mapping, dome installations, and VR experiences."
        images={sectionData.environments}
        viewAllLink="/categories/environments"
        viewAllText="Explore Environments"
      />

      {/* Realities Section */}
      <SectionBlock
        sectionName="realities"
        title="Realities"
        description="Digital narratives that blur the line between physical and virtual spaces, creating new cultural dimensions."
        images={sectionData.realities}
        viewAllLink="/categories/realities"
        viewAllText="Explore Realities"
      />

      {/* Theatre Section */}
      <SectionBlock
        sectionName="theatre"
        title="Theatre"
        description="Performance-focused immersive experiences designed for live venues, cultural institutions, and theatrical spaces."
        images={sectionData.theatre}
        viewAllLink="/categories/theatre"
        viewAllText="Explore Theatre"
      />

      {/* Featured Collections Block */}
      <FeaturedCollectionsBlock collections={collections || []} />

      {/* Commission Block */}
      <CommissionBlock />
    </main>
  )
}
