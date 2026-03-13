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
  },
  {
    id: 'mythic',
    title: 'Mythic',
    description: 'Otherworldly dimensions drawn from mythology and speculative imagination.',
  },
  {
    id: 'culture',
    title: 'Culture',
    description: 'Historical architecture, cities and cultural landscapes across civilizations.',
  },
  {
    id: 'art',
    title: 'Art',
    description: 'Curated art galleries, surreal geometry, light and sacred structures.',
  }
]

export default async function TheatrePage() {
  const supabase = await createClient()

  // Fetch equirectangular theatre images
  const { data: imagesData, error } = await supabase
    .from('images')
    .select('id, title, original_url, image_format, description, tags, thumbnail_medium_url, upscaled_url, content_category, file_path, active, created_at')
    .eq('image_format', 'equirectangular')
    .order('created_at', { ascending: false })

  const images = imagesData || []

  if (error) {
    console.error('[v0] Error fetching theatre images:', error)
  }

  // Shuffle images to get random display
  const shuffledImages = [...images].sort(() => Math.random() - 0.5)

  // Get first image from each category for the category cards
  const imagesByCategory = (images as any[]).reduce((acc, img) => {
    const cat = img.content_category || 'Uncategorized'
    if (!acc[cat]) {
      acc[cat] = []
    }
    acc[cat].push(img)
    return acc
  }, {} as Record<string, any[]>)

  const getCategoryImage = (categoryTitle: string): string => {
    const categoryImages = imagesByCategory[categoryTitle] || []
    if (categoryImages.length > 0 && categoryImages[0].thumbnail_medium_url) {
      return categoryImages[0].thumbnail_medium_url
    }
    const fallbackMap: Record<string, string> = {
      'Nature': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatrecard1-KS7txT33WCKlyFXonD8HCCdAzxPTga.png',
      'Mythic': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatrecard3-UaaXg7KQTpFbTkm7lUNPbY2cAQTnXo.png',
      'Culture': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatrecard2-QFFV4ItZ8sqpWekmsFrL8s4rzbplUW.png',
      'Art': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatrecard4-uRigMYs3nTQDbC7kH0WYBLfYIFdcxJ.png'
    }
    return fallbackMap[categoryTitle] || ''
  }

  return (
    <main className="min-h-screen w-full bg-black text-white">
      {/* Theatre Carousel - Shows random images on load */}
      <section className="w-full">
        {images.length > 0 ? (
          <TheatreCarouselPreview 
            images={shuffledImages} 
            collections={[]}
          />
        ) : (
          <div className="text-center py-20 px-6">
            <p className="text-gray-400">Loading images from Backblaze...</p>
          </div>
        )}
      </section>

      {/* Hero Header */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-32 max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-light mb-4 text-amber-50">Theatre</h1>
        <p className="text-xl md:text-2xl font-light text-gray-400 mb-12">A Curated Gallery of Immersive Worlds</p>
        
        <div className="space-y-6 text-gray-300 max-w-3xl">
          <p className="leading-relaxed">
            The N3urali Theatre presents a collection of visual environments designed to be experienced as living, breathing spaces.
          </p>
          <p className="leading-relaxed">
            Each panoramic image is an equirectangular capture representing the visual foundation of immersive productions.
          </p>
          <p className="leading-relaxed text-sm text-gray-400">
            Explore our 4 domains below or click GO to enter any panoramic environment.
          </p>
        </div>
      </section>

      {/* Category Grid - Click to filter carousel by category */}
      <section className="px-6 md:px-12 lg:px-20 py-16 max-w-7xl mx-auto border-t border-gray-800">
        <h2 className="text-3xl font-light mb-12 text-amber-50">Explore by Domain</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map((category) => {
            const categoryImage = getCategoryImage(category.title)
            const imageCount = imagesByCategory[category.title]?.length || 0
            return (
              <div
                key={category.id}
                className="group relative p-8 bg-gradient-to-br from-gray-900/60 to-gray-900/20 border border-gray-700 hover:border-amber-400 rounded-lg transition-all duration-300 text-left hover:scale-105 cursor-pointer overflow-hidden"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-300"
                  style={{ backgroundImage: `url('${categoryImage}')` }}
                />
                
                {/* Content Overlay */}
                <div className="relative z-10">
                  <h3 className="text-3xl font-light mb-2 group-hover:text-amber-100 transition-colors">
                    {category.title}
                    {imageCount > 0 && <span className="text-sm text-gray-400 ml-2">({imageCount})</span>}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{category.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer Section */}
      <section className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto border-t border-gray-800">
        <div className="bg-gray-900/50 border border-gray-700 p-12 md:p-16 rounded-lg">
          <h2 className="text-3xl font-light mb-6 text-amber-50">Collaborate with Us</h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            The N3urali Theatre is available for installations, exhibitions, and custom immersive experiences.
          </p>
          <Link href="/contact" className="inline-block px-8 py-3 border border-amber-400 text-amber-400 hover:bg-amber-400/10 rounded transition-colors font-light">
            Get in Touch
          </Link>
        </div>
      </section>
    </main>
  )
}
