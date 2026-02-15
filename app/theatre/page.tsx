import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CategoryHeroBlock } from '@/components/category-hero-block'
import { CategoryGalleryBlock } from '@/components/category-gallery-block'
import { RelatedCategoriesBlock } from '@/components/related-categories-block'

export const metadata: Metadata = {
  title: 'Theatre - N3uralia360',
  description: 'Performance-focused immersive experiences designed for live venues, cultural institutions, and theatrical spaces.',
}

export const revalidate = 3600

export default async function TheatrePage() {
  const supabase = await createClient()

  const { data: images } = await supabase
    .from('images')
    .select('id, title, thumbnail_medium_url, original_url, upscaled_url')
    .eq('content_category', 'theatre')
    .eq('active', true)
    .order('created_at', { ascending: false })

  const imageCount = images?.length || 0

  return (
    <main className="min-h-screen w-full bg-background">
      <CategoryHeroBlock
        category="theatre"
        title="Theatre"
        description="Performance-focused immersive experiences designed for live venues, cultural institutions, and theatrical spaces."
        imageCount={imageCount}
      />

      <CategoryGalleryBlock
        images={images || []}
        category="theatre"
      />

      <RelatedCategoriesBlock currentCategory="theatre" />
    </main>
  )
}
