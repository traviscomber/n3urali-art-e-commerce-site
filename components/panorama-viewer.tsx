"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { X, RotateCcw, ZoomIn, ZoomOut, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PanoramaViewerProps {
  imageUrl: string
  title: string
  onClose: () => void
  isPreview?: boolean // Added preview mode option
}

export const PanoramaViewer = React.memo(function PanoramaViewer({
  imageUrl,
  title,
  onClose,
  isPreview = false, // Default to preview mode
}: PanoramaViewerProps) {
  const [yaw, setYaw] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [fov, setFov] = useState(90)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(!isPreview) // Start in preview mode if specified

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const animationRef = useRef<number>()
  const containerRef = useRef<HTMLDivElement>(null)

  const renderPanorama = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image || !imageLoaded) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    // Convert field of view to radians
    const fovRad = (fov * Math.PI) / 180
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
  }, [yaw, pitch, fov, imageLoaded])

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
  }, [isFullscreen])

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

      setYaw((prev) => prev + deltaX * 0.3)
      setPitch((prev) => Math.max(-90, Math.min(90, prev - deltaY * 0.3)))

      setLastMousePos({ x: e.clientX, y: e.clientY })
    },
    [isDragging, lastMousePos],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 3 : -3 // Reduced from 5 to 3 for finer control
    setFov((prev) => Math.max(60, Math.min(110, prev + delta))) // Limited range: 60-110°
  }, [])

  const resetView = useCallback(() => {
    setYaw(0)
    setPitch(0)
    setFov(90) // Changed from 75 to 90 for better default view
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (isPreview) {
      setIsFullscreen(!isFullscreen)
    } else {
      if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    }
  }, [isPreview, isFullscreen])

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
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen()
          setIsFullscreen(false)
        } else {
          onClose()
        }
      }
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [onClose])

  if (!imageUrl || !title) {
    return null
  }

  if (isPreview && !isFullscreen) {
    // Preview mode - embedded in page
    return (
      <div ref={containerRef} className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between">
          <div className="text-white">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-xs text-white/70">360° Preview • Drag to explore</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFov((prev) => Math.max(60, prev + 5))}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-8 w-8 p-0"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFov((prev) => Math.min(110, prev - 5))}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-8 w-8 p-0"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-8 w-8 p-0"
            >
              <Maximize className="h-3 w-3" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={resetView}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-8 w-8 p-0"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="w-full h-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
        </div>

        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">Loading 360° view...</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Fullscreen mode - overlay
  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="text-white">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-white/70">
            Drag to look around • Limited zoom to preserve quality • True 360° spherical view
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFov((prev) => Math.max(60, prev + 5))}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFov((prev) => Math.min(110, prev - 5))}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          {isPreview && (
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Minimize className="h-4 w-4" />
            </Button>
          )}
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
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
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

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white/70 text-sm">
        <div className="bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <p>Drag to rotate • Limited zoom for quality • F11 for fullscreen • ESC to close</p>
        </div>
      </div>
    </div>
  )
})
