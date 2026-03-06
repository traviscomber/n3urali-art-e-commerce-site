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

  const mythicLabels = [
    'El Tayukú Presence',
    'Halloween in Lego City',
    'Vibrant Ritual of New Caledonia',
    'Hages of Blue Ocean',
    'Angry Wind Spirit',
  ]

  const mythicCategories = [
    { name: 'Asian', id: 'asian' },
    { name: 'Mesoamerican', id: 'mesoamerican' },
    { name: 'Greek', id: 'greek' },
    { name: 'Egyptian', id: 'egyptian' },
  ]

  const artBannerUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArtBackg-MIwtTMvWE0TRmQidtELMbTop8VeRAE.png'

  const artImages = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt1-JHfKxVu8FQv8LdNqFTQmWvLqG3gGfP.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt2-LK0xH3j2YvMdKpQrStUvWxYzA4bHiS.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt3-MN1yI4k3ZwNeQrSwTuVwXzYbB5cIjT.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt4-OP2zJ5l4AxOfRsTxUvWxYaCc6dJkU.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt5-PQ3aK6m5ByPgSuTyVwXyZbDd7eKlV.png',
  ]

  const artLabels = [
    'Prismatic Sky',
    'Neon Dreams',
    'Geometric Harmony',
    'Cosmic Dance',
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
      {!selectedNatureCategory && (
        <>
          {/* Intro Section */}
          <section className="w-full max-w-full overflow-hidden py-12 sm:py-16 md:py-24 px-4 sm:px-8 lg:px-12 border-b border-slate-700">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-slate-400 leading-tight mb-3 sm:mb-4">Environments</h1>
              <p className="text-slate-500 text-xs sm:text-sm md:text-base leading-relaxed">Immersive dome worlds across nature, heritage, mythology and art.</p>
            </div>
          </section>

          {/* Nature Section */}
          <section id="nature" className="w-full max-w-full overflow-hidden border-b border-slate-700 scroll-mt-0">
            <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatBackg-nLk3xYz9vWuSmQrTpUsVwXyZaB1cJ2.png"
                alt="Nature"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 bg-black/40">
                <div className="flex flex-col gap-2 sm:gap-4 max-w-2xl">
                  <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100 leading-tight">Nature</h2>
                  <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">Explore Earth's most magnificent environments through immersive dome experiences.</p>
                </div>
              </div>
            </div>

            <div className="relative w-full overflow-x-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 border-b border-slate-700">
              <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-min md:min-w-0">
                <button className="text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0">
                  <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                </button>
                {natureCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedNatureCategory(category.id)}
                    className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap"
                  >
                    {category.name}
                  </button>
                ))}
                <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto flex-shrink-0">
                  <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {natureCategoryImages['oceans']?.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                    <Image
                      src={item.url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 sm:p-4">
                      <p className="text-slate-100 text-xs sm:text-sm font-light line-clamp-2">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Heritage Section */}
          <section className="w-full max-w-full overflow-hidden border-b border-slate-700">
            <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsHerBackg-pMl4yZaAbCd3xRsVuTwXyZaBd2cK3E.png"
                alt="Heritage"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 bg-black/40">
                <div className="flex flex-col gap-2 sm:gap-4 max-w-2xl">
                  <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100 leading-tight">Heritage</h2>
                  <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">Journey through sacred sites and cultural landmarks around the world.</p>
                </div>
              </div>
            </div>

            <div className="relative w-full overflow-x-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 border-b border-slate-700">
              <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-min md:min-w-0">
                <button className="text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0">
                  <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                </button>
                {heritageCategories.map((category) => (
                  <button key={category.id} className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">
                    {category.name}
                  </button>
                ))}
                <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto flex-shrink-0">
                  <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500 text-sm">Heritage {idx}</div>
                  </div>
                ))}
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
                  <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100 leading-tight">Mythic</h2>
                  <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">Symbolic and dreamlike cosmology transformed into immersive dome experiences.</p>
                </div>
              </div>
            </div>

            <div className="relative w-full overflow-x-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 border-b border-slate-700">
              <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-min md:min-w-0">
                <button className="text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0">
                  <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                </button>
                {mythicCategories.map((category) => (
                  <button key={category.id} className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">
                    {category.name}
                  </button>
                ))}
                <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto flex-shrink-0">
                  <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {mythicImages.slice(0, 5).map((url, idx) => (
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
                  <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100 leading-tight">Art</h2>
                  <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">Bold, cinematic dome worlds created for live performance and immersive stages.</p>
                </div>
              </div>
            </div>

            <div className="relative w-full overflow-x-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 border-b border-slate-700">
              <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-min md:min-w-0">
                <button className="text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0">
                  <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                </button>
                {artCategories.map((category) => (
                  <button key={category.id} className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">
                    {category.name}
                  </button>
                ))}
                <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto flex-shrink-0">
                  <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {artImages.slice(0, 5).map((url, idx) => (
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
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
