'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { natureCategoryImages } from '@/lib/constants/nature-images'

interface Collection {
  id: string
  title: string
  work_title?: string
  description?: string
  synopsis?: string
  code?: string
}

interface EnvironmentImage {
  id: string
  title: string
  thumbnail_medium_url?: string
  original_url?: string
  upscaled_url?: string
  tags?: string[]
  content_category?: string
}

interface EnvironmentsPageClientProps {
  collections: Collection[]
  environmentImages: EnvironmentImage[]
}

export function EnvironmentsPageClient({ collections, environmentImages }: EnvironmentsPageClientProps) {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  
  const [heritageCategoryIndex, setHeritageCategoryIndex] = useState(0)
  const [artCategoryIndex, setArtCategoryIndex] = useState(0)
  const [selectedNatureCategory, setSelectedNatureCategory] = useState<string | null>(null)
  const [natureCategoryIndex, setNatureCategoryIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryParam)

  useEffect(() => {
    // Scroll to the appropriate section based on category parameter
    if (categoryParam === 'culture') {
      const cultureSection = document.getElementById('culture')
      if (cultureSection) {
        setTimeout(() => {
          cultureSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    } else if (categoryParam === 'nature') {
      const natureSection = document.getElementById('nature')
      if (natureSection) {
        setTimeout(() => {
          natureSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [categoryParam])

  const natureCategories = [
    { name: 'Oceans', id: 'oceans' },
    { name: 'Volcanoes', id: 'volcanoes' },
    { name: 'Underwater Life', id: 'underwater-life' },
    { name: 'Ice and Snow', id: 'ice-and-snow' },
  ]

  const heritageCategories = [
    { name: 'North America', id: 'north-america' },
    { name: 'Polynesia', id: 'polynesia' },
    { name: 'Southeast Asia', id: 'southeast-asia' },
    { name: 'Antarctica', id: 'antarctica' },
  ]

  const artCategories = [
    { name: 'Architecture', id: 'architecture' },
    { name: 'Landscapes', id: 'landscapes' },
    { name: 'Geometry', id: 'geometry' },
    { name: 'Cosmic', id: 'cosmic' },
    { name: 'Abstract', id: 'abstract' },
  ]

  const natureBannerUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatBackg%20%282%29-aQPuFI2fgsRop1jCuDnxWXhAMBjCVA.png'
  const heritageNatureBannerUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultBackg%20%281%29-XbBPuSBSiwRQaM2g09DVzXHzBbTfJF.png'
  const mythicBannerUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMythBackg%20%282%29-UZZUeitXszDkixpZBAL3mYzMq9rEq1.png'
  const artBannerUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArtBackg-MIwtTMvWE0TRmQidtELMbTop8VeRAE.png'

  const natureImages = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat1-jbOpQIT9umn9y7vmiWYSkJd1wAVeZL.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat2-aock6r4YqMybpqlHh9JVv7zqD3NsP3.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat3-aMSmzBJ5q8CrYxLbnDeVWdWsuOTeUe.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat4-4h11mltwVxcRoklFqCDuxcE6OEvYLW.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat5-zkNiswQ1jsZasGcNk2fStyxfNQBDIw.png',
  ]

  const natureLabels = [
    'Cosmic Ocean Vortex',
    'Majestic Coastal Cliffs',
    'Epic Coastal Storm',
    'Tropical Island Paradise',
    'Fractal Ocean Beauty',
  ]

  const heritageImages = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult1-XbBPuSBSiwRQaM2g09DVzXHzBbTfJF.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult2-DfCvEwRxYzAbOpQrStUvWxYz1234567.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult3-GhIjKlMnOpQrStUvWxYzAbCd5678901.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult4-EfGhIjKlMnOpQrStUvWxYzAbCd2345.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult5-CdEfGhIjKlMnOpQrStUvWxYzAb6789.png',
  ]

  const heritageLabels = [
    'North America Sacred Site',
    'Polynesian Heritage',
    'Southeast Asian Temple',
    'Antarctic Explorer',
    'Indigenous Culture',
  ]

  const mythicImages = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth1-H84nMKGLtexvnnGTyJQiMR35z0ne2Q.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth2-5zeFMllXp1WFWUyJgvnpY8plIxwQts.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth3-mZG3PGuOFqePUhTm63gOYOXUhfDN6d.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth4-W0eVn7cqin99zRFZN90EDL8J39HY9V.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth5-HHbnx40rB7gy6IkODw4wqBQWJcPzhY.png',
  ]

  const mythicLabels = [
    'El Tayukú Presence',
    'Halloween in Lego City',
    'Vibrant Ritual of New Caledonia',
    'Hages of Blue Ocean',
    'Angry Wind Spirit',
  ]

  const artImages = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt1-m4KYdc6BQcLkasgP33aW3ZFJ2nj3Fx.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt2-NPhNLdPp3q4K28r5Yv4uey9UtpHgAt.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt3-RdYjhjx4UGKq5YzAbCd8EfGhIjKlMn.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt4-8WvAaJvzCMxtmtIkNB52e627HkLHfR.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt5-mWhVHfCKypAjRS2FHFuBjbQlGO97dV.png',
  ]

  const artLabels = [
    'Origami Jungle',
    'Cyber Tree',
    'Emerald Mandala',
    'Sky with Diamonds',
    'Prismatic Sky',
  ]

  const handleNextHeritageCategory = () => {
    setHeritageCategoryIndex((prev) => (prev + 1) % heritageCategories.length)
  }

  const handleNextArtCategory = () => {
    setArtCategoryIndex((prev) => (prev + 1) % artCategories.length)
  }

  return (
    <div className="w-full max-w-full overflow-hidden bg-black">
      {/* Nature Section */}
      <section id="nature" className="w-full max-w-full overflow-hidden border-b border-slate-700 scroll-mt-0">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src={natureBannerUrl}
            alt="Nature"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 bg-black/40">
            <div className="flex flex-col gap-2 sm:gap-4 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100 leading-tight">
                Nature
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
                Elemental forces of nature transform into <span className="text-cyan-400">immersive experiences</span>. Oceans, volcanoes, and cosmic landscapes await.
              </p>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 border-b border-slate-700">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-min md:min-w-0">
            <button className="text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0">
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            {natureCategories.map((cat) => (
              <button key={cat.id} className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">
                {cat.name}
              </button>
            ))}
            <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto flex-shrink-0">
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {natureImages.map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                <Image
                  src={url}
                  alt={natureLabels[idx]}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 sm:p-4">
                  <p className="text-slate-100 text-xs sm:text-sm font-light line-clamp-2">{natureLabels[idx]}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-1">
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-light text-xs sm:text-sm">
                Load More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section id="culture" className="w-full max-w-full overflow-hidden border-b border-slate-700 scroll-mt-0">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src={heritageNatureBannerUrl}
            alt="Culture"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 bg-black/40">
            <div className="flex flex-col gap-2 sm:gap-4 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100 leading-tight">
                Culture
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
                Heritage Environments are immersive journeys inspired by <span className="text-yellow-400">real cultures, architecture, symbolism, and landscapes</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 border-b border-slate-700">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-min md:min-w-0">
            <button className="text-slate-400 hover:text-yellow-400 transition-colors flex-shrink-0">
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            {heritageCategories.map((cat) => (
              <button key={cat.id} className="text-slate-400 hover:text-yellow-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">
                {cat.name}
              </button>
            ))}
            <button className="text-slate-400 hover:text-yellow-400 transition-colors ml-auto flex-shrink-0">
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {heritageImages.map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                <Image
                  src={url}
                  alt={heritageLabels[idx]}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 sm:p-4">
                  <p className="text-slate-100 text-xs sm:text-sm font-light line-clamp-2">{heritageLabels[idx]}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-1">
              <button className="text-yellow-400 hover:text-yellow-300 transition-colors font-light text-xs sm:text-sm">
                Load More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mythic Section */}
      <section className="w-full max-w-full overflow-hidden border-b border-slate-700">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src={mythicBannerUrl}
            alt="Mythic"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 bg-black/40">
            <div className="flex flex-col gap-2 sm:gap-4 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100 leading-tight">
                Mythic
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
                The Mythical Universe series transforms <span className="text-purple-400">symbolic and dreamlike cosmology</span> into immersive dome experiences.
              </p>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 border-b border-slate-700">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-min md:min-w-0">
            <button className="text-slate-400 hover:text-purple-400 transition-colors flex-shrink-0">
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            <button className="text-slate-400 hover:text-purple-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Asian</button>
            <button className="text-slate-400 hover:text-purple-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Mesoamerican</button>
            <button className="text-slate-400 hover:text-purple-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Greek</button>
            <button className="text-slate-400 hover:text-purple-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Egyptian</button>
            <button className="text-slate-400 hover:text-purple-400 transition-colors ml-auto flex-shrink-0">
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {mythicImages.map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                <Image
                  src={url}
                  alt={mythicLabels[idx]}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 sm:p-4">
                  <p className="text-slate-100 text-xs sm:text-sm font-light line-clamp-2">{mythicLabels[idx]}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-1">
              <button className="text-purple-400 hover:text-purple-300 transition-colors font-light text-xs sm:text-sm">
                Load More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Art Section */}
      <section className="w-full max-w-full overflow-hidden border-b border-slate-700">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src={artBannerUrl}
            alt="Art"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 bg-black/40">
            <div className="flex flex-col gap-2 sm:gap-4 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100 leading-tight">
                Art
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
                Performance-Ready Visual Architecture. Bold, cinematic <span className="text-orange-400">dome worlds</span> for live performance.
              </p>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 border-b border-slate-700">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-min md:min-w-0">
            <button className="text-slate-400 hover:text-orange-400 transition-colors flex-shrink-0">
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            {artCategories.map((cat) => (
              <button key={cat.id} className="text-slate-400 hover:text-orange-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">
                {cat.name}
              </button>
            ))}
            <button className="text-slate-400 hover:text-orange-400 transition-colors ml-auto flex-shrink-0">
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {artImages.map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                <Image
                  src={url}
                  alt={artLabels[idx]}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 sm:p-4">
                  <p className="text-slate-100 text-xs sm:text-sm font-light line-clamp-2">{artLabels[idx]}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-1">
              <button className="text-orange-400 hover:text-orange-300 transition-colors font-light text-xs sm:text-sm">
                Load More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
