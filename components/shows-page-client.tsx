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

  const featuredCollection = collections[0]
  const teaserLabels = ['Heritage', 'Education', 'Fun', 'Art']

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
              {featuredCollection && (
                <div className="space-y-6">
                  <div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      {featuredCollection.synopsis || featuredCollection.description || 'Experience immersive cinematic stories'}
                    </p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      From mythical realms to sacred atmospheres, cinematic side of N3uralia360.
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
              )}
            </div>

            {/* Right: Featured Image */}
            <div className="flex justify-end items-start">
              <div className="relative w-full max-w-sm">
                <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-700/50">
                  <Image
                    src={featuredCollection?.featured_image_url || '/placeholder.svg?height=400&width=400'}
                    alt={featuredCollection?.title || 'Featured show'}
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

      {/* Teasers Section */}
      {teaserImages.length > 0 && (
        <section className="px-6 sm:px-8 lg:px-12 py-20 border-b border-slate-800">
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="text-4xl font-light text-slate-400 mb-12">Teasers:</h2>

            {/* Teaser Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teaserImages.slice(0, 4).map((image, index) => (
                <div key={image.id} className="relative aspect-square rounded-md overflow-hidden group cursor-pointer">
                  <Image
                    src={image.upscaled_url || image.original_url || image.thumbnail_medium_url || '/placeholder.svg'}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Label Overlay - centered */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center">
                    <p className="text-white text-xl md:text-2xl font-bold uppercase tracking-wider drop-shadow-lg">
                      {teaserLabels[index] || image.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video Player Section */}
      <section className="px-6 sm:px-8 lg:px-12 py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto w-full">
          <div className="relative w-full aspect-video rounded-md overflow-hidden bg-slate-900">
            <Image
              src="https://images.unsplash.com/photo-1566961236-e5cb944e0bf0?w=1400&h=800&fit=crop"
              alt="Video player"
              fill
              className="object-cover"
            />
            {/* Text Overlay - positioned upper left */}
            <div className="absolute inset-0 flex items-start justify-start pt-12 pl-12 bg-black/20">
              <p className="text-5xl md:text-6xl font-light text-white drop-shadow-lg">video player</p>
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
