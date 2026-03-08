"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { X, RotateCcw, ZoomIn, ZoomOut, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PanoramaViewerProps {
  imageUrl: string
  title: string
  onClose?: () => void
  isInline?: boolean
  isPreview?: boolean
  className?: string
}

export const PanoramaViewer = React.memo(function PanoramaViewer({
  imageUrl,
  title,
  onClose,
  isInline = false,
  isPreview = false,
  className = "",
}: PanoramaViewerProps) {
  const [yaw, setYaw] = useState(0) // Horizontal rotation
  const [pitch, setPitch] = useState(0) // Vertical rotation
  const [fov, setFov] = useState(75) // Field of view (zoom)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const animationRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log("[v0] PanoramaViewer initialized with isInline:", isInline, "isPreview:", isPreview)
  }, [isInline, isPreview])

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

    // Render each pixel with optimized sampling
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

        // Sample from source image with bounds checking
        const sourceX = Math.floor(u * image.width) % image.width
        const sourceY = Math.max(0, Math.min(image.height - 1, Math.floor(v * image.height)))

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
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
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
      e.preventDefault()
      e.stopPropagation()

      if (!isDragging) return

      const deltaX = e.clientX - lastMousePos.x
      const deltaY = e.clientY - lastMousePos.y

      setYaw((prev) => prev + deltaX * 0.3)
      setPitch((prev) => Math.max(-90, Math.min(90, prev - deltaY * 0.3)))

      setLastMousePos({ x: e.clientX, y: e.clientY })
    },
    [isDragging, lastMousePos],
  )

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation() // Added stopPropagation to prevent background scrolling
    const delta = e.deltaY > 0 ? 5 : -5
    setFov((prev) => Math.max(30, Math.min(120, prev + delta)))
  }, [])

  const resetView = useCallback(() => {
    setYaw(0)
    setPitch(0)
    setFov(75)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (isInline || isPreview) {
      console.log("[v0] Fullscreen disabled in inline/preview mode")
      return
    }

    console.log("[v0] Toggling fullscreen, current state:", !!document.fullscreenElement)
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [isInline, isPreview])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen()
          setIsFullscreen(false)
        } else if (!isInline && !isPreview) {
          onClose?.()
        }
      }
    }

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement
      console.log("[v0] Fullscreen state changed:", isCurrentlyFullscreen)
      setIsFullscreen(isCurrentlyFullscreen)
    }

    if (!isInline && !isPreview) {
      document.addEventListener("keydown", handleKeyDown)
      document.addEventListener("fullscreenchange", handleFullscreenChange)
    }

    return () => {
      if (!isInline && !isPreview) {
        document.removeEventListener("keydown", handleKeyDown)
        document.removeEventListener("fullscreenchange", handleFullscreenChange)
      }
    }
  }, [onClose, isInline, isPreview])

  useEffect(() => {
    if (!imageUrl) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      console.log("[v0] Panorama image loaded successfully from:", imageUrl)
      setImageLoaded(true)
    }
    img.onerror = (e) => {
      console.error("[v0] Failed to load panorama image from URL:", imageUrl)
      console.error("[v0] Image error event:", e)
    }
    img.src = imageUrl
    imageRef.current = img
  }, [imageUrl])

  if (!imageUrl || !title) {
    return null
  }

  const containerClasses = isInline
    ? `relative w-full h-full ${className}`
    : isPreview
      ? "relative w-full h-full"
      : "fixed inset-0 z-50 bg-black"

  const controlsClasses =
    isInline || isPreview
      ? "absolute top-2 right-2 z-10 flex items-center gap-1"
      : "absolute top-4 left-4 right-4 z-10 flex items-center justify-between"

  return (
    <div ref={containerRef} className={containerClasses}>
      {!isInline && !isPreview && (
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-white/70">Drag to look around • Scroll to zoom • True 360° spherical view</p>
          </div>
        </div>
      )}

      <div className={controlsClasses}>
        {!isInline && !isPreview && <div></div>}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFov((prev) => Math.max(30, prev + 10))}
            className={
              isInline || isPreview
                ? "bg-black/50 hover:bg-black/70 text-white border-white/20 h-8 w-8 p-0"
                : "bg-white/10 hover:bg-white/20 text-white border-white/20"
            }
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFov((prev) => Math.min(120, prev - 10))}
            className={
              isInline || isPreview
                ? "bg-black/50 hover:bg-black/70 text-white border-white/20 h-8 w-8 p-0"
                : "bg-white/10 hover:bg-white/20 text-white border-white/20"
            }
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          {!isInline && !isPreview && (
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={resetView}
            className={
              isInline || isPreview
                ? "bg-black/50 hover:bg-black/70 text-white border-white/20 h-8 w-8 p-0"
                : "bg-white/10 hover:bg-white/20 text-white border-white/20"
            }
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className={
                isInline || isPreview
                  ? "bg-black/50 hover:bg-black/70 text-white border-white/20 h-8 w-8 p-0"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/20"
              }
            >
              <X className="h-4 w-4" />
            </Button>
          )}
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
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onDragStart={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          style={{
            pointerEvents: "auto",
            touchAction: "none",
          }}
        />
      </div>

      {!imageLoaded && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${isInline || isPreview ? "text-white" : "text-white"}`}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading spherical panorama...</p>
          </div>
        </div>
      )}

      {!isInline && !isPreview && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white/70 text-sm">
          <div className="bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm">
            <p>Drag to rotate • Scroll to zoom • F11 for fullscreen • ESC to close</p>
          </div>
        </div>
      )}
    </div>
  )
})
