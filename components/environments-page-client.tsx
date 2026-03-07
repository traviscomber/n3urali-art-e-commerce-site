'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/lib/contexts/language-context'

// Lazy import to avoid webpack serialization warning for large constants
let natureCategoryImages: any = {}

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

interface DatabaseImage {
  id: string
  title: string
  thumbnail_medium_url: string
}

interface EnvironmentsPageClientProps {
  collections: Collection[]
  environmentImages: EnvironmentImage[]
}

export function EnvironmentsPageClient({ collections, environmentImages }: EnvironmentsPageClientProps) {
  const { t } = useLanguage()
  const [heritageCategoryIndex, setHeritageCategoryIndex] = useState(0)
  const [artCategoryIndex, setArtCategoryIndex] = useState(0)
  const [selectedNatureCategory, setSelectedNatureCategory] = useState<string | null>(null)
  const [natureCategoryIndex, setNatureCategoryIndex] = useState(0)
  const [databaseImages, setDatabaseImages] = useState<{ [key: string]: DatabaseImage[] }>({})
  const [imagesLoading, setImagesLoading] = useState(true)

  const natureCategories = [
    { name: t('environments.oceans'), id: 'oceans' },
    { name: t('environments.volcanoes'), id: 'volcanoes' },
    { name: t('environments.iceSnow'), id: 'ice-and-snow' },
    { name: t('environments.forest'), id: 'forest' },
  ]

  const heritageCategories = [
    { name: t('environments.northAmerica'), id: 'north-america' },
    { name: t('environments.southAmerica'), id: 'south-america' },
    { name: t('environments.asia'), id: 'asia' },
    { name: t('environments.more'), id: 'more' },
  ]

  const artCategories = [
    { name: t('environments.architecture'), id: 'architecture' },
    { name: t('environments.landscapes'), id: 'landscapes' },
    { name: t('environments.geometry'), id: 'geometry' },
    { name: t('environments.cosmic'), id: 'cosmic' },
    { name: t('environments.abstract'), id: 'abstract' },
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
    t('shows.mythicLabel1'),
    t('shows.mythicLabel2'),
    t('shows.mythicLabel3'),
    t('shows.mythicLabel4'),
    t('shows.mythicLabel5'),
  ]

  const mythicCategories = [
    { name: t('environments.mythicAsian'), id: 'asian' },
    { name: t('environments.mythicMesoamerican'), id: 'mesoamerican' },
    { name: t('environments.mythicGreek'), id: 'greek' },
    { name: t('environments.mythicEgyptian'), id: 'egyptian' },
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
    t('environments.artLabel1'),
    t('environments.artLabel2'),
    t('environments.artLabel3'),
    t('environments.artLabel4'),
    t('environments.artLabel5'),
  ]

  // Fetch real image IDs from database
  useEffect(() => {
    const fetchCategoryImages = async () => {
      try {
        // Dynamically import large constants to avoid webpack serialization warning
        const { natureCategoryImages: imageData } = await import('@/lib/constants/nature-images')
        natureCategoryImages = imageData
        
        console.log('[v0] Fetching category images')
        const categories = ['Oceans', 'Volcanoes', 'Ice & Snow', 'Forest']
        const imagesByCategory: { [key: string]: DatabaseImage[] } = {}

        for (const category of categories) {
          try {
            console.log('[v0] Fetching images for category:', category)
            const response = await fetch(`/api/environments/images-by-category?category=${encodeURIComponent(category)}`)
            console.log('[v0] API response status:', response.status)
            
            if (response.ok) {
              const data = await response.json()
              console.log('[v0] Got', data.images?.length || 0, 'images for', category)
              if (data.images && data.images.length > 0) {
                imagesByCategory[category] = data.images
              }
            }
          } catch (err) {
            console.error('[v0] Error fetching category', category, ':', err)
          }
        }

        console.log('[v0] Final imagesByCategory:', Object.keys(imagesByCategory))
        setDatabaseImages(imagesByCategory)
      } catch (error) {
        console.error('[v0] Failed to fetch nature category images:', error)
      } finally {
        setImagesLoading(false)
      }
    }

    fetchCategoryImages()
  }, [])

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
                {t('environmentsPage.title')}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm md:text-base font-light mb-4 sm:mb-6">
                {t('environmentsPage.subtitle')}
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex gap-2 sm:gap-3 items-start text-slate-400 text-xs sm:text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>{t('environmentsPage.benefit1')}</span>
                </li>
                <li className="flex gap-2 sm:gap-3 items-start text-slate-400 text-xs sm:text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>{t('environmentsPage.benefit2')}</span>
                </li>
                <li className="flex gap-2 sm:gap-3 items-start text-slate-400 text-xs sm:text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>{t('environmentsPage.benefit3')}</span>
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
                {t('environments.natureTitle')}
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
                {t('environments.natureDescription')}
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
              {t('environments.oceans')}
            </button>
            <button 
              onClick={() => setSelectedNatureCategory('volcanoes')}
              className={`font-light transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedNatureCategory === 'volcanoes' ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}
            >
              {t('environments.volcanoes')}
            </button>
            <button 
              onClick={() => setSelectedNatureCategory('forest')}
              className={`font-light transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedNatureCategory === 'forest' ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}
            >
              {t('environments.forest')}
            </button>
            <button 
              onClick={() => setSelectedNatureCategory('ice-and-snow')}
              className={`font-light transition-colors text-xs sm:text-sm whitespace-nowrap ${selectedNatureCategory === 'ice-and-snow' ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}
            >
              {t('environments.iceSnow')}
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
                {t('environmentsPage.back')}
              </button>
              <span className="text-slate-400">|</span>
              <h2 className="text-slate-200 text-xs sm:text-sm font-light">
                {natureCategories.find(cat => cat.id === selectedNatureCategory)?.name || selectedNatureCategory}
              </h2>
            </div>

            {/* Image Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {(databaseImages[selectedNatureCategory] && databaseImages[selectedNatureCategory].length > 0 
                ? databaseImages[selectedNatureCategory] 
                : natureCategoryImages[selectedNatureCategory] || [])
                ?.slice(0, 5).map((image, idx) => (
                <Link
                  key={idx}
                  href={`/environments/${(image as any).id || `${selectedNatureCategory}-${idx}`}`}
                  className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group cursor-pointer text-left"
                >
                  <Image
                    src={(image as any).thumbnail_medium_url || (image as any).url}
                    alt={(image as any).title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">{(image as any).title}</p>
                  </div>
                </Link>
              ))}

              {/* Load More - spans full width on mobile */}
              <button 
                onClick={() => console.log('Load More clicked')}
                className="flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-1 cursor-pointer"
              >
                <span className="text-cyan-400 hover:text-cyan-300 transition-colors font-light text-xs sm:text-sm">
                  {t('environmentsPage.loadMore')}
                </span>
              </button>
            </div>
          </div>
        ) : (
          // Showcase Grid - Responsive
          <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {/* Chilled trees - Links to actual ocean images or placeholder */}
              {databaseImages['Oceans'] && databaseImages['Oceans'].length > 0 ? (
                <Link href={`/environments/${databaseImages['Oceans'][0].id}`} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat1-nkk8Hy0OO5lAUZFfWloX0E7soAeK9U.png"
                    alt="Chilled trees forest walking"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Chilled trees forest walking</p>
                  </div>
                </Link>
              ) : (
                <Link href="/environments/nature-showcase-1" className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat1-nkk8Hy0OO5lAUZFfWloX0E7soAeK9U.png"
                    alt="Chilled trees forest walking"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Chilled trees forest walking</p>
                  </div>
                </Link>
              )}

              {/* Tropical paradise - Links to actual volcano images or placeholder */}
              {databaseImages['Volcanoes'] && databaseImages['Volcanoes'].length > 0 ? (
                <Link href={`/environments/${databaseImages['Volcanoes'][0].id}`} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat2-JsjbkCmrWRtUS7eM4bS7btJ1v62vhx.png"
                    alt="Tropical paradise bay"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Tropical paradise bay</p>
                  </div>
                </Link>
              ) : (
                <Link href="/environments/nature-showcase-2" className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat2-JsjbkCmrWRtUS7eM4bS7btJ1v62vhx.png"
                    alt="Tropical paradise bay"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Tropical paradise bay</p>
                  </div>
                </Link>
              )}

              <button onClick={() => setSelectedNatureCategory('forest')} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group cursor-pointer">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat3-LTyR3NMoIATIkcqUzoPaCNqwJ0JscN.png"
                  alt="Forest"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                  <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Forest</p>
                </div>
              </button>

              {/* Lava power - Links to actual volcano images or placeholder */}
              {databaseImages['Volcanoes'] && databaseImages['Volcanoes'].length > 2 ? (
                <Link href={`/environments/${databaseImages['Volcanoes'][2].id}`} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat4-rzoHjM9BDiPVOHxpm0Mo3KRXkz7dqk.png"
                    alt="Lava power"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Lava power</p>
                  </div>
                </Link>
              ) : (
                <Link href="/environments/nature-showcase-4" className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNat4-rzoHjM9BDiPVOHxpm0Mo3KRXkz7dqk.png"
                    alt="Lava power"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Lava power</p>
                  </div>
                </Link>
              )}

              {/* Dreamy Sponges - Links to actual ocean images or placeholder */}
              {databaseImages['Oceans'] && databaseImages['Oceans'].length > 1 ? (
                <Link href={`/environments/${databaseImages['Oceans'][1].id}`} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater1-32cco29YdW82Sg3nv1RIWp43PKLSYN.png"
                    alt="Dreamy Sponges"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Dreamy Sponges</p>
                  </div>
                </Link>
              ) : (
                <Link href="/environments/nature-showcase-5" className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater1-32cco29YdW82Sg3nv1RIWp43PKLSYN.png"
                    alt="Dreamy Sponges"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                    <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">Dreamy Sponges</p>
                  </div>
                </Link>
              )}

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
                    {t('environments.heritageTitle')}
                  </h2>
                  <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
                    {t('environments.heritageDescription')}
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
                    {t('environments.mythicTitle')}
                  </h2>
                  <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
                    {t('environments.mythicDescription')}
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
                  <Link key={idx} href={`/environments/mythic-${idx}`} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                    <Image
                      src={url}
                      alt={mythicLabels[idx]}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                      <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">{mythicLabels[idx]}</p>
                    </div>
                  </Link>
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
                    {t('environments.artTitle')}
                  </h2>
                  <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
                    {t('environments.artDescription')}
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
                  <Link key={idx} href={`/environments/art-${idx}`} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                    <Image
                      src={url}
                      alt={artLabels[idx]}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-3 sm:p-5">
                      <p className="text-white text-xs sm:text-sm md:text-base font-light line-clamp-2">{artLabels[idx]}</p>
                    </div>
                  </Link>
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
