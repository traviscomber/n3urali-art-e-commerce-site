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
  const [currentCategory, setCurrentCategory] = useState<string | null>(null)

  // Get only equirectangular images for carousel - NO SLICE LIMIT, show all
  const allCarouselImages = images.filter(img => img.image_format === 'equirectangular')

  console.log('[v0] TheatreCarouselPreview - total images:', images.length)
  console.log('[v0] TheatreCarouselPreview - equirectangular images:', allCarouselImages.length)

  // Group images by content_category FIRST so we can use it everywhere
  const imagesByCategory = allCarouselImages.reduce((acc, img) => {
    const category = img.content_category || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(img)
    return acc
  }, {} as Record<string, any[]>)

  // Get sorted categories (order matters for display) - DEFINE BEFORE USING
  const categories = Object.keys(imagesByCategory).sort()
  
  console.log('[v0] TheatreCarouselPreview - categories:', categories)
  
  // Set default category on mount
  useEffect(() => {
    if (!currentCategory && categories.length > 0) {
      setCurrentCategory(categories[0])
    }
  }, [categories, currentCategory])

  // Get images for current category, or all if none selected
  const carouselImages = currentCategory && imagesByCategory[currentCategory] 
    ? imagesByCategory[currentCategory]
    : allCarouselImages

  // Extract folder name from file_path (e.g., "VIDS/Categories/Nature/Ocean-Surreal/filename.mov" -> "Ocean-Surreal")
  const extractFolderName = (filePath: string | null | undefined) => {
    if (!filePath) return 'Theatre Collection'
    try {
      // Split by forward slash to get path parts
      const parts = filePath.split('/')
      // Get the last non-empty part before the filename (which is the actual folder)
      let folderName = parts[parts.length - 2] || 'Theatre Collection'
      // Replace hyphens with spaces and capitalize each word
      return folderName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    } catch {
      return 'Theatre Collection'
    }
  }

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

  // Auto-rotate panorama with intelligent preload + transition timing
  useEffect(() => {
    if (!isViewerOpen) return
    if (carouselImages.length <= 1) return

    let preloadComplete = false
    let timeoutId: NodeJS.Timeout

    const startPreloadAndTransition = () => {
      preloadComplete = false
      const nextIdx = (currentIdx + 1) % carouselImages.length
      const nextImage = carouselImages[nextIdx]
      const nextImageUrl = nextImage.original_url || nextImage.upscaled_url
      
      // Start preload immediately
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        preloadComplete = true
        console.log('[v0] Preload complete, texture ready')
      }
      img.onerror = () => {
        preloadComplete = true // Mark as complete even on error, proceed with transition
        console.log('[v0] Preload error, proceeding anyway')
      }
      img.src = nextImageUrl
      console.log('[v0] Starting preload:', nextImageUrl)
      
      // Transition after 20 seconds OR when preload completes, whichever is later
      timeoutId = setTimeout(() => {
        console.log('[v0] Transition at 20s, preload ready:', preloadComplete)
        setCurrentIdx(prev => (prev + 1) % carouselImages.length)
      }, 20000)
    }

    // Start first preload immediately
    startPreloadAndTransition()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isViewerOpen, carouselImages.length, currentIdx])

  if (carouselImages.length === 0) {
    return (
      <div className="w-full py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto bg-red-900/20 border border-red-700 rounded-lg p-8 text-center">
          <p className="text-red-400 font-light">No equirectangular images found</p>
          <p className="text-red-300 text-sm mt-2">Total images in database: {images.length}</p>
          <p className="text-red-300 text-sm">Categories available: {categories.length > 0 ? categories.join(', ') : 'None'}</p>
        </div>
      </div>
    )
  }

  const currentImage = carouselImages[currentIdx]
  const nextIdx = (currentIdx + 1) % carouselImages.length
  const nextImage = carouselImages[nextIdx]
  const imageUrl = currentImage.original_url || currentImage.upscaled_url

  return (
    <>
      {/* Category Navigation Tabs */}
      {categories.length > 1 && (
        <div className="w-full px-6 md:px-12 lg:px-20 py-8 border-b border-gray-700">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setCurrentCategory(category)
                    setCurrentIdx(0)
                    setIsTransitioning(false)
                  }}
                  className={`px-6 py-2 whitespace-nowrap rounded-lg transition-all font-light ${
                    currentCategory === category
                      ? 'bg-amber-600/20 border border-amber-400 text-amber-100'
                      : 'bg-gray-900/50 border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-gray-100'
                  }`}
                >
                  {category}
                  <span className="ml-2 text-xs opacity-70">({imagesByCategory[category].length})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Carousel Preview - Only shown when viewer is closed */}
      {!isViewerOpen && (
        <div className="w-full py-16 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
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
        </div>
      )}

      {/* Panorama Viewer - Fullscreen Modal */}
      {isViewerOpen && imageUrl && (
        <div className="fixed inset-0 z-50 bg-black">
          <PanoramaViewerPSV
            imageUrl={imageUrl}
            title={extractFolderName(currentImage.file_path)}
            onClose={() => setIsViewerOpen(false)}
            relaxMode={true}
            fov={130}
            sphereScale={5000}
            rotationSpeed={0.0002}
            initialYaw={0}
          />
        </div>
      )}
    </>
  )
}
