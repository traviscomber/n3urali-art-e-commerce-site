import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CategoryHeroBlock } from '@/components/category-hero-block'
import { CategoryGalleryBlock } from '@/components/category-gallery-block'
import { RelatedCategoriesBlock } from '@/components/related-categories-block'

export const metadata: Metadata = {
  title: 'Realities - N3uralia360',
  description: 'Digital narratives that blur the line between physical and virtual spaces, creating new cultural dimensions.',
}

export const revalidate = 3600

export default async function RealitiesPage() {
  const supabase = await createClient()

  const { data: images } = await supabase
    .from('images')
    .select('id, title, thumbnail_medium_url, original_url, upscaled_url')
    .eq('content_category', 'realities')
    .eq('active', true)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen w-full bg-background">
      <CategoryHeroBlock
        category="realities"
        title="Realities"
        description="Immersive cinematic experiences designed for full-dome installations. Seamless performance loops, VR-ready environments, and cultural narratives. Professional grade, instantly deployable."
        imageCount={images?.length || 0}
        heroImage="/museum-gallery-360-art.png"
      />

      <CategoryGalleryBlock
        images={images || []}
        category="realities"
      />

      <RelatedCategoriesBlock currentCategory="realities" />
    </main>
  )
}
