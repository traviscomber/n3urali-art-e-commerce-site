"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { getImages } from "@/app/actions/admin-actions"

interface Image {
  id: string
  title: string
  category: "equirectangular" | "fisheye"
  price: number
  preview_url: string
  dimensions: string
  file_size: number
  description?: string
}

export default function GalleryPage() {
  const router = useRouter()
  const [images, setImages] = useState<any[]>([])

  useEffect(() => {
    const fetchImages = async () => {
      const result = await getImages()
      const fetchedImages = result.success ? result.data : []
      setImages(fetchedImages)
    }
    fetchImages()
  }, [])

  const transformedImages = images.map((image: any) => ({
    id: image.id,
    title: image.title,
    category: image.category_name?.toLowerCase() === "fisheye" ? ("fisheye" as const) : ("equirectangular" as const),
    price: Number.parseFloat(image.price) || 0,
    preview_url: image.thumbnail_url || image.image_url,
    dimensions: "4096x4096",
    file_size: 20000000,
    description: image.description || "",
  }))

  const equirectangularImages = transformedImages.filter((img) => img.category === "equirectangular")
  const fisheyeImages = transformedImages.filter((img) => img.category === "fisheye")

  const handleImageSelect = async (image: Image, mode: "preview" | "360" = "preview") => {
    console.log("[v0] Image clicked, redirecting to photo details:", image.title, "Mode:", mode)
    if (mode === "360" && image.category === "equirectangular") {
      router.push(`/photo/${image.id}?view=360`)
    } else {
      router.push(`/photo/${image.id}`)
    }
  }

  const scrollSection = (direction: "left" | "right", sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      const scrollAmount = 320
      section.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const ImageCard = ({ image, size = "normal" }: { image: Image; size?: "normal" | "large" }) => (
    <div
      className={`group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden ${size === "large" ? "min-w-[280px]" : "min-w-[250px]"}`}
    >
      <div className={`relative ${size === "large" ? "aspect-[4/3]" : "aspect-video"} overflow-hidden`}>
        <img
          src={image.preview_url || "/placeholder.svg"}
          alt={image.title}
          className="w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/95 hover:bg-white text-gray-900 border border-gray-200 shadow-lg flex-1"
              onClick={(e) => {
                e.stopPropagation()
                handleImageSelect(image, "preview")
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            {image.category === "equirectangular" && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleImageSelect(image, "360")
                }}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                360°
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-900 truncate text-sm">{image.title}</h3>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {image.category === "equirectangular" ? "360°" : "Fisheye"}
          </Badge>
          <span className="text-sm font-bold text-emerald-600">${image.price}</span>
        </div>
      </div>
    </div>
  )

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
                <h2 className="text-3xl font-bold text-gray-900">360° Images</h2>
                <p className="text-gray-600 mt-1">Equirectangular panoramic photography</p>
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
                  .map((image) => <ImageCard key={image.id} image={image} size="large" />)
              ) : (
                <div className="text-center py-8 w-full">
                  <p className="text-gray-500">No 360° images available</p>
                </div>
              )}
            </div>
          </div>

          {/* Fisheye Images Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">180° Images</h2>
                <p className="text-gray-600 mt-1">Fisheye lens photography</p>
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
                fisheyeImages.slice(0, 6).map((image) => <ImageCard key={image.id} image={image} size="large" />)
              ) : (
                <div className="text-center py-8 w-full">
                  <p className="text-gray-500">No fisheye images available</p>
                </div>
              )}
            </div>
          </div>

          {/* Complete Gallery Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Complete Gallery</h2>
              <p className="text-gray-600 mt-1">Click any image to view details and purchase</p>
            </div>

            {transformedImages.length > 0 ? (
              <div className="grid grid-cols-5 lg:grid-cols-10 gap-3">
                {transformedImages.map((image) => (
                  <div key={image.id} className="group relative cursor-pointer">
                    {/* Clean thumbnail without frame */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={image.preview_url || "/placeholder.svg"}
                        alt={image.title}
                        className="w-full h-full object-cover bg-muted/10 transition-transform duration-300 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/80 transition-all duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="text-center text-white p-2 space-y-2">
                          <h3 className="font-semibold text-xs truncate">{image.title}</h3>
                          <p className="text-xs text-gray-300">
                            {image.category === "equirectangular" ? "360°" : "Fisheye"}
                          </p>
                          <p className="text-xs font-bold text-emerald-400">${image.price}</p>

                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-white/95 hover:bg-white text-gray-900 text-xs px-2 py-1 h-auto"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleImageSelect(image, "preview")
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            {image.category === "equirectangular" && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-auto"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleImageSelect(image, "360")
                                }}
                              >
                                <svg
                                  className="h-3 w-3 mr-1"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                                360°
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Small indicator for featured images */}
                      <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-60" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-lg font-semibold mb-2">No images available</h3>
                <p className="text-muted-foreground">Upload some images in the admin panel to see them here</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
