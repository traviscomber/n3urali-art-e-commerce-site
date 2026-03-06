'use client'

import Link from 'next/link'
import Image from 'next/image'

interface HomepageHeroProps {
  videoUrl?: string
}

export function HomepageHero({ videoUrl }: HomepageHeroProps) {
  return (
    <section className="w-full bg-black py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-slate-700/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center">
          {/* Left Column: Title, Subtitle, Description */}
          <div className="flex flex-col gap-6 sm:gap-8">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-light text-blue-300 mb-2 sm:mb-3 tracking-tight leading-none">
                Studio
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-400 font-light tracking-wide">
                Built to Perform
              </p>
            </div>

            <div className="space-y-3 sm:space-y-5">
              <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-relaxed font-light">
                Cinematic dome stories, seamless immersive loops, and VR-ready environments — crafted for dome operators, immersive events, and live performance.
              </p>
              <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-relaxed font-light">
                Projection-ready. Dome-correct. Instantly deployable.
              </p>
            </div>

            <div className="pt-2 sm:pt-4">
              <Link href="/studio">
                <button className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-light text-slate-100 border border-blue-300/40 hover:border-blue-300 hover:text-blue-300 transition-colors duration-300 rounded">
                  Explore Studio
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column: Video - Hidden on mobile */}
          <div className="hidden md:flex justify-center">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-2xl border border-slate-700/60 group">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-400 text-sm">Video not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
