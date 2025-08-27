"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { X, RotateCcw, ZoomIn, ZoomOut, Maximize, Play, Pause, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PanoramaViewerProps {
  imageUrl: string
  title: string
  onClose: () => void
}

export const PanoramaViewer = React.memo(function PanoramaViewer({ imageUrl, title, onClose }: PanoramaViewerProps) {
  const [yaw, setYaw] = useState(0) // Horizontal rotation
  const [pitch, setPitch] = useState(0) // Vertical rotation
  const [fov, setFov] = useState(75) // Field of view (zoom)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAutoRotating, setIsAutoRotating] = useState(false)
  const [rotationSpeed, setRotationSpeed] = useState(0.5)
  const [rotationDirection, setRotationDirection] = useState(1) // 1 for clockwise, -1 for counter-clockwise

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const animationRef = useRef<number>()
  const containerRef = useRef<HTMLDivElement>(null)
  const lastTimeRef = useRef<number>(0)

  const bilinearSample = useCallback((imageData: ImageData, x: number, y: number) => {
    const { width, height, data } = imageData

    // Wrap x coordinate horizontally (seamless left-right connection)
    x = ((x % width) + width) % width

    // Clamp y coordinate vertically (no wrapping at poles)
    y = Math.max(0, Math.min(height - 1, y))

    const x1 = Math.floor(x)
    const y1 = Math.floor(y)
    const x2 = (x1 + 1) % width
    const y2 = Math.min(y1 + 1, height - 1)

    const fx = x - x1
    const fy = y - y1

    const getPixel = (px: number, py: number) => {
      px = ((px % width) + width) % width
      py = Math.max(0, Math.min(height - 1, py))
      const idx = (py * width + px) * 4
      return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]
    }

    const p1 = getPixel(x1, y1)
    const p2 = getPixel(x2, y1)
    const p3 = getPixel(x1, y2)
    const p4 = getPixel(x2, y2)

    const result = [0, 0, 0, 0]
    for (let i = 0; i < 4; i++) {
      const top = p1[i] * (1 - fx) + p2[i] * fx
      const bottom = p3[i] * (1 - fx) + p4[i] * fx
      result[i] = Math.round(top * (1 - fy) + bottom * fy)
    }

    return result
  }, [])

  const renderPanorama = useCallback(
    (currentTime = 0) => {
      const canvas = canvasRef.current
      const image = imageRef.current
      if (!canvas || !image || !imageLoaded) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      if (isAutoRotating && !isDragging) {
        const deltaTime = currentTime - lastTimeRef.current
        if (deltaTime > 0) {
          setYaw((prev) => prev + rotationSpeed * rotationDirection * deltaTime * 0.01)
        }
      }
      lastTimeRef.current = currentTime

      const devicePixelRatio = window.devicePixelRatio || 1
      const displayWidth = canvas.clientWidth
      const displayHeight = canvas.clientHeight
      const canvasWidth = displayWidth * devicePixelRatio
      const canvasHeight = displayHeight * devicePixelRatio

      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        ctx.scale(devicePixelRatio, devicePixelRatio)
      }

      const imageData = ctx.createImageData(canvasWidth, canvasHeight)
      const data = imageData.data

      // Create source image data once
      const tempCanvas = document.createElement("canvas")
      const tempCtx = tempCanvas.getContext("2d")
      tempCanvas.width = image.width
      tempCanvas.height = image.height
      tempCtx?.drawImage(image, 0, 0)
      const sourceImageData = tempCtx?.getImageData(0, 0, image.width, image.height)

      if (!sourceImageData) return

      // Convert field of view to radians
      const fovRad = (fov * Math.PI) / 180
      const yawRad = (yaw * Math.PI) / 180
      const pitchRad = (pitch * Math.PI) / 180

      const aspectRatio = canvasWidth / canvasHeight
      const tanHalfFov = Math.tan(fovRad / 2)

      for (let y = 0; y < canvasHeight; y += 1) {
        for (let x = 0; x < canvasWidth; x += 1) {
          // Convert screen coordinates to normalized coordinates (-1 to 1)
          const nx = (2 * x) / canvasWidth - 1
          const ny = 1 - (2 * y) / canvasHeight

          // Calculate ray direction in 3D space
          const rayX = tanHalfFov * nx * aspectRatio
          const rayY = tanHalfFov * ny
          const rayZ = -1

          // Normalize ray direction
          const rayLength = Math.sqrt(rayX * rayX + rayY * rayY + rayZ * rayZ)
          let dirX = rayX / rayLength
          let dirY = rayY / rayLength
          let dirZ = rayZ / rayLength

          // Apply pitch rotation (around X axis)
          const cosPitch = Math.cos(pitchRad)
          const sinPitch = Math.sin(pitchRad)
          const rotY = dirY * cosPitch - dirZ * sinPitch
          const rotZ = dirY * sinPitch + dirZ * cosPitch
          dirY = rotY
          dirZ = rotZ

          // Apply yaw rotation (around Y axis)
          const cosYaw = Math.cos(yawRad)
          const sinYaw = Math.sin(yawRad)
          const rotX = dirX * cosYaw - dirZ * sinYaw
          const rotZFinal = dirX * sinYaw + dirZ * cosYaw
          dirX = rotX
          dirZ = rotZFinal

          // Convert 3D direction to spherical coordinates
          const theta = Math.atan2(dirX, -dirZ)
          const phi = Math.asin(Math.max(-1, Math.min(1, dirY)))

          // Convert spherical coordinates to equirectangular coordinates
          const u = theta / (2 * Math.PI) + 0.5
          const v = 0.5 - phi / Math.PI

          const sourceX = u * image.width
          const sourceY = v * (image.height - 1)

          const pixel = bilinearSample(sourceImageData, sourceX, sourceY)
          const targetIndex = (y * canvasWidth + x) * 4

          data[targetIndex] = pixel[0] // R
          data[targetIndex + 1] = pixel[1] // G
          data[targetIndex + 2] = pixel[2] // B
          data[targetIndex + 3] = 255 // A
        }
      }

      ctx.putImageData(imageData, 0, 0)
    },
    [yaw, pitch, fov, imageLoaded, isAutoRotating, isDragging, rotationSpeed, rotationDirection, bilinearSample],
  )

  useEffect(() => {
    const animate = (currentTime: number) => {
      renderPanorama(currentTime)
      animationRef.current = requestAnimationFrame(animate)
    }

    if (imageLoaded) {
      animationRef.current = requestAnimationFrame(animate)
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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      setLastMousePos({ x: e.clientX, y: e.clientY })
      if (isAutoRotating) {
        setIsAutoRotating(false)
      }
    },
    [isAutoRotating],
  )

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
    const delta = e.deltaY > 0 ? 5 : -5
    setFov((prev) => Math.max(30, Math.min(120, prev + delta)))
  }, [])

  const resetView = useCallback(() => {
    setYaw(0)
    setPitch(0)
    setFov(75)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const toggleAutoRotation = useCallback(() => {
    setIsAutoRotating((prev) => !prev)
  }, [])

  const increaseRotationSpeed = useCallback(() => {
    setRotationSpeed((prev) => Math.min(3, prev + 0.2))
  }, [])

  const decreaseRotationSpeed = useCallback(() => {
    setRotationSpeed((prev) => Math.max(0.1, prev - 0.2))
  }, [])

  const toggleRotationDirection = useCallback(() => {
    setRotationDirection((prev) => prev * -1)
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

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="text-white">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-white/70">Drag to look around • Scroll to zoom • High-quality spherical view</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFov((prev) => Math.max(30, prev + 10))}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFov((prev) => Math.min(120, prev - 10))}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Maximize className="h-4 w-4" />
          </Button>
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
            <p>Loading high-quality panorama...</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-2 bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAutoRotation}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
          >
            {isAutoRotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="ml-1 text-xs">Auto Rotate</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRotationDirection}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
          >
            <RotateCw className="h-4 w-4" />
            <span className="ml-1 text-xs">Direction</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={decreaseRotationSpeed}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
          >
            <span className="text-xs">Speed -</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={increaseRotationSpeed}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
          >
            <span className="text-xs">Speed +</span>
          </Button>
        </div>
      </div>
    </div>
  )
})
