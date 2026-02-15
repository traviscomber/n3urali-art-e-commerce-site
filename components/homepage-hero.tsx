'use client'

import Image from 'next/image'

interface HomepageHeroProps {
  featuredImage?: {
    url: string
    alt: string
  }
}

export function HomepageHero({ featuredImage }: HomepageHeroProps) {
  return (
    <section className="w-full bg-black py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-600/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Title, Subtitle, Description */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-blue-300 mb-2 tracking-tight">
                Studio
              </h1>
              <p className="text-lg md:text-xl text-gray-500 font-light">
                Built to Perform
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light">
                Cinematic dome stories, seamless immersive loops, and VR-ready environments — crafted for dome operators, immersive events, and live performance.
              </p>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light">
                Projection-ready. Dome-correct. Instantly deployable.
              </p>
            </div>
          </div>

          {/* Right Column: Video Placeholder */}
          <div className="flex justify-center">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 shadow-2xl border border-gray-700/50 flex items-center justify-center group">
              {/* Video Placeholder Content */}
              <div className="flex flex-col items-center justify-center gap-4 text-center px-6">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <svg className="w-8 h-8 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm md:text-base text-gray-400 font-light">
                    Video Placeholder
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Studio showcase video
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
