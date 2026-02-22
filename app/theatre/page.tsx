import { createClient } from '@/lib/supabase/server'
import { TheatrePlayerClient } from '@/components/theatre-player-client'

export const metadata = {
  title: 'Theatre - N3uralia360',
  description: 'Immersive equirectangular 360° experiences.',
}

export const revalidate = 3600

export default async function TheatrePage() {
  const supabase = await createClient()

  // Fetch only equirectangular images (no videos), must be active
  // Only select minimal fields to reduce bundle size
  const { data: images } = await supabase
    .from('images')
    .select('id, title, original_url, image_format, description')
    .eq('image_format', 'equirectangular')
    .eq('active', true)
    .order('created_at', { ascending: false })

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
