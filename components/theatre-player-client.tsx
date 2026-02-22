'use client'

import { useState } from 'react'
import { PanoramaViewer } from '@/components/panorama-viewer'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface Image {
  id: string
  title: string
  thumbnail_medium_url?: string
  original_url?: string
  upscaled_url?: string
  image_format?: string
  description?: string
}

interface Collection {
  id: string
  title?: string
  code?: string
  description?: string
  synopsis?: string
}

interface TheatrePlayerClientProps {
  images: Image[]
  collections: Collection[]
}

export function TheatrePlayerClient({ images, collections }: TheatrePlayerClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  console.log('[v0] TheatrePlayerClient - Images received:', images.length)
  console.log('[v0] TheatrePlayerClient - Collections received:', collections.length)

  if (!images || images.length === 0) {
    console.log('[v0] TheatrePlayerClient - No images, showing fallback')
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-light text-gray-400 mb-4">No Equirectangular Images Available</h2>
          <p className="text-gray-500">Check back soon for immersive 360° experiences.</p>
        </div>
      </div>
    )
  }

  const currentImage = images[selectedImageIndex]
  const imageUrl = currentImage.upscaled_url || currentImage.original_url || currentImage.thumbnail_medium_url || ''
  
  console.log('[v0] Current image:', currentImage.title, 'URL:', imageUrl)

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="min-h-screen w-full bg-black">
      {/* Header Section */}
      <div className="pt-20 pb-12 text-center border-b border-gray-800">
        <h1 className="text-5xl md:text-6xl font-light text-gray-400 mb-6 tracking-wide">
          Theatre
        </h1>
        <div className="space-y-2 text-gray-500 text-sm md:text-base">
          <p>Immerse yourself. No special requirements</p>
          <p>Bigger screen brings better experience</p>
          <p className="mt-4">A Living Immersive Catalog</p>
          <p>New worlds are released regularly</p>
        </div>
      </div>

      {/* Featured Panorama Section */}
      <div className="w-full px-6 py-16 max-w-7xl mx-auto">
        {/* Panorama Viewer */}
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-12 border border-gray-700">
          <PanoramaViewer
            imageUrl={imageUrl}
            title={currentImage.title || 'Panoramic View'}
            isInline={true}
            isPreview={true}
          />

          {/* GO Button - Opens full panorama */}
          <button
            onClick={() => setIsViewerOpen(true)}
            className="absolute inset-0 m-auto w-24 h-24 rounded-full border-2 border-gray-600 hover:border-cyan-500 transition-colors duration-300 flex items-center justify-center z-10 group"
          >
            <span className="text-cyan-400 text-lg font-light tracking-wider group-hover:text-cyan-300 transition-colors">GO</span>
          </button>
        </div>

        {/* Image Info */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-300 mb-2">
            {currentImage.title}
          </h2>
          {currentImage.description && (
            <p className="text-gray-500">
              {currentImage.description}
            </p>
          )}
          <p className="text-gray-600 text-sm mt-4">
            Image {selectedImageIndex + 1} of {images.length}
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-lg border border-gray-700 hover:border-cyan-500 text-gray-400 hover:text-cyan-400 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === selectedImageIndex
                    ? 'w-8 bg-cyan-500'
                    : 'w-2 bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-lg border border-gray-700 hover:border-cyan-500 text-gray-400 hover:text-cyan-400 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Collections Grid */}
        {collections && collections.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-800">
            <h3 className="text-2xl font-light text-gray-300 mb-8 text-center">
              Collections
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="p-6 rounded-lg border-2 border-gray-700 hover:border-cyan-500 transition-all duration-300 text-left group"
                >
                  <h4 className="text-lg font-light text-cyan-400 mb-2 group-hover:text-cyan-300 transition-colors">
                    {collection.title || collection.code}
                  </h4>
                  {collection.synopsis && (
                    <p className="text-gray-400 text-sm mb-4">
                      {collection.synopsis}
                    </p>
                  )}
                  {collection.description && (
                    <p className="text-gray-500 text-sm">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-cyan-400 text-sm font-light mt-4 group-hover:gap-3 transition-all">
                    <span>Explore</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Panorama Modal */}
      {isViewerOpen && (
        <div className="fixed inset-0 z-50 bg-black">
          <PanoramaViewer
            imageUrl={imageUrl}
            title={currentImage.title || 'Panoramic View'}
            onClose={() => setIsViewerOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
