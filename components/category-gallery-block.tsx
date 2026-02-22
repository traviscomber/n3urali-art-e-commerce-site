'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface ImageData {
  id: string
  title: string
  thumbnail_medium_url?: string
  original_url?: string
  upscaled_url?: string
}

interface CategoryGalleryBlockProps {
  images: ImageData[]
  category: string
}

export function CategoryGalleryBlock({
  images,
  category,
}: CategoryGalleryBlockProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="space-y-8">
        {/* Section header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Gallery
          </h2>
          <p className="text-gray-400">
            Explore all {images.length} works in this collection
          </p>
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {images.map((image) => (
            <Link
              key={image.id}
              href={`/photo/${image.id}`}
              className="group relative overflow-hidden rounded-lg aspect-square bg-gray-900"
              onMouseEnter={() => setHoveredId(image.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Image
                src={image.thumbnail_medium_url || image.original_url || '/placeholder.jpg'}
                alt={image.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="text-white">
                  <h3 className="font-semibold text-base line-clamp-2">
                    {image.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {images.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              No images in this category yet. Check back soon!
            </p>
          </div>
        )}

        {/* View all CTA */}
        {images.length > 0 && (
          <div className="flex justify-center pt-8">
            <Link
              href={`/gallery?category=${category}`}
              className="inline-block px-8 py-3 border border-gray-600 text-foreground font-semibold rounded-lg hover:bg-gray-900 transition-colors"
            >
              View All Works
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
