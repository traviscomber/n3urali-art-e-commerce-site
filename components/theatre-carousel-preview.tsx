'use client'

import { useState, useEffect } from 'react'

interface CarouselPreviewProps {
  images: any[]
  collections: any[]
}

export function TheatreCarouselPreview({ images, collections }: CarouselPreviewProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Get only equirectangular images for carousel
  const carouselImages = images.filter(img => img.image_format === 'equirectangular').slice(0, 10)

  useEffect(() => {
    if (carouselImages.length <= 1) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      
      setTimeout(() => {
        // Update the index AFTER waiting for transition to complete PLUS extra buffer
        // This ensures the 1-second fade fully finishes rendering before React re-renders
        setCurrentIdx(prev => (prev + 1) % carouselImages.length)
        setIsTransitioning(false)
      }, 1100) // 1100ms: 1000ms for CSS transition + 100ms buffer to ensure fade fully completes
    }, 20000) // 20 seconds per image

    return () => clearInterval(interval)
  }, [carouselImages.length])

  if (carouselImages.length === 0) {
    return <div className="w-full aspect-video bg-gray-900 rounded-lg border border-gray-700" />
  }

  const currentImage = carouselImages[currentIdx]
  const nextIdx = (currentIdx + 1) % carouselImages.length
  const nextImage = carouselImages[nextIdx]

  return (
    <div className="w-full py-16">
      {/* Seamless carousel with cross-dissolve */}
      <div className="relative w-full aspect-video bg-gray-900 overflow-hidden mb-12 border border-gray-700 group">
        {/* Current image - visible by default, only loads when not transitioning */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundImage: `url('${currentImage.thumbnail_medium_url || currentImage.original_url}')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />

        {/* Next image - only renders during transition to avoid loading 2 images */}
        {isTransitioning && (
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-100`}
            style={{
              backgroundImage: `url('${nextImage.thumbnail_medium_url || nextImage.original_url}')`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          />
        )}

        {/* Image info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
          <h3 className="text-2xl font-light">{currentImage.title || 'Theatre Collection'}</h3>
          <p className="text-sm text-gray-300 mt-2">{currentImage.description || ''}</p>
        </div>
      </div>
    </div>
  )
}
