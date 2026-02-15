'use client'

import Image from 'next/image'
import Link from 'next/link'

export function RealitiesSection() {
  const useCases = [
    'School dome programming',
    'Festival headline segments',
    'Branded immersive presentations',
    'Themed event openings',
  ]

  return (
    <section className="w-full bg-black py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-600/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-purple-400 mb-2 tracking-tight">
                R3alities
              </h2>
              <p className="text-lg md:text-xl text-gray-500 font-light">
                Cinematic Dome Stories
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light">
                Designed as mini-shows that hold audience attention from beginning to end, R3alities are perfect for:
              </p>
              
              <ul className="space-y-2">
                {useCases.map((useCase, index) => (
                  <li key={index} className="flex gap-3 items-start">
                    <span className="text-purple-400 text-sm flex-shrink-0 mt-1">•</span>
                    <span className="text-sm md:text-base text-gray-400 font-light">
                      {useCase}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/realities"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group w-fit"
            >
              <span className="text-sm md:text-base font-light">Explore</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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

          {/* Right Column: Circular Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-full overflow-hidden shadow-2xl">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MossyCircle-INNnPq9QQKjyDfVp8lNArf2Gxzz2H6.png"
                alt="R3alities - Cinematic dome stories with whimsical creatures"
                fill
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
