'use client'

import { useState } from 'react'
import { PanoramaViewerPSV } from '@/components/panorama-viewer-psv'
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

  if (!images || images.length === 0) {
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

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="min-h-screen w-full bg-black">
      {/* Full-screen Auto-Rotating Panorama Viewer */}
      {isViewerOpen && (
        <PanoramaViewerPSV
          imageUrl={imageUrl}
          title={currentImage.title || 'Panoramic Experience'}
          onClose={() => setIsViewerOpen(false)}
          relaxMode={true}
        />
      )}

      {/* Landing Page - Only shown when viewer is not open */}
      {!isViewerOpen && (
        <>
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
            {/* Panorama Teaser */}
            <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-12 border border-gray-700 group">
              <div
                className="w-full h-full bg-cover bg-center cursor-pointer transition-transform duration-300 group-hover:scale-105"
                style={{
                  backgroundImage: `url('${currentImage.thumbnail_medium_url || imageUrl}')`,
                  backgroundPosition: 'center',
                }}
              />

              {/* GO Button - Opens full auto-rotating panorama */}
              <button
                onClick={() => setIsViewerOpen(true)}
                className="absolute inset-0 m-auto w-24 h-24 rounded-full border-2 border-gray-600 hover:border-cyan-500 transition-all duration-300 flex items-center justify-center z-10 hover:scale-110 hover:bg-black/20"
              >
                <span className="text-cyan-400 text-lg font-light tracking-wider group-hover:text-cyan-300 transition-colors">GO</span>
              </button>

              {/* Info overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6">
                  <h3 className="text-xl font-light text-white">{currentImage.title}</h3>
                  <p className="text-sm text-gray-300 mt-2">Click GO to explore in 360°</p>
                </div>
              </div>
            </div>

            {/* Image Info */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-gray-300 mb-2">
                {currentImage.title}
              </h2>
              <p className="text-gray-500">
                {currentImage.description || 'Explore this immersive panoramic experience'}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                {selectedImageIndex + 1} of {images.length}
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-8 mb-12">
              <button
                onClick={handlePrevious}
                className="p-3 rounded-full border border-gray-700 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all"
                aria-label="Previous panorama"
              >
                <ChevronLeft className="w-6 h-6 text-gray-400 hover:text-cyan-400" />
              </button>

              <div className="flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === selectedImageIndex
                        ? 'bg-cyan-500 w-8'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    aria-label={`Go to panorama ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="p-3 rounded-full border border-gray-700 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all"
                aria-label="Next panorama"
              >
                <ChevronRight className="w-6 h-6 text-gray-400 hover:text-cyan-400" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
