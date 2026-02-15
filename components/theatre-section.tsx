'use client'

import Image from 'next/image'
import Link from 'next/link'

export function TheatreSection() {
  return (
    <section className="w-full bg-black py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-600/60">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-5xl md:text-6xl font-light text-gray-400 mb-4">
            Theatre
          </h2>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-400 mb-2">Immerse yourself. No special requirements</p>
              <p className="text-sm text-gray-400">Bigger screen brings better experience</p>
            </div>

            <div className="pt-4 border-t border-gray-700/50">
              <p className="text-sm text-gray-300 font-light mb-1">A Living Immersive Catalog</p>
              <p className="text-sm text-gray-500">New worlds are released regularly</p>
            </div>
          </div>

          {/* Right: Image with GO button */}
          <div className="relative">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DYiD3vnRNQc9fda9myUBaQR8CQGZva.png"
                alt="Theatre immersive experience"
                fill
                className="object-cover"
              />

              {/* GO Button Overlay */}
              <Link
                href="/theatre"
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="w-20 h-20 rounded-full border border-gray-400 flex items-center justify-center text-gray-300 text-lg font-light group-hover:bg-gray-900/50 transition-all duration-300">
                  GO
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
