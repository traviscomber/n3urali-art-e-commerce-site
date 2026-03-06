'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Collection {
  id: string
  title: string
  work_title?: string
  description?: string
}

interface EnvironmentImage {
  id: string
  title: string
  thumbnail_medium_url?: string
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
  const [selectedNatureCategory, setSelectedNatureCategory] = useState<string | null>(null)

  return (
    <div className="w-full max-w-full overflow-hidden bg-black">
      <section id="nature" className="w-full border-b border-slate-700 py-12 px-6">
        <h2 className="text-4xl md:text-6xl font-light text-slate-100 mb-8">Nature</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {environmentImages
            .filter((img) => img.content_category === 'nature')
            .map((img) => (
              <div
                key={img.id}
                className="relative h-64 rounded-lg overflow-hidden bg-slate-900 hover:opacity-80 transition-opacity"
              >
                {img.thumbnail_medium_url && (
                  <Image
                    src={img.thumbnail_medium_url}
                    alt={img.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            ))}
        </div>
      </section>

      <section id="culture" className="w-full border-b border-slate-700 py-12 px-6">
        <h2 className="text-4xl md:text-6xl font-light text-slate-100 mb-8">Culture</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {environmentImages
            .filter((img) => img.content_category === 'culture')
            .map((img) => (
              <div
                key={img.id}
                className="relative h-64 rounded-lg overflow-hidden bg-slate-900 hover:opacity-80 transition-opacity"
              >
                {img.thumbnail_medium_url && (
                  <Image
                    src={img.thumbnail_medium_url}
                    alt={img.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            ))}
        </div>
      </section>

      <section id="mythic" className="hidden w-full border-b border-slate-700 py-12 px-6">
        <h2 className="text-4xl md:text-6xl font-light text-slate-100 mb-8">Mythic</h2>
      </section>

      <section id="art" className="w-full border-b border-slate-700 py-12 px-6">
        <h2 className="text-4xl md:text-6xl font-light text-slate-100 mb-8">Art</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {environmentImages
            .filter((img) => img.content_category === 'art')
            .map((img) => (
              <div
                key={img.id}
                className="relative h-64 rounded-lg overflow-hidden bg-slate-900 hover:opacity-80 transition-opacity"
              >
                {img.thumbnail_medium_url && (
                  <Image
                    src={img.thumbnail_medium_url}
                    alt={img.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}
