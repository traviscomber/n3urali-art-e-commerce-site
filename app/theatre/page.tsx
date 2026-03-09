import { createClient } from '@/lib/supabase/server'
import { TheatrePlayerClient } from '@/components/theatre-player-client'

export const metadata = {
  title: 'Theatre - N3uralia360',
  description: 'Immersive equirectangular 360° experiences.',
}

export const revalidate = 3600

export default async function TheatrePage() {
  const supabase = await createClient()

  // Fetch equirectangular images from Backblaze THEATRE folders
  // These are uploaded via the admin theatre photo upload with content_category set
  const { data: theatreImages } = await supabase
    .from('images')
    .select('id, title, original_url, image_format, description, tags, thumbnail_medium_url, upscaled_url, content_category, created_at')
    .eq('image_format', 'equirectangular')
    .eq('active', true)
    .like('file_path', 'THEATRE/Categories/%')
    .order('created_at', { ascending: false })

  // Also fetch legacy equirectangular images (from before THEATRE folder structure)
  const { data: legacyImages } = await supabase
    .from('images')
    .select('id, title, original_url, image_format, description, tags, thumbnail_medium_url, upscaled_url, content_category, created_at')
    .eq('image_format', 'equirectangular')
    .eq('active', true)
    .not('file_path', 'like', 'THEATRE/Categories/%')
    .order('created_at', { ascending: false })

  // Combine both sets
  const images = [...(theatreImages || []), ...(legacyImages || [])]

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
