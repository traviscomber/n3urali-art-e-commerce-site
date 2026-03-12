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
  sphereScale?: number
  rotationSpeed?: number
  geometrySegments?: number
  initialYaw?: number
  transitionDuration?: number
}

export const PanoramaViewerPSV = React.memo(function PanoramaViewerPSV({
  imageUrl,
  title,
  onClose,
  relaxMode = true,
  fov = 75,
  sphereScale = 5000,
  rotationSpeed = 0.0002,
  geometrySegments = 64, // OPTIMIZED: reduced from 128
  initialYaw = Math.PI,
  transitionDuration = 800, // FAST: reduced from 1500ms
}: PanoramaViewerPSVProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const animationRef = useRef<number | null>(null)
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const sphereRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const rotationYRef = useRef(initialYaw)
  const currentFovRef = useRef(fov)
  const pendingTextureRef = useRef<any>(null)
  const isTransitioningRef = useRef(false)
  const transitionStartTimeRef = useRef(0)
  const materialRef = useRef<any>(null)

  useEffect(() => {
    const loadPanorama = async () => {
      try {
        if (!canvasRef.current) {
          setError('Canvas not initialized')
          return
        }

        const canvas = canvasRef.current
        const width = window.innerWidth
        const height = window.innerHeight

        // Scene setup
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 100000)
        camera.position.set(0, 0, 0) // Camera at center of sphere (inside for 360 view)
        camera.lookAt(0, 0, -1) // Look forward

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
        renderer.setSize(width, height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setClearColor(0x000000, 1)
        renderer.autoClear = false
        
        // Create sphere FIRST before loading texture
        const geometry = new THREE.SphereGeometry(sphereScale, geometrySegments, geometrySegments)
        const material = new THREE.MeshBasicMaterial({
          map: null,
          side: THREE.BackSide, // Render inside of sphere
          toneMapped: false, // OPTIMIZATION: disable tone mapping for faster rendering
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

        // Load texture
        const textureLoader = new THREE.TextureLoader()
        const texture = textureLoader.load(
          imageUrl,
          () => {
            // Apply texture immediately
            material.map = texture
            material.needsUpdate = true
            material.color.setHex(0xffffff)
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

        // Zoom control
        const handleWheel = (e: WheelEvent) => {
          e.preventDefault()
          if (e.deltaY > 0) {
            currentFovRef.current = Math.min(currentFovRef.current + 2, 170)
          } else if (e.deltaY < 0) {
            currentFovRef.current = Math.max(currentFovRef.current - 2, fov)
          }
          camera.fov = currentFovRef.current
          camera.updateProjectionMatrix()
        }

        canvas.addEventListener('wheel', handleWheel, { passive: false })

        // FAST animation loop - single sphere with material updates
        const animate = () => {
          animationRef.current = requestAnimationFrame(animate)

          // Handle fast texture transition
          if (isTransitioningRef.current && pendingTextureRef.current && materialRef.current) {
            const elapsed = performance.now() - transitionStartTimeRef.current
            const progress = Math.min(elapsed / transitionDuration, 1)

            if (progress >= 1) {
              // Swap texture instantly
              isTransitioningRef.current = false
              materialRef.current.map = pendingTextureRef.current
              materialRef.current.needsUpdate = true
              materialRef.current.transparent = false
              pendingTextureRef.current = null
            } else {
              // Opacity fade during transition
              materialRef.current.transparent = true
              materialRef.current.opacity = 1 - progress * 0.9
            }
          }

          // Auto-rotation
          if (relaxMode && sphereRef.current) {
            rotationYRef.current += rotationSpeed
            sphereRef.current.rotation.y = rotationYRef.current
          }

          renderer.clear()
          renderer.render(scene, camera)
        }

        animate()

        // Resize handler
        const handleResize = () => {
          const newWidth = window.innerWidth
          const newHeight = window.innerHeight
          camera.aspect = newWidth / newHeight
          camera.updateProjectionMatrix()
          renderer.setSize(newWidth, newHeight)
        }

        window.addEventListener('resize', handleResize)

        return () => {
          window.removeEventListener('resize', handleResize)
          canvas.removeEventListener('wheel', handleWheel)
          if (animationRef.current) cancelAnimationFrame(animationRef.current)
          renderer.dispose()
          geometry.dispose()
          material.dispose()
          texture.dispose()
        }
      } catch (err) {
        console.error('[v0] Panorama error:', err)
        setError('Failed to initialize panorama')
        setIsLoading(false)
      }
    }

    loadPanorama()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (rendererRef.current) rendererRef.current.dispose()
    }
  }, [imageUrl, relaxMode, fov, sphereScale, rotationSpeed, geometrySegments, initialYaw, transitionDuration])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose()
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onClose])

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-300 text-sm">Loading panorama...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button onClick={onClose} className="px-6 py-2 border border-red-500 text-red-400 rounded hover:bg-red-500/10">
              Close
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
          <div className="pointer-events-auto">
            <h2 className="text-white text-2xl font-light tracking-wide">{title}</h2>
            <p className="text-gray-400 text-sm mt-1">Scroll to zoom</p>
          </div>

          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-auto flex flex-col gap-3">
            <button
              onClick={() => {
                if (cameraRef.current) {
                  currentFovRef.current = Math.max(currentFovRef.current - 5, fov)
                  cameraRef.current.fov = currentFovRef.current
                  cameraRef.current.updateProjectionMatrix()
                }
              }}
              className="p-3 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-cyan-500 transition-all bg-black/30 hover:bg-cyan-500/10"
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
              className="p-3 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-cyan-500 transition-all bg-black/30 hover:bg-cyan-500/10"
            >
              <ZoomOut size={20} />
            </button>
          </div>

          <div className="pointer-events-auto">
            <button onClick={onClose} className="px-6 py-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-white transition-all font-light">
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
