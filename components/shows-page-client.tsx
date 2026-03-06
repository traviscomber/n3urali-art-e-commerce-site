'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

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

  const teasers = [
    {
      video: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upscaled_4k_1769186425665-tIDvx4aisEE2OnZKa01br1AsjGa0U9.mp4',
      title: 'Teaser Video 1',
    },
    {
      video: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upscaled_4k_1769188268692-hzRqYyG3px6XWnyqOeymrygNVHapDN.mp4',
      title: 'Teaser Video 2',
    },
    {
      video: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upscaled_4k_1769187422672-86GC3cBIId4ahyMtCrRkhq9BS8zVM5.mp4',
      title: 'Teaser Video 3',
    },
  ]

  const handlePrevTeaser = () => {
    setTeaserIndex((prev) => (prev - 1 + teasers.length) % teasers.length)
  }

  const handleNextTeaser = () => {
    setTeaserIndex((prev) => (prev + 1) % teasers.length)
  }

  const handleTeaserClick = (idx: number) => {
    setTeaserIndex(idx)
    // Auto-play video when clicked
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
                Shows
              </h1>
              <p className="text-slate-200 text-xs sm:text-sm md:text-base font-light mt-1">
                Cinematic Dome Stories
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <p className="text-slate-100 text-xs sm:text-sm leading-relaxed max-w-xl hidden sm:block">
                {currentShow.description || currentShow.synopsis || 'From mythical realms to sacred atmospheres, immerse in tales of wonder.'}
              </p>

              <div className="space-y-1 sm:space-y-2 pt-1 hidden sm:block">
                <p className="text-slate-200 text-xs font-medium uppercase tracking-widest opacity-80">Perfect for:</p>
                <ul className="space-y-0.5 sm:space-y-1">
                  {[
                    'Family dome nights',
                    'Cultural programming',
                    'Art and experience-focused events',
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-slate-100 text-xs">
                      <span className="text-cyan-400 flex-shrink-0 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mythic Section - HIDDEN */}
      <section className="hidden w-full max-w-full overflow-hidden border-b border-slate-700">
        {/* Full-width Banner with Overlay Text */}
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src={mythicBannerUrl}
            alt="Mythic"
            fill
            className="object-cover"
          />
          {/* Overlay Text */}
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

        {/* Category Navigation Tabs - Mobile Responsive */}
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

        {/* Showcase Grid - Responsive */}
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

            {/* Load More - spans full width on mobile */}
            <div className="flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-1">
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-light text-xs sm:text-sm">
                Load More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Teasers Section */}
      <section className="w-full max-w-full overflow-hidden min-h-screen sm:h-screen border-b border-slate-700">
        <div className="w-full h-full flex flex-col sm:flex-row items-stretch overflow-hidden relative">
          {/* Left: Teaser Info and Buttons - Full width mobile, 30% on desktop */}
          <div className="w-full sm:w-[30%] flex flex-col justify-center py-8 sm:py-12 px-6 sm:px-16 md:px-24 lg:px-32 flex-shrink-0">
            <div className="flex flex-col gap-4 sm:gap-6 max-w-md">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-slate-300 leading-tight">
                Teasers:
              </h2>

              <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
                Full-length shows and dome editions are available. If you are interested in a specific episode or would like to commission a custom production, please contact our team.
              </p>

              <p className="text-slate-400 text-xs sm:text-sm">
                We develop immersive content from concept to final delivery.
              </p>

              <div className="space-y-1.5 sm:space-y-2 text-slate-500 text-xs sm:text-xs leading-relaxed">
                <p>Original and consistent character design</p>
                <p>Cohesive narrative and visual building</p>
                <p>Dynamic scene editing with special effects</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-4 pt-4">
                <button className="px-3 sm:px-6 py-2 border border-cyan-400 text-cyan-400 text-xs sm:text-sm font-medium hover:bg-cyan-400/10 transition-colors">
                  Send Email
                </button>
                <button className="px-3 sm:px-6 py-2 border border-cyan-400 text-cyan-400 text-xs sm:text-sm font-medium hover:bg-cyan-400/10 transition-colors">
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Right: Video Teasers with Arrow Navigation - Hidden on mobile, 70% on desktop */}
          <div className="hidden sm:flex sm:flex-1 relative overflow-hidden items-center justify-end px-6 sm:px-16 md:px-24 lg:px-32">
            {/* Left: Current Teaser with Up/Down Arrows */}
            <div className="relative flex flex-col items-center gap-4">
              {/* Up Arrow */}
              <button
                onClick={handlePrevTeaser}
                className="text-slate-400 hover:text-cyan-400 transition-colors p-2"
                aria-label="Previous teaser"
              >
                <ChevronLeft size={32} className="rotate-90" />
              </button>

              {/* Teaser Videos - Current and Next */}
              <div className="flex flex-col gap-3">
                {/* Current Teaser Video */}
                <button
                  onClick={() => handleTeaserClick(teaserIndex)}
                  className={`relative w-32 h-32 rounded-lg overflow-hidden border transition-all border-cyan-400 shadow-lg shadow-cyan-400/30`}
                >
                  <video
                    src={teasers[teaserIndex]?.video}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium text-center px-2">{teasers[teaserIndex]?.title}</p>
                  </div>
                </button>

                {/* Next Teaser Video */}
                <button
                  onClick={() => handleTeaserClick((teaserIndex + 1) % teasers.length)}
                  className={`relative w-32 h-32 rounded-lg overflow-hidden border transition-all border-slate-700 hover:border-cyan-400`}
                >
                  <video
                    src={teasers[(teaserIndex + 1) % teasers.length]?.video}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium text-center px-2">{teasers[(teaserIndex + 1) % teasers.length]?.title}</p>
                  </div>
                </button>
              </div>

              {/* Down Arrow */}
              <button
                onClick={handleNextTeaser}
                className="text-slate-400 hover:text-cyan-400 transition-colors p-2"
                aria-label="Next teaser"
              >
                <ChevronLeft size={32} className="-rotate-90" />
              </button>
            </div>

            {/* Right: Main Video Preview */}
            <div className="relative flex-1 flex flex-col items-center ml-12">
              <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-700 video-player-container">
                <video
                  data-main-player
                  src={teasers[teaserIndex]?.video}
                  className="w-full h-full object-cover"
                  controls
                  controlsList="nodownload nofullscreen"
                  preload="metadata"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables Section - HIDDEN */}
      <section className="hidden w-full max-w-full overflow-hidden min-h-screen sm:h-screen border-b border-slate-700">
        <div className="w-full h-full flex flex-col sm:flex-row items-stretch overflow-hidden relative">
          {/* Left: Deliverables Info - Full width mobile, 30% on desktop */}
          <div className="w-full sm:w-[30%] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-8 lg:px-12 flex-shrink-0">
            <div className="flex flex-col gap-4 sm:gap-6 max-w-md">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-slate-300 leading-tight">
                Deliverables
              </h2>

              <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
                All content is delivered in professional 4K resolution and optimized for full dome, Fulldome and 360-degree environments.
              </p>

              <div className="space-y-2 sm:space-y-3">
                <p className="text-slate-500 text-xs sm:text-sm font-medium">Our productions include:</p>
                <ul className="space-y-1 sm:space-y-2 text-slate-400 text-xs sm:text-sm">
                  <li className="flex gap-2 sm:gap-3 items-start">
                    <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                    <span>Dome-ready masters</span>
                  </li>
                  <li className="flex gap-2 sm:gap-3 items-start">
                    <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                    <span>Character creation (natural)</span>
                  </li>
                  <li className="flex gap-2 sm:gap-3 items-start">
                    <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                    <span>Full dome environment and special effects</span>
                  </li>
                  <li className="flex gap-2 sm:gap-3 items-start">
                    <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                    <span>Structured storytelling and educational frameworks</span>
                  </li>
                </ul>
              </div>

              <p className="text-slate-400 text-xs sm:text-sm">
                <span className="text-cyan-400 font-semibold">N3uralia360</span> develops scalable immersive content for planetariums, rental domes, and exhibitions everywhere.
              </p>
            </div>
          </div>

          {/* Right: Contact Form - Hidden on mobile, 70% on desktop */}
          <div className="hidden sm:flex sm:flex-1 relative overflow-hidden items-center justify-center px-4 sm:px-8">
            <div className="max-w-md w-full">
              <h3 className="text-2xl sm:text-3xl font-light text-slate-300 mb-6 sm:mb-8">
                Submit Your Inquiry
              </h3>

              <form className="space-y-4 sm:space-y-6">
                <div>
                  <label className="text-slate-400 text-xs sm:text-sm mb-2 block">Your email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full bg-transparent border border-slate-600 text-slate-300 px-3 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs sm:text-sm mb-2 sm:mb-3 block">Choose one:</label>
                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 text-cyan-400 focus:ring-0"
                      />
                      <span className="text-slate-400 text-xs sm:text-sm">I would like to see a demo in my dome</span>
                    </label>
                    <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 text-cyan-400 focus:ring-0"
                      />
                      <span className="text-slate-400 text-xs sm:text-sm">I am interested in watching a full episode</span>
                    </label>
                    <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 text-cyan-400 focus:ring-0"
                      />
                      <span className="text-slate-400 text-xs sm:text-sm">I want to commission a custom show</span>
                    </label>
                    <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 text-cyan-400 focus:ring-0"
                      />
                      <span className="text-slate-400 text-xs sm:text-sm">Other</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-4 sm:px-6 py-2 sm:py-3 border border-cyan-400 text-cyan-400 text-xs sm:text-sm font-medium hover:bg-cyan-400/10 transition-colors"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
