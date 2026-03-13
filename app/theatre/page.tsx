import { createClient } from '@/lib/supabase/server'
import { TheatrePageClient } from '@/components/theatre-page-client'

export const metadata = {
  title: 'Theatre - N3uralia',
  description: 'A Curated Gallery of Immersive Worlds',
}

export const revalidate = 3600

const CATEGORIES = [
  {
    id: 'nature',
    title: 'Nature',
    description: 'Immersive scenic landscapes, forests, oceans, mountains, and planetary environments.',
    color: 'from-emerald-900/40'
  },
  {
    id: 'mythic',
    title: 'Mythic',
    description: 'Otherworldly dimensions drawn from mythology and speculative imagination.',
    color: 'from-purple-900/40'
  },
  {
    id: 'culture',
    title: 'Culture',
    description: 'Historical architecture, cities and cultural landscapes across civilizations.',
    color: 'from-amber-900/40'
  },
  {
    id: 'art',
    title: 'Art',
    description: 'Curated art galleries, surreal geometry, light and sacred structures.',
    color: 'from-rose-900/40'
  }
]

const ACCESS_MODES = [
  {
    id: 'discovery',
    title: 'Discovery',
    description: 'Explore the collection freely. Perfect for casual browsing and discovery of new immersive worlds.',
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'Advanced navigation controls for design professionals seeking reference imagery or inspiration.',
  },
  {
    id: 'venue',
    title: 'Venue',
    description: 'Installation mode designed for museums, galleries, and immersive venues.',
  }
]

export default async function TheatrePage() {
  const supabase = await createClient()

  // Fetch equirectangular theatre images - get ALL equirectangular images regardless of filters
  const { data: imagesData, error } = await supabase
    .from('images')
    .select('id, title, original_url, image_format, description, tags, thumbnail_medium_url, upscaled_url, content_category, file_path, active, created_at')
    .eq('image_format', 'equirectangular')
    .order('content_category', { ascending: true })
    .order('created_at', { ascending: false })

  // Fetch collections
  const { data: collectionsData } = await supabase
    .from('collections')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const images = imagesData || []
  const collections = collectionsData || []

  if (error) console.error('[v0] Error fetching theatre images:', error)
  console.log('[v0] Total images fetched:', images.length)
  console.log('[v0] Images by category:', images.reduce((acc: any, img: any) => {
    const cat = img.content_category || 'uncategorized'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {}))
  console.log('[v0] Sample images:', images.slice(0, 3).map(img => ({ id: img.id, title: img.title, category: img.content_category, format: img.image_format })))

  // Group images by content_category to get featured images for each category
  const imagesByCategory = (images as any[]).reduce((acc, img) => {
    if (!acc[img.content_category]) {
      acc[img.content_category] = []
    }
    acc[img.content_category].push(img)
    return acc
  }, {} as Record<string, any[]>)

  // Get first image from each category or use fallback
  const getCategoryImage = (categoryId: string): string => {
    // Try to get by category ID first, then try by category title
    let categoryImages = imagesByCategory[categoryId]
    if (!categoryImages) {
      const categoryTitle = CATEGORIES.find(c => c.id === categoryId)?.title
      if (categoryTitle) {
        categoryImages = imagesByCategory[categoryTitle]
      }
    }
    categoryImages = categoryImages || []
    
    if (categoryImages.length > 0 && categoryImages[0].thumbnail_medium_url) {
      return categoryImages[0].thumbnail_medium_url
    }
    // Fallback to default images if no database images found
    const fallbackMap: Record<string, string> = {
      'nature': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatrecard1-KS7txT33WCKlyFXonD8HCCdAzxPTga.png',
      'mythic': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatrecard3-UaaXg7KQTpFbTkm7lUNPbY2cAQTnXo.png',
      'culture': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatrecard2-QFFV4ItZ8sqpWekmsFrL8s4rzbplUW.png',
      'art': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatrecard4-uRigMYs3nTQDbC7kH0WYBLfYIFdcxJ.png'
    }
    return fallbackMap[categoryId] || ''
  }

  return (
    <TheatrePageClient 
      images={images}
      collections={collections}
      imagesByCategory={imagesByCategory}
      getCategoryImage={getCategoryImage}
    />
  )
}
