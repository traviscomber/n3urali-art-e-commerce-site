'use client'

import React, { useEffect, useRef, useState } from 'react'
import { X, ZoomOut, ZoomIn } from 'lucide-react'

interface PanoramaViewerPSVProps {
  imageUrl: string
  nextImageUrl?: string // URL of next image for early preloading
  title: string
  onClose?: () => void
  onAutoAdvance?: () => void // Callback when auto-advance should happen
  relaxMode?: boolean
  fov?: number // Field of view (default 75 for comfortable viewing)
  sphereScale?: number // Sphere radius (default 5000)
  rotationSpeed?: number // Auto-rotation speed (default 0.0002)
  geometrySegments?: number // Sphere geometry segments (default 128)
  initialYaw?: number // Initial rotation offset in radians to hide seam (default 0 for center)
  enableFestivalTransitions?: boolean // Enable smooth transitions for festival mode
  autoAdvanceInterval?: number // Time in ms before auto-advancing (default 30000ms)
}

export const PanoramaViewerPSV = React.memo(function PanoramaViewerPSV({
  imageUrl,
  nextImageUrl,
  title,
  onClose,
  onAutoAdvance,
  relaxMode = true,
  fov = 75,
  sphereScale = 5000,
  rotationSpeed = 0.0002,
  geometrySegments = 128,
  initialYaw = 0, // Default to 0 for center
  enableFestivalTransitions = false,
  autoAdvanceInterval = 30000,
}: PanoramaViewerPSVProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const animationRef = useRef<number | null>(null)
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const sphereRef = useRef<any>(null)
  const nextSphereRef = useRef<any>(null) // Secondary sphere for crossfade
  const cameraRef = useRef<any>(null)
  const rotationYRef = useRef(initialYaw)
  const currentFovRef = useRef(fov)
  const transitionLayerRef = useRef<any>(null)
  const transitionProgressRef = useRef(0)
  const isTransitioningRef = useRef(false)
  const materialRef = useRef<any>(null)
  const nextMaterialRef = useRef<any>(null) // Material for next sphere
  const nextTextureRef = useRef<any>(null) // Pre-loaded next texture
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const nextImageUrlRef = useRef<string | null>(null)
  const cameraFovTransitionRef = useRef(fov)
  const rotationSpeedTransitionRef = useRef(rotationSpeed)

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

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: false })
        renderer.setSize(width, height)
        renderer.setPixelRatio(1) // Lock to 1x for speed, not 2x
        renderer.setClearColor(0x000000, 1)
        renderer.autoClear = false
        console.log('[v0] Renderer initialized, size:', width, 'x', height)
        
        // Load panorama image with CORS
        const textureLoader = new THREE.TextureLoader()
        textureLoader.setCrossOrigin('anonymous')
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
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping

        // Create OPTIMIZED sphere geometry (48 segments for 7x less geometry than 128)
        const geometry = new THREE.SphereGeometry(sphereScale, 48, 48)
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide,
          toneMapped: false,
        })
        const sphere = new THREE.Mesh(geometry, material)
        
        // Apply initial yaw rotation
        sphere.rotation.y = initialYaw
        rotationYRef.current = 0 // Reset rotation speed for continuous motion
        
        scene.add(sphere)

        sceneRef.current = scene
        rendererRef.current = renderer
        sphereRef.current = sphere
        materialRef.current = material
        cameraRef.current = camera

        // Mouse wheel zoom control
        const handleWheel = (e: WheelEvent) => {
          e.preventDefault()
          
          if (e.deltaY > 0) {
            currentFovRef.current = Math.min(currentFovRef.current + 2, 170)
            camera.fov = currentFovRef.current
            camera.updateProjectionMatrix()
          }
          else if (e.deltaY < 0) {
            currentFovRef.current = Math.max(currentFovRef.current - 2, fov)
            camera.fov = currentFovRef.current
            camera.updateProjectionMatrix()
          }
        }

        canvas.addEventListener('wheel', handleWheel, { passive: false })

        // Render initial frame
        renderer.clear()
        renderer.render(scene, camera)
        console.log(`[v0] Initial render completed with FOV ${fov}`)

        // Animation loop optimized for 30 FPS with dual-layer crossfade
        let lastFrameTime = Date.now()
        const animate = () => {
          animationRef.current = requestAnimationFrame(animate)
          
          const currentTime = Date.now()
          const deltaTime = (currentTime - lastFrameTime) / 1000
          lastFrameTime = currentTime

          // Dual-layer crossfade transition (600ms for smooth festival transitions)
          if (isTransitioningRef.current && materialRef.current && nextMaterialRef.current) {
            transitionProgressRef.current += deltaTime / 0.6
            if (transitionProgressRef.current >= 1) {
              transitionProgressRef.current = 1
              isTransitioningRef.current = false
              
              // Cleanup old sphere
              materialRef.current.opacity = 1
              materialRef.current.transparent = false
              if (nextSphereRef.current) {
                sceneRef.current?.remove(nextSphereRef.current)
              }
              nextSphereRef.current = null
              nextMaterialRef.current = null
            } else {
              // Smooth easing for elegant crossfade
              const easeProgress = transitionProgressRef.current < 0.5 
                ? 2 * transitionProgressRef.current * transitionProgressRef.current 
                : 1 - Math.pow(-2 * transitionProgressRef.current + 2, 2) / 2
              
              // Crossfade both layers for zero black frames
              materialRef.current.opacity = 1 - easeProgress
              materialRef.current.transparent = true
              nextMaterialRef.current.opacity = easeProgress
              nextMaterialRef.current.transparent = true
              
              // Gentle rotation during transition
              rotationYRef.current = rotationSpeed * (1 - 0.7 * easeProgress)
            }
          } else {
            // Normal state
            if (materialRef.current) {
              materialRef.current.opacity = 1
              materialRef.current.transparent = false
            }
            rotationYRef.current = rotationSpeed
          }

          // Smooth camera FOV transitions
          if (cameraFovTransitionRef.current !== currentFovRef.current) {
            const fovDifference = currentFovRef.current - cameraFovTransitionRef.current
            cameraFovTransitionRef.current += fovDifference * 0.1
            if (cameraRef.current) {
              cameraRef.current.fov = cameraFovTransitionRef.current
              cameraRef.current.updateProjectionMatrix()
            }
          }

          // Auto-rotate if relaxMode enabled
          if (relaxMode && sphereRef.current) {
            sphereRef.current.rotation.y += rotationYRef.current
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

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [imageUrl, relaxMode, fov, sphereScale, rotationSpeed, geometrySegments, initialYaw])

  // Preload next image EARLY for smooth crossfade - triggers well before transition
  useEffect(() => {
    if (!nextImageUrl || !rendererRef.current || !sceneRef.current || !sphereRef.current?.geometry) return
    
    const preloadNextImage = async () => {
      try {
        const THREE = (window as any).THREE
        if (!THREE) return
        
        const textureLoader = new THREE.TextureLoader()
        textureLoader.setCrossOrigin('anonymous')
        
        console.log('[v0] Early preloading next panorama:', nextImageUrl)
        
        textureLoader.load(nextImageUrl, (newTexture: any) => {
          // Create material for next sphere
          const nextMaterial = new THREE.MeshBasicMaterial({
            map: newTexture,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0,
            toneMapped: false,
          })
          
          // Create next sphere ready for crossfade
          const nextSphere = new THREE.Mesh(sphereRef.current.geometry, nextMaterial)
          nextSphere.rotation.y = sphereRef.current.rotation.y
          
          sceneRef.current.add(nextSphere)
          nextSphereRef.current = nextSphere
          nextMaterialRef.current = nextMaterial
          nextTextureRef.current = newTexture
          
          console.log('[v0] Next panorama preloaded and ready for crossfade')
        }, undefined, (err: any) => {
          console.error('[v0] Error preloading next image:', err)
        })
      } catch (err) {
        console.error('[v0] Preload error:', err)
      }
    }
    
    // Preload after a short delay to ensure scene is ready
    const timeout = setTimeout(preloadNextImage, 500)
    return () => clearTimeout(timeout)
  }, [nextImageUrl])

  // Auto-advance to next image with gentle 3-second crossfade from second 27-30
  useEffect(() => {
    if (!enableFestivalTransitions || !autoAdvanceInterval || !onAutoAdvance) return
    if (isTransitioningRef.current) return
    
    const CROSSFADE_DURATION = 3000 // 3 seconds for gentle, overlapping crossfade
    
    // Start crossfade at second 27 (3 seconds before the 30s interval ends)
    const crossfadeStartTime = autoAdvanceInterval - CROSSFADE_DURATION // 27 seconds for 30s interval
    
    const timeout = setTimeout(() => {
      // Only advance if next image is preloaded and ready
      if (nextSphereRef.current && nextMaterialRef.current) {
        transitionProgressRef.current = 0
        isTransitioningRef.current = true
        
        // Start the next image immediately (second 27) with overlapping crossfade
        onAutoAdvance?.()
        console.log('[v0] Starting 3-second gentle crossfade from image 1 to image 2 (sec 27-30)')
        
        // Complete the transition after 3 seconds
        const transitionTimeout = setTimeout(() => {
          console.log('[v0] Crossfade complete - image 2 now fully visible')
        }, CROSSFADE_DURATION)
        
        return () => clearTimeout(transitionTimeout)
      } else {
        console.warn('[v0] Next image not preloaded yet, skipping crossfade')
      }
    }, crossfadeStartTime)
    
    return () => clearTimeout(timeout)
  }, [autoAdvanceInterval, enableFestivalTransitions, onAutoAdvance])

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
      }
    }

    window.addEventListener('keydown', handleKeyPress)
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

      {/* Title and Controls Overlay */}
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

declare global {
  interface Window {
    THREE: any
  }
}
