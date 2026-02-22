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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const animationRef = useRef<number>()
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const sphereRef = useRef<any>(null)
  const rotationYRef = useRef(0)

  useEffect(() => {
    const loadPanorama = async () => {
      try {
        if (!canvasRef.current) {
          setError('Canvas not initialized')
          return
        }

        // Load Three.js from CDN
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
        script.async = true
        script.onload = () => {
          initThreePanorama()
        }
        script.onerror = () => {
          setError('Failed to load 3D library')
          setIsLoading(false)
        }
        document.body.appendChild(script)
      } catch (err) {
        setError('Failed to initialize panorama viewer')
        setIsLoading(false)
      }
    }

    const initThreePanorama = () => {
      const THREE = (window as any).THREE
      if (!THREE || !canvasRef.current) {
        setError('3D library not available')
        setIsLoading(false)
        return
      }

      try {
        const canvas = canvasRef.current
        const width = window.innerWidth
        const height = window.innerHeight

        // Scene setup
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(120, width / height, 0.1, 10000)
        camera.position.z = 0

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
        renderer.setSize(width, height)
        renderer.setPixelRatio(window.devicePixelRatio)

        // Load panorama image with CORS
        const textureLoader = new THREE.TextureLoader()
        const texture = textureLoader.load(
          imageUrl,
          () => {
            console.log('[v0] Texture loaded successfully')
            setIsLoading(false)
          },
          undefined,
          (error) => {
            console.error('[v0] Texture load error:', error)
            setError('Failed to load panorama image')
            setIsLoading(false)
          }
        )
        texture.encoding = THREE.sRGBColorSpace

        // Create sphere geometry for equirectangular panorama
        const geometry = new THREE.SphereGeometry(500, 64, 64)
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide,
        })
        const sphere = new THREE.Mesh(geometry, material)
        scene.add(sphere)

        sceneRef.current = scene
        rendererRef.current = renderer
        sphereRef.current = sphere

        // Animation loop
        const animate = () => {
          animationRef.current = requestAnimationFrame(animate)

          // Slow auto-rotation in relax mode (rotate the sphere itself)
          if (relaxMode && sphereRef.current) {
            rotationYRef.current += 0.0002
            sphereRef.current.rotation.y = rotationYRef.current
          }

          renderer.render(scene, camera)
        }

        animate()

        // Handle window resize
        const handleResize = () => {
          const newWidth = window.innerWidth
          const newHeight = window.innerHeight
          camera.aspect = newWidth / newHeight
          camera.updateProjectionMatrix()
          renderer.setSize(newWidth, newHeight)
        }

        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => {
          window.removeEventListener('resize', handleResize)
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
          }
          renderer.dispose()
          geometry.dispose()
          material.dispose()
          texture.dispose()
        }
      } catch (err) {
        console.error('[v0] Panorama initialization error:', err)
        setError('Failed to initialize panorama viewer')
        setIsLoading(false)
      }
    }

    loadPanorama()

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (rendererRef.current) {
        rendererRef.current.dispose()
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
      {/* Canvas for panorama */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ display: 'block' }}
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
    THREE: any
  }
}
