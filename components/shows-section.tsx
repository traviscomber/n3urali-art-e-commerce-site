'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LANDING_PAGE_IMAGES } from '@/lib/constants/image-urls'

export function ShowsSection() {
  const useCases = [
    'School dome programming',
    'Festival headline segments',
    'Branded immersive presentations',
    'Themed event openings',
  ]

  return (
    <section className="w-full max-w-full overflow-hidden bg-black py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-slate-700/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center">
          {/* Left Column: Content */}
          <div className="flex flex-col gap-6 sm:gap-8">
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-light text-purple-400 mb-2 sm:mb-3 tracking-tight leading-none">
                Shows
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-400 font-light tracking-wide">
                Cinematic Dome Stories
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-relaxed font-light">
                Designed as mini-shows that hold audience attention from beginning to end, our Shows are perfect for:
              </p>
              
              <ul className="space-y-2 sm:space-y-3">
                {useCases.map((useCase, index) => (
                  <li key={index} className="flex gap-3 items-start">
                    <span className="text-purple-400 text-xs sm:text-sm flex-shrink-0 mt-1">◆</span>
                    <span className="text-xs sm:text-sm md:text-base text-slate-400 font-light">
                      {useCase}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <Link
                href="/shows"
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-light text-slate-100 border border-purple-400/40 hover:border-purple-400 hover:text-purple-400 transition-all duration-300 group rounded"
              >
                <span>Explore Shows</span>
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column: Circular Image */}
          <div className="flex justify-center mt-8 md:mt-0">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-full md:max-w-md aspect-square rounded-full overflow-hidden shadow-2xl border-2 border-slate-700/60 group">
              <Image
                src={LANDING_PAGE_IMAGES.shows}
                alt="Shows - Cinematic dome stories with whimsical creatures"
                fill
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
