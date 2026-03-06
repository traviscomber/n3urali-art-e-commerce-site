'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
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
  const [selectedNatureCategory, setSelectedNatureCategory] = useState<string>('oceans')
  const [showingCategory, setShowingCategory] = useState<string | null>(null)

  const natureCategoryOptions = [
    { id: 'oceans', label: 'Oceans' },
    { id: 'volcanoes', label: 'Volcanoes' },
    { id: 'underwater', label: 'Underwater' },
    { id: 'ice-and-snow', label: 'Ice & Snow' },
  ]

  const mythicCategoryOptions = [
    { id: 'celestial', label: 'Celestial' },
    { id: 'legends', label: 'Legends' },
    { id: 'ancient', label: 'Ancient' },
    { id: 'ethereal', label: 'Ethereal' },
  ]

  // Filter images by category
  const getNatureImagesByCategory = (categoryId: string) => {
    return environmentImages.filter(
      (img) =>
        img.content_category?.toLowerCase() === 'nature' &&
        img.tags?.some((tag) => tag.toLowerCase().includes(categoryId.toLowerCase()))
    )
  }

  const getMythicImagesByCategory = (categoryId: string) => {
    return environmentImages.filter(
      (img) =>
        img.content_category?.toLowerCase() === 'mythic' &&
        img.tags?.some((tag) => tag.toLowerCase().includes(categoryId.toLowerCase()))
    )
  }

  const getCultureImages = () => {
    return environmentImages.filter((img) => img.content_category?.toLowerCase() === 'culture')
  }

  const getArtImages = () => {
    return environmentImages.filter((img) => img.content_category?.toLowerCase() === 'art')
  }

  const handleNextArtCategory = () => {
    const currentIndex = natureCategoryOptions.findIndex((opt) => opt.id === selectedNatureCategory)
    const nextIndex = (currentIndex + 1) % natureCategoryOptions.length
    setSelectedNatureCategory(natureCategoryOptions[nextIndex].id)
  }

  return (
    <main className="w-full min-h-screen bg-black">
      {/* Nature Section */}
      <section className="w-full border-b border-slate-700 py-12 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-light text-slate-100 mb-2">Nature</h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-8 max-w-2xl">
            Explore Earth's most stunning natural landscapes and environments
          </p>

          {/* Category Navigation */}
          <div className="flex items-center gap-2 sm:gap-4 mb-8 overflow-x-auto pb-2">
            {natureCategoryOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedNatureCategory(option.id)}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  selectedNatureCategory === option.id
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {getNatureImagesByCategory(selectedNatureCategory).map((image) => (
              <div
                key={image.id}
                className="group relative h-64 sm:h-72 rounded-lg overflow-hidden bg-slate-900 cursor-pointer"
              >
                {image.thumbnail_medium_url && (
                  <Image
                    src={image.thumbnail_medium_url}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div>
                    <h3 className="text-slate-100 font-medium text-sm">{image.title}</h3>
                    {image.tags && image.tags.length > 0 && (
                      <p className="text-cyan-400 text-xs mt-1">{image.tags.join(' • ')}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {getNatureImagesByCategory(selectedNatureCategory).length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm">No images available for this category</p>
            </div>
          )}
        </div>
      </section>

      {/* Culture Section */}
      <section className="w-full border-b border-slate-700 py-12 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-light text-slate-100 mb-2">Culture</h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-8 max-w-2xl">
            Discover cultural richness and heritage from around the world
          </p>

          {/* Image Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {getCultureImages().map((image) => (
              <div
                key={image.id}
                className="group relative h-64 sm:h-72 rounded-lg overflow-hidden bg-slate-900 cursor-pointer"
              >
                {image.thumbnail_medium_url && (
                  <Image
                    src={image.thumbnail_medium_url}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div>
                    <h3 className="text-slate-100 font-medium text-sm">{image.title}</h3>
                    {image.tags && image.tags.length > 0 && (
                      <p className="text-cyan-400 text-xs mt-1">{image.tags.join(' • ')}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {getCultureImages().length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm">No images available</p>
            </div>
          )}
        </div>
      </section>

      {/* Mythic Section - Hidden */}
      {false && (
        <section className="w-full border-b border-slate-700 py-12 px-6 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-light text-slate-100 mb-2">Mythic</h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-8 max-w-2xl">
              Experience immersive mythical realms and legendary worlds
            </p>

            {/* Category Navigation */}
            <div className="flex items-center gap-2 sm:gap-4 mb-8 overflow-x-auto pb-2">
              {mythicCategoryOptions.map((option) => (
                <button
                  key={option.id}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-300 transition-all whitespace-nowrap"
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {getMythicImagesByCategory('celestial').map((image) => (
                <div
                  key={image.id}
                  className="group relative h-64 sm:h-72 rounded-lg overflow-hidden bg-slate-900 cursor-pointer"
                >
                  {image.thumbnail_medium_url && (
                    <Image
                      src={image.thumbnail_medium_url}
                      alt={image.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div>
                      <h3 className="text-slate-100 font-medium text-sm">{image.title}</h3>
                      {image.tags && image.tags.length > 0 && (
                        <p className="text-cyan-400 text-xs mt-1">{image.tags.join(' • ')}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Art Section */}
      <section className="w-full py-12 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-light text-slate-100 mb-2">Art</h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-8 max-w-2xl">
            Experience immersive artistic expressions and creative visions
          </p>

          {/* Image Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {getArtImages().map((image) => (
              <div
                key={image.id}
                className="group relative h-64 sm:h-72 rounded-lg overflow-hidden bg-slate-900 cursor-pointer"
              >
                {image.thumbnail_medium_url && (
                  <Image
                    src={image.thumbnail_medium_url}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div>
                    <h3 className="text-slate-100 font-medium text-sm">{image.title}</h3>
                    {image.tags && image.tags.length > 0 && (
                      <p className="text-cyan-400 text-xs mt-1">{image.tags.join(' • ')}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {getArtImages().length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm">No images available</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
