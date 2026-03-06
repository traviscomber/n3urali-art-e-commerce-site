'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ImageOptimizer } from '@/lib/image-optimization'
import { ImageUrlHandler } from '@/lib/image-url-handler'

interface OptimizedImageProps {
  imageId: string
  src: string
  alt: string
  width?: number
  height?: number
  quality?: number
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
  className?: string
  containerClassName?: string
}

/**
 * High-performance image component with lazy loading, WebP support,
 * LQIP placeholders, and responsive variants for delivering large format content
 */
export function OptimizedImage({
  imageId,
  src,
  alt,
  width = 800,
  height = 600,
  quality = 80,
  priority = false,
  onLoad,
  onError,
  className = '',
  containerClassName = '',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isWebPSupported, setIsWebPSupported] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)
  const [loadingStrategy, setLoadingStrategy] = useState<'eager' | 'lazy'>('lazy')

  // Detect WebP support
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    try {
      const webpData = canvas.toDataURL('image/webp')
      setIsWebPSupported(webpData.includes('image/webp'))
    } catch {
      setIsWebPSupported(false)
    }
  }, [])

  // Set loading strategy based on network
  useEffect(() => {
    const strategy = ImageOptimizer.getLoadingStrategy()
    setLoadingStrategy(strategy)
  }, [])

  // Generate responsive image data
  const { webpSrcSet, jpegSrcSet, lqip } = ImageOptimizer.generatePictureElement(
    imageId,
    alt,
    width,
    height,
    !priority,
  )

  const responsiveSizes = ImageOptimizer.getResponsiveSizes()
  const displayUrl = ImageUrlHandler.convertToDisplayUrl(src)

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    console.error(`[v0] Failed to load image: ${imageId}`)
    onError?.()
  }, [imageId, onError])

  return (
    <div className={`relative overflow-hidden bg-slate-900 ${containerClassName}`}>
      {/* LQIP Background Placeholder */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-md"
          style={{
            backgroundImage: `url('${lqip}')`,
            opacity: 0.5,
          }}
        />
      )}

      {/* WebP Picture Element with JPEG Fallback */}
      <picture>
        {/* WebP source for modern browsers */}
        <source
          srcSet={webpSrcSet}
          sizes={responsiveSizes}
          type="image/webp"
        />
        {/* JPEG fallback */}
        <source
          srcSet={jpegSrcSet}
          sizes={responsiveSizes}
          type="image/jpeg"
        />
        {/* Fallback image */}
        <img
          ref={imgRef}
          src={displayUrl}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loadingStrategy}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          data-image-id={imageId}
        />
      </picture>

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/30 backdrop-blur-sm">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

/**
 * Gallery image variant - optimized for thumbnail display
 */
export function GalleryImage({
  imageId,
  src,
  alt,
  className = '',
  onLoad,
}: Omit<OptimizedImageProps, 'width' | 'height'>) {
  return (
    <OptimizedImage
      imageId={imageId}
      src={src}
      alt={alt}
      width={400}
      height={300}
      quality={70}
      className={`rounded-lg hover:opacity-80 transition-opacity ${className}`}
      containerClassName="aspect-video"
      onLoad={onLoad}
    />
  )
}

/**
 * Full-screen panorama viewer image - high quality, priority loading
 */
export function PanoramaImage({
  imageId,
  src,
  alt,
  className = '',
}: Omit<OptimizedImageProps, 'width' | 'height' | 'priority'>) {
  return (
    <OptimizedImage
      imageId={imageId}
      src={src}
      alt={alt}
      width={8192}
      height={6144}
      quality={90}
      priority={true}
      className={className}
      containerClassName="w-full h-full"
    />
  )
}

/**
 * Product detail image - high quality with larger dimensions
 */
export function ProductImage({
  imageId,
  src,
  alt,
  className = '',
}: Omit<OptimizedImageProps, 'width' | 'height' | 'priority'>) {
  return (
    <OptimizedImage
      imageId={imageId}
      src={src}
      alt={alt}
      width={2048}
      height={1536}
      quality={85}
      priority={false}
      className={`rounded-xl ${className}`}
      containerClassName="aspect-square"
    />
  )
}
