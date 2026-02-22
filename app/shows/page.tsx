import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ShowsPageClient } from '@/components/shows-page-client'

export const metadata: Metadata = {
  title: 'Shows - N3uralia360',
  description: 'Cinematic dome stories featuring immersive narratives and cultural experiences designed for full-dome installations.',
}

export const revalidate = 3600

export default async function ShowsPage() {
  const supabase = await createClient()

  // Fetch collections (shows) - fetch all to ensure we get data
  const { data: collections } = await supabase
    .from('collections')
    .select('id, title, work_title, description, synopsis, code')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch teaser images - get first 4 active images (regardless of category)
  const { data: images } = await supabase
    .from('images')
    .select('id, title, thumbnail_medium_url, original_url, upscaled_url, tags, content_category')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <main className="min-h-screen w-full bg-black">
      <ShowsPageClient collections={collections || []} teaserImages={images || []} />
    </main>
  )
}
