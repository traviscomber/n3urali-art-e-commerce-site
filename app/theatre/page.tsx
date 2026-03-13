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

const ACCESS_MODES = [
  {
    id: 'discovery',
    title: 'Discovery',
    description: 'Open access to explore collections and discover new immersive environments.',
    link: '#discovery'
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'Professional-grade access with curated content for institutions.',
    link: '#professional'
  },
  {
    id: 'venue',
    title: 'Venue',
    description: 'Venue access for installations and architectural environments.',
    link: '#venue'
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

  // Group images by main category (extract from "Category/Subcategory")
  const imagesByCategory = (images as any[]).reduce((acc, img) => {
    const fullCat = img.content_category || 'Uncategorized'
    const mainCat = fullCat.split('/')[0]
    if (!acc[mainCat]) {
      acc[mainCat] = []
    }
    acc[mainCat].push(img)
    return acc
  }, {} as Record<string, any[]>)

  const getCategoryImage = (categoryTitle: string): string => {
    // Use specific theatre card images for each category
    const cardImages: Record<string, string> = {
      'Nature': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatrecard1-Ye9WN1hlv9Mkv1RbaX6GDUFcoSfjOm.png',
      'Mythic': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatrecard3-eMkeu84pDpyyfrBdUW0ToJXXd8xlD2.png',
      'Culture': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatrecard2-D8l39s6V8WkU8ns9a9EAzeNcgiC7Ah.png',
      'Art': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Theatrecard4-glgnzD3EjP9bmcF2cjr0qOwk30dJcv.png'
    }
    return cardImages[categoryTitle] || ''
  }

  return (
    <main className="min-h-screen w-full bg-black text-white">
      {/* Hero Header Section */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-20 max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-light mb-2 text-amber-50">Theatre</h1>
        <p className="text-lg md:text-xl font-light text-gray-400 mb-8">A Curated Gallery of Immersive Worlds</p>
        
        <div className="space-y-4 text-gray-300 text-sm md:text-base max-w-3xl leading-relaxed">
          <p>
            The N3urali Theatre presents a collection of visual environments designed to be experienced as a living, breathing world generation process and represents the visual foundations of future immersive productions.
          </p>
          <p>
            The gallery can exist as a visual installation, experiencing spaces such as museums, galleries, and creative studios. Through a series of navigation modes and interactive features, visitors encounter visual environments.
          </p>
          <p>
            The Theatre is organized into four environment domains. Each domain contains curated collections that span part of the N3urali visual universe.
          </p>
        </div>
      </section>

      {/* Category Cards Grid - 2x2 Layout */}
      <section className="px-6 md:px-12 lg:px-20 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map((category) => {
            const categoryImage = getCategoryImage(category.title)
            const imageCount = imagesByCategory[category.title]?.length || 0
            return (
              <div
                key={category.id}
                className="group relative h-56 md:h-64 rounded-lg overflow-hidden border border-gray-700 hover:border-amber-400 transition-all duration-300 cursor-pointer"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity duration-300"
                  style={{ backgroundImage: `url('${categoryImage}')` }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-3xl md:text-4xl font-light mb-2 text-amber-50">
                    {category.title}
                  </h3>
                  <p className="text-gray-300 text-xs md:text-sm leading-relaxed">{category.description}</p>
                  {imageCount > 0 && (
                    <p className="text-xs text-gray-400 mt-2">{imageCount} environments</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Access to the Gallery Section */}
      <section className="px-6 md:px-12 lg:px-20 py-16 max-w-7xl mx-auto border-t border-gray-800">
        <h2 className="text-3xl md:text-4xl font-light mb-2 text-amber-50">Access to the Gallery</h2>
        <p className="text-gray-400 text-xs md:text-sm mb-12 max-w-2xl leading-relaxed">
          The Theatre architecture can be delivered in several implementations, depending on how the gallery is used. All environments are programmed on the cutting-edge visual technology platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ACCESS_MODES.map(mode => (
            <div key={mode.id} className="bg-gray-900/40 border border-gray-800 p-6 md:p-8 rounded-lg hover:border-amber-400/30 transition-colors">
              <h3 className="text-base md:text-lg font-light mb-3 text-amber-50 capitalize">{mode.title}</h3>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6">{mode.description}</p>
              <Link href={mode.link} className="text-xs font-light text-amber-400 hover:text-amber-300 transition-colors">
                Learn More →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Showcases Section */}
      <section className="px-6 md:px-12 lg:px-20 py-16 max-w-7xl mx-auto border-t border-gray-800">
        <h2 className="text-3xl md:text-4xl font-light mb-4 text-amber-50">Showcases</h2>
        <p className="text-gray-300 text-xs md:text-sm leading-relaxed max-w-2xl mb-6">
          Collections can be presented on large displays, immersive domes, or architectural screens, allowing viewers to explore and analyze the visual environments through interactive viewing modes.
        </p>
        <div className="space-y-3 text-gray-400 text-xs md:text-sm">
          <p>• Gallery Mode</p>
          <p>• Sequence Display</p>
          <p>• Collections and Galleries</p>
          <p>• Custom Presentations</p>
        </div>
      </section>

      {/* Gallery Section - Theatre Carousel */}
      <section className="w-full py-16 border-t border-gray-800">
        <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-light text-amber-50">Gallery</h2>
        </div>
        
        {images.length > 0 ? (
          <TheatreCarouselPreview 
            images={shuffledImages} 
            collections={[]}
          />
        ) : (
          <div className="text-center py-20 px-6">
            <p className="text-gray-400 text-sm">Loading images from Backblaze...</p>
          </div>
        )}
      </section>

      {/* From Image to Environment Section */}
      <section className="px-6 md:px-12 lg:px-20 py-16 max-w-7xl mx-auto border-t border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl md:text-4xl font-light mb-4 text-amber-50">From Image to Environment</h3>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed mb-4">
              Many of the worlds presented in the Theatre began as static imagery and have been processed through innovative diffusion refinement techniques that evolve the scenes into sophisticated, immersive environments.
            </p>
            <p className="text-gray-400 text-xs leading-relaxed">
              The Theatre functions as both a gallery and a creative laboratory, where visual environments are continuously refined and enhanced.
            </p>
          </div>
          <div className="h-64 md:h-80 rounded-lg overflow-hidden border border-gray-800 bg-gray-900/20">
            <div className="w-full h-full bg-cover bg-center" style={{
              backgroundImage: 'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Imatoenv-PglM2dLLJt3S1ss795wqe2XdSC3noa.png)'
            }} />
          </div>
        </div>
      </section>

      {/* Studio Collaboration Section */}
      <section className="px-6 md:px-12 lg:px-20 py-16 max-w-7xl mx-auto border-t border-gray-800">
        <h3 className="text-3xl md:text-4xl font-light mb-4 text-amber-50">Studio Collaboration</h3>
        <p className="text-gray-300 text-xs md:text-sm leading-relaxed mb-8 max-w-2xl">
          N3urali collaborates with artists, cultural institutions, and creative partners to transform these environments into curated experiences. Custom visualizations can be developed for specific brands, themes, or environments.
        </p>
        <Link href="/contact" className="inline-block px-8 py-3 border border-amber-400 text-amber-400 hover:bg-amber-400/10 rounded text-xs transition-colors font-light">
          Contact Now
        </Link>
      </section>

      <div className="h-20" />
    </main>
  )
}
