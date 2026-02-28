'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
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
  const [categoryIndex, setCategoryIndex] = useState(0)

  const categories = [
    { name: 'North America', id: 'north-america' },
    { name: 'South America', id: 'south-america' },
    { name: 'Asia', id: 'asia' },
    { name: 'More', id: 'more' },
  ]

  const categoryImages = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_00000000ee7071f59683d205a8420d01-MAJ7wyOFcrHAp7zpe0O3CCtNiN39jv.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_0000000084b4720eab101516c1d517ef-isrhjXPFYMJ2NRAjYnKXaqq7UFm5QK.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/T3-tKVM0mRce88hLOkXMFL3RMTfa90904.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/T31-icn8zhQpqszgBmYVNR57HNzAmikXcO.png',
  ]

  const handleNextCategory = () => {
    setCategoryIndex((prev) => (prev + 1) % categories.length)
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

      {/* Heritage Environments Featured Section */}
      <section className="w-full min-h-screen border-b border-slate-700">
        <div className="w-full h-full flex items-stretch overflow-hidden relative">
          {/* Left: Heritage Info - 30% width */}
          <div className="w-full lg:w-[30%] flex flex-col justify-center py-12 px-8 lg:px-12 flex-shrink-0 section-divider">
            <div className="flex flex-col gap-6 max-w-md">
              <h2 className="text-5xl lg:text-6xl font-light text-slate-300 leading-tight">
                Heritage Environments
              </h2>

              <p className="text-slate-400 text-base leading-relaxed">
                Heritage Environments are immersive journeys inspired by real cultures, architecture, symbolism, and landscapes.
              </p>

              <ul className="space-y-2">
                <li className="flex gap-3 items-start text-slate-400 text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Cinematic and respectful</span>
                </li>
                <li className="flex gap-3 items-start text-slate-400 text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Emotional and accessible</span>
                </li>
                <li className="flex gap-3 items-start text-slate-400 text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Engaging for families and events</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Featured Image and Category Buttons - 70% width */}
          <div className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center px-12 flex-col gap-8">
            {/* Main Featured Image */}
            <div className="relative w-full h-96 rounded-lg overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_00000000ee7071f59683d205a8420d01-MAJ7wyOFcrHAp7zpe0O3CCtNiN39jv.png"
                alt="Heritage Environments"
                fill
                className="object-cover"
              />
            </div>

            {/* Category Buttons with Scroll Arrow */}
            <div className="relative w-full flex items-center gap-6">
              {/* Category Buttons */}
              <div className="flex gap-6 flex-wrap">
                {categories.map((category, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCategoryIndex(idx)}
                    className="flex flex-col items-center gap-3 group"
                  >
                    {/* Category Image or Placeholder */}
                    <div className={`relative w-24 h-24 rounded-full overflow-hidden border-2 transition-all ${
                      idx === categoryIndex ? 'border-cyan-400' : 'border-slate-700'
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
                onClick={handleNextCategory}
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
