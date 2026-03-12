'use client'

import { useState, useEffect } from 'react'
import { PanoramaViewerPSV } from '@/components/panorama-viewer-psv'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useLanguage } from '@/lib/contexts/language-context'

interface Image {
  id: string
  title: string
  thumbnail_medium_url?: string
  original_url?: string
  upscaled_url?: string
  image_format?: string
  description?: string
  tags?: string[]
  content_category?: string // Theatre photo category (e.g., "Nature/Ocean-Surreal")
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
  const { t } = useLanguage()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)

  // Map of panorama titles to translation keys for dynamic translation
  const panoramaMap: Record<string, { title: string; desc: string }> = {
    "Aurora Borealis Ice Formations": { title: "theatre.panorama.aurora", desc: "theatre.panorama.auroraDesc" },
    "Glacial Valley Aurora": { title: "theatre.panorama.glacial", desc: "theatre.panorama.glacialDesc" },
    "Abstract Mountain Ice Vortex": { title: "theatre.panorama.abstractMountain", desc: "theatre.panorama.abstractMountainDesc" },
    "Radiant Ice Cave": { title: "theatre.panorama.radiantIce", desc: "theatre.panorama.radiantIceDesc" },
    "Crystalline Ice Shards": { title: "theatre.panorama.crystalline", desc: "theatre.panorama.crystallineDesc" },
    "Immersive Worlds - Panoramic View": { title: "theatre.panorama.immersiveWorlds", desc: "theatre.panorama.immersiveWorldsDesc" },
    "Cultural Journeys - Indo Expedition": { title: "theatre.panorama.culturalJourneys", desc: "theatre.panorama.culturalJourneysDesc" },
    "Digital Art - Contemporary Expression": { title: "theatre.panorama.digitalArt", desc: "theatre.panorama.digitalArtDesc" },
  }

  // Generate proper title - show category name from content_category (e.g., "Art/Escher")
  const getProperTitle = (image: Image): string => {
    // First priority: use the category name from content_category
    if (image.content_category) {
      // Format "Art/Bosch-Graspher" -> "Art / Bosch Graspher"
      const parts = image.content_category.split('/')
      return parts
        .map(part =>
          part
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
        )
        .join(' / ')
    }
    
    // Fallback: use image title
    if (image.title && image.title.trim()) {
      return image.title
    }
    
    return 'Untitled'
  }

  // Function to get translated panorama description
  const getTranslatedDescription = (description: string | undefined): string => {
    return description || ''
  }

  // Get all related images (same category or primary subcategory tag)
  // For theatre photos: uses content_category (e.g., "Nature/Ocean-Surreal")
  // For legacy images: uses first tag as primary subcategory
  const getRelatedImages = (imageIndex: number): Image[] => {
    const currentImage = images[imageIndex]
    
    // If this is a theatre photo with content_category, group by that
    if (currentImage?.content_category) {
      return images.filter(img => img.content_category === currentImage.content_category)
    }
    
    // Legacy: group by first tag
    if (!currentImage?.tags || currentImage.tags.length === 0) {
      // If no tags, return only this image
      return [currentImage]
    }

    // Use the first tag as the primary subcategory (e.g., "Forest", "Ocean")
    const primaryTag = currentImage.tags[0]
    
    // Find all images with the same primary tag (same subcategory)
    return images.filter(img => {
      if (!img.tags || img.tags.length === 0) return false
      return img.tags[0] === primaryTag
    })
  }

  // Auto-rotate related images every 30 seconds when in fullscreen viewer
  useEffect(() => {
    if (!isViewerOpen) return // Only auto-rotate when viewer IS open

    const relatedImages = getRelatedImages(selectedImageIndex)

    // If only 1 related image, no need to rotate
    if (relatedImages.length <= 1) return

    const interval = setInterval(() => {
      setSlideDirection('right') // Current slides right, next slides in from left
      setTimeout(() => {
        // Find current image in related images and rotate to next
        const currentIdx = relatedImages.findIndex(img => img.id === images[selectedImageIndex].id)
        const nextIdx = (currentIdx + 1) % relatedImages.length
        const nextImage = relatedImages[nextIdx]
        const nextImageIndex = images.findIndex(img => img.id === nextImage.id)
        setSelectedImageIndex(nextImageIndex)
        setSlideDirection(null)
      }, 1000) // 1 second slide duration
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [isViewerOpen, selectedImageIndex, images])

  if (!images || images.length === 0) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-light text-gray-400 mb-4">{t('theatre.noImages')}</h2>
          <p className="text-gray-500">{t('theatre.checkBack')}</p>
        </div>
      </div>
    )
  }

  const currentImage = images[selectedImageIndex]
  const imageUrl = currentImage.upscaled_url || currentImage.original_url || currentImage.thumbnail_medium_url || ''
  
  // Compute related images and index - safe to compute on both server and client
  const relatedImages = getRelatedImages(selectedImageIndex)
  const currentRelatedIndex = relatedImages.findIndex(img => img.id === currentImage.id) + 1

  const handlePrevious = () => {
    const currentRelated = getRelatedImages(selectedImageIndex)
    
    if (currentRelated.length <= 1) return // No navigation if only 1 related image
    
    const currentIdx = currentRelated.findIndex(img => img.id === images[selectedImageIndex].id)
    const prevIdx = (currentIdx - 1 + currentRelated.length) % currentRelated.length
    const prevImage = currentRelated[prevIdx]
    const prevImageIndex = images.findIndex(img => img.id === prevImage.id)
    setSelectedImageIndex(prevImageIndex)
  }

  const handleNext = () => {
    const currentRelated = getRelatedImages(selectedImageIndex)
    
    if (currentRelated.length <= 1) return // No navigation if only 1 related image
    
    const currentIdx = currentRelated.findIndex(img => img.id === images[selectedImageIndex].id)
    const nextIdx = (currentIdx + 1) % currentRelated.length
    const nextImage = currentRelated[nextIdx]
    const nextImageIndex = images.findIndex(img => img.id === nextImage.id)
    setSelectedImageIndex(nextImageIndex)
  }

  return (
    <div className="min-h-screen w-full bg-black">
      {/* Full-screen Auto-Rotating Panorama Viewer */}
      {isViewerOpen && (
        <PanoramaViewerPSV
          imageUrl={imageUrl}
          title={getProperTitle(currentImage)}
          onClose={() => setIsViewerOpen(false)}
          relaxMode={true}
          fov={130}
          sphereScale={5000}
          rotationSpeed={0.0002}
          initialYaw={Math.PI}
        />
      )}

      {/* Landing Page - Only shown when viewer is not open */}
      {!isViewerOpen && (
        <>
          {/* Header Section */}
          <div className="pt-20 pb-12 text-center ">
            <h1 className="text-5xl md:text-6xl font-light text-gray-400 mb-6 tracking-wide">
              {t('theatre.title')}
            </h1>
            <div className="space-y-2 text-gray-500 text-sm md:text-base">
              <p>{t('theatre.tagline1')}</p>
              <p>{t('theatre.tagline2')}</p>
              <p className="mt-4">{t('theatre.tagline3')}</p>
              <p>{t('theatre.tagline4')}</p>
            </div>
          </div>

          {/* Featured Panorama Section */}
          <div className="w-full py-16">
            {/* Panorama Carousel with Slide Transitions */}
            <div className="relative w-full aspect-video bg-gray-900 overflow-hidden mb-12 border border-gray-700 group">
              {/* Next Image - Slides In from Left */}
              {relatedImages.length > 1 && (
                <div
                  className={`absolute inset-0 bg-cover bg-center transition-transform duration-1000 ${
                    slideDirection === 'right' ? 'translate-x-0' : 'translate-x-[-100%]'
                  }`}
                  style={{
                    backgroundImage: `url('${
                      relatedImages[(relatedImages.findIndex(img => img.id === currentImage.id) + 1) % relatedImages.length]?.thumbnail_medium_url ||
                      relatedImages[(relatedImages.findIndex(img => img.id === currentImage.id) + 1) % relatedImages.length]?.original_url ||
                      ''
                    }')`,
                    backgroundPosition: 'center',
                  }}
                />
              )}

              {/* Current Image - Slides Out to Right */}
              <div
                className={`absolute inset-0 bg-cover bg-center cursor-pointer transition-transform duration-1000 ${
                  slideDirection === 'right' ? 'translate-x-[100%]' : 'translate-x-0'
                }`}
                style={{
                  backgroundImage: `url('${currentImage.thumbnail_medium_url || imageUrl}')`,
                  backgroundPosition: 'center',
                }}
              />

              {/* GO Button - Opens full auto-rotating panorama */}
              <button
                onClick={() => setIsViewerOpen(true)}
                className="absolute inset-0 m-auto w-32 h-32 rounded-full border-2 border-cyan-500 hover:border-cyan-400 transition-all duration-300 flex items-center justify-center z-10 hover:scale-125 hover:bg-cyan-500/20 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80"
              >
                <span className="text-cyan-400 text-2xl font-semibold tracking-wider group-hover:text-cyan-200 transition-colors">{t('theatre.goButton')}</span>
              </button>

              {/* Info overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6">
                  <h3 className="text-xl font-light text-white">{getProperTitle(currentImage)}</h3>
                </div>
              </div>
            </div>

            {/* Image Info - REMOVED DUPLICATE TITLE */}
            <div className="text-center mb-12">
              <p className="text-gray-500">
                {getTranslatedDescription(currentImage.description)}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                {currentRelatedIndex} of {relatedImages.length}
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-8 mb-12">
              <button
                onClick={handlePrevious}
                disabled={relatedImages.length <= 1}
                className="p-3 rounded-full border border-gray-700 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('theatre.ariaLabelPrevious')}
              >
                <ChevronLeft className="w-6 h-6 text-gray-400 hover:text-cyan-400" />
              </button>

              <div className="flex gap-2">
                {relatedImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      const imageIndex = images.findIndex(i => i.id === img.id)
                      setSelectedImageIndex(imageIndex)
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      img.id === currentImage.id
                        ? 'bg-cyan-500 w-8'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    aria-label={t('theatre.ariaLabelPanorama').replace('{index}', (index + 1).toString())}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={relatedImages.length <= 1}
                className="p-3 rounded-full border border-gray-700 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('theatre.ariaLabelNext')}
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
