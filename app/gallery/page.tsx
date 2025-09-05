"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { getImages } from "@/app/actions/admin-actions"
import NextImage from "next/image"
import React from "react"

interface GalleryImage {
  id: string
  title: string
  category: "equirectangular" | "fisheye"
  price: number
  preview_url: string
  dimensions: string
  file_size: number
  description?: string
}

const ImageCard = React.memo(
  ({
    image,
    size = "normal",
    onImageSelect,
  }: {
    image: GalleryImage
    size?: "normal" | "large"
    onImageSelect: (image: GalleryImage) => void
  }) => (
    <div
      className={`group relative bg-card rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-border overflow-hidden cursor-pointer ${size === "large" ? "min-w-[280px] max-w-[280px]" : "min-w-[250px] max-w-[250px]"}`}
      onClick={() => onImageSelect(image)}
    >
      <div
        className={`relative ${size === "large" ? "aspect-video h-[157px]" : "aspect-video h-[140px]"} overflow-hidden`}
      >
        <NextImage
          src={image.preview_url || "/placeholder.svg"}
          alt={image.title}
          fill
          className="object-contain bg-muted/20 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg w-full">
              View Photo
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground truncate text-sm">{image.title}</h3>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {image.category === "equirectangular" ? "360°" : "Fisheye"}
          </Badge>
          <span className="text-sm font-bold text-emerald-500">${image.price}</span>
        </div>
      </div>
    </div>
  ),
)

ImageCard.displayName = "ImageCard"

export default function GalleryPage() {
  const router = useRouter()
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true)
      const result = await getImages()
      const fetchedImages = result.success ? result.data : []
      setImages(fetchedImages)
      setLoading(false)
    }
    fetchImages()
  }, [])

  const transformedImages = useMemo(
    () =>
      images.map((image: any) => ({
        id: image.id,
        title: image.title,
        category:
          image.category_name?.toLowerCase() === "fisheye" ? ("fisheye" as const) : ("equirectangular" as const),
        price: Number.parseFloat(image.price) || 0,
        preview_url:
          image.category_name?.toLowerCase() === "fisheye"
            ? image.thumbnail_url || "/placeholder.svg"
            : image.thumbnail_url || image.image_url,
        dimensions: "4096x4096",
        file_size: 20000000,
        description: image.description || "",
      })),
    [images],
  )

  const equirectangularImages = useMemo(
    () => transformedImages.filter((img) => img.category === "equirectangular"),
    [transformedImages],
  )

  const fisheyeImages = useMemo(
    () => transformedImages.filter((img) => img.category === "fisheye"),
    [transformedImages],
  )

  const handleImageSelect = useCallback(
    async (image: GalleryImage) => {
      console.log("[v0] Image clicked, redirecting to photo:", image.title, "ID:", image.id)
      router.push(`/photo/${image.id}`)
    },
    [router],
  )

  const scrollSection = useCallback((direction: "left" | "right", sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      const scrollAmount = 320
      section.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-b from-muted/30 to-background">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Badge variant="secondary" className="animate-pulse-glow">
                Professional Collection
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
                Immersive
                <span className="text-primary block">Image Gallery</span>
              </h1>

              <p className="text-xl text-muted-foreground text-pretty">
                Discover our curated collection of high-resolution equirectangular and fisheye images. Click any image
                to view details and purchase directly.
              </p>
            </div>
          </div>
        </section>

        {/* Loading Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading gallery images...</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
        {/* Animated Background Effects */}
        <div className="absolute inset-0">
          {/* Animated gradient layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse" />
          <div
            className="absolute inset-0 bg-gradient-to-tl from-accent/5 via-transparent to-primary/5 opacity-50"
            style={{
              animation: "pulse 4s ease-in-out infinite alternate",
            }}
          />

          {/* Floating animated circles - replaced bounce with gentle pulse and rotation */}
          <div
            className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <div
            className="absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full"
            style={{
              animation: "pulse 3s ease-in-out infinite, spin 20s linear infinite",
            }}
          />
          <div
            className="absolute bottom-20 left-1/4 w-20 h-20 bg-accent/10 rounded-full animate-ping"
            style={{ animationDuration: "4s" }}
          />
          <div
            className="absolute bottom-40 right-1/3 w-16 h-16 bg-primary/15 rounded-full animate-pulse"
            style={{ animationDuration: "6s" }}
          />

          {/* Pulsing orbs */}
          <div
            className="absolute top-1/3 left-1/2 w-40 h-40 bg-gradient-radial from-primary/10 to-transparent rounded-full animate-pulse"
            style={{ animationDuration: "5s" }}
          />
          <div
            className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-gradient-radial from-secondary/10 to-transparent rounded-full"
            style={{
              animation: "pulse 7s ease-in-out infinite alternate",
            }}
          />
        </div>

        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="animate-pulse-glow">
              Professional Collection
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
              Immersive
              <span className="text-primary block">Image Gallery</span>
            </h1>

            <p className="text-xl text-muted-foreground text-pretty">
              Discover our curated collection of high-resolution equirectangular and fisheye images. Click any image to
              view details and purchase directly.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 space-y-16">
        <div className="container mx-auto px-4">
          {/* 360° Images Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">360° Images</h2>
                <p className="text-muted-foreground mt-1">Equirectangular panoramic photography</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollSection("left", "equirectangular-scroll")}
                  className="h-10 w-10 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollSection("right", "equirectangular-scroll")}
                  className="h-10 w-10 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div
              id="equirectangular-scroll"
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {equirectangularImages.length > 0 ? (
                equirectangularImages
                  .slice(0, 6)
                  .map((image) => (
                    <ImageCard key={image.id} image={image} size="large" onImageSelect={handleImageSelect} />
                  ))
              ) : (
                <div className="text-center py-8 w-full">
                  <p className="text-muted-foreground">No 360° images available</p>
                </div>
              )}
            </div>
          </div>

          {/* Fisheye Images Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">180° Images</h2>
                <p className="text-muted-foreground mt-1">Fisheye lens photography</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollSection("left", "fisheye-scroll")}
                  className="h-10 w-10 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollSection("right", "fisheye-scroll")}
                  className="h-10 w-10 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div
              id="fisheye-scroll"
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {fisheyeImages.length > 0 ? (
                fisheyeImages
                  .slice(0, 6)
                  .map((image) => (
                    <ImageCard key={image.id} image={image} size="large" onImageSelect={handleImageSelect} />
                  ))
              ) : (
                <div className="text-center py-8 w-full">
                  <p className="text-muted-foreground">No fisheye images available</p>
                </div>
              )}
            </div>
          </div>

          {/* Complete Gallery Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">Complete Gallery</h2>
              <p className="text-muted-foreground mt-1">Click any image to view details and purchase</p>
            </div>

            {transformedImages.length > 0 ? (
              <div className="grid grid-cols-5 lg:grid-cols-10 gap-3">
                {transformedImages.map((image) => (
                  <div
                    key={image.id}
                    className="group relative cursor-pointer"
                    onClick={() => handleImageSelect(image)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <NextImage
                        src={image.preview_url || "/placeholder.svg"}
                        alt={image.title}
                        fill
                        className="object-contain bg-muted/10 transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      />

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/80 transition-all duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="text-center text-white p-2 space-y-2">
                          <h3 className="font-semibold text-xs truncate">{image.title}</h3>
                          <p className="text-xs text-gray-300">
                            {image.category === "equirectangular" ? "360°" : "Fisheye"}
                          </p>
                          <p className="text-xs font-bold text-emerald-400">${image.price}</p>
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-2 py-1 h-auto mt-2"
                          >
                            View Photo
                          </Button>
                        </div>
                      </div>

                      <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-60" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-lg font-semibold mb-2 text-foreground">No images available</h3>
                <p className="text-muted-foreground">Upload some images in the admin panel to see them here</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
