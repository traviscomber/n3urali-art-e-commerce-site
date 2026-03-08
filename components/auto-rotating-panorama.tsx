'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface AutoRotatingPanoramaProps {
  imageUrl: string
  title: string
  onClose?: () => void
  className?: string
}

function PanoramaContent({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const rotationSpeedRef = useRef(0.0002) // Very slow rotation
  const textureRef = useRef<THREE.Texture | null>(null)

  useEffect(() => {
    // Load texture once on mount
    const loader = new THREE.TextureLoader()
    loader.load(
      imageUrl,
      (texture) => {
        textureRef.current = texture
      },
      undefined,
      (error) => {
        console.error('[v0] Failed to load panorama texture:', error)
      }
    )
  }, [imageUrl])

  useFrame(() => {
    if (meshRef.current) {
      // Continuous slow horizontal rotation
      meshRef.current.rotation.y += rotationSpeedRef.current
    }
  })

  return (
    <>
      <mesh ref={meshRef} scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, 64, 64]} />
        <meshBasicMaterial map={textureRef.current || undefined} />
      </mesh>
    </>
  )
}

function CameraSetup() {
  const { camera } = useThree()

  useEffect(() => {
    // Position camera at center, looking slightly up
    camera.position.set(0, 50, 0)
    camera.lookAt(0, 0, 0)
    
    // Only set fov if this is a PerspectiveCamera
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 85
      camera.updateProjectionMatrix()
    }
  }, [camera])

  return null
}

export const AutoRotatingPanorama = React.memo(function AutoRotatingPanorama({
  imageUrl,
  title,
  onClose,
  className = '',
}: AutoRotatingPanoramaProps) {
  const [isLoading, setIsLoading] = useState(true)

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
    <div className={`w-full h-screen bg-black relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Loading panorama...</p>
          </div>
        </div>
      )}
      <Canvas
        camera={{ position: [0, 0, 0], fov: 85 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={() => setIsLoading(false)}
      >
        <CameraSetup />
        <PanoramaContent imageUrl={imageUrl} />
      </Canvas>

      {/* Close Button and Title */}
      <div className="absolute inset-0 pointer-events-none flex flex-col">
        <div className="flex-1 flex flex-col justify-between p-6">
          {/* Title at top */}
          <div className="pointer-events-auto">
            <h2 className="text-white text-2xl font-light tracking-wide">{title}</h2>
            <p className="text-gray-400 text-sm mt-1">Relax and explore this panoramic world</p>
          </div>

          {/* Close button at bottom */}
          <div className="pointer-events-auto">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-white transition-all duration-300 font-light"
            >
              Close (ESC)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
