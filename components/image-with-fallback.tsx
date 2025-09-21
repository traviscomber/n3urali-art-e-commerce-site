"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageUrlHandler } from "@/lib/image-url-handler"

interface ImageWithFallbackProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackSrc?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
}

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc,
  priority = false,
  fill = false,
  sizes,
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(() => {
    const convertedUrl = ImageUrlHandler.convertToDisplayUrl(src)
    console.log("[v0] ImageWithFallback - Original:", src, "Converted:", convertedUrl)
    return convertedUrl
  })
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    console.log("[v0] Image load error for:", currentSrc)

    if (!hasError && fallbackSrc) {
      console.log("[v0] Trying fallback:", fallbackSrc)
      setCurrentSrc(ImageUrlHandler.convertToDisplayUrl(fallbackSrc))
      setHasError(true)
    } else if (!hasError) {
      console.log("[v0] Using placeholder image")
      setCurrentSrc(`/placeholder.svg?height=${height || 400}&width=${width || 400}&query=image-not-found`)
      setHasError(true)
    }
  }

  const imageProps = {
    src: currentSrc,
    alt,
    className,
    onError: handleError,
    priority,
    crossOrigin: "anonymous" as const,
  }

  if (fill) {
    return <Image {...imageProps} fill sizes={sizes} />
  }

  return <Image {...imageProps} width={width || 400} height={height || 400} />
}

export default ImageWithFallback
