'use client'

import Image from 'next/image'
import Link from 'next/link'

interface CollectionImage {
  id: string
  title: string
  thumbnail_medium_url?: string
  upscaled_url?: string
  original_url?: string
}

interface Collection {
  id: string
  code: string
  title: string
  description?: string
  collection_images?: Array<{
    image_id: string
    images?: CollectionImage
  }>
}

interface FeaturedCollectionsBlockProps {
  collections: Collection[]
}

export function FeaturedCollectionsBlock({ collections }: FeaturedCollectionsBlockProps) {
  return (
    <section className="w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-12 lg:mb-16 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 text-pretty">Featured Collections</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Curated works and cultural narratives that showcase our artistic vision across multiple mediums.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-12">
          {collections.map((collection) => {
            // Get first 4 images from collection
            const images = (collection.collection_images || [])
              .slice(0, 4)
              .map((ci) => ci.images)
              .filter(Boolean) as CollectionImage[]

            return (
              <Link
                key={collection.id}
                href={`/collection/${collection.code}`}
                className="group cursor-pointer"
              >
                <div className="overflow-hidden rounded-xl">
                  {/* Collection Image Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-6 aspect-square bg-muted">
                    {images.length > 0 ? (
                      images.map((img, idx) => {
                        const imageUrl = img.upscaled_url || img.original_url || img.thumbnail_medium_url
                        return (
                          <div
                            key={img.id}
                            className="relative overflow-hidden rounded-lg bg-muted aspect-square"
                          >
                            <Image
                              src={imageUrl || '/placeholder.jpg'}
                              alt={img.title}
                              fill
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                              sizes="(max-width: 768px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                          </div>
                        )
                      })
                    ) : (
                      <div className="col-span-2 bg-muted rounded-lg" />
                    )}
                  </div>

                  {/* Collection Info */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors duration-300">
                      {collection.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2">{collection.description}</p>

                    {/* View Button */}
                    <div className="inline-flex items-center gap-2 mt-4 text-accent font-semibold group-hover:gap-3 transition-all duration-300">
                      View Collection
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* View All Collections Button */}
        <div className="flex justify-center">
          <Link
            href="/collection"
            className="px-8 py-3 border border-accent text-accent font-semibold rounded-lg hover:bg-accent/10 transition-all duration-300 transform hover:scale-105"
          >
            Browse All Collections
          </Link>
        </div>
      </div>
    </section>
  )
}
