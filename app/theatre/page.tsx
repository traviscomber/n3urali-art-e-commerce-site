import { createClient } from '@/lib/supabase/server'
import { TheatrePlayerClient } from '@/components/theatre-player-client'

export const metadata = {
  title: 'Theatre - N3uralia360',
  description: 'Immersive equirectangular 360° experiences.',
}

export const revalidate = 3600

export default async function TheatrePage() {
  const supabase = await createClient()

  // Fetch all equirectangular images (including inactive for testing)
  const { data: images, error: imagesError } = await supabase
    .from('images')
    .select('id, title, thumbnail_medium_url, original_url, upscaled_url, image_format, description, active')
    .eq('image_format', 'equirectangular')
    .order('created_at', { ascending: false })

  console.log('[v0] Theatre - Fetched images:', images?.length, 'Error:', imagesError)
  if (images) {
    images.forEach((img, i) => {
      console.log(`[v0] Theatre - Image ${i}:`, img.title, 'Active:', img.active, 'URL:', img.original_url)
    })
  }

  // Fetch collections with their images
  const { data: collections, error: collectionsError } = await supabase
    .from('collections')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  console.log('[v0] Theatre - Fetched collections:', collections?.length, 'Error:', collectionsError)

  return (
    <main className="min-h-screen w-full bg-black">
      <TheatrePlayerClient 
        images={images || []} 
        collections={collections || []}
      />
    </main>
  )
}
