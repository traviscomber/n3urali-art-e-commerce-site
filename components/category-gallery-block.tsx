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
    <>
      {/* Top Divider */}
      <div className="w-full px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="border-b border-border/40" />
          <div className="border-b border-border/20" />
        </div>
      </div>

      {/* Gallery Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Section header */}
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Gallery
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore all {images.length} works in this collection
            </p>
          </div>

          {/* Image grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {images.map((image) => (
              <Link
                key={image.id}
                href={`/photo/${image.id}`}
                className="group relative overflow-hidden rounded-lg aspect-square bg-muted"
                onMouseEnter={() => setHoveredId(image.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Image
                  src={image.upscaled_url || image.thumbnail_medium_url || image.original_url || '/placeholder.jpg'}
                  alt={image.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end p-4">
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
              <p className="text-muted-foreground text-lg">
                No images in this category yet. Check back soon!
              </p>
            </div>
          )}

          {/* View all CTA */}
          {images.length > 0 && (
            <div className="flex justify-center pt-8">
              <Link
                href={`/gallery?category=${category}`}
                className="px-8 py-3 border border-accent text-accent font-semibold rounded-lg hover:bg-accent/10 transition-all duration-300"
              >
                View All Works
              </Link>
            </div>
          )}
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
