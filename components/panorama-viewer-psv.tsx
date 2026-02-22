'use client'

import React, { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface PanoramaViewerPSVProps {
  imageUrl: string
  title: string
  onClose?: () => void
  relaxMode?: boolean
}

export const PanoramaViewerPSV = React.memo(function PanoramaViewerPSV({
  imageUrl,
  title,
  onClose,
  relaxMode = true,
}: PanoramaViewerPSVProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Dynamically load Photo Sphere Viewer library
    const loadLibrary = async () => {
      try {
        // Load CSS
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdn.jsdelivr.net/npm/photo-sphere-viewer@5.10.0/index.min.css'
        document.head.appendChild(link)

        // Load JS
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/photo-sphere-viewer@5.10.0/index.umd.min.js'
        script.async = true
        script.onload = () => {
          initializePanorama()
        }
        script.onerror = () => {
          setError('Failed to load panorama library')
          setIsLoading(false)
        }
        document.body.appendChild(script)
      } catch (err) {
        setError('Failed to initialize panorama viewer')
        setIsLoading(false)
      }
    }

    const initializePanorama = () => {
      if (!containerRef.current || !window.PhotoSphereViewer) {
        setError('Panorama viewer not available')
        setIsLoading(false)
        return
      }

      try {
        const PSV = window.PhotoSphereViewer.Viewer

        viewerRef.current = new PSV({
          container: containerRef.current,
          panorama: imageUrl,
          navbar: relaxMode ? false : 'bottom',
          defaultZoomLvl: 50, // Start zoomed out for full view
          minZoomLvl: 30,
          maxZoomLvl: 100,
          autorotate: relaxMode ? { speed: '2rpm', idleTime: 0 } : false,
          keyboard: !relaxMode,
          mousewheel: !relaxMode,
          touchmove: !relaxMode,
          withCredentials: false,
        })

        setIsLoading(false)
      } catch (err) {
        console.error('[v0] Failed to initialize panorama:', err)
        setError('Failed to initialize panorama viewer')
        setIsLoading(false)
      }
    }

    loadLibrary()

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy()
      }
    }
  }, [imageUrl, relaxMode])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onClose])

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Container for PSV */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ background: '#000' }}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-300 text-sm">Loading panorama...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 border border-red-500 text-red-400 rounded hover:bg-red-500/10 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Title and Close Button Overlay */}
      {!isLoading && !error && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
          {/* Title */}
          <div className="pointer-events-auto">
            <h2 className="text-white text-2xl font-light tracking-wide">{title}</h2>
            <p className="text-gray-400 text-sm mt-1">
              {relaxMode ? 'Relax and explore this panoramic world' : 'Drag to explore • Scroll to zoom • ESC to close'}
            </p>
          </div>

          {/* Close Button */}
          <div className="pointer-events-auto">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-white transition-all duration-300 flex items-center gap-2"
              >
                <X size={18} />
                <span className="text-sm">Close (ESC)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

// Extend Window interface for TypeScript
declare global {
  interface Window {
    PhotoSphereViewer: any
  }
}
