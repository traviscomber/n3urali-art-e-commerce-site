"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const calculateDynamicPrice = (basePrice: number) => {
    const now = new Date()
    const minutesInHour = now.getMinutes()
    const secondsInMinute = now.getSeconds()
    const totalSeconds = minutesInHour * 60 + secondsInMinute

    const priceMultiplier = 1.5 - totalSeconds / 3600

    return basePrice * priceMultiplier
  }

  useEffect(() => {
    const updatePrices = () => {
      const newPrices: Record<string, number> = {}
      images.forEach((image) => {
        newPrices[image.id] = calculateDynamicPrice(image.price)
      })
      setCurrentPrices(newPrices)
    }

    updatePrices()
    const interval = setInterval(updatePrices, 1000)

    return () => clearInterval(interval)
  }, [images])

  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setIsTransitioning(true)

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
        setIsTransitioning(false)
      }, 300) // Fade out duration
    }, 3000) // Change image every 3 seconds

    return () => clearInterval(rotationInterval)
  }, [images.length])

  const handleAuctionClick = (image: AuctionImage, e: React.MouseEvent) => {
    e.preventDefault()
    const capturedPrice = currentPrices[image.id] || image.price
    const capturedTimestamp = new Date().toISOString()

    console.log("[v0] Auction clicked - navigating to photo page:", {
      imageId: image.id,
      capturedPrice,
      capturedTimestamp,
    })

    router.push(`/photo/${image.id}?auctionPrice=${capturedPrice.toFixed(2)}&auctionTimestamp=${capturedTimestamp}`)
  }

  if (!images || images.length === 0) {
    return null
  }

  const currentImage = images[currentIndex]

  return (
    <div className="relative max-w-7xl mx-auto px-4">
      <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
        {/* Current Image */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 cursor-pointer ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
          onClick={(e) => handleAuctionClick(currentImage, e)}
        >
          <Image
            src={currentImage.upscaled_url || currentImage.original_url || currentImage.file_path || "/placeholder.svg"}
            alt={currentImage.title}
            fill
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
            priority
          />

          {/* Subtle overlay gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {/* Progress indicator dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true)
                setTimeout(() => {
                  setCurrentIndex(index)
                  setIsTransitioning(false)
                }, 300)
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-12 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>

        {/* Glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 rounded-3xl blur-3xl -z-10 animate-pulse" />
      </div>
    </div>
  )
}
