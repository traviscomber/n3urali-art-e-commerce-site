'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import Image from 'next/image'

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

// Image URLs
const NATURE_BANNER_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatBackg%20%281%29-TLXUR5xYkTXrK8r7ahb8ZseNFWVg53.png'
const NATURE_IMAGES = [
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat1-nkk8Hy0OO5lAUZFfWloX0E7soAeK9U.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat2-JsjbkCmrWRtUS7eM4bS7btJ1v62vhx.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat3-LTyR3NMoIATIkcqUzoPaCNqwJ0JscN.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat4-rzoHjM9BDiPVOHxpm0Mo3KRXkz7dqk.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat5-kNXWZO6NmPKqOnEXPxAFy9TRHKUpyK.png',
]

const CULTURE_BANNER_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_00000000ee7071f59683d205a8420d01-MAJ7wyOFcrHAp7zpe0O3CCtNiN39jv.png'
const CULTURE_IMAGES = [
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult1-dhVGWchKNmJw81kGmXDaXIJ5cd2xFk.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult2-g8bXETDkCu4snNrPouTKozSZSfGxMl.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult3-rkJrAmWhsEN0xY7OOeNbBueEgYyjBY.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult4-fOr7dFUw2LF1ihBOtwpZSNb9txsVJq.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult5-YMhIkyjNnvCMyh91uvItbrfSuoxm5n.png',
]

const CATEGORY_IMAGES = [
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_00000000ee7071f59683d205a8420d01-MAJ7wyOFcrHAp7zpe0O3CCtNiN39jv.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_0000000084b4720eab101516c1d517ef-isrhjXPFYMJ2NRAjYnKXaqq7UFm5QK.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/T3-tKVM0mRce88hLOkXMFL3RMTfa90904.png',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/T31-icn8zhQpqszgBmYVNR57HNzAmikXcO.png',
]

const ART_FEATURED_IMAGE = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_0000000084b4720eab101516c1d517ef-isrhjXPFYMJ2NRAjYnKXaqq7UFm5QK.png'

const NATURE_LABELS = [
  'Chilled trees forest walking',
  'Tropical paradise bay',
  'Mycelia in strange',
  'Lava power',
  'Dreamy Sponges',
]

const CULTURE_LABELS = [
  'Purple sunset halo',
  'Canoe adventure',
  'Sunset over ancient temple',
  'Walking walls of Valparaiso',
  'Celestial gates',
]

export function EnvironmentsPageClient({ collections, environmentImages }: EnvironmentsPageClientProps) {
  const [heritageCategoryIndex, setHeritageCategoryIndex] = useState(0)
  const [artCategoryIndex, setArtCategoryIndex] = useState(0)

  const heritageCategories = [
    { name: 'North America', id: 'north-america' },
    { name: 'South America', id: 'south-america' },
    { name: 'Asia', id: 'asia' },
    { name: 'More', id: 'more' },
  ]

  const artCategories = [
    { name: 'Color Splash', id: 'color-splash' },
    { name: 'Dreamland', id: 'dreamland' },
    { name: 'Escher inspired', id: 'escher' },
    { name: 'More', id: 'more' },
  ]

  const handleNextHeritageCategory = () => {
    setHeritageCategoryIndex((prev) => (prev + 1) % heritageCategories.length)
  }

  const handleNextArtCategory = () => {
    setArtCategoryIndex((prev) => (prev + 1) % artCategories.length)
  }

  return (
    <div className="w-full bg-black">
      {/* Intro Section */}
      <section className="w-full py-16 px-8 lg:px-12 border-b border-slate-700">
        <div className="max-w-2xl">
          <h1 className="text-6xl lg:text-7xl font-light text-slate-400 leading-tight mb-4">
            Environments
          </h1>
          <p className="text-slate-500 text-base font-light mb-6">
            Seamless dome loops designed to charm.
          </p>
          <ul className="space-y-3">
            <li className="flex gap-3 items-start text-slate-400 text-sm">
              <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
              <span>Endless themed nights without rebuilding your show</span>
            </li>
            <li className="flex gap-3 items-start text-slate-400 text-sm">
              <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
              <span>Clean, seamless material ready to layer and mix</span>
            </li>
            <li className="flex gap-3 items-start text-slate-400 text-sm">
              <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
              <span>Ambient premium visuals that elevate any space</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Nature Section */}
      <section className="w-full border-b border-slate-700">
        {/* Full-width Banner with Overlay Text */}
        <div className="relative w-full h-80 overflow-hidden">
          <Image
            src={NATURE_BANNER_URL}
            alt="Nature"
            fill
            className="object-cover"
          />
          {/* Overlay Text */}
          <div className="absolute inset-0 flex flex-col justify-center px-12 bg-black/40">
            <div className="flex flex-col gap-4 max-w-2xl">
              <h2 className="text-6xl font-light text-slate-100 leading-tight">
                Nature
              </h2>
              <p className="text-slate-200 text-base leading-relaxed max-w-md">
                Explore real world with dreamlike immersive dome interpretations. Travel between UNESCO Sites in seconds or discover diversity of real life reimagined with <span className="text-red-400">immersive</span> creativity.
              </p>
            </div>
          </div>
        </div>

        {/* Region Navigation Tabs */}
        <div className="relative w-full flex items-center gap-8 px-12 py-8 border-b border-slate-700">
          <button className="text-slate-400 hover:text-cyan-400 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button className="text-slate-300 hover:text-cyan-400 transition-colors font-light">Oceans</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Volcanoes</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Underwater Life</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Ice and Snow</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Showcase Grid - 3 columns */}
        <div className="w-full px-12 py-12">
          <div className="grid grid-cols-3 gap-6">
            {NATURE_IMAGES.slice(0, 5).map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                <Image
                  src={url}
                  alt={NATURE_LABELS[idx]}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <p className="text-slate-100 text-sm font-light">{NATURE_LABELS[idx]}</p>
                </div>
              </div>
            ))}

            {/* Load More - spans the third column */}
            <div className="flex items-center justify-center">
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-light text-sm">
                Load More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Heritage Environments Featured Section - Culture */}
      <section className="w-full border-b border-slate-700">
        {/* Full-width Banner with Overlay Text */}
        <div className="relative w-full h-80 overflow-hidden">
          <Image
            src={CULTURE_BANNER_URL}
            alt="Culture"
            fill
            className="object-cover"
          />
          {/* Overlay Text */}
          <div className="absolute inset-0 flex flex-col justify-center px-12 bg-black/40">
            <div className="flex flex-col gap-4 max-w-2xl">
              <h2 className="text-6xl font-light text-slate-100 leading-tight">
                Culture
              </h2>
              <p className="text-slate-200 text-base leading-relaxed max-w-md">
                Heritage Environments are immersive journeys inspired by real cultures, architecture, symbolism, and landscapes.
              </p>
            </div>
          </div>
        </div>

        {/* Region Navigation Tabs */}
        <div className="relative w-full flex items-center gap-8 px-12 py-8 border-b border-slate-700">
          <button className="text-slate-400 hover:text-cyan-400 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button className="text-slate-300 hover:text-cyan-400 transition-colors font-light">North America</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Polynesia</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Southeast Asia</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Antarctica</button>
        </div>

        {/* Showcase Grid - 3 columns */}
        <div className="w-full px-12 py-12">
          <div className="grid grid-cols-3 gap-6">
            {CULTURE_IMAGES.slice(0, 5).map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                <Image
                  src={url}
                  alt={CULTURE_LABELS[idx]}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <p className="text-slate-100 text-sm font-light">{CULTURE_LABELS[idx]}</p>
                </div>
              </div>
            ))}

            {/* Load More - spans the third column */}
            <div className="flex items-center justify-center">
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-light text-sm">
                Load More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Art Environments Section */}
      <section className="w-full min-h-screen border-b border-slate-700">
        <div className="w-full h-full flex items-stretch overflow-hidden relative">
          {/* Left: Art Environments Info - 30% width */}
          <div className="w-full lg:w-[30%] flex flex-col justify-center py-12 px-8 lg:px-12 flex-shrink-0 section-divider">
            <div className="flex flex-col gap-6 max-w-md">
              <h2 className="text-5xl lg:text-6xl font-light text-slate-300 leading-tight">
                Art Environments
              </h2>

              <p className="text-slate-400 text-base font-light">
                Dreams you can choose
              </p>

              <p className="text-slate-400 text-base leading-relaxed">
                Performance-Ready Visual Architecture. Art Spaces are bold, cinematic dome worlds created for live performance and immersive stages.
              </p>

              <p className="text-slate-400 text-base leading-relaxed">
                Designed for:
              </p>

              <ul className="space-y-2">
                <li className="flex gap-3 items-start text-slate-400 text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Event domes</span>
                </li>
                <li className="flex gap-3 items-start text-slate-400 text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Experiential activations</span>
                </li>
                <li className="flex gap-3 items-start text-slate-400 text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Immersive installations</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Featured Image and Category Buttons - 70% width */}
          <div className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center px-12 flex-col gap-8">
            {/* Main Featured Image */}
            <div className="relative w-full h-96 rounded-lg overflow-hidden">
              <Image
                src={ART_FEATURED_IMAGE}
                alt="Art Environments"
                fill
                className="object-cover"
              />
            </div>

            {/* Category Buttons with Scroll Arrow */}
            <div className="relative w-full flex items-center gap-6">
              {/* Category Buttons */}
              <div className="flex gap-6 flex-wrap">
                {artCategories.map((category, idx) => (
                  <button
                    key={idx}
                    onClick={() => setArtCategoryIndex(idx)}
                    className="flex flex-col items-center gap-3 group"
                  >
                    {/* Category Image or Placeholder */}
                    <div className={`relative w-24 h-24 rounded-full overflow-hidden border-2 transition-all ${
                      idx === artCategoryIndex ? 'border-cyan-400' : 'border-slate-700'
                    }`}>
                      {idx < 3 ? (
                        <Image
                          src={CATEGORY_IMAGES[idx]}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <ChevronRight size={32} className="text-slate-600" />
                        </div>
                      )}
                    </div>
                    <span className="text-slate-300 text-sm font-light">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Scroll More Arrow - Positioned on the right */}
              <button
                onClick={handleNextArtCategory}
                className="ml-auto text-slate-400 hover:text-cyan-400 transition-colors p-2"
                aria-label="View more categories"
              >
                <ChevronRight size={32} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
      <section className="w-full py-16 px-8 lg:px-12 border-b border-slate-700">
        <div className="max-w-2xl">
          <h1 className="text-6xl lg:text-7xl font-light text-slate-400 leading-tight mb-4">
            Environments
          </h1>
          <p className="text-slate-500 text-base font-light mb-6">
            Seamless dome loops designed to charm.
          </p>
          <ul className="space-y-3">
            <li className="flex gap-3 items-start text-slate-400 text-sm">
              <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
              <span>Endless themed nights without rebuilding your show</span>
            </li>
            <li className="flex gap-3 items-start text-slate-400 text-sm">
              <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
              <span>Clean, seamless material ready to layer and mix</span>
            </li>
            <li className="flex gap-3 items-start text-slate-400 text-sm">
              <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
              <span>Ambient premium visuals that elevate any space</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Nature Section */}
      <section className="w-full border-b border-slate-700">
        {/* Full-width Banner with Overlay Text */}
        <div className="relative w-full h-80 overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatBackg%20%281%29-TLXUR5xYkTXrK8r7ahb8ZseNFWVg53.png"
            alt="Nature"
            fill
            className="object-cover"
          />
          {/* Overlay Text */}
          <div className="absolute inset-0 flex flex-col justify-center px-12 bg-black/40">
            <div className="flex flex-col gap-4 max-w-2xl">
              <h2 className="text-6xl font-light text-slate-100 leading-tight">
                Nature
              </h2>
              <p className="text-slate-200 text-base leading-relaxed max-w-md">
                Explore real world with dreamlike immersive dome interpretations. Travel between UNESCO Sites in seconds or discover diversity of real life reimagined with <span className="text-red-400">immersive</span> creativity.
              </p>
            </div>
          </div>
        </div>

        {/* Region Navigation Tabs */}
        <div className="relative w-full flex items-center gap-8 px-12 py-8 border-b border-slate-700">
          <button className="text-slate-400 hover:text-cyan-400 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button className="text-slate-300 hover:text-cyan-400 transition-colors font-light">Oceans</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Volcanoes</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Underwater Life</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Ice and Snow</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Showcase Grid - 3 columns */}
        <div className="w-full px-12 py-12">
          <div className="grid grid-cols-3 gap-6">
            {/* Row 1 */}
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat1-nkk8Hy0OO5lAUZFfWloX0E7soAeK9U.png"
                alt="Chilled trees forest walking"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <p className="text-slate-100 text-sm font-light">Chilled trees forest walking</p>
              </div>
            </div>

            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat2-JsjbkCmrWRtUS7eM4bS7btJ1v62vhx.png"
                alt="Tropical paradise bay"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <p className="text-slate-100 text-sm font-light">Tropical paradise bay</p>
              </div>
            </div>

            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat3-LTyR3NMoIATIkcqUzoPaCNqwJ0JscN.png"
                alt="Mycelia in strange"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <p className="text-slate-100 text-sm font-light">Mycelia in strange</p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat4-rzoHjM9BDiPVOHxpm0Mo3KRXkz7dqk.png"
                alt="Lava power"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <p className="text-slate-100 text-sm font-light">Lava power</p>
              </div>
            </div>

            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat5-kNXWZO6NmPKqOnEXPxAFy9TRHKUpyK.png"
                alt="Dreamy Sponges"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <p className="text-slate-100 text-sm font-light">Dreamy Sponges</p>
              </div>
            </div>

            {/* Load More - spans the third column */}
            <div className="flex items-center justify-center">
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-light text-sm">
                Load More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Heritage Environments Featured Section - Culture */}
      <section className="w-full border-b border-slate-700">
        {/* Full-width Banner with Overlay Text */}
        <div className="relative w-full h-80 overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_00000000ee7071f59683d205a8420d01-MAJ7wyOFcrHAp7zpe0O3CCtNiN39jv.png"
            alt="Culture"
            fill
            className="object-cover"
          />
          {/* Overlay Text */}
          <div className="absolute inset-0 flex flex-col justify-center px-12 bg-black/40">
            <div className="flex flex-col gap-4 max-w-2xl">
              <h2 className="text-6xl font-light text-slate-100 leading-tight">
                Culture
              </h2>
              <p className="text-slate-200 text-base leading-relaxed max-w-md">
                Heritage Environments are immersive journeys inspired by real cultures, architecture, symbolism, and landscapes.
              </p>
            </div>
          </div>
        </div>

        {/* Region Navigation Tabs */}
        <div className="relative w-full flex items-center gap-8 px-12 py-8 border-b border-slate-700">
          <button className="text-slate-400 hover:text-cyan-400 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button className="text-slate-300 hover:text-cyan-400 transition-colors font-light">North America</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Polynesia</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Southeast Asia</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Antarctica</button>
        </div>

        {/* Showcase Grid - 3 columns */}
        <div className="w-full px-12 py-12">
          <div className="grid grid-cols-3 gap-6">
            {/* Row 1 */}
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult1-dhVGWchKNmJw81kGmXDaXIJ5cd2xFk.png"
                alt="Purple sunset halo"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <p className="text-slate-100 text-sm font-light">Purple sunset halo</p>
              </div>
            </div>

            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult2-g8bXETDkCu4snNrPouTKozSZSfGxMl.png"
                alt="Canoe adventure"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <p className="text-slate-100 text-sm font-light">Canoe adventure</p>
              </div>
            </div>

            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult3-rkJrAmWhsEN0xY7OOeNbBueEgYyjBY.png"
                alt="Sunset over ancient temple"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <p className="text-slate-100 text-sm font-light">Sunset over ancient temple</p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult4-fOr7dFUw2LF1ihBOtwpZSNb9txsVJq.png"
                alt="Walking walls of Valparaiso"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <p className="text-slate-100 text-sm font-light">Walking walls of Valparaiso</p>
              </div>
            </div>

            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult5-YMhIkyjNnvCMyh91uvItbrfSuoxm5n.png"
                alt="Celestial gates"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <p className="text-slate-100 text-sm font-light">Celestial gates</p>
              </div>
            </div>

            {/* Load More - spans the third column */}
            <div className="flex items-center justify-center">
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-light text-sm">
                Load More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Art Environments Section */}
      <section className="w-full min-h-screen border-b border-slate-700">
        <div className="w-full h-full flex items-stretch overflow-hidden relative">
          {/* Left: Art Environments Info - 30% width */}
          <div className="w-full lg:w-[30%] flex flex-col justify-center py-12 px-8 lg:px-12 flex-shrink-0 section-divider">
            <div className="flex flex-col gap-6 max-w-md">
              <h2 className="text-5xl lg:text-6xl font-light text-slate-300 leading-tight">
                Art Environments
              </h2>

              <p className="text-slate-400 text-base font-light">
                Dreams you can choose
              </p>

              <p className="text-slate-400 text-base leading-relaxed">
                Performance-Ready Visual Architecture. Art Spaces are bold, cinematic dome worlds created for live performance and immersive stages.
              </p>

              <p className="text-slate-400 text-base leading-relaxed">
                Designed for:
              </p>

              <ul className="space-y-2">
                <li className="flex gap-3 items-start text-slate-400 text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Event domes</span>
                </li>
                <li className="flex gap-3 items-start text-slate-400 text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Experiential activations</span>
                </li>
                <li className="flex gap-3 items-start text-slate-400 text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Immersive installations</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Featured Image and Category Buttons - 70% width */}
          <div className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center px-12 flex-col gap-8">
            {/* Main Featured Image */}
            <div className="relative w-full h-96 rounded-lg overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_0000000084b4720eab101516c1d517ef-isrhjXPFYMJ2NRAjYnKXaqq7UFm5QK.png"
                alt="Art Environments"
                fill
                className="object-cover"
              />
            </div>

            {/* Category Buttons with Scroll Arrow */}
            <div className="relative w-full flex items-center gap-6">
              {/* Category Buttons */}
              <div className="flex gap-6 flex-wrap">
                {artCategories.map((category, idx) => (
                  <button
                    key={idx}
                    onClick={() => setArtCategoryIndex(idx)}
                    className="flex flex-col items-center gap-3 group"
                  >
                    {/* Category Image or Placeholder */}
                    <div className={`relative w-24 h-24 rounded-full overflow-hidden border-2 transition-all ${
                      idx === artCategoryIndex ? 'border-cyan-400' : 'border-slate-700'
                    }`}>
                      {idx < 3 ? (
                        <Image
                          src={categoryImages[idx]}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <ChevronRight size={32} className="text-slate-600" />
                        </div>
                      )}
                    </div>
                    <span className="text-slate-300 text-sm font-light">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Scroll More Arrow - Positioned on the right */}
              <button
                onClick={handleNextArtCategory}
                className="ml-auto text-slate-400 hover:text-cyan-400 transition-colors p-2"
                aria-label="View more categories"
              >
                <ChevronRight size={32} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
