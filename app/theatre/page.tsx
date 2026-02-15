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

  const featuredImage = images?.[0]

  const theatreFeatures = [
    'Live performance integration',
    'Theatre venue optimization',
    'Performance loop sequences',
    'Cultural event experiences',
    'Custom venue solutions',
  ]

  return (
    <main className="min-h-screen w-full bg-background">
      <CategoryHeroBlock
        category="theatre"
        title="Theatre"
        subtitle="Performance-Ready Experiences"
        description="Performance-focused immersive experiences designed for live venues, cultural institutions, and theatrical spaces. Built for seamless integration with live events and performances."
        features={theatreFeatures}
        featuredImage={
          featuredImage ? {
            url: featuredImage.upscaled_url || featuredImage.original_url || '',
            alt: featuredImage.title || 'Theatre featured work'
          } : undefined
        }
      />

      <CategoryGalleryBlock
        images={images || []}
        category="theatre"
      />

      <RelatedCategoriesBlock currentCategory="theatre" />
    </main>
  )
}
