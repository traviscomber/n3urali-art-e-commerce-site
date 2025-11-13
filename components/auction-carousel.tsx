"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, TrendingDown, Zap } from "lucide-react"

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
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 })

  const calculateDynamicPrice = (basePrice: number) => {
    const now = new Date()
    const minutesInHour = now.getMinutes()
    const secondsInMinute = now.getSeconds()
    const totalSeconds = minutesInHour * 60 + secondsInMinute

    const priceMultiplier = 1.5 - totalSeconds / 3600

    return basePrice * priceMultiplier
  }

  const calculateTimeLeft = () => {
    const now = new Date()
    const minutesLeft = 59 - now.getMinutes()
    const secondsLeft = 59 - now.getSeconds()
    return { minutes: minutesLeft, seconds: secondsLeft }
  }

  const getDiscountPercentage = (currentPrice: number, basePrice: number) => {
    return Math.round(((basePrice - currentPrice) / basePrice) * 100)
  }

  const isHotDeal = (currentPrice: number, basePrice: number) => {
    return getDiscountPercentage(currentPrice, basePrice) > 30
  }

  useEffect(() => {
    const updatePrices = () => {
      const newPrices: Record<string, number> = {}
      images.forEach((image) => {
        newPrices[image.id] = calculateDynamicPrice(image.price)
      })
      setCurrentPrices(newPrices)
      setTimeLeft(calculateTimeLeft())
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

    // Navigate to photo detail page with auction price parameters
    router.push(`/photo/${image.id}?auctionPrice=${capturedPrice.toFixed(2)}&auctionTimestamp=${capturedTimestamp}`)
  }

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="flex gap-6 animate-infinite-scroll-reverse hover:pause-animation">
        {images.map((image) => {
          const currentPrice = currentPrices[image.id] || image.price
          const discount = getDiscountPercentage(currentPrice, image.price)
          const hotDeal = isHotDeal(currentPrice, image.price)

          return (
            <div
              key={`first-${image.id}`}
              className="group flex-shrink-0 w-80 relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
              onClick={(e) => handleAuctionClick(image, e)}
            >
              {hotDeal && (
                <div className="absolute top-3 left-3 z-20">
                  <Badge className="bg-red-500 text-white animate-pulse flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    HOT DEAL
                  </Badge>
                </div>
              )}

              <div className="absolute top-3 right-3 z-20">
                <Badge className="bg-green-500 text-white flex items-center gap-1 text-base px-3 py-1">
                  <TrendingDown className="w-4 h-4" />
                  {discount}% OFF
                </Badge>
              </div>

              <div className="block h-52 relative">
                <Image
                  src={image.upscaled_url || image.original_url || image.file_path || "/placeholder.svg"}
                  alt={image.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="320px"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 text-white space-y-2">
                <h3 className="font-semibold text-sm line-clamp-2">{image.title}</h3>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    {image.image_format}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-white/80">
                    <Clock className="w-3 h-3" />
                    <span>
                      {timeLeft.minutes}:{timeLeft.seconds.toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={(e) => handleAuctionClick(image, e)}
                  className={`w-full ${hotDeal ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-primary hover:bg-primary/90"}`}
                >
                  {hotDeal ? "GRAB NOW!" : "View Deal"}
                </Button>
              </div>
            </div>
          )
        })}

        {images.map((image) => {
          const currentPrice = currentPrices[image.id] || image.price
          const discount = getDiscountPercentage(currentPrice, image.price)
          const hotDeal = isHotDeal(currentPrice, image.price)

          return (
            <div
              key={`second-${image.id}`}
              className="group flex-shrink-0 w-80 relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
              onClick={(e) => handleAuctionClick(image, e)}
            >
              {hotDeal && (
                <div className="absolute top-3 left-3 z-20">
                  <Badge className="bg-red-500 text-white animate-pulse flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    HOT DEAL
                  </Badge>
                </div>
              )}

              <div className="absolute top-3 right-3 z-20">
                <Badge className="bg-green-500 text-white flex items-center gap-1 text-base px-3 py-1">
                  <TrendingDown className="w-4 h-4" />
                  {discount}% OFF
                </Badge>
              </div>

              <div className="block h-52 relative">
                <Image
                  src={image.upscaled_url || image.original_url || image.file_path || "/placeholder.svg"}
                  alt={image.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="320px"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 text-white space-y-2">
                <h3 className="font-semibold text-sm line-clamp-2">{image.title}</h3>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    {image.image_format}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-white/80">
                    <Clock className="w-3 h-3" />
                    <span>
                      {timeLeft.minutes}:{timeLeft.seconds.toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={(e) => handleAuctionClick(image, e)}
                  className={`w-full ${hotDeal ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-primary hover:bg-primary/90"}`}
                >
                  {hotDeal ? "GRAB NOW!" : "View Deal"}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
