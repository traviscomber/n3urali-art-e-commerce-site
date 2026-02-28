import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { EnvironmentsPageClient } from '@/components/environments-page-client'

export const metadata: Metadata = {
  title: 'Environments - N3uralia360',
  description: 'Full-dome immersive environments designed for planetariums, rental domes, and experiential spaces worldwide.',
}

export const revalidate = 3600

export default async function EnvironmentsPage() {
  const supabase = await createClient()

  // Fetch collections (environments)
  const { data: collections } = await supabase
    .from('collections')
    .select('id, title, work_title, description, synopsis, code')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch environment images
  const { data: images } = await supabase
    .from('images')
    .select('id, title, thumbnail_medium_url, original_url, upscaled_url, tags, content_category')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <main className="min-h-screen w-full bg-black">
      <EnvironmentsPageClient collections={collections || []} environmentImages={images || []} />
    </main>
  )
}
