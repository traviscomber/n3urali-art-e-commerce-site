'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface CategoryHeroBlockProps {
  category: 'studio' | 'environments' | 'realities' | 'theatre'
  title: string
  description: string
  imageCount?: number
  heroImage?: string
}

const CATEGORY_COLORS = {
  studio: {
    accent: 'from-blue-600/40 to-blue-900/40',
    button: 'bg-blue-600 hover:bg-blue-700',
    text: 'text-blue-300',
    label: 'border-blue-400/50 text-blue-300',
  },
  environments: {
    accent: 'from-green-600/40 to-green-900/40',
    button: 'bg-green-600 hover:bg-green-700',
    text: 'text-green-300',
    label: 'border-green-400/50 text-green-300',
  },
  realities: {
    accent: 'from-purple-600/40 to-purple-900/40',
    button: 'bg-purple-600 hover:bg-purple-700',
    text: 'text-purple-300',
    label: 'border-purple-400/50 text-purple-300',
  },
  theatre: {
    accent: 'from-orange-600/40 to-orange-900/40',
    button: 'bg-orange-600 hover:bg-orange-700',
    text: 'text-orange-300',
    label: 'border-orange-400/50 text-orange-300',
  },
}

export function CategoryHeroBlock({
  category,
  title,
  description,
  imageCount = 0,
  heroImage = '/mountain-panorama-360-sunrise.png',
}: CategoryHeroBlockProps) {
  const [isHovering, setIsHovering] = useState(false)
  const colors = CATEGORY_COLORS[category]
  const categoryDisplayName = category.charAt(0).toUpperCase() + category.slice(1)

  return (
    <>
      {/* Top Divider */}
      <div className="w-full px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="border-b border-border/40" />
          <div className="border-b border-border/20" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-background">
        <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] w-full flex flex-col items-center justify-center">
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={heroImage}
              alt={title}
              fill
              className="object-cover w-full h-full"
              priority
              quality={85}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.accent}`} />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8 text-center">
            {/* Category Label */}
            <div className={`mb-4 px-4 py-2 rounded-full border ${colors.label} text-sm font-semibold uppercase tracking-wide`}>
              {categoryDisplayName}
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6 text-pretty">
              {title}
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed mb-8">
              {description}
            </p>

            {/* Image Count */}
            {imageCount > 0 && (
              <p className="text-sm text-gray-400 mb-12">
                {imageCount} immersive experiences
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${category === 'theatre' ? 'theatre/all' : category}`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className={`px-8 py-4 ${colors.button} text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-center`}
              >
                Explore Gallery
              </Link>

              <Link
                href="/commission"
                className="px-8 py-4 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 border border-white/40 transition-all duration-300 transform hover:scale-105 text-center"
              >
                Commission
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Divider */}
      <div className="w-full px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="border-b border-border/20" />
          <div className="border-b border-border/40" />
        </div>
      </div>
    </>
  )
}
