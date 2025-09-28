"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface WatermarkedImageProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  onLoad?: () => void
  fill?: boolean
  width?: number
  height?: number
  imageType?: string // Added imageType prop for dynamic watermark sizing
}

export function WatermarkedImage({
  src,
  alt,
  className = "",
  style = {},
  onLoad,
  fill = false,
  width,
  height,
  imageType = "",
}: WatermarkedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !src) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsLoading(true)
    setError(false)

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      console.log("[v0] WatermarkedImage: Image loaded, starting watermark process")
      console.log("[v0] WatermarkedImage: Image dimensions:", img.naturalWidth, "x", img.naturalHeight)
      console.log("[v0] WatermarkedImage: Image type:", imageType)

      // Set canvas dimensions
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      // Draw the original image
      ctx.drawImage(img, 0, 0)

      // Load and draw the N3u360 logo watermark
      const logo = new Image()
      logo.crossOrigin = "anonymous"
      logo.onload = () => {
        console.log("[v0] WatermarkedImage: Logo loaded successfully")

        let watermarkSizeMultiplier = 0.12 // Default size

        // Smaller watermarks for panoramic images
        if (imageType.includes("equirectangular") || imageType.includes("squirectangular")) {
          watermarkSizeMultiplier = 0.08 // Smaller for panoramic images
        } else if (imageType.includes("fisheye") || imageType.includes("dome")) {
          watermarkSizeMultiplier = 0.1 // Medium size for fisheye/dome
        }

        const watermarkSize = Math.min(img.naturalWidth * watermarkSizeMultiplier, 200)

        console.log("[v0] WatermarkedImage: Watermark size:", watermarkSize, "multiplier:", watermarkSizeMultiplier)

        // Corner watermarks with higher opacity
        const positions = [
          { x: 30, y: 30 }, // Top left
          { x: img.naturalWidth - watermarkSize - 30, y: 30 }, // Top right
          { x: 30, y: img.naturalHeight - watermarkSize - 30 }, // Bottom left
          { x: img.naturalWidth - watermarkSize - 30, y: img.naturalHeight - watermarkSize - 30 }, // Bottom right
        ]

        ctx.globalAlpha = 0.6
        positions.forEach((pos) => {
          ctx.drawImage(logo, pos.x, pos.y, watermarkSize, watermarkSize)
        })

        ctx.globalAlpha = 0.4
        const centerSizeMultiplier =
          imageType.includes("equirectangular") || imageType.includes("squirectangular") ? 1.0 : 1.2
        const largeCenterSize = watermarkSize * centerSizeMultiplier
        const largeCenterX = (img.naturalWidth - largeCenterSize) / 2
        const largeCenterY = (img.naturalHeight - largeCenterSize) / 2
        ctx.drawImage(logo, largeCenterX, largeCenterY, largeCenterSize, largeCenterSize)

        ctx.globalAlpha = 1.0
        console.log("[v0] WatermarkedImage: Watermarks applied successfully")
        setIsLoading(false)
        onLoad?.()
      }

      logo.onerror = () => {
        console.error("[v0] WatermarkedImage: Failed to load logo from /images/n3u360-logo.png")
        // If logo fails to load, just show the image without watermark
        setIsLoading(false)
        onLoad?.()
      }

      logo.src = "/images/n3u360-logo.png"
    }

    img.onerror = () => {
      setError(true)
      setIsLoading(false)
    }

    img.src = src

    // Prevent right-click and drag
    const preventContextMenu = (e: Event) => {
      e.preventDefault()
      return false
    }

    const preventDrag = (e: Event) => {
      e.preventDefault()
      return false
    }

    canvas.addEventListener("contextmenu", preventContextMenu)
    canvas.addEventListener("dragstart", preventDrag)
    canvas.addEventListener("selectstart", preventDrag)

    return () => {
      canvas.removeEventListener("contextmenu", preventContextMenu)
      canvas.removeEventListener("dragstart", preventDrag)
      canvas.removeEventListener("selectstart", preventDrag)
    }
  }, [src, onLoad, imageType])

  if (error) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`} style={style}>
        <span className="text-muted-foreground">Failed to load image</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${fill ? "object-cover" : "object-contain"}`}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          WebkitUserDrag: "none",
          WebkitTouchCallout: "none",
          pointerEvents: "none",
        }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  )
}
