'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Collection {
  id: string
  title: string
  work_title?: string
  description?: string
  synopsis?: string
  code?: string
}

interface EnvironmentImage {
  id: string
  title: string
  thumbnail_medium_url?: string
  original_url?: string
  upscaled_url?: string
  tags?: string[]
  content_category?: string
}

interface EnvironmentsPageClientProps {
  collections: Collection[]
  environmentImages: EnvironmentImage[]
}

export function EnvironmentsPageClient({
  collections,
  environmentImages,
}: EnvironmentsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = ['Nature', 'Culture', 'Mythic', 'Art']

  const getImagesByCategory = (category: string) => {
    return environmentImages.filter(
      (img) => img.content_category?.toLowerCase() === category.toLowerCase()
    )
  }

  return (
    <main className="w-full min-h-screen bg-black">
      {categories.map((category) => (
        <section
          key={category}
          id={category.toLowerCase()}
          className={`w-full border-b border-slate-700 py-12 px-6 sm:px-8 lg:px-12 ${
            category === 'Mythic' ? 'hidden' : ''
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-slate-100 mb-8">
              {category}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getImagesByCategory(category).map((image) => (
                <div
                  key={image.id}
                  className="group relative h-64 rounded-lg overflow-hidden bg-slate-900"
                >
                  {image.thumbnail_medium_url && (
                    <Image
                      src={image.thumbnail_medium_url}
                      alt={image.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <h3 className="text-slate-100 text-sm font-medium">{image.title}</h3>
                  </div>
                </div>
              ))}
            </div>

            {getImagesByCategory(category).length === 0 && (
              <p className="text-slate-400 text-center py-12">No images available</p>
            )}
          </div>
        </section>
      ))}
    </main>
  )
}
