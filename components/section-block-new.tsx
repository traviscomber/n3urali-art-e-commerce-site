'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface SectionImage {
  id: string
  title: string
  thumbnail_medium_url?: string
  upscaled_url?: string
  original_url?: string
}

interface SectionBlockProps {
  sectionName: 'studio' | 'environments' | 'realities' | 'theatre'
  title: string
  description: string
  images: SectionImage[]
  viewAllLink: string
  viewAllText?: string
}

const SECTION_COLORS = {
  studio: 'border-blue-500/30 hover:border-blue-500/60',
  environments: 'border-green-500/30 hover:border-green-500/60',
  realities: 'border-purple-500/30 hover:border-purple-500/60',
  theatre: 'border-orange-500/30 hover:border-orange-500/60',
}

export function SectionBlock({
  sectionName,
  title,
  description,
  images,
  viewAllLink,
  viewAllText = 'View All',
}: SectionBlockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-12 lg:mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 text-pretty">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {images.map((image, idx) => {
            const imageUrl =
              image.upscaled_url || image.original_url || image.thumbnail_medium_url || '/placeholder.jpg'

            return (
              <div
                key={image.id}
                className="relative group overflow-hidden rounded-lg aspect-video bg-muted"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Image */}
                <Image
                  src={imageUrl}
                  alt={image.title}
                  fill
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />

                {/* Title Overlay */}
                <div
                  className={`absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                >
                  <h3 className="text-white font-semibold line-clamp-2">{image.title}</h3>
                </div>

                {/* Border Indicator */}
                <div
                  className={`absolute inset-0 border-2 ${SECTION_COLORS[sectionName]} rounded-lg transition-all duration-300 pointer-events-none`}
                />
              </div>
            )
          })}
        </div>

        {/* View All Button */}
        <div className="flex justify-center">
          <Link
            href={viewAllLink}
            className="px-8 py-3 border border-accent text-accent font-semibold rounded-lg hover:bg-accent/10 transition-all duration-300 transform hover:scale-105"
          >
            {viewAllText}
          </Link>
        </div>
      </div>
    </section>
  )
}
