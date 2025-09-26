"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PanoramaViewerProps {
  imageUrl: string
  title: string
  onClose: () => void
  isPaid?: boolean // Added isPaid prop to control protection level
}

export const PanoramaViewer = React.memo(function PanoramaViewer({
  imageUrl,
  title,
  onClose,
  isPaid = false, // Default to unpaid (protected)
}: PanoramaViewerProps) {
  const [yaw, setYaw] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const animationRef = useRef<number>()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!isPaid) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    },
    [isPaid],
  )

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!isPaid) {
        e.preventDefault()
        return false
      }
    },
    [isPaid],
  )

  const handleSelectStart = useCallback(
    (e: React.SyntheticEvent) => {
      if (!isPaid) {
        e.preventDefault()
        return false
      }
    },
    [isPaid],
  )

  const renderPanorama = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image || !imageLoaded) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    const fovRad = (75 * Math.PI) / 180
    const yawRad = (yaw * Math.PI) / 180
    const pitchRad = (pitch * Math.PI) / 180

    // Create temporary canvas for image sampling
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    tempCanvas.width = image.width
    tempCanvas.height = image.height
    tempCtx?.drawImage(image, 0, 0)
    const sourceImageData = tempCtx?.getImageData(0, 0, image.width, image.height)

    if (!sourceImageData) return

    // Render each pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Convert screen coordinates to normalized coordinates (-1 to 1)
        const nx = (2 * x) / width - 1
        const ny = 1 - (2 * y) / height

        // Calculate ray direction in 3D space
        const rayX = Math.tan(fovRad / 2) * nx * (width / height)
        const rayY = Math.tan(fovRad / 2) * ny
        const rayZ = -1

        // Normalize ray direction
        const rayLength = Math.sqrt(rayX * rayX + rayY * rayY + rayZ * rayZ)
        let dirX = rayX / rayLength
        let dirY = rayY / rayLength
        let dirZ = rayZ / rayLength

        // Apply pitch rotation
        const cosPitch = Math.cos(pitchRad)
        const sinPitch = Math.sin(pitchRad)
        const rotY = dirY * cosPitch - dirZ * sinPitch
        const rotZ = dirY * sinPitch + dirZ * cosPitch
        dirY = rotY
        dirZ = rotZ

        // Apply yaw rotation
        const cosYaw = Math.cos(yawRad)
        const sinYaw = Math.sin(yawRad)
        const rotX = dirX * cosYaw - dirZ * sinYaw
        const rotZFinal = dirX * sinYaw + dirZ * cosYaw
        dirX = rotX
        dirZ = rotZFinal

        // Convert 3D direction to spherical coordinates
        const theta = Math.atan2(dirX, -dirZ) // Horizontal angle
        const phi = Math.asin(Math.max(-1, Math.min(1, dirY))) // Vertical angle

        // Convert spherical coordinates to equirectangular coordinates
        const u = (theta / (2 * Math.PI) + 0.5) % 1
        const v = 0.5 - phi / Math.PI

        // Sample from source image
        const sourceX = Math.floor(u * image.width) % image.width
        const sourceY = Math.floor(v * image.height)

        if (sourceX >= 0 && sourceX < image.width && sourceY >= 0 && sourceY < image.height) {
          const sourceIndex = (sourceY * image.width + sourceX) * 4
          const targetIndex = (y * width + x) * 4

          data[targetIndex] = sourceImageData.data[sourceIndex] // R
          data[targetIndex + 1] = sourceImageData.data[sourceIndex + 1] // G
          data[targetIndex + 2] = sourceImageData.data[sourceIndex + 2] // B
          data[targetIndex + 3] = 255 // A
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }, [yaw, pitch, imageLoaded]) // Removed fov dependency

  useEffect(() => {
    const animate = () => {
      renderPanorama()
      animationRef.current = requestAnimationFrame(animate)
    }

    if (imageLoaded) {
      animate()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [renderPanorama, imageLoaded])

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    return () => window.removeEventListener("resize", updateCanvasSize)
  }, []) // Removed isFullscreen dependency

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()

      const deltaX = e.clientX - lastMousePos.x
      const deltaY = e.clientY - lastMousePos.y

      const sensitivity = isPaid ? 0.3 : 0.2
      setYaw((prev) => prev + deltaX * sensitivity)
      setPitch((prev) => Math.max(-90, Math.min(90, prev - deltaY * sensitivity)))

      setLastMousePos({ x: e.clientX, y: e.clientY })
    },
    [isDragging, lastMousePos, isPaid],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const resetView = useCallback(() => {
    setYaw(0)
    setPitch(0)
  }, [])

  useEffect(() => {
    if (!imageUrl) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setImageLoaded(true)
    }
    img.onerror = () => {
      console.error("Failed to load panorama image")
    }
    img.src = imageUrl
    imageRef.current = img
  }, [imageUrl])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPaid) {
        // Block common shortcuts for unpaid images
        if (
          e.ctrlKey ||
          e.metaKey || // Block Ctrl/Cmd combinations
          e.key === "F12" || // Block dev tools
          (e.ctrlKey && e.shiftKey && e.key === "I") || // Block inspect
          (e.ctrlKey && e.shiftKey && e.key === "C") || // Block console
          (e.ctrlKey && e.key === "u") || // Block view source
          (e.ctrlKey && e.key === "s") // Block save
        ) {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
      }

      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, isPaid])

  if (!imageUrl || !title) {
    return null
  }

  const protectionClasses = !isPaid ? "select-none" : ""

  return (
    <div ref={containerRef} className={`fixed inset-0 z-50 bg-black ${protectionClasses}`}>
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="text-white">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-white/70">
            {!isPaid
              ? "Preview Mode - Purchase for full access • Limited interaction"
              : "Drag to look around • True 360° spherical view"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={resetView}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="w-full h-full">
        <canvas
          ref={canvasRef}
          className={`w-full h-full ${!isPaid ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={handleContextMenu}
          onDragStart={handleDragStart}
          onSelectStart={handleSelectStart}
        />
      </div>

      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading spherical panorama...</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none z-20">
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/30 text-3xl font-bold rotate-12 select-none ${!isPaid ? "text-white/50" : "text-white/20"}`}
        >
          {!isPaid ? "PREVIEW - n3uralia.art" : "n3uralia.art"}
        </div>
        {!isPaid && (
          <>
            <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-white/25 text-xl font-bold -rotate-12 select-none">
              PREVIEW ONLY
            </div>
            <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 text-white/25 text-xl font-bold rotate-45 select-none">
              PREVIEW ONLY
            </div>
            <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/25 text-lg font-bold rotate-12 select-none">
              PURCHASE FOR FULL ACCESS
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white/70 text-sm">
        <div className="bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <p>
            {!isPaid
              ? "Preview Mode • Purchase to unlock full features • ESC to close"
              : "Drag to rotate • ESC to close"}
          </p>
        </div>
      </div>
    </div>
  )
})
