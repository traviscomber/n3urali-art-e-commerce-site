'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { SECTION_BACKGROUND_IMAGES, ENVIRONMENT_COLLECTIONS } from '@/lib/constants/image-urls'

export function EnvironmentsSection() {
  return (
    <section className="w-full bg-black py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-600/60 relative overflow-hidden">
      {/* Background Image - Full coverage */}
      <div className="absolute inset-0 opacity-40">
        <Image
          src={SECTION_BACKGROUND_IMAGES.environments}
          alt="Forest background"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Content overlay */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Environments Header - Hero Section */}
        <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-green-400 mb-4 tracking-tight">
              Environments
            </h2>
            <p className="text-lg md:text-xl text-gray-300 font-light mb-6">
              Endless Immersive Backdrops
            </p>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light mb-4">
              Environments are continuous immersive loops crafted using professional motion tuned specifically for dome perception.
            </p>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light mb-8">
              When you need atmosphere and flexibility
            </p>
            
            <div className="flex gap-4">
              <Link href="/environments" className="px-6 py-3 border border-green-500 text-green-400 hover:bg-green-500/10 transition-colors text-sm font-light">
                FREE Demo
              </Link>
              <Link href="/environments" className="px-6 py-3 border border-gray-600 text-gray-400 hover:border-gray-400 transition-colors text-sm font-light">
                View Catalogue
              </Link>
            </div>
          </div>

          {/* Right Column - Visual space for background (handled by background image) */}
          <div className="hidden lg:block" />
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-600/60 mb-20" />

        {/* Environment Collections Container */}
        <div className="space-y-20">
          {/* Collection 1: Heritage Environments */}
          <EnvironmentCollection
            {...ENVIRONMENT_COLLECTIONS.heritage}
          />

          {/* Collection 2: Mythical Universe */}
          <EnvironmentCollection
            {...ENVIRONMENT_COLLECTIONS.mythical}
          />

          {/* Collection 3: Art Spaces */}
          <EnvironmentCollection
            {...ENVIRONMENT_COLLECTIONS.art}
          />
        </div>
      </div>
    </section>
  )
}

interface EnvironmentCollectionProps {
  title: string
  subtitle: string
  images: Array<{ src: string; alt: string }>
  ctaText: string
  ctaLink: string
  highlightIndex?: number
}

function EnvironmentCollection({
  title,
  subtitle,
  images,
  ctaText,
  ctaLink,
  highlightIndex = 1,
}: EnvironmentCollectionProps) {
  return (
    <div className="space-y-8 pb-12 border-b border-gray-600/60">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-4xl md:text-5xl font-light text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-400 text-sm font-light">
            {subtitle}
          </p>
        </div>
        <div className="mt-6 md:mt-0">
          <Link href={ctaLink} className="inline-flex items-center gap-3 group">
            <span className="text-gray-400 text-sm font-light group-hover:text-cyan-400 transition-colors">
              {ctaText}
            </span>
            <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-cyan-400 transition-colors">
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* Image Grid - 3 Circular Images with Center Highlighted */}
      <div className="flex items-center justify-center gap-6 md:gap-8 flex-wrap">
        {images.map((image, index) => {
          const isHighlighted = index === highlightIndex
          const size = isHighlighted ? 320 : 224
          
          return (
            <button
              key={index}
              onClick={() => window.location.href = ctaLink}
              className={`relative rounded-full overflow-hidden transform transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer flex-shrink-0 ${
                isHighlighted ? 'ring-2 ring-cyan-400/30 hover:ring-cyan-400/60' : ''
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={size}
                height={size}
                className="object-cover rounded-full"
                priority={isHighlighted}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
