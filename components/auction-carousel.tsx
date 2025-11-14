"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock } from 'lucide-react'

interface AuctionImage {
  id: string
  title: string
  file_path: string
  original_url: string | null
  upscaled_url: string | null
  price: number
  image_format: string
}

interface AuctionCarouselProps {
  images: AuctionImage[]
}

export default function AuctionCarousel({ images }: AuctionCarouselProps) {
  const router = useRouter()
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({})
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const calculateDynamicPrice = (basePrice: number) => {
    const now = new Date()
    const minutesInHour = now.getMinutes()
    const secondsInMinute = now.getSeconds()
    const totalSeconds = minutesInHour * 60 + secondsInMinute

    // Price multiplier: starts at 1.5x and decreases to 1.0x at minute 59
    const priceMultiplier = 1.5 - totalSeconds / 3600

    return basePrice * priceMultiplier
  }

  const calculateSecondsLeft = () => {
    const now = new Date()
    return 59 - now.getSeconds()
  }

  const calculateDiscountPercent = () => {
    const now = new Date()
    const minutesInHour = now.getMinutes()
    
    // Discount increases from 0% to 33% as we approach minute 59
    return Math.floor((minutesInHour / 59) * 33)
  }

  useEffect(() => {
    const updatePrices = () => {
      const newPrices: Record<string, number> = {}
      images.forEach((image) => {
        newPrices[image.id] = calculateDynamicPrice(image.price)
      })
      setCurrentPrices(newPrices)
      setSecondsLeft(calculateSecondsLeft())
    }

    updatePrices()
    const interval = setInterval(updatePrices, 1000)

    return () => clearInterval(interval)
  }, [images])

  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 30000) // Change image every 30 seconds

    return () => clearInterval(interval)
  }, [images.length])

  const handleAuctionClick = (image: AuctionImage, e: React.MouseEvent) => {
    e.preventDefault()
    const capturedPrice = currentPrices[image.id] || image.price
    const capturedTimestamp = new Date().toISOString()

    console.log("[v0] Last-minute auction clicked - navigating to photo page:", {
      imageId: image.id,
      capturedPrice,
      capturedTimestamp,
      secondsLeft,
    })

    router.push(`/photo/${image.id}?auctionPrice=${capturedPrice.toFixed(2)}&auctionTimestamp=${capturedTimestamp}`)
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay imágenes en subasta en este momento
      </div>
    )
  }

  const currentImage = images[currentImageIndex]
  const currentPrice = currentPrices[currentImage?.id] || currentImage?.price || 0
  const discountPercent = calculateDiscountPercent()

  return (
    <div className="relative max-w-7xl mx-auto px-4">
      <div
        className="group relative aspect-[21/9] rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 cursor-pointer"
        onClick={(e) => handleAuctionClick(currentImage, e)}
      >
        <Image
          src={currentImage.upscaled_url || currentImage.original_url || currentImage.file_path || "/placeholder.svg"}
          alt={currentImage.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 1400px) 100vw, 1400px"
          priority
        />

        {/* Clean image by default - only subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Full overlay appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Timer badge - hidden by default, shows on hover */}
        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          <Badge className="bg-[#392A48]/90 text-white hover:bg-[#392A48] text-base px-4 py-2 border border-[#392A48]/50 backdrop-blur-md font-light">
            <Clock className="w-4 h-4 mr-2" />
            {secondsLeft}s restantes
          </Badge>
        </div>

        {/* All info hidden by default, shows elegantly on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 text-sm backdrop-blur-md border-0 font-light">
                  {currentImage.image_format}
                </Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-balance">{currentImage.title}</h2>
            </div>

            <div className="text-right space-y-3">
              <div className="space-y-1">
                <div className="text-6xl font-bold bg-gradient-to-r from-yellow-200 to-orange-400 bg-clip-text text-transparent">
                  ${currentPrice.toFixed(2)}
                </div>
                {discountPercent > 0 && (
                  <div className="text-sm text-yellow-400/90 font-medium">
                    {discountPercent}% de descuento
                  </div>
                )}
              </div>
              <Button 
                size="lg" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-normal"
                onClick={(e) => handleAuctionClick(currentImage, e)}
              >
                Ver Detalles
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation dots for manual control */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex(index)
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "w-8 bg-white/80"
                    : "w-1.5 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Ver imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
