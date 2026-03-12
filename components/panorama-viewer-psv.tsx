'use client'

import React, { useEffect, useRef, useState } from 'react'
import { X, ZoomOut, ZoomIn } from 'lucide-react'

interface PanoramaViewerPSVProps {
  imageUrl: string
  title: string
  onClose?: () => void
  relaxMode?: boolean
  fov?: number // Field of view (default 75 for comfortable viewing)
  sphereScale?: number // Sphere radius (default 5000)
  rotationSpeed?: number // Auto-rotation speed (default 0.0002)
  geometrySegments?: number // Sphere geometry segments (default 128)
  initialYaw?: number // Initial rotation offset in radians to hide seam (default Math.PI for back of sphere)
}

export const PanoramaViewerPSV = React.memo(function PanoramaViewerPSV({
  imageUrl,
  title,
  onClose,
  relaxMode = true,
  fov = 75,
  sphereScale = 5000,
  rotationSpeed = 0.0002,
  geometrySegments = 128,
  initialYaw = Math.PI, // Default to 180 degrees (back of sphere, hiding the seam)
}: PanoramaViewerPSVProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const animationRef = useRef<number | null>(null)
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const sphereRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const rotationYRef = useRef(initialYaw) // Start with initialYaw offset
  const currentFovRef = useRef(fov)

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
        console.log('[v0] Three.js not available or canvas missing')
        setError('3D library not available')
        setIsLoading(false)
        return
      }

      try {
        const canvas = canvasRef.current
        const width = window.innerWidth
        const height = window.innerHeight

        console.log('[v0] Initializing panorama with dimensions:', width, 'x', height)

        // Scene setup with configurable FOV
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 100000)
        camera.position.set(0, 0, 0)
        camera.lookAt(0, 0, 0)
        console.log(`[v0] Camera created with FOV: ${fov}, position:`, camera.position, 'aspect:', width / height)

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
        renderer.setSize(width, height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setClearColor(0x000000, 1)
        renderer.autoClear = false
        console.log('[v0] Renderer initialized, size:', width, 'x', height)
        // Load panorama image with CORS
        const textureLoader = new THREE.TextureLoader()
        console.log('[v0] Loading texture from:', imageUrl)
        
        const texture = textureLoader.load(
          imageUrl,
          () => {
            console.log('[v0] Texture loaded successfully')
            setIsLoading(false)
          },
          undefined,
          (error: any) => {
            console.error('[v0] Texture load error:', error)
            setError('Failed to load panorama image')
            setIsLoading(false)
          }
        )
        texture.encoding = THREE.sRGBColorSpace
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping

        // Create configurable sphere geometry for equirectangular panorama
        const geometry = new THREE.SphereGeometry(sphereScale, geometrySegments, geometrySegments)
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide,
        })
        const sphere = new THREE.Mesh(geometry, material)
        
        // Apply initial yaw rotation and reset the rotation ref for new image
        sphere.rotation.y = initialYaw
        rotationYRef.current = initialYaw // Reset rotation tracker for this new image
        console.log('[v0] Applied initial yaw rotation:', initialYaw, 'radians, reset rotation tracker')
        
        scene.add(sphere)

        sceneRef.current = scene
        rendererRef.current = renderer
        sphereRef.current = sphere
        cameraRef.current = camera

        // Mouse wheel zoom control (zoom out only)
        const handleWheel = (e: WheelEvent) => {
          e.preventDefault()
          
          // Zoom out on scroll down
          if (e.deltaY > 0) {
            currentFovRef.current = Math.min(currentFovRef.current + 2, 170)
            camera.fov = currentFovRef.current
            camera.updateProjectionMatrix()
          }
          // Zoom in on scroll up
          else if (e.deltaY < 0) {
            currentFovRef.current = Math.max(currentFovRef.current - 2, fov)
            camera.fov = currentFovRef.current
            camera.updateProjectionMatrix()
          }
        }

        canvas.addEventListener('wheel', handleWheel, { passive: false })

        // Render initial frame immediately with correct camera
        renderer.clear()
        renderer.render(scene, camera)
        console.log(`[v0] Initial render completed with FOV ${fov}`)

        // Animation loop with consistent rendering
        const animate = () => {
          animationRef.current = requestAnimationFrame(animate)

          // Slow auto-rotation in relax mode (rotate the sphere itself)
          if (relaxMode && sphereRef.current) {
            rotationYRef.current += rotationSpeed
            sphereRef.current.rotation.y = rotationYRef.current
          }

          renderer.clear()
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
          canvas.removeEventListener('wheel', handleWheel)
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
  }, [imageUrl, relaxMode, fov, sphereScale, rotationSpeed, geometrySegments, initialYaw])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }

    const handleWindowResize = () => {
      if (rendererRef.current && cameraRef.current && canvasRef.current) {
        const width = window.innerWidth
        const height = window.innerHeight
        
        cameraRef.current.aspect = width / height
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(width, height)
        console.log('[v0] Window resized, updated panorama dimensions to:', width, 'x', height)
      }
    }

    window.addEventListener('resize', handleWindowResize)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('resize', handleWindowResize)
    }
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
          {/* Top: Title */}
          <div className="pointer-events-auto">
            <h2 className="text-white text-2xl font-light tracking-wide">{title}</h2>
            <p className="text-gray-400 text-sm mt-1">Relax and explore • Scroll to zoom</p>
          </div>

          {/* Right Side: Zoom Controls */}
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-auto flex flex-col gap-3">
            <button
              onClick={() => {
                if (cameraRef.current) {
                  currentFovRef.current = Math.max(currentFovRef.current - 5, fov)
                  cameraRef.current.fov = currentFovRef.current
                  cameraRef.current.updateProjectionMatrix()
                }
              }}
              className="p-3 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-cyan-500 transition-all duration-300 bg-black/30 hover:bg-cyan-500/10"
              title="Zoom in"
            >
              <ZoomIn size={20} />
            </button>

            <button
              onClick={() => {
                if (cameraRef.current) {
                  currentFovRef.current = Math.min(currentFovRef.current + 5, 170)
                  cameraRef.current.fov = currentFovRef.current
                  cameraRef.current.updateProjectionMatrix()
                }
              }}
              className="p-3 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-cyan-500 transition-all duration-300 bg-black/30 hover:bg-cyan-500/10"
              title="Zoom out"
            >
              <ZoomOut size={20} />
            </button>
          </div>

          {/* Bottom: Close Button */}
          <div className="pointer-events-auto">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-white transition-all duration-300 font-light"
            >
              Close (ESC)
            </button>
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
