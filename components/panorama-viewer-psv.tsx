'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Viewer } from 'photo-sphere-viewer'
import 'photo-sphere-viewer/index.css'

interface PanoramaViewerPSVProps {
  imageUrl: string
  title: string
  onClose?: () => void
  relaxMode?: boolean // Auto-rotation only, no user controls
  className?: string
}

export const PanoramaViewerPSV = React.memo(function PanoramaViewerPSV({
  imageUrl,
  title,
  onClose,
  relaxMode = true,
  className = '',
}: PanoramaViewerPSVProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current || !imageUrl) return

    try {
      // Initialize Photo Sphere Viewer
      viewerRef.current = new Viewer({
        container: containerRef.current,
        panorama: imageUrl,
        caption: title,
        autorotate: relaxMode ? true : false,
        autorotateInactivityDelay: relaxMode ? 0 : 5000, // Auto-rotate immediately in relax mode
        autorotateSpeed: relaxMode ? '0.5rpm' : '2rpm', // Very slow rotation for relaxing
        touchmove: !relaxMode, // Disable touch in relax mode
        mousewheel: !relaxMode, // Disable scroll zoom in relax mode
        keyboard: !relaxMode, // Disable keyboard controls in relax mode
        navbar: false, // Hide navbar
        showZoomCtrl: !relaxMode, // Hide zoom controls in relax mode
        textureWidth: 2048, // High quality
        fisheye: false,
        defaultZoomLvl: 50, // Start zoomed out for full view
      })

      setIsLoading(false)

      // Keyboard shortcut to close
      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) {
          onClose()
        }
      }

      window.addEventListener('keydown', handleKeydown)

      return () => {
        window.removeEventListener('keydown', handleKeydown)
        if (viewerRef.current) {
          viewerRef.current.destroy()
        }
      }
    } catch (error) {
      console.error('[v0] Failed to initialize panorama viewer:', error)
      setIsLoading(false)
    }
  }, [imageUrl, relaxMode, onClose])

  return (
    <div className={`w-full h-screen bg-black relative ${className}`}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Loading panorama...</p>
          </div>
        </div>
      )}

      {/* Viewer container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Title and close button overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
        {/* Title at top */}
        <div className="pointer-events-auto">
          <h2 className="text-white text-2xl font-light tracking-wide">{title}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {relaxMode ? 'Relax and explore this panoramic world' : 'Drag to rotate • Scroll to zoom • ESC to exit'}
          </p>
        </div>

        {/* Close button at bottom */}
        {onClose && (
          <div className="pointer-events-auto">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-white transition-all duration-300 font-light text-sm"
            >
              Close (ESC)
            </button>
          </div>
        )}
      </div>
    </div>
  )
})
