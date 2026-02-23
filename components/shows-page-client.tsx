'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Collection {
  id: string
  title: string
  work_title?: string
  description?: string
  synopsis?: string
  featured_image_url?: string
  format_types?: string[]
  code?: string
}

interface TeaserImage {
  id: string
  title: string
  thumbnail_medium_url?: string
  original_url?: string
  upscaled_url?: string
  tags?: string[]
}

interface ShowsPageClientProps {
  collections: Collection[]
  teaserImages: TeaserImage[]
}

export function ShowsPageClient({ collections, teaserImages }: ShowsPageClientProps) {
  const [currentTeaserIndex, setCurrentTeaserIndex] = useState(0)
  const [selectedTeaserIndex, setSelectedTeaserIndex] = useState<number | null>(null)

  const featuredCollection = collections?.[0]
  const featuredImage = teaserImages?.[0]
  const teaserLabels = ['Heritage', 'Education', 'Fun']

  // Map teaser labels to button image URLs (the square button designs)
  const teaserButtonImages: Record<string, string> = {
    'Heritage': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HeritageButtonShowPage%20%281%29-UTOiJnPQYrWs6eoV58npFHyJGXFzrR.png',
    'Education': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EducationButtonShowPage-7Cbh8lnKGVveRFY7gN0mLW8JagRgPS.png',
    'Fun': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FunButtonShowPage-JhOWIO4GjW22okIs8IPV2s8JofS8SI.png'
  }

  // Map teaser labels to custom video URLs
  const teaserVideoUrls: Record<string, string> = {
    'Heritage': 'https://f005.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z98ffc2d7197217df97910c16_f107090e62b7fa63f_d20260222_m232412_c005_v0501037_t0027_u01771802652244',
    'Education': '',
    'Fun': ''
  }

  const handleTeaserNext = () => {
    setCurrentTeaserIndex((prev) => (prev + 1) % teaserImages.length)
  }

  const handleTeaserPrev = () => {
    setCurrentTeaserIndex((prev) => (prev - 1 + teaserImages.length) % teaserImages.length)
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-6 sm:px-8 lg:px-12 py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: Content */}
            <div className="flex flex-col gap-8 pt-0">
              <div>
                <h1 className="text-7xl md:text-8xl font-light text-slate-400 leading-tight mb-2">
                  Shows
                </h1>
                <p className="text-slate-500 text-base tracking-wide">Cinematic Dome Stories</p>
              </div>

              {/* Featured Show Description */}
              <div className="space-y-6">
                <div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    {featuredCollection?.synopsis || 'Meet Mossy — Guide of the Multiverse'}
                  </p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {featuredCollection?.description || 'From mythical realms to sacred atmospheres, cinematic side of N3uralia360.'}
                  </p>
                </div>

                {/* Perfect For */}
                <div className="space-y-3">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Perfect for:</p>
                  <ul className="space-y-2">
                    <li className="flex gap-3 items-start text-slate-300 text-sm">
                      <span className="text-cyan-400 flex-shrink-0 mt-0.5">•</span>
                      <span>Family dome nights</span>
                    </li>
                    <li className="flex gap-3 items-start text-slate-300 text-sm">
                      <span className="text-cyan-400 flex-shrink-0 mt-0.5">•</span>
                      <span>Cultural programming</span>
                    </li>
                    <li className="flex gap-3 items-start text-slate-300 text-sm">
                      <span className="text-cyan-400 flex-shrink-0 mt-0.5">•</span>
                      <span>Branded immersive events</span>
                    </li>
                  </ul>
                </div>

                {/* Production Details */}
                <p className="text-slate-400 text-xs leading-relaxed pt-4 border-t border-slate-700">
                  Real 4K, ready to be distributed and custom storytelling creation.
                </p>
              </div>
            </div>

            {/* Right: Featured Image */}
            <div className="flex justify-end items-start">
              <div className="relative w-full max-w-sm">
                <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-700/50">
                  <Image
                    src={featuredImage?.upscaled_url || featuredImage?.original_url || featuredImage?.thumbnail_medium_url || '/placeholder.svg?height=400&width=400'}
                    alt={featuredImage?.title || featuredCollection?.title || 'Featured show'}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {featuredCollection?.title && (
                  <div className="mt-6 text-center">
                    <p className="text-cyan-300 font-light text-2xl italic mb-1">
                      {featuredCollection.title}
                    </p>
                    <p className="text-slate-400 text-xs tracking-wide">1×1 Video block with {featuredCollection.title}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Player Section with Side Teaser Carousel */}
      <section className="px-6 sm:px-8 lg:px-12 py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-4xl font-light text-slate-400 mb-12">Teasers:</h2>

          {/* Side-by-side layout: Teasers on left, Video player on right */}
          <div className="grid grid-cols-1 lg:grid-cols-[140px_1fr] gap-12 items-start">
            
            {/* Left: Compact vertical teaser list - Smaller thumbnail buttons */}
            <div className="flex flex-col items-stretch gap-3">
              {/* Display 3 teasers vertically - Compact squares */}
              {teaserLabels.map((label, index) => {
                const isSelected = selectedTeaserIndex === index
                const buttonImageUrl = teaserButtonImages[label]
                
                return (
                  <div
                    key={`teaser-${index}`}
                    onClick={() => setSelectedTeaserIndex(index)}
                    className={`relative w-full h-32 rounded-sm overflow-hidden cursor-pointer group transition-all duration-300 ${
                      isSelected ? 'ring-2 ring-cyan-400' : 'ring-1 ring-slate-700 group-hover:ring-slate-500'
                    }`}
                  >
                    {/* Background Image - Full bleed, no text overlay */}
                    <Image
                      src={buttonImageUrl}
                      alt={label}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Selection overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/20" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Right: Video Player (Square - Better balanced size) */}
            <div className="relative w-full max-w-lg aspect-square rounded-md overflow-hidden bg-black">
              <video
                key={selectedTeaserIndex}
                src={selectedTeaserIndex !== null ? (teaserVideoUrls[teaserLabels[selectedTeaserIndex]] || teaserImages[selectedTeaserIndex]?.upscaled_url || teaserImages[selectedTeaserIndex]?.original_url || '') : 'https://f005.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z98ffc2d7197217df97910c16_f107090e62b7fa63f_d20260222_m232412_c005_v0501037_t0027_u01771802652244'}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="px-6 sm:px-8 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-5xl font-light text-slate-400 mb-6">Deliverables</h2>

          <p className="text-slate-400 text-sm leading-relaxed mb-12 max-w-md">
            Simple show licensing or custom created show. Real 4K quality.
          </p>

          <button className="px-8 py-3 border border-slate-500 text-slate-300 hover:border-cyan-400 hover:text-cyan-400 transition-colors rounded-sm text-sm font-light uppercase tracking-wider">
            Ask Question
          </button>
        </div>
      </section>
    </div>
  )
}
