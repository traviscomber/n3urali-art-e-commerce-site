import { createClient } from '@/lib/supabase/server'
import { TheatrePlayerClient } from '@/components/theatre-player-client'

export const metadata = {
  title: 'Theatre - N3uralia360',
  description: 'Immersive equirectangular 360° experiences.',
}

export const revalidate = 3600

export default async function TheatrePage() {
  const supabase = await createClient()

  // Fetch equirectangular images only from THEATRE/Categories/ folder in Backblaze
  // Theatre photos have content_category set (e.g., "Nature/Ocean-Surreal")
  // Filter by file_path to ensure we only get theatre photos
  const { data: images, error } = await supabase
    .from('images')
    .select('id, title, original_url, image_format, description, tags, thumbnail_medium_url, upscaled_url, content_category, file_path, created_at')
    .eq('image_format', 'equirectangular')
    .eq('active', true)
    .like('file_path', 'THEATRE/Categories/%')
    .order('content_category', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching theatre images:', error)
  }

  // Fetch collections with their images
  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen w-full bg-black">
      <TheatrePlayerClient 
        images={images || []} 
        collections={collections || []}
      />
    </main>
  )
}
