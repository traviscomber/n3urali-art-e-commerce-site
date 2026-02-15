import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CategoryHeroBlock } from '@/components/category-hero-block'
import { CategoryGalleryBlock } from '@/components/category-gallery-block'
import { RelatedCategoriesBlock } from '@/components/related-categories-block'

export const metadata: Metadata = {
  title: 'Studio - N3uralia360',
  description: 'Creative workspace and production environment where immersive experiences come to life through collaborative artistic vision.',
}

export const revalidate = 3600

export default async function StudioPage() {
  const supabase = await createClient()

  const { data: images } = await supabase
    .from('images')
    .select('id, title, thumbnail_medium_url, original_url, upscaled_url')
    .eq('content_category', 'studio')
    .eq('active', true)
    .order('created_at', { ascending: false })

  const featuredImage = images?.[0]

  const studioFeatures = [
    'Full-dome immersive content',
    'Dome & VR environments',
    'Seamless performance loops',
    'Educational and cultural series',
    'Custom immersive productions',
  ]

  return (
    <main className="min-h-screen w-full bg-background">
      <CategoryHeroBlock
        category="studio"
        title="Studio"
        subtitle="Built to Perform"
        description="Cinematic dome stories, seamless immersive loops, and VR-ready environments — crafted for dome operators, immersive events, and live performance. Projection-ready. Dome-correct. Instantly deployable."
        features={studioFeatures}
        featuredImage={
          featuredImage ? {
            url: featuredImage.upscaled_url || featuredImage.original_url || '',
            alt: featuredImage.title || 'Studio featured work'
          } : undefined
        }
      />

      <CategoryGalleryBlock
        images={images || []}
        category="studio"
      />

      <RelatedCategoriesBlock currentCategory="studio" />
    </main>
  )
}
