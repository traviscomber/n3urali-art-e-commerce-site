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
  // Touch/drag control references
  const mouseDownRef = useRef(false)
  const mouseXRef = useRef(0)
  const mouseDeltaRef = useRef(0)
  // Fade effect timing - track elapsed time in current image
  const imageStartTimeRef = useRef<number | null>(null)
  const FADE_IN_DURATION = 3000 // 3 seconds fade in
  const FADE_OUT_START_TIME = 33000 // Start fade out at 33 seconds (36 - 3)

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

        const renderer = new THREE.WebGLRenderer({ 
          canvas, 
          antialias: true, // Enable antialiasing for smooth edges
          alpha: false,
          precision: 'highp', // High precision for accurate rendering
        })
        renderer.setSize(width, height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Up to 2x for high-DPI screens
        renderer.setClearColor(0x000000, 1)
        renderer.autoClear = false
        renderer.outputColorSpace = THREE.SRGBColorSpace
        console.log('[v0] Renderer initialized with high quality settings, size:', width, 'x', height)
        
        // Load panorama image with CORS and adaptive quality
        const textureLoader = new THREE.TextureLoader()
        textureLoader.setCrossOrigin('anonymous')
        
        // Adaptive geometry quality based on device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        const geometrySegments = isMobile ? 128 : 256 // Reduce segments on mobile
        console.log('[v0] Loading texture from:', imageUrl, '- Device:', isMobile ? 'Mobile' : 'Desktop')
        
        const texture = textureLoader.load(
          imageUrl,
          () => {
            console.log('[v0] Texture loaded successfully')
            // Don't hide loading here - let it hide after first render
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
        texture.minFilter = THREE.LinearFilter // Smooth filtering to prevent artifacts
        texture.magFilter = THREE.LinearFilter

        // Create high-quality sphere geometry (adaptive segments based on device)
        const geometry = new THREE.SphereGeometry(sphereScale, geometrySegments, geometrySegments)
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide,
          toneMapped: false,
          depthTest: false, // Disable depth testing to prevent z-fighting during crossfade
          depthWrite: false, // Prevent depth buffer conflicts
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

        // Mouse drag to pan panorama
        const handleMouseDown = (e: MouseEvent) => {
          mouseDownRef.current = true
          mouseXRef.current = e.clientX
          mouseDeltaRef.current = 0
        }

        const handleMouseMove = (e: MouseEvent) => {
          if (!mouseDownRef.current || !sphereRef.current) return
          
          const deltaX = e.clientX - mouseXRef.current
          mouseDeltaRef.current = deltaX * 0.005 // Sensitivity factor
          mouseXRef.current = e.clientX
          
          // Apply pan rotation
          if (sphereRef.current) {
            sphereRef.current.rotation.y -= mouseDeltaRef.current
          }
          if (nextSphereRef.current) {
            nextSphereRef.current.rotation.y -= mouseDeltaRef.current
          }
        }

        const handleMouseUp = () => {
          mouseDownRef.current = false
          mouseDeltaRef.current = 0
        }

        // Touch controls for mobile
        const handleTouchStart = (e: TouchEvent) => {
          if (e.touches.length === 1) {
            mouseDownRef.current = true
            mouseXRef.current = e.touches[0].clientX
          }
        }

        const handleTouchMove = (e: TouchEvent) => {
          if (!mouseDownRef.current || e.touches.length !== 1 || !sphereRef.current) return
          
          const deltaX = e.touches[0].clientX - mouseXRef.current
          mouseDeltaRef.current = deltaX * 0.005
          mouseXRef.current = e.touches[0].clientX
          
          if (sphereRef.current) {
            sphereRef.current.rotation.y -= mouseDeltaRef.current
          }
          if (nextSphereRef.current) {
            nextSphereRef.current.rotation.y -= mouseDeltaRef.current
          }
        }

        const handleTouchEnd = () => {
          mouseDownRef.current = false
          mouseDeltaRef.current = 0
        }

        canvas.addEventListener('wheel', handleWheel, { passive: false })
        canvas.addEventListener('mousedown', handleMouseDown)
        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('mouseup', handleMouseUp)
        canvas.addEventListener('mouseleave', handleMouseUp)
        canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
        canvas.addEventListener('touchmove', handleTouchMove, { passive: true })
        canvas.addEventListener('touchend', handleTouchEnd, { passive: true })

        // Render initial frame
        renderer.clear()
        renderer.render(scene, camera)
        console.log(`[v0] Initial render completed with FOV ${fov}`)

        // Animation loop optimized for 30 FPS with dual-layer crossfade
        let lastFrameTime = Date.now()
        let firstFrameRendered = false
        const animate = () => {
          animationRef.current = requestAnimationFrame(animate)
          
          const currentTime = Date.now()
          const deltaTime = (currentTime - lastFrameTime) / 1000
          lastFrameTime = currentTime
          
          // Hide loading spinner on first frame render
          if (!firstFrameRendered) {
            firstFrameRendered = true
            setIsLoading(false)
            console.log('[v0] First frame rendered, loading complete')
            // Reset fade timer when new image starts
            const now = Date.now()
            imageStartTimeRef.current = now
            console.log(`[v0] FADE TIMER RESET: imageStartTime=${now}ms, FADE_OUT_START_TIME=${FADE_OUT_START_TIME}ms, FADE_OUT_END_TIME=${FADE_OUT_START_TIME + FADE_IN_DURATION}ms`)
          }

          // Track fade timing for ALL states (including during transitions)
          let fadedOpacity = 1
          if (imageStartTimeRef.current) {
            const elapsedTime = Date.now() - imageStartTimeRef.current
            
            // Fade in from 0-3 seconds
            if (elapsedTime < FADE_IN_DURATION) {
              const fadeInProgress = elapsedTime / FADE_IN_DURATION
              fadedOpacity = fadeInProgress < 0.5 
                ? 4 * fadeInProgress * fadeInProgress * fadeInProgress
                : 1 - Math.pow(-2 * fadeInProgress + 2, 3) / 2
            }
            // Fade out from 33-36 seconds (DURING crossfade transition)
            else if (elapsedTime >= FADE_OUT_START_TIME && elapsedTime <= FADE_OUT_START_TIME + FADE_IN_DURATION) {
              const fadeOutProgress = (elapsedTime - FADE_OUT_START_TIME) / FADE_IN_DURATION
              const cubicEase = fadeOutProgress < 0.5 
                ? 4 * fadeOutProgress * fadeOutProgress * fadeOutProgress
                : 1 - Math.pow(-2 * fadeOutProgress + 2, 3) / 2
              fadedOpacity = 1 - cubicEase
              console.log(`[v0] FADE-OUT: elapsed=${elapsedTime}ms, progress=${fadeOutProgress.toFixed(3)}, easeProgress=${cubicEase.toFixed(3)}, opacity=${fadedOpacity.toFixed(3)}`)
            }
          }

          // Dual-layer crossfade transition with enhanced fade effects
          if (isTransitioningRef.current && materialRef.current && nextMaterialRef.current) {
            transitionProgressRef.current += deltaTime / 4.0 // 4-second crossfade
            if (transitionProgressRef.current >= 1) {
              transitionProgressRef.current = 1
              isTransitioningRef.current = false
              
              // SWAP references: next becomes current, old is removed
              // Remove old sphere from scene
              sceneRef.current?.remove(sphereRef.current)
              
              // Swap sphere and material references
              sphereRef.current = nextSphereRef.current
              materialRef.current = nextMaterialRef.current
              
              // Ensure current layer is fully visible with no fade
              materialRef.current.opacity = 1
              materialRef.current.transparent = false
              
              // Clear next references
              nextSphereRef.current = null
              nextMaterialRef.current = null
              
              console.log('[v0] Crossfade complete, next image now current')
            } else {
              // Enhanced easing with smooth fade in and fade out
              // Cubic ease-in-out for more natural motion
              let easeProgress: number
              if (transitionProgressRef.current < 0.5) {
                easeProgress = 4 * transitionProgressRef.current * transitionProgressRef.current * transitionProgressRef.current
              } else {
                const p = 2 * transitionProgressRef.current - 2
                easeProgress = 0.5 * p * p * p + 1
              }
              
              // Apply fade-out effect to current image and crossfade to next
              materialRef.current.opacity = Math.max(0, (1 - easeProgress) * fadedOpacity)
              materialRef.current.transparent = easeProgress > 0
              nextMaterialRef.current.opacity = Math.min(1, easeProgress)
              nextMaterialRef.current.transparent = easeProgress < 1
              
              // Gentle rotation during transition (slows to 10% speed at midpoint)
              rotationYRef.current = rotationSpeed * (1 - 0.9 * easeProgress)
            }
          } else {
            // Normal state - apply fade effects when not transitioning
            if (materialRef.current) {
              materialRef.current.opacity = fadedOpacity
              materialRef.current.transparent = fadedOpacity < 1
            }
            rotationYRef.current = rotationSpeed
          }
              
          // Auto-rotate if relaxMode enabled
          if (relaxMode && sphereRef.current) {
            sphereRef.current.rotation.y += rotationYRef.current
          }
          
          // Keep next sphere rotation in sync during preload and crossfade
          if (nextSphereRef.current) {
            nextSphereRef.current.rotation.y += rotationYRef.current
          }

          renderer.render(scene, camera)
        }

        animate()
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

  // Preload next image IMMEDIATELY and continuously for zero-delay playback
  useEffect(() => {
    if (!nextImageUrl || !rendererRef.current || !sceneRef.current || !sphereRef.current?.geometry) return
    
    const preloadNextImage = () => {
      try {
        const THREE = (window as any).THREE
        if (!THREE) return
        
        const textureLoader = new THREE.TextureLoader()
        textureLoader.setCrossOrigin('anonymous')
        
        console.log('[v0] Preloading next panorama immediately:', nextImageUrl)
        
        textureLoader.load(nextImageUrl, (newTexture: any) => {
          // Optimize texture for seamless crossfade
          newTexture.wrapS = THREE.ClampToEdgeWrapping
          newTexture.wrapT = THREE.ClampToEdgeWrapping
          newTexture.minFilter = THREE.LinearFilter
          newTexture.magFilter = THREE.LinearFilter
          newTexture.colorSpace = 'srgb'
          
          // Create material for next sphere with artifact-free rendering
          const nextMaterial = new THREE.MeshBasicMaterial({
            map: newTexture,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0,
            toneMapped: false,
            depthTest: false,
            depthWrite: false,
          })
          
          // Create next sphere ready for seamless crossfade
          const nextSphere = new THREE.Mesh(sphereRef.current.geometry, nextMaterial)
          nextSphere.rotation.y = sphereRef.current.rotation.y
          
          sceneRef.current.add(nextSphere)
          nextSphereRef.current = nextSphere
          nextMaterialRef.current = nextMaterial
          nextTextureRef.current = newTexture
          
          console.log('[v0] Next panorama fully loaded and ready, no delay on transition')
        }, undefined, (err: any) => {
          console.error('[v0] Error preloading next image:', err)
        })
      } catch (err) {
        console.error('[v0] Preload error:', err)
      }
    }
    
    // Start preload immediately, no delay
    preloadNextImage()
  }, [nextImageUrl])

  // Auto-advance to next image with seamless 4-second crossfade (32-36 seconds for 36s loop)
  useEffect(() => {
    if (!enableFestivalTransitions || !autoAdvanceInterval || !onAutoAdvance) return
    if (isTransitioningRef.current) return
    
    const CROSSFADE_DURATION = 4000 // 4 seconds for smooth, extended fade
    // Start crossfade at (total - 3 seconds) so it completes by the interval
    // For 36s loop: fade from second 33-36
    const crossfadeStartTime = autoAdvanceInterval - CROSSFADE_DURATION
    
    console.log('[v0] Auto-advance scheduled: crossfade at', crossfadeStartTime, 'ms, complete at', autoAdvanceInterval, 'ms')
    
    const timeout = setTimeout(() => {
      // Check if next image is preloaded
      if (nextSphereRef.current && nextMaterialRef.current) {
        transitionProgressRef.current = 0
        isTransitioningRef.current = true
        console.log('[v0] Starting 3-second crossfade')
        
        // After crossfade completes, advance to next image
        setTimeout(() => {
          console.log('[v0] Crossfade complete, advancing to next image')
          onAutoAdvance?.()
        }, CROSSFADE_DURATION)
      } else {
        console.warn('[v0] Next image not ready, waiting for preload to complete...')
        // If not ready, wait a bit and retry
        setTimeout(() => {
          if (nextSphereRef.current && nextMaterialRef.current) {
            transitionProgressRef.current = 0
            isTransitioningRef.current = true
            setTimeout(() => {
              onAutoAdvance?.()
            }, CROSSFADE_DURATION)
          }
        }, 100)
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
