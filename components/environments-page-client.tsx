'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import Image from 'next/image'

// Environment sections component - Updated
// Helper function to filter images by category
const getImagesByCategory = (category: string, images: EnvironmentImage[]) => {
  return images.filter((img) => img.content_category?.toLowerCase() === category.toLowerCase())
}

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
    <div className="w-full max-w-full overflow-hidden bg-black">
      {/* Show detail view if category selected, otherwise show full page */}
      {!selectedNatureCategory && (
        <>
          {/* Intro Section */}
          <section className="w-full max-w-full overflow-hidden py-12 sm:py-16 md:py-24 px-4 sm:px-8 lg:px-12 border-b border-slate-700">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-slate-400 leading-tight mb-3 sm:mb-4">
                Environments
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm md:text-base font-light mb-4 sm:mb-6">
                Seamless dome loops designed to charm.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex gap-2 sm:gap-3 items-start text-slate-400 text-xs sm:text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Endless themed nights without rebuilding your show</span>
                </li>
                <li className="flex gap-2 sm:gap-3 items-start text-slate-400 text-xs sm:text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Clean, seamless material ready to layer and mix</span>
                </li>
                <li className="flex gap-2 sm:gap-3 items-start text-slate-400 text-xs sm:text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Ambient premium visuals that elevate any space</span>
                </li>
              </ul>
            </div>
          </section>
        </>
      )}

      {/* Nature Section - Always visible with banner and nav */}
      <section id="nature" className="w-full max-w-full overflow-hidden border-b border-slate-700">
        {/* Full-width Banner with Overlay Text */}
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatBackg%20%281%29-TLXUR5xYkTXrK8r7ahb8ZseNFWVg53.png"
            alt="Nature"
            fill
            className="object-cover"
          />
          {/* Overlay Text */}
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 bg-black/40">
            <div className="flex flex-col gap-2 sm:gap-4 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100 leading-tight">
                Nature
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
                Explore real world with dreamlike immersive dome interpretations. Travel between UNESCO Sites in seconds or discover diversity of real life reimagined with <span className="text-red-400">immersive</span> creativity.
              </p>
            </div>
          </div>
        </div>

        {/* Region Navigation Tabs - Mobile Responsive */}
        <div className="relative w-full overflow-x-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 border-b border-slate-700">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-min md:min-w-0">
            <button className="text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0">
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            <button 
              onClick={() => setSelectedNatureCategory('oceans')}
              className={`font-light transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedNatureCategory === 'oceans' ? 'text-cyan-400' : 'text-slate-300 hover:text-cyan-400'}`}
            >
              Oceans
            </button>
            <button 
              onClick={() => setSelectedNatureCategory('volcanoes')}
              className={`font-light transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedNatureCategory === 'volcanoes' ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}
            >
              Volcanoes
            </button>
            <button 
              onClick={() => setSelectedNatureCategory('underwater-life')}
              className={`font-light transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedNatureCategory === 'underwater-life' ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}
            >
              Underwater
            </button>
            <button 
              onClick={() => setSelectedNatureCategory('ice-and-snow')}
              className={`font-light transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedNatureCategory === 'ice-and-snow' ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}
            >
              Ice & Snow
            </button>
            <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto flex-shrink-0">
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Conditional Content: Show detail view or grid */}
        {selectedNatureCategory ? (
          // Detail View Modal
          <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
            {/* Back Button */}
            <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
              <button
                onClick={() => setSelectedNatureCategory(null)}
                className="text-slate-400 hover:text-cyan-400 transition-colors text-xs sm:text-sm font-light"
              >
                Back
              </button>
              <span className="text-slate-400">|</span>
              <h2 className="text-slate-200 text-xs sm:text-sm font-light">
                {natureCategories.find(cat => cat.id === selectedNatureCategory)?.name || selectedNatureCategory}
              </h2>
            </div>

            {/* Image Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {getImagesByCategory(selectedNatureCategory, environmentImages).slice(0, 5).map((image) => (
                <button
                  key={image.id}
                  onClick={() => console.log('Image clicked:', image.title)}
                  className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group cursor-pointer text-left"
                >
                  <Image
                    src={image.thumbnail_medium_url || '/placeholder.jpg'}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">{image.title}</p>
                  </div>
                </button>
              ))}

              {/* Load More - spans full width on mobile */}
              <button 
                onClick={() => console.log('Load More clicked')}
                className="flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-1 cursor-pointer"
              >
                <span className="text-cyan-400 hover:text-cyan-300 transition-colors font-light text-xs sm:text-sm">
                  Load More
                </span>
              </button>
            </div>
          </div>
        ) : (
          // Showcase Grid - Responsive
          <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat1-nkk8Hy0OO5lAUZFfWloX0E7soAeK9U.png"
                  alt="Chilled trees forest walking"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                  <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Chilled trees forest walking</p>
                </div>
              </div>

              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat2-JsjbkCmrWRtUS7eM4bS7btJ1v62vhx.png"
                  alt="Tropical paradise bay"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                  <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Tropical paradise bay</p>
                </div>
              </div>

              <button onClick={() => setSelectedNatureCategory('underwater-life')} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group cursor-pointer">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat3-LTyR3NMoIATIkcqUzoPaCNqwJ0JscN.png"
                  alt="Underwater Life"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                  <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Underwater Life</p>
                </div>
              </button>

              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat4-rzoHjM9BDiPVOHxpm0Mo3KRXkz7dqk.png"
                  alt="Lava power"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                  <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Lava power</p>
                </div>
              </div>

              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater1-32cco29YdW82Sg3nv1RIWp43PKLSYN.png"
                  alt="Dreamy Sponges"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                  <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Dreamy Sponges</p>
                </div>
              </div>

              <div className="flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-1">
                <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-light text-xs sm:text-sm">
                  Load More
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Show other sections only if detail view is not open */}
      {!selectedNatureCategory && (
        <>
          {/* Culture Section */}
          <section id="culture" className="w-full max-w-full overflow-hidden border-b border-slate-700">
            <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultBackg-eTk9tnAfHGhSUA1ZUSshfm8Ww57D1e.png"
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
                    Heritage Environments are immersive journeys inspired by real cultures, architecture, symbolism, and landscapes.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative w-full overflow-x-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 border-b border-slate-700">
              <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-min md:min-w-0">
                <button className="text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0">
                  <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                </button>
                <button className="text-slate-300 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">North America</button>
                <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Polynesia</button>
                <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Southeast Asia</button>
                <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Antarctica</button>
                <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto flex-shrink-0">
                  <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult1-dhVGWchKNmJw81kGmXDaXIJ5cd2xFk.png"
                    alt="Purple sunset halo"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Purple sunset halo</p>
                  </div>
                </div>

                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult2-g8bXETDkCu4snNrPouTKozSZSfGxMl.png"
                    alt="Canoe adventure"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Canoe adventure</p>
                  </div>
                </div>

                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult3-rkJrAmWhsEN0xY7OOeNbBueEgYyjBY.png"
                    alt="Sunset over ancient temple"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Sunset over ancient temple</p>
                  </div>
                </div>

                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult4-fOr7dFUw2LF1ihBOtwpZSNb9txsVJq.png"
                    alt="Walking walls of Valparaiso"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Walking walls of Valparaiso</p>
                  </div>
                </div>

                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult5-YMhIkyjNnvCMyh91uvItbrfSuoxm5n.png"
                    alt="Celestial gates"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Celestial gates</p>
                  </div>
                </div>

                <div className="flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-1">
                  <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-light text-xs sm:text-sm">
                    Load More
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Mythic Section */}
          <section id="mythic" className="w-full max-w-full overflow-hidden border-b border-slate-700">
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
                    The Mythical Universe series transforms <span className="text-cyan-400">symbolic and dreamlike cosmology</span> into immersive dome experiences. Pure atmosphere and emotional immersion.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative w-full overflow-x-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 border-b border-slate-700">
              <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-min md:min-w-0">
                <button className="text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0">
                  <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                </button>
                <button className="text-slate-300 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Asian</button>
                <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Mesoamerican</button>
                <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Greek</button>
                <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Egyptian</button>
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
                    <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                      <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">{mythicLabels[idx]}</p>
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

          {/* Art Section */}
          <section id="art" className="w-full max-w-full overflow-hidden border-b border-slate-700">
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
                    Performance-Ready Visual Architecture. Bold, cinematic <span className="text-cyan-400">dome worlds</span> created for live performance and immersive stages.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative w-full overflow-x-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-8 border-b border-slate-700">
              <div className="flex items-center gap-2 sm:gap-4 md:gap-8 min-w-min md:min-w-0">
                <button className="text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0">
                  <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                </button>
                <button className="text-slate-300 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Architecture</button>
                <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Landscapes</button>
                <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Geometry</button>
                <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Cosmic</button>
                <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light text-xs sm:text-sm whitespace-nowrap">Abstract</button>
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
                    <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                      <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">{artLabels[idx]}</p>
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
        </>
      )}
    </div>
  )
}
