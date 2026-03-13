'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const PanoramaViewerPSV = dynamic(
  () => import('@/components/panorama-viewer-psv').then(mod => mod.PanoramaViewerPSV),
  { ssr: false }
)

interface CarouselPreviewProps {
  images: any[]
  collections: any[]
  selectedCategory?: string | null
  shouldAutoPlay?: boolean
  onAutoPlayComplete?: () => void
}

export function TheatreCarouselPreview({ 
  images, 
  collections,
  selectedCategory: initialCategory = null,
  shouldAutoPlay = false,
  onAutoPlayComplete
}: CarouselPreviewProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<string | null>(initialCategory)

  // Define the 4 main categories we want to display
  const MAIN_CATEGORIES = ['Nature', 'Culture', 'Mythic', 'Art']

  // Filter equirectangular images
  const allCarouselImages = images.filter(img => img.image_format === 'equirectangular')

  // Group by MAIN category (extract first part of content_category like "Nature" from "Nature/Ocean-Surreal")
  const imagesByCategory = allCarouselImages.reduce((acc, img) => {
    // Extract main category from content_category (format: "MainCategory/Subcategory")
    const fullCategory = img.content_category || 'Uncategorized'
    const mainCategory = fullCategory.split('/')[0] // Get first part before the slash
    
    if (!acc[mainCategory]) {
      acc[mainCategory] = []
    }
    acc[mainCategory].push(img)
    return acc
  }, {} as Record<string, any[]>)

  // Filter to only show the 4 main categories that have images
  const categories = MAIN_CATEGORIES.filter(cat => imagesByCategory[cat] && imagesByCategory[cat].length > 0).sort()

  // Initialize with first category
  useEffect(() => {
    if (!currentCategory && categories.length > 0) {
      setCurrentCategory(categories[0])
    }
  }, [categories, currentCategory])

  // Get current category images
  const carouselImages = currentCategory && imagesByCategory[currentCategory] 
    ? imagesByCategory[currentCategory]
    : allCarouselImages

  // Extract folder name from file_path
  const extractFolderName = (filePath: string | null | undefined): string => {
    if (!filePath) return 'Theatre Collection'
    try {
      const parts = filePath.split('/')
      const folderName = parts[parts.length - 2] || 'Theatre Collection'
      return folderName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    } catch {
      return 'Theatre Collection'
    }
  }

  // Carousel auto-rotate
  useEffect(() => {
    if (carouselImages.length <= 1) return
    if (isViewerOpen) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIdx(prev => (prev + 1) % carouselImages.length)
        setIsTransitioning(false)
      }, 1100)
    }, 17000)

    return () => clearInterval(interval)
  }, [carouselImages.length, isViewerOpen])

  // Panorama viewer preload
  useEffect(() => {
    if (!isViewerOpen) return
    if (carouselImages.length <= 1) return

    let timeoutId: NodeJS.Timeout

    const nextIdx = (currentIdx + 1) % carouselImages.length
    const nextImage = carouselImages[nextIdx]
    const nextImageUrl = nextImage.original_url || nextImage.upscaled_url
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {}
    img.onerror = () => {}
    img.src = nextImageUrl
    
    timeoutId = setTimeout(() => {
      setCurrentIdx(prev => (prev + 1) % carouselImages.length)
    }, 20000)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isViewerOpen, carouselImages.length, currentIdx])

  // Empty state
  if (carouselImages.length === 0) {
    return (
      <div className="w-full py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto bg-red-900/20 border border-red-700 rounded-lg p-8 text-center">
          <p className="text-red-400 font-light">No equirectangular images found</p>
          <p className="text-red-300 text-sm mt-2">Total images: {images.length}</p>
          <p className="text-red-300 text-sm">Categories: {categories.length > 0 ? categories.join(', ') : 'None'}</p>
        </div>
      </div>
    )
  }

  const currentImage = carouselImages[currentIdx]
  const imageUrl = currentImage.original_url || currentImage.upscaled_url

  return (
    <>
      {/* Category Navigation */}
      {categories.length > 1 && (
        <div className="w-full px-6 md:px-12 lg:px-20 py-8 border-b border-gray-700">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {categories.map(category => (
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
                      : 'bg-gray-900/50 border border-gray-700 text-gray-300 hover:border-gray-500'
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

      {/* Carousel */}
      {!isViewerOpen && (
        <div className="w-full py-16 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div 
              className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700 group cursor-pointer"
              onClick={() => setIsViewerOpen(true)}
            >
              <div
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
                style={{
                  backgroundImage: `url('${currentImage.thumbnail_medium_url || imageUrl}')`,
                }}
              />
              {isTransitioning && (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-100"
                  style={{
                    backgroundImage: `url('${carouselImages[(currentIdx + 1) % carouselImages.length].thumbnail_medium_url}')`,
                  }}
                />
              )}
              <button className="absolute inset-0 flex items-center justify-center group">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 border-2 border-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform group-hover:border-amber-100">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-white text-lg font-light tracking-widest group-hover:text-amber-100">GO</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panorama Viewer */}
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
