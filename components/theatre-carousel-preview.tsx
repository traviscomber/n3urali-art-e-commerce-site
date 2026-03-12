'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const PanoramaViewerPSV = dynamic(() => import('@/components/panorama-viewer-psv').then(mod => mod.PanoramaViewerPSV), { ssr: false })

interface CarouselPreviewProps {
  images: any[]
  collections: any[]
}

export function TheatreCarouselPreview({ images, collections }: CarouselPreviewProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  // Get only equirectangular images for carousel
  const carouselImages = images.filter(img => img.image_format === 'equirectangular').slice(0, 10)

  useEffect(() => {
    if (carouselImages.length <= 1) return
    if (isViewerOpen) return // Don't auto-rotate when viewer is open

    const interval = setInterval(() => {
      // Start transition at 17 seconds (last 3 seconds of 20-second display)
      // This creates a longer overlapping fade where the next image appears while current is still visible
      setIsTransitioning(true)
      
      setTimeout(() => {
        // Update the index AFTER waiting for transition to complete PLUS extra buffer
        // This ensures the 1-second fade fully finishes rendering before React re-renders
        setCurrentIdx(prev => (prev + 1) % carouselImages.length)
        setIsTransitioning(false)
      }, 1100) // 1100ms: 1000ms for CSS transition + 100ms buffer to ensure fade fully completes
    }, 17000) // Start the 1-second fade at 17 seconds, giving 3 seconds of overlap before the next image cycle

    return () => clearInterval(interval)
  }, [carouselImages.length, isViewerOpen])

  // Auto-rotate panorama in fullscreen viewer
  useEffect(() => {
    if (!isViewerOpen) return
    if (carouselImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % carouselImages.length)
    }, 20000) // 20 seconds per image in viewer

    return () => clearInterval(interval)
  }, [isViewerOpen, carouselImages.length])

  if (carouselImages.length === 0) {
    return <div className="w-full aspect-video bg-gray-900 rounded-lg border border-gray-700" />
  }

  const currentImage = carouselImages[currentIdx]
  const nextIdx = (currentIdx + 1) % carouselImages.length
  const nextImage = carouselImages[nextIdx]
  const imageUrl = currentImage.original_url || currentImage.upscaled_url

  return (
    <>
      <div className="w-full py-16">
        {/* Seamless carousel with cross-dissolve and GO button */}
        <div 
          className="relative w-full aspect-video bg-gray-900 overflow-hidden mb-12 border border-gray-700 group cursor-pointer hover:border-gray-500 transition-colors"
        >
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

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

          {/* Centered GO button */}
          <button
            onClick={() => setIsViewerOpen(true)}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 border-2 border-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform group-hover:border-amber-100">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-white text-lg font-light tracking-widest group-hover:text-amber-100 transition-colors">GO</span>
            </div>
          </button>
        </div>
      </div>

      {/* Panorama Viewer Modal */}
      {isViewerOpen && imageUrl && (
        <PanoramaViewerPSV
          imageUrl={imageUrl}
          title={currentImage.title || 'Theatre Collection'}
          onClose={() => setIsViewerOpen(false)}
          relaxMode={true}
          fov={130}
          sphereScale={5000}
          rotationSpeed={0.0002}
          initialYaw={0}
        />
      )}
    </>
  )
}
