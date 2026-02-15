'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useState } from 'react'

interface HeroBlockProps {
  featuredImage?: {
    id: string
    title: string
    original_url?: string
    upscaled_url?: string
    thumbnail_large_url?: string
  }
}

export function HeroBlock({ featuredImage }: HeroBlockProps) {
  const [isHovering, setIsHovering] = useState(false)

  const imageUrl =
    featuredImage?.upscaled_url ||
    featuredImage?.original_url ||
    featuredImage?.thumbnail_large_url ||
    '/mountain-panorama-360-sunrise.png'

  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* Hero Container */}
      <div className="relative h-screen md:h-[70vh] lg:h-[80vh] w-full flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="absolute top-12 z-10">
          <Image
            src="/images/n3uralia-logo.png"
            alt="N3uralia360 Logo"
            width={120}
            height={100}
            className="object-contain"
            priority
          />
        </div>

        {/* Hero Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={imageUrl}
            alt={featuredImage?.title || 'Hero Background'}
            fill
            className="object-cover w-full h-full"
            priority
            quality={85}
          />

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

          {/* Additional subtle vignette effect */}
          <div className="absolute inset-0 bg-radial-gradient opacity-20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8 text-center">
          {/* Heading */}
          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6">
              <span className="block text-pretty">Immersive</span>
              <span className="block text-pretty">Worlds</span>
              <span className="block text-accent">Cultural Stories</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed mt-8">
              We create immersive experiences across dome installations, VR environments, performance loops, and spatial
              media. Each work begins with deep cultural research and unfolds through collaborative artistic vision.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <Link
              href="/gallery"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="px-8 py-3 sm:py-4 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 text-center"
            >
              Explore Gallery
            </Link>

            <Link
              href="/commission"
              className="px-8 py-3 sm:py-4 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 border border-white/40 transition-all duration-300 transform hover:scale-105 text-center"
            >
              Commission
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg
              className="w-6 h-6 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
