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

  return (
    <div className="relative">
      <div className="flex gap-6 animate-infinite-scroll-reverse hover:pause-animation">
        {images.map((image) => (
          <div
            key={`first-${image.id}`}
            className="group flex-shrink-0 w-80 h-52 relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
            onClick={(e) => handleAuctionClick(image, e)}
          >
            <Image
              src={image.upscaled_url || image.original_url || image.file_path || "/placeholder.svg"}
              alt={image.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="320px"
            />
          </div>
        ))}

        {images.map((image) => (
          <div
            key={`second-${image.id}`}
            className="group flex-shrink-0 w-80 h-52 relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
            onClick={(e) => handleAuctionClick(image, e)}
          >
            <Image
              src={image.upscaled_url || image.original_url || image.file_path || "/placeholder.svg"}
              alt={image.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="320px"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
