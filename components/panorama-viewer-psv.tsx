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
  transitionDuration?: number // Fade transition duration in ms (default 1500)
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
  transitionDuration = 1500, // 1.5 second fade transition
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
  const pendingTextureRef = useRef<any>(null) // Texture loaded but not yet displayed
  const isTransitioningRef = useRef(false) // Whether currently transitioning
  const transitionStartTimeRef = useRef(0) // When transition started
  const materialRef = useRef<any>(null) // Reference to material for texture swapping

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

        // Create sphere geometry and material FIRST (before loading texture)
        const geometry = new THREE.SphereGeometry(sphereScale, 64, 64)
        geometry.scale(-1, 1, 1)
        const material = new THREE.MeshBasicMaterial({
          map: null, // Will be set when texture loads
          side: THREE.BackSide,
          color: 0x333333, // Dark grey placeholder while loading
        })
        const sphere = new THREE.Mesh(geometry, material)
        sphere.rotation.y = initialYaw
        scene.add(sphere)
        
        materialRef.current = material
        sphereRef.current = sphere
        sceneRef.current = scene
        rendererRef.current = renderer
        cameraRef.current = camera
        rotationYRef.current = initialYaw
        
        console.log('[v0] Sphere and material created')

        // Now load panorama image with CORS - OPTIMIZED
        const textureLoader = new THREE.TextureLoader()
        console.log('[v0] Loading texture from:', imageUrl)
        
        const texture = textureLoader.load(
          imageUrl,
          () => {
            console.log('[v0] Texture loaded successfully')
            // Apply texture to material immediately
            material.map = texture
            material.needsUpdate = true
            material.color.setHex(0xffffff) // Reset color to white
            
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

        // Animation loop - OPTIMIZED for single sphere with fast transitions
        const animate = () => {
          animationRef.current = requestAnimationFrame(animate)

          // Handle texture transition with opacity overlay (GPU-accelerated)
          if (isTransitioningRef.current && pendingTextureRef.current && materialRef.current) {
            const elapsed = performance.now() - transitionStartTimeRef.current
            const progress = Math.min(elapsed / transitionDuration, 1)
            
            if (progress >= 1) {
              // Transition complete - immediately swap texture
              isTransitioningRef.current = false
              materialRef.current.map = pendingTextureRef.current
              materialRef.current.needsUpdate = true
              materialRef.current.opacity = 1
              materialRef.current.transparent = false
              pendingTextureRef.current = null
              console.log('[v0] Transition complete, texture swapped')
            } else {
              // Mid-transition: use canvas overlay for fade effect
              // Keep rendering current texture with overlay opacity
              materialRef.current.opacity = 1 - (progress * 0.95) // Subtle opacity fade
              materialRef.current.transparent = true
            }
          }

          // Auto-rotation in relax mode
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
  }, [imageUrl, relaxMode, fov, rotationSpeed, initialYaw, transitionDuration])

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
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: isLoading ? 'none' : 'block' }}
      />

      {/* Fade Overlay for Smooth Transitions */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0)',
          opacity: isTransitioningRef.current ? 0.3 : 0,
          transition: `opacity ${transitionDuration}ms ease-in-out`,
        }}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-white">Loading panorama...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center w-full h-full bg-red-900/20">
          <div className="text-red-300 text-center p-8">
            <p className="text-xl mb-2">Error loading panorama</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 text-white hover:text-amber-100 transition-colors p-2 rounded-full hover:bg-white/10"
        aria-label="Close panorama viewer"
      >
        <X size={32} />
      </button>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
        <button
          onClick={() => {
            if (cameraRef.current) {
              currentFovRef.current = Math.max(currentFovRef.current - 10, 20)
              cameraRef.current.fov = currentFovRef.current
              cameraRef.current.updateProjectionMatrix()
            }
          }}
          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
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
          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut size={20} />
        </button>
      </div>
    </div>
  )
})

// Extend Window interface for TypeScript
declare global {
  interface Window {
    THREE: any
  }
}
