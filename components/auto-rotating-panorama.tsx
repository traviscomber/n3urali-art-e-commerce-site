'use client'

import React, { useRef, useEffect } from 'react'
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
        <meshBasicMaterial map={new THREE.TextureLoader().load(imageUrl)} />
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
    camera.fov = 85
    camera.updateProjectionMatrix()
  }, [camera])

  return null
}

export const AutoRotatingPanorama = React.memo(function AutoRotatingPanorama({
  imageUrl,
  title,
  onClose,
  className = '',
}: AutoRotatingPanoramaProps) {
  return (
    <div className={`w-full h-screen bg-black relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 0], fov: 85 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <CameraSetup />
        <PanoramaContent imageUrl={imageUrl} />
      </Canvas>

      {/* Close button if provided */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
          aria-label="Close panorama viewer"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Title overlay */}
      <div className="absolute bottom-8 left-8 z-50">
        <h2 className="text-2xl font-light text-white text-shadow">{title}</h2>
        <p className="text-sm text-gray-300 mt-2">Relax and explore the immersive panorama</p>
      </div>
    </div>
  )
})
