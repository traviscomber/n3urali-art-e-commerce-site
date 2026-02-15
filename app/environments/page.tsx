import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CategoryHeroBlock } from '@/components/category-hero-block'
import { CategoryGalleryBlock } from '@/components/category-gallery-block'
import { RelatedCategoriesBlock } from '@/components/related-categories-block'

export const metadata: Metadata = {
  title: 'Environments - N3uralia360',
  description: '360-degree immersive environments designed for projection mapping, dome installations, and VR experiences.',
}

export const revalidate = 3600

export default async function EnvironmentsPage() {
  const supabase = await createClient()

  const { data: images } = await supabase
    .from('images')
    .select('id, title, thumbnail_medium_url, original_url, upscaled_url')
    .eq('content_category', 'environments')
    .eq('active', true)
    .order('created_at', { ascending: false })

  const imageCount = images?.length || 0

  return (
    <main className="min-h-screen w-full bg-background">
      <CategoryHeroBlock
        category="environments"
        title="Environments"
        description="360-degree immersive environments designed for projection mapping, dome installations, and VR experiences."
        imageCount={imageCount}
      />

      <CategoryGalleryBlock
        images={images || []}
        category="environments"
      />

      <RelatedCategoriesBlock currentCategory="environments" />
    </main>
  )
}
