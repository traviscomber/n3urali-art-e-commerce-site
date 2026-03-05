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

  const natureCategoryImages: Record<string, { title: string; url: string }[]> = {
    'oceans': [
      { title: 'Cyan corals', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat1-nkk8Hy0OO5lAUZFfWloX0E7soAeK9U.png' },
      { title: 'Thousands of Tentacles', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat2-JsjbkCmrWRtUS7eM4bS7btJ1v62vhx.png' },
      { title: 'Dreamy sponge', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat3-LTyR3NMoIATIkcqUzoPaCNqwJ0JscN.png' },
      { title: 'Jellyfish Rising', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat4-rzoHjM9BDiPVOHxpm0Mo3KRXkz7dqk.png' },
      { title: 'Pink Sponges of Far Planet', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat5-4G2FHlE9CWaQ4TUFvXf7JHyJz8n3Hu.png' },
    ],
    'volcanoes': [
      { title: 'Lava power', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat4-rzoHjM9BDiPVOHxpm0Mo3KRXkz7dqk.png' },
      { title: 'Tropical paradise bay', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat2-JsjbkCmrWRtUS7eM4bS7btJ1v62vhx.png' },
      { title: 'Mycelia in strange', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat3-LTyR3NMoIATIkcqUzoPaCNqwJ0JscN.png' },
      { title: 'Chilled trees forest walking', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat1-nkk8Hy0OO5lAUZFfWloX0E7soAeK9U.png' },
      { title: 'Dreamy Sponges', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat5-4G2FHlE9CWaQ4TUFvXf7JHyJz8n3Hu.png' },
    ],
    'underwater-life': [
      { title: 'Cyan corals', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat1-nkk8Hy0OO5lAUZFfWloX0E7soAeK9U.png' },
      { title: 'Thousands of Tentacles', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat2-JsjbkCmrWRtUS7eM4bS7btJ1v62vhx.png' },
      { title: 'Dreamy sponge', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat3-LTyR3NMoIATIkcqUzoPaCNqwJ0JscN.png' },
      { title: 'Jellyfish Rising', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat4-rzoHjM9BDiPVOHxpm0Mo3KRXkz7dqk.png' },
      { title: 'Pink Sponges of Far Planet', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat5-4G2FHlE9CWaQ4TUFvXf7JHyJz8n3Hu.png' },
    ],
    'ice-and-snow': [
      { title: 'Tropical paradise bay', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat2-JsjbkCmrWRtUS7eM4bS7btJ1v62vhx.png' },
      { title: 'Lava power', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat4-rzoHjM9BDiPVOHxpm0Mo3KRXkz7dqk.png' },
      { title: 'Mycelia in strange', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat3-LTyR3NMoIATIkcqUzoPaCNqwJ0JscN.png' },
      { title: 'Chilled trees forest walking', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat1-nkk8Hy0OO5lAUZFfWloX0E7soAeK9U.png' },
      { title: 'Dreamy Sponges', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat5-4G2FHlE9CWaQ4TUFvXf7JHyJz8n3Hu.png' },
    ],
  }

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
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt1-m4KYdc6BQcLkasgP33aW3ZFJ2nj3Fx.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt2-NPhNLdPp3q4K28r5Yv4uey9UtpHgAt.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt3-RdYjhjx4UGKt8ZAUJqVZsPYA5w4IWz.png',
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
    <div className="w-full bg-black">
      {/* Category Detail View Modal */}
      {selectedNatureCategory && (
        <section className="w-full border-b border-slate-700">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 px-12 py-6 border-b border-slate-700">
            <button
              onClick={() => setSelectedNatureCategory(null)}
              className="text-slate-400 hover:text-cyan-400 transition-colors text-base font-light"
            >
              Back
            </button>
            <span className="text-slate-400">|</span>
            <h2 className="text-slate-200 text-base font-light">
              {natureCategories.find(cat => cat.id === selectedNatureCategory)?.name || selectedNatureCategory}
            </h2>
          </div>

          {/* Category Navigation Tabs */}
          <div className="relative w-full flex items-center gap-8 px-12 py-8 border-b border-slate-700">
            <button className="text-slate-400 hover:text-cyan-400 transition-colors">
              <ChevronLeft size={24} />
            </button>
            {natureCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedNatureCategory(cat.id)}
                className={`font-light transition-colors ${
                  selectedNatureCategory === cat.id ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'
                }`}
              >
                {cat.name}
              </button>
            ))}
            <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto">
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Image Grid */}
          <div className="w-full px-12 py-12">
            <div className="grid grid-cols-3 gap-[4.5rem]">
              {natureCategoryImages[selectedNatureCategory]?.map((image, idx) => (
                <div
                  key={idx}
                  className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group"
                >
                  <Image
                    src={image.url}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                    <p className="text-white text-base font-light">{image.title}</p>
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
      )}

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
          <div className="grid grid-cols-3 gap-[4.5rem]">
            {/* Row 1 */}
            <button onClick={() => setSelectedNatureCategory('oceans')} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group cursor-pointer">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat1-nkk8Hy0OO5lAUZFfWloX0E7soAeK9U.png"
                alt="Chilled trees forest walking"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                <p className="text-white text-base font-light">Chilled trees forest walking</p>
              </div>
            </button>

            <button onClick={() => setSelectedNatureCategory('volcanoes')} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group cursor-pointer">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat2-JsjbkCmrWRtUS7eM4bS7btJ1v62vhx.png"
                alt="Tropical paradise bay"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                <p className="text-white text-base font-light">Tropical paradise bay</p>
              </div>
            </button>

            <button onClick={() => setSelectedNatureCategory('underwater-life')} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group cursor-pointer">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat3-LTyR3NMoIATIkcqUzoPaCNqwJ0JscN.png"
                alt="Mycelia in strange"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                <p className="text-white text-base font-light">Mycelia in strange</p>
              </div>
            </button>

            {/* Row 2 */}
            <button onClick={() => setSelectedNatureCategory('ice-and-snow')} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group cursor-pointer">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat4-rzoHjM9BDiPVOHxpm0Mo3KRXkz7dqk.png"
                alt="Lava power"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                <p className="text-white text-base font-light">Lava power</p>
              </div>
            </button>

            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat5-4G2FHlE9CWaQ4TUFvXf7JHyJz8n3Hu.png"
                alt="Dreamy Sponges"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                <p className="text-white text-base font-light">Dreamy Sponges</p>
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
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultBackg-eTk9tnAfHGhSUA1ZUSshfm8Ww57D1e.png"
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
          <div className="grid grid-cols-3 gap-[4.5rem]">
            {/* Row 1 */}
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult1-dhVGWchKNmJw81kGmXDaXIJ5cd2xFk.png"
                alt="Purple sunset halo"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                <p className="text-white text-base font-light">Purple sunset halo</p>
              </div>
            </div>

            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult2-g8bXETDkCu4snNrPouTKozSZSfGxMl.png"
                alt="Canoe adventure"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                <p className="text-white text-base font-light">Canoe adventure</p>
              </div>
            </div>

            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult3-rkJrAmWhsEN0xY7OOeNbBueEgYyjBY.png"
                alt="Sunset over ancient temple"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                <p className="text-white text-base font-light">Sunset over ancient temple</p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult4-fOr7dFUw2LF1ihBOtwpZSNb9txsVJq.png"
                alt="Walking walls of Valparaiso"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                <p className="text-white text-base font-light">Walking walls of Valparaiso</p>
              </div>
            </div>

            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult5-YMhIkyjNnvCMyh91uvItbrfSuoxm5n.png"
                alt="Celestial gates"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                <p className="text-white text-base font-light">Celestial gates</p>
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

      {/* Mythic Section */}
      <section className="w-full border-b border-slate-700">
        {/* Full-width Banner with Overlay Text */}
        <div className="relative w-full h-80 overflow-hidden">
          <Image
            src={mythicBannerUrl}
            alt="Mythic"
            fill
            className="object-cover"
          />
          {/* Overlay Text */}
          <div className="absolute inset-0 flex flex-col justify-center px-12 bg-black/40">
            <div className="flex flex-col gap-4 max-w-2xl">
              <h2 className="text-6xl font-light text-slate-100 leading-tight">
                Mythic
              </h2>
              <p className="text-slate-200 text-base leading-relaxed max-w-md">
                The Mythical Universe series transforms <span className="text-cyan-400">symbolic and dreamlike cosmology</span> into immersive dome experiences. Pure atmosphere and emotional immersion.
              </p>
            </div>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="relative w-full flex items-center gap-8 px-12 py-8 border-b border-slate-700">
          <button className="text-slate-400 hover:text-cyan-400 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button className="text-slate-300 hover:text-cyan-400 transition-colors font-light">Asian</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Mesoamerican</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Greek</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Egyptian</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Showcase Grid - 3 columns */}
        <div className="w-full px-12 py-12">
          <div className="grid grid-cols-3 gap-[4.5rem]">
            {mythicImages.slice(0, 5).map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                <Image
                  src={url}
                  alt={mythicLabels[idx]}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                  <p className="text-white text-base font-light">{mythicLabels[idx]}</p>
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
      <section className="w-full border-b border-slate-700">
        {/* Full-width Banner with Overlay Text */}
        <div className="relative w-full h-80 overflow-hidden">
          <Image
            src={artBannerUrl}
            alt="Art"
            fill
            className="object-cover"
          />
          {/* Overlay Text */}
          <div className="absolute inset-0 flex flex-col justify-center px-12 bg-black/40">
            <div className="flex flex-col gap-4 max-w-2xl">
              <h2 className="text-6xl font-light text-slate-100 leading-tight">
                Art
              </h2>
              <p className="text-slate-200 text-base leading-relaxed max-w-md">
                Performance-Ready Visual Architecture. Bold, cinematic <span className="text-cyan-400">dome worlds</span> created for live performance and immersive stages.
              </p>
            </div>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="relative w-full flex items-center gap-8 px-12 py-8 border-b border-slate-700">
          <button className="text-slate-400 hover:text-cyan-400 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button className="text-slate-300 hover:text-cyan-400 transition-colors font-light">Architecture</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Landscapes</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Geometry</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Cosmic</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Abstract</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Showcase Grid - 3 columns */}
        <div className="w-full px-12 py-12">
          <div className="grid grid-cols-3 gap-[4.5rem]">
            {artImages.slice(0, 5).map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                <Image
                  src={url}
                  alt={artLabels[idx]}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                  <p className="text-white text-base font-light">{artLabels[idx]}</p>
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
    </div>
  )
}
