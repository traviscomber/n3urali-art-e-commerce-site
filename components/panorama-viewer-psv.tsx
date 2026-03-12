'use client'

import React, { useEffect, useRef, useState } from 'react'
import { X, ZoomOut, ZoomIn } from 'lucide-react'
import * as THREE from 'three'

interface PanoramaViewerPSVProps {
  imageUrl: string
  title: string
  onClose?: () => void
  relaxMode?: boolean
  fov?: number
}

export const PanoramaViewerPSV = React.memo(function PanoramaViewerPSV({
  imageUrl,
  title,
  onClose,
  relaxMode = true,
  fov = 75,
}: PanoramaViewerPSVProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const animationRef = useRef<number | null>(null)
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const sphereRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const rotationYRef = useRef(0)
  const currentFovRef = useRef(fov)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const loadPanorama = async () => {
      try {
        const width = window.innerWidth
        const height = window.innerHeight

        // Scene setup
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 100000)
        camera.position.set(0, 0, 0)

        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance', // Use high-performance GPU
        })
        renderer.setSize(width, height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setClearColor(0x000000)
        renderer.outputColorSpace = THREE.sRGBColorSpace

        // Load texture first with optimization and CORS support
        const textureLoader = new THREE.TextureLoader()
        textureLoader.setCrossOrigin('anonymous')
        
        textureLoader.load(
          imageUrl,
          (loadedTexture) => {
            console.log('[v0] Texture loaded successfully')
            // Optimize texture quality and performance
            loadedTexture.encoding = THREE.sRGBColorSpace
            loadedTexture.generateMipmaps = true
            loadedTexture.minFilter = THREE.LinearMipmapLinearFilter
            loadedTexture.magFilter = THREE.LinearFilter
            loadedTexture.anisotropy = Math.min(16, renderer.capabilities.maxAnisotropy)
            
            // Create sphere with HIGH quality geometry for better rendering (128 segments)
            const geometry = new THREE.SphereGeometry(1000, 128, 128)
            const material = new THREE.MeshBasicMaterial({
              map: loadedTexture,
              side: THREE.BackSide,
              toneMapped: false, // Disable tone mapping for faster rendering
            })
            const sphere = new THREE.Mesh(geometry, material)
            scene.add(sphere)

            sphereRef.current = sphere
            sceneRef.current = scene
            rendererRef.current = renderer
            cameraRef.current = camera

            setIsLoading(false)
            console.log('[v0] Panorama loaded successfully with high quality')
          },
          (progress) => {
            console.log('[v0] Texture loading progress:', Math.round((progress.loaded / progress.total) * 100) + '%')
          },
          (err) => {
            console.error('[v0] Texture load failed:', err)
            setError('Failed to load panorama image')
            setIsLoading(false)
          }
        )

        // Handle resize
        const handleResize = () => {
          const w = window.innerWidth
          const h = window.innerHeight
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        }

        window.addEventListener('resize', handleResize)

        // Zoom with mouse wheel
        const handleWheel = (e: WheelEvent) => {
          e.preventDefault()
          if (e.deltaY > 0) {
            currentFovRef.current = Math.min(currentFovRef.current + 5, 150)
          } else {
            currentFovRef.current = Math.max(currentFovRef.current - 5, 30)
          }
          camera.fov = currentFovRef.current
          camera.updateProjectionMatrix()
        }

        canvas.addEventListener('wheel', handleWheel, { passive: false })

        // Animation loop
        const animate = () => {
          animationRef.current = requestAnimationFrame(animate)

          if (relaxMode && sphereRef.current) {
            rotationYRef.current += 0.0002
            sphereRef.current.rotation.y = rotationYRef.current
          }

          renderer.render(scene, camera)
        }

        animate()

        // Cleanup
        return () => {
          window.removeEventListener('resize', handleResize)
          canvas.removeEventListener('wheel', handleWheel)
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
          }
        }
      } catch (err) {
        console.error('[v0] Panorama setup error:', err)
        setError('Failed to initialize panorama viewer')
        setIsLoading(false)
      }
    }

    loadPanorama()
  }, [imageUrl, fov, relaxMode])

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="text-center">
            <div className="text-gray-300">Loading panorama...</div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-red-500 text-red-400 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 text-white hover:text-amber-100 transition-colors p-2"
        aria-label="Close"
      >
        <X size={32} />
      </button>

      {/* Title */}
      <div className="absolute top-6 left-6 z-10 text-white">
        <h2 className="text-lg font-light">{title}</h2>
        <p className="text-sm text-gray-400">Scroll to zoom</p>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
        <button
          onClick={() => {
            if (cameraRef.current) {
              currentFovRef.current = Math.max(currentFovRef.current - 10, 30)
              cameraRef.current.fov = currentFovRef.current
              cameraRef.current.updateProjectionMatrix()
            }
          }}
          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => {
            if (cameraRef.current) {
              currentFovRef.current = Math.min(currentFovRef.current + 10, 150)
              cameraRef.current.fov = currentFovRef.current
              cameraRef.current.updateProjectionMatrix()
            }
          }}
          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut size={20} />
        </button>
      </div>
    </div>
  )
})
