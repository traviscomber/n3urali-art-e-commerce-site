import { createClient } from '@/lib/supabase/server'
import { TheatreCarouselPreview } from '@/components/theatre-carousel-preview'
import Link from 'next/link'

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
    <main className="min-h-screen w-full bg-black text-white">
      {/* Hero Header */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-32 max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-light mb-4 text-amber-50">Theatre</h1>
        <p className="text-xl md:text-2xl font-light text-gray-400 mb-12">A Curated Gallery of Immersive Worlds</p>
        
        <div className="space-y-6 text-gray-300 max-w-3xl">
          <p className="leading-relaxed">
            The N3urali Theatre presents a collection of visual environments designed to be experienced as living, breathing spaces. Each panoramic image is an equirectangular capture that serves as a world generation process and represents the visual foundation of future immersive productions.
          </p>
          <p className="leading-relaxed">
            The gallery can exist as a visual installation, experiencing spaces such as museums, galleries, and creative studios. Through a series of navigation modes and interactive features, visitors encounter visual environments.
          </p>
          <p className="leading-relaxed">
            The Theatre is organized into four environment domains. Each domain contains curated collections that span part of the N3urali visual universe.
          </p>
        </div>
      </section>

      {/* Category Grid - Uses first image from each category */}
      <section className="px-6 md:px-12 lg:px-20 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map((category) => {
            const categoryImage = getCategoryImage(category.id)
            return (
              <button
                key={category.id}
                className="group relative p-8 bg-gradient-to-br from-gray-900/60 to-gray-900/20 border border-gray-700 hover:border-gray-500 rounded-lg transition-all duration-300 text-left hover:scale-105 cursor-pointer overflow-hidden"
              >
                {/* Background Image from Database or Fallback */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-300"
                  style={{ backgroundImage: `url('${categoryImage}')` }}
                />
                
                {/* Content Overlay */}
                <div className="relative z-10">
                  <h3 className="text-3xl font-light mb-2 group-hover:text-amber-100 transition-colors">{category.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{category.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Access to the Gallery */}
      <section className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
        <h2 className="text-4xl font-light mb-4 text-amber-50">Access to the Gallery</h2>
        <p className="text-gray-400 mb-12 max-w-2xl">
          The Theatre architecture can be delivered in several implementations, depending on how the gallery is used.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {ACCESS_MODES.map(mode => (
            <div key={mode.id} className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg hover:border-gray-600 transition-colors">
              <h3 className="text-xl font-light mb-3">{mode.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{mode.description}</p>
              <Link href={`#${mode.id}`} className="inline-block mt-6 px-6 py-2 border border-gray-600 hover:border-amber-400 rounded text-sm transition-colors hover:text-amber-100">
                Learn More
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Showcases */}
      <section className="px-6 md:px-12 lg:px-20 py-16 max-w-7xl mx-auto">
        <div className="relative w-full rounded-lg overflow-hidden border border-gray-700 mb-12">
          {/* Showcases Image Background */}
          <div 
            className="w-full h-96 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Showcases-ecKK0TlU1ssDlpMKv8TOK79CKRdB1F.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent flex flex-col justify-center px-8 md:px-12 lg:px-20">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-amber-50">Showcases</h2>
            <p className="text-gray-200 leading-relaxed max-w-2xl mb-8">
              Collections can be presented on large displays, immersive domes, or architectural screens, allowing viewers to explore and analyze the visual environments through interactive viewing modes.
            </p>
            <div className="space-y-2 text-gray-300 text-sm max-w-2xl">
              <p>• Gallery Mode</p>
              <p>• Sequence Display</p>
              <p>• Collection and Galleries</p>
              <p>• Custom Presentations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Theatre Carousel Preview - Full Width */}
      <section className="w-full py-20">
        {images.length > 0 ? (
          <TheatreCarouselPreview images={images} collections={collections} />
        ) : (
          <div className="text-center py-20 px-6">
            <p className="text-gray-400">No theatre images available</p>
          </div>
        )}
      </section>

      {/* From Image to Environment */}
      <section className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <h3 className="text-3xl font-light mb-4 text-amber-50">From Image to Environment</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Many of the worlds presented in the Theatre began as static imagery and have been processed through innovative diffusion refinement techniques that evolve the scenes into sophisticated, immersive environments.
            </p>
            <p className="text-gray-400 text-sm">
              The Theatre functions as both a gallery and a creative laboratory.
            </p>
          </div>
          <div className="h-64 md:h-96 rounded-lg overflow-hidden border border-gray-700">
            <div className="w-full h-full bg-cover bg-center" style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1578321272176-e69f6e9ff59e?w=800&q=80)'
            }} />
          </div>
        </div>

        {/* Studio Collaboration */}
        <div className="bg-gray-900/50 border border-gray-700 p-12 md:p-16 rounded-lg">
          <h3 className="text-3xl font-light mb-6 text-amber-50">Studio Collaboration</h3>
          <p className="text-gray-300 leading-relaxed mb-8">
            Studios collaborates with artists, cultural institutions, and creative partners to transform these environments into curated experiences. Custom visualizations can be developed for specific brands, themes, or environments.
          </p>
          <Link href="#contact" className="inline-block px-8 py-3 border border-gray-600 hover:border-amber-400 rounded text-amber-100 hover:bg-amber-400/10 transition-all">
            Contact Now
          </Link>
        </div>
      </section>

      <div className="h-20" />
    </main>
  )
}
