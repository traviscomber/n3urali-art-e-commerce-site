'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/lib/contexts/language-context'

interface Collection {
  id: string
  title: string
  work_title?: string
  description?: string
  synopsis?: string
  code?: string
}

interface TeaserImage {
  id: string
  title: string
  thumbnail_medium_url?: string
  original_url?: string
  upscaled_url?: string
  tags?: string[]
  content_category?: string
}

interface ShowsPageClientProps {
  collections: Collection[]
  teaserImages: TeaserImage[]
}

export function ShowsPageClient({ collections, teaserImages }: ShowsPageClientProps) {
  const { t } = useLanguage()
  const [teaserIndex, setTeaserIndex] = useState(0)

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
    { name: t('shows.categoryAsian'), id: 'asian' },
    { name: t('shows.categoryMesoamerican'), id: 'mesoamerican' },
    { name: t('shows.categoryGreek'), id: 'greek' },
    { name: t('shows.categoryEgyptian'), id: 'egyptian' },
  ]

  const teasers = [
    {
      video: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upscaled_4k_1769186425665-tIDvx4aisEE2OnZKa01br1AsjGa0U9.mp4',
      title: t('shows.teaserTitle1'),
    },
    {
      video: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upscaled_4k_1769188268692-hzRqYyG3px6XWnyqOeymrygNVHapDN.mp4',
      title: t('shows.teaserTitle2'),
    },
    {
      video: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upscaled_4k_1769187422672-86GC3cBIId4ahyMtCrRkhq9BS8zVM5.mp4',
      title: t('shows.teaserTitle3'),
    },
  ]

  const perfectForItems = [
    t('showsPage.perfectFor1'),
    t('showsPage.perfectFor2'),
    t('showsPage.perfectFor3'),
  ]

  const characterFeatures = [
    t('showsPage.characterDesign'),
    t('showsPage.narrativeBuilding'),
    t('showsPage.effectsEditing'),
  ]

  const handlePrevTeaser = () => {
    setTeaserIndex((prev) => (prev - 1 + teasers.length) % teasers.length)
  }

  const handleNextTeaser = () => {
    setTeaserIndex((prev) => (prev + 1) % teasers.length)
  }

  const handleTeaserClick = (idx: number) => {
    setTeaserIndex(idx)
    setTimeout(() => {
      const videoElement = document.querySelector('video[data-main-player]') as HTMLVideoElement
      if (videoElement) {
        videoElement.play()
      }
    }, 0)
  }

  // Sample shows data (fallback if no collections)
  const shows = collections.length > 0 ? collections : [
    {
      id: '1',
      title: 'Meet Mosey — Guide of the Nile, Multiverse',
      description: 'From mythical realms to sacred atmospheres, immerse in tales of wonder.',
      code: 'mosey',
    },
  ]

  const currentShow = shows[0]

  return (
    <div className="w-full max-w-full overflow-hidden bg-black">
      {/* Hero Section - Banner Height with Overlay Text */}
      <section className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] border-b border-slate-700 relative overflow-hidden">
        {/* Background Image - Fixed */}
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_0000000084b4720eab101516c1d517ef%20%281%29-nDHLlhz2hCO4eWQ8VBdlYq2w2Drwka.png"
          alt="Immersive dome experience with cosmic visualization"
          fill
          className="object-cover fixed"
          priority
        />
        
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        {/* Content Overlay - Text Inside Banner */}
        <div className="absolute inset-0 w-full h-full flex flex-col justify-start sm:justify-center py-6 sm:py-8 px-6 sm:px-16 md:px-24 lg:px-32">
          <div className="flex flex-col gap-4 sm:gap-6 max-w-2xl">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-slate-100 leading-tight">
                {t('showsPage.pageTitle')}
              </h1>
              <p className="text-slate-200 text-xs sm:text-sm md:text-base font-light mt-1">
                {t('showsPage.pageSubtitle')}
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <p className="text-slate-100 text-xs sm:text-sm leading-relaxed max-w-xl hidden sm:block">
                {currentShow.description || currentShow.synopsis || t('showsPage.descriptionDefault')}
              </p>

              <div className="space-y-1 sm:space-y-2 pt-1 hidden sm:block">
                <p className="text-slate-200 text-xs font-medium uppercase tracking-widest opacity-80">{t('showsPage.perfectFor')}</p>
                <ul className="space-y-0.5 sm:space-y-1">
                  {perfectForItems.map((item, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="text-cyan-400 text-xs sm:text-sm flex-shrink-0 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teasers Section */}
      <section className="w-full max-w-full overflow-hidden bg-black py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center">
          {/* Left: Teaser Info and Buttons */}
          <div className="w-full flex flex-col justify-center py-8 sm:py-12">
            <div className="flex flex-col gap-4 sm:gap-6 max-w-md">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-slate-300 leading-tight">
                {t('showsPage.teasersTitle')}
              </h2>

              <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
                {t('showsPage.teasersDesc1')}
              </p>

              <p className="text-slate-400 text-xs sm:text-sm">
                {t('showsPage.teasersDesc2')}
              </p>

              <div className="space-y-1.5 sm:space-y-2 text-slate-500 text-xs sm:text-xs leading-relaxed">
                {characterFeatures.map((feature, idx) => (
                  <p key={idx}>{feature}</p>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-4 pt-4">
                <button className="px-3 sm:px-6 py-2 border border-cyan-400 text-cyan-400 text-xs sm:text-sm font-medium hover:bg-cyan-400/10 transition-colors">
                  {t('showsPage.sendEmail')}
                </button>
                <button className="px-3 sm:px-6 py-2 border border-cyan-400 text-cyan-400 text-xs sm:text-sm font-medium hover:bg-cyan-400/10 transition-colors">
                  {t('showsPage.whatsapp')}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Video Player with Controls */}
          <div className="w-full flex flex-col gap-4 sm:gap-6">
            {/* Main Video Player */}
            <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl border border-slate-700">
              <video
                key={teaserIndex}
                src={teasers[teaserIndex].video}
                controls
                autoPlay
                loop
                muted
                playsInline
                data-main-player
                className="w-full h-auto"
              />
            </div>

            {/* Thumbnail Carousel Navigation */}
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <button
                onClick={handlePrevTeaser}
                className="p-2 rounded border border-slate-600 hover:border-cyan-400 text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-2 sm:gap-3 flex-1 overflow-x-auto">
                {teasers.map((teaser, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTeaserClick(idx)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded border-2 transition-all ${
                      idx === teaserIndex
                        ? 'border-cyan-400'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <video
                      src={teaser.video}
                      className="w-full h-full object-cover"
                      muted
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextTeaser}
                className="p-2 rounded border border-slate-600 hover:border-cyan-400 text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Shows Collection Grid Section */}
      <section className="w-full max-w-full overflow-hidden bg-black py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-6 sm:gap-8 md:gap-12">
            {shows.slice(0, 6).map((show, idx) => (
              <div
                key={show.id}
                className="group cursor-pointer rounded-lg overflow-hidden border border-slate-700 hover:border-cyan-400/50 transition-all"
              >
                <div className="aspect-video bg-slate-900 flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                  <div className="text-center">
                    <p className="text-slate-400 text-xs sm:text-sm font-light">
                      {show.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More - spans full width on mobile */}
            <div className="flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-1">
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-light text-xs sm:text-sm">
                {t('showsPage.loadMore')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mythic Section - Hidden for now */}
      {/* Future: Add mythic environments section here */}
    </div>
  )
}
