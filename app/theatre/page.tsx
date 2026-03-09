import { createClient } from '@/lib/supabase/server'
import { TheatrePlayerClient } from '@/components/theatre-player-client'

export const metadata = {
  title: 'Theatre - N3uralia360',
  description: 'Immersive equirectangular 360° experiences.',
}

export const revalidate = 3600

export default async function TheatrePage() {
  const supabase = await createClient()

  // First, let's see ALL equirectangular images in the database
  const { data: allEquirect } = await supabase
    .from('images')
    .select('id, title, file_path, active, image_format, content_category')
    .eq('image_format', 'equirectangular')

  console.log('[v0] All equirectangular images in database:', allEquirect?.length || 0)
  if (allEquirect) {
    allEquirect.forEach(img => {
      console.log('[v0] Image:', { title: img.title, file_path: img.file_path, active: img.active, content_category: img.content_category })
    })
  }

  // Fetch equirectangular images only from THEATRE/Categories/ folder in Backblaze
  const { data: images, error } = await supabase
    .from('images')
    .select('id, title, original_url, image_format, description, tags, thumbnail_medium_url, upscaled_url, content_category, file_path, active, created_at')
    .eq('image_format', 'equirectangular')
    .eq('active', true)
    .like('file_path', 'THEATRE/Categories/%')
    .order('content_category', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching theatre images:', error)
  }

  console.log('[v0] Theatre filtered images (THEATRE/Categories/%):', images?.length || 0)
  if (images && images.length > 0) {
    images.forEach(img => {
      console.log('[v0] Found theatre image:', { title: img.title, file_path: img.file_path, category: img.content_category })
    })
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
