'use client'

import { useState } from 'react'
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
  const [heritageCategoryIndex, setHeritageCategoryIndex] = useState(0)
  const [artCategoryIndex, setArtCategoryIndex] = useState(0)
  const [selectedNatureCategory, setSelectedNatureCategory] = useState<string | null>(null)
  const [natureCategoryIndex, setNatureCategoryIndex] = useState(0)

  const natureCategories = [
    { name: 'Oceans', id: 'oceans' },
    { name: 'Volcanoes', id: 'volcanoes' },
    { name: 'Underwater Life', id: 'underwater-life' },
    { name: 'Ice and Snow', id: 'ice-and-snow' },
  ]

  const heritageCategories = [
    { name: 'North America', id: 'north-america' },
    { name: 'South America', id: 'south-america' },
    { name: 'Asia', id: 'asia' },
    { name: 'More', id: 'more' },
  ]

  const artCategories = [
    { name: 'Architecture', id: 'architecture' },
    { name: 'Landscapes', id: 'landscapes' },
    { name: 'Geometry', id: 'geometry' },
    { name: 'Cosmic', id: 'cosmic' },
    { name: 'Abstract', id: 'abstract' },
  ]

  const mythicBannerUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMythBackg%20%282%29-UZZUeitXszDkixpZBAL3mYzMq9rEq1.png'
  const mythicImages = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth1-H84nMKGLtexvnnGTyJQiMR35z0ne2Q.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth2-5zeFMllXp1WFWUyJgvnpY8plIxwQts.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth3-mZG3PGuOFqePUhTm63gOYOXUhfDN6d.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth4-W0eVn7cqin99zRFZN90EDL8J39HY9V.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth5-HHbnx40rB7gy6IkODw4wqBQWJcPzhY.png',
  ]

  const mythicLabels = ['El Tayukú Presence', 'Halloween in Lego City', 'Vibrant Ritual of New Caledonia', 'Hages of Blue Ocean', 'Angry Wind Spirit']

  const artBannerUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArtBackg-MIwtTMvWE0TRmQidtELMbTop8VeRAE.png'
  const artImages = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt1-m4KYdc6BQcLkasgP33aW3ZFJ2nj3Fx.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt2-NPhNLdPp3q4K28r5Yv4uey9UtpHgAt.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt3-RdYjhjx4UGKt8ZAUJqVZsPYA5w4IWz.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt4-8WvAaJvzCMxtmtIkNB52e627HkLHfR.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt5-mWhVHfCKypAjRS2FHFuBjbQlGO97dV.png',
  ]

  const artLabels = ['Origami Jungle', 'Cyber Tree', 'Emerald Mandala', 'Sky with Diamonds', 'Prismatic Sky']

  const handleNextHeritageCategory = () => {
    setHeritageCategoryIndex((prev) => (prev + 1) % heritageCategories.length)
  }

  const handleNextArtCategory = () => {
    setArtCategoryIndex((prev) => (prev + 1) % artCategories.length)
  }

  return (
    <div className="w-full max-w-full overflow-hidden bg-black">
      {/* Intro Section */}
      <section className="w-full max-w-full overflow-hidden py-12 sm:py-16 md:py-24 px-4 sm:px-8 lg:px-12 border-b border-slate-700">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-slate-400 leading-tight mb-3 sm:mb-4">Explore Environments</h1>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg font-light">Immersive dome worlds from nature, culture, mythology and art.</p>
        </div>
      </section>

      {/* Nature Section - with ID anchor for navigation */}
      <section id="nature" className="w-full max-w-full overflow-hidden border-b border-slate-700 scroll-mt-16">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatBackg%20%282%29-aQPuFI2fgsRop1jCuDnxWXhAMBjCVA.png"
            alt="Nature"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-4 sm:px-8 lg:px-12">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100">Nature</h2>
            <p className="text-slate-200 text-xs sm:text-sm md:text-base mt-2">Elemental forces and natural wonders</p>
          </div>
        </div>
        <div className="px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {natureCategoryImages['oceans']?.slice(0, 5).map((item, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800">
                <Image src={item.url} alt={item.title} fill className="object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4">
                  <p className="text-white text-xs sm:text-sm font-light line-clamp-2">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section - with ID anchor for navigation */}
      <section id="culture" className="w-full max-w-full overflow-hidden border-b border-slate-700 scroll-mt-16">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultBackg%20%281%29-XbBPuSBSiwRQaM2g09DVzXHzBbTfJF.png"
            alt="Culture"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-4 sm:px-8 lg:px-12">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100">Culture</h2>
            <p className="text-slate-200 text-xs sm:text-sm md:text-base mt-2">Heritage environments and traditions</p>
          </div>
        </div>
        <div className="px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {collections.slice(0, 5).map((collection, idx) => (
              <div key={collection.id} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800">
                <div className="w-full h-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                  <p className="text-white text-xs sm:text-sm font-light text-center px-2">{collection.title || 'Culture'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mythic Section - with ID anchor for navigation */}
      <section id="mythic" className="w-full max-w-full overflow-hidden border-b border-slate-700 scroll-mt-16">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src={mythicBannerUrl}
            alt="Mythic"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-4 sm:px-8 lg:px-12">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100">Mythic</h2>
            <p className="text-slate-200 text-xs sm:text-sm md:text-base mt-2">Legendary worlds and mythological realms</p>
          </div>
        </div>
        <div className="px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {mythicImages.map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800">
                <Image src={url} alt={mythicLabels[idx]} fill className="object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4">
                  <p className="text-white text-xs sm:text-sm font-light line-clamp-2">{mythicLabels[idx]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Art Section - with ID anchor for navigation */}
      <section id="art" className="w-full max-w-full overflow-hidden border-b border-slate-700 scroll-mt-16">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src={artBannerUrl}
            alt="Art"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-4 sm:px-8 lg:px-12">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100">Art</h2>
            <p className="text-slate-200 text-xs sm:text-sm md:text-base mt-2">Creative expression and digital art</p>
          </div>
        </div>
        <div className="px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {artImages.map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800">
                <Image src={url} alt={artLabels[idx]} fill className="object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4">
                  <p className="text-white text-xs sm:text-sm font-light line-clamp-2">{artLabels[idx]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
