'use client'

import Image from 'next/image'
import Link from 'next/link'

interface ImageGridFeaturedProps {
  images: any[]
  title?: string
}

export function ImageGridFeatured({ images, title = 'Featured Works' }: ImageGridFeaturedProps) {
  return (
    <section className="w-full px-4 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        {title && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              {title}
            </h2>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.slice(0, 9).map((image) => (
            <Link
              key={image.id}
              href={`/photo/${image.id}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border/20 bg-muted transition-all hover:border-foreground/30"
            >
              <Image
                src={image.thumbnail_medium_url || image.file_path || '/placeholder.jpg'}
                alt={image.title || 'Featured work'}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-0 flex items-end p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="space-y-1">
                  {image.title && <h3 className="font-semibold text-white text-sm">{image.title}</h3>}
                  {image.price && <p className="text-xs text-white/70">${image.price}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
