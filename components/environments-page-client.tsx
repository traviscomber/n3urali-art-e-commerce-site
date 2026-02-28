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
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-slate-400 text-base leading-relaxed">
                  {currentCollection.description || 'Continuous atmospheric loops optimized for dome perception and experiential venues.'}
                </p>

                <div className="space-y-3 pt-2">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest opacity-60">Perfect for:</p>
                  <ul className="space-y-1.5">
                    {[
                      'Ambient dome experiences',
                      'Museum installations',
                      'Venue ambiance programming',
                      'Continuous loop experiences',
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-3 items-start text-slate-300 text-sm">
                        <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Main Environment Image - 70% with flex grow to fill remaining space */}
          <div className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center px-8">
            <div className="relative w-4/5 h-4/5 rounded-lg overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_00000000ee7071f59683d205a8420d01-MAJ7wyOFcrHAp7zpe0O3CCtNiN39jv.png"
                alt={currentCollection.title || 'Environment preview'}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Galleries Section */}
      <section className="w-full h-screen border-b border-slate-700">
        <div className="w-full h-full flex items-stretch overflow-hidden relative">
          {/* Left: Galleries Info - 30% width */}
          <div className="w-full lg:w-[30%] flex flex-col justify-center py-12 px-8 lg:px-12 flex-shrink-0 section-divider">
            <div className="flex flex-col gap-6 max-w-md">
              <h2 className="text-6xl lg:text-7xl font-light text-slate-300 leading-tight">
                Galleries:
              </h2>

              <p className="text-slate-400 text-base leading-relaxed">
                Curated environment collections ready for deployment. Choose from our library of atmospheric spaces or commission a custom environment tailored to your venue.
              </p>

              <p className="text-slate-400 text-sm">
                Each environment is optimized for seamless looping and multi-sensory dome perception.
              </p>

              <div className="space-y-2 text-slate-500 text-xs leading-relaxed">
                <p>Professional 4K dome masters</p>
                <p>Seamless loop optimization</p>
                <p>Customizable atmospheric elements</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button className="px-6 py-2 border border-cyan-400 text-cyan-400 text-sm font-medium hover:bg-cyan-400/10 transition-colors">
                  Send Email
                </button>
                <button className="px-6 py-2 border border-cyan-400 text-cyan-400 text-sm font-medium hover:bg-cyan-400/10 transition-colors">
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Right: Environment Previews with Arrow Navigation - 70% width */}
          <div className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center px-12">
            {/* Left: Environment Previews with Up/Down Arrows */}
            <div className="relative flex flex-col items-center gap-4">
              {/* Up Arrow */}
              <button
                onClick={handlePrevPreview}
                className="text-slate-400 hover:text-cyan-400 transition-colors p-2"
                aria-label="Previous environment"
              >
                <ChevronLeft size={32} className="rotate-90" />
              </button>

              {/* Environment Previews - Current and Next */}
              <div className="flex flex-col gap-3">
                {/* Current Preview */}
                <button
                  onClick={() => handlePreviewClick(previewIndex)}
                  className={`relative w-40 h-40 rounded-lg overflow-hidden border transition-all border-cyan-400 shadow-lg shadow-cyan-400/30`}
                >
                  <Image
                    src={previews[previewIndex]?.image}
                    alt={previews[previewIndex]?.title}
                    fill
                    className="object-cover"
                  />
                </button>

                {/* Next Preview */}
                <button
                  onClick={() => handlePreviewClick((previewIndex + 1) % previews.length)}
                  className={`relative w-40 h-40 rounded-lg overflow-hidden border transition-all border-slate-700 hover:border-cyan-400`}
                >
                  <Image
                    src={previews[(previewIndex + 1) % previews.length]?.image}
                    alt={previews[(previewIndex + 1) % previews.length]?.title}
                    fill
                    className="object-cover"
                  />
                </button>
              </div>

              {/* Down Arrow */}
              <button
                onClick={handleNextPreview}
                className="text-slate-400 hover:text-cyan-400 transition-colors p-2"
                aria-label="Next environment"
              >
                <ChevronLeft size={32} className="-rotate-90" />
              </button>
            </div>

            {/* Right: Main Gallery Preview */}
            <div className="relative flex-1 flex flex-col items-center ml-12">
              <div className="relative w-full max-w-xl aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
                <Image
                  src={previews[previewIndex]?.image}
                  alt={previews[previewIndex]?.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section className="w-full h-screen border-b border-slate-700">
        <div className="w-full h-full flex items-stretch overflow-hidden relative">
          {/* Left: Specifications Info - 30% width */}
          <div className="w-full lg:w-[30%] flex flex-col justify-center py-12 px-8 lg:px-12 flex-shrink-0 section-divider">
            <div className="flex flex-col gap-6 max-w-md">
              <h2 className="text-6xl lg:text-7xl font-light text-slate-300 leading-tight">
                Specifications
              </h2>

              <p className="text-slate-400 text-base leading-relaxed">
                All environments are delivered in professional 4K resolution optimized for full-dome projection, VR, and immersive installations worldwide.
              </p>

              <div className="space-y-3">
                <p className="text-slate-500 text-sm font-medium">Our environment library includes:</p>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex gap-3 items-start">
                    <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                    <span>Dome-ready 4K masters</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                    <span>Seamless loop optimization</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                    <span>360° equirectangular formats</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                    <span>Projection-ready delivery</span>
                  </li>
                </ul>
              </div>

              <p className="text-slate-400 text-sm">
                <span className="text-cyan-400 font-semibold">N3uralia360</span> develops scalable immersive environments for planetariums, museums, and experiential venues globally.
              </p>
            </div>
          </div>

          {/* Right: Contact Form - 70% width */}
          <div className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center px-12">
            <div className="max-w-md w-full">
              <h3 className="text-3xl font-light text-slate-300 mb-8">
                Request Environment
              </h3>

              <form className="space-y-6">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Your email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full bg-transparent border border-slate-600 text-slate-300 px-4 py-2 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm mb-3 block">Choose one:</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 text-cyan-400 focus:ring-0"
                      />
                      <span className="text-slate-400 text-sm">I want to see a demo environment</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 text-cyan-400 focus:ring-0"
                      />
                      <span className="text-slate-400 text-sm">I am interested in a specific theme</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 text-cyan-400 focus:ring-0"
                      />
                      <span className="text-slate-400 text-sm">I want to commission a custom environment</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 text-cyan-400 focus:ring-0"
                      />
                      <span className="text-slate-400 text-sm">Other</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 border border-cyan-400 text-cyan-400 text-sm font-medium hover:bg-cyan-400/10 transition-colors"
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
