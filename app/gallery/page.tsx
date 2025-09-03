"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Eye, ChevronLeft, ChevronRight } from "lucide-react"
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
  const [images, setImages] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

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

  const handleImageSelect = async (image: Image) => {
    console.log("[v0] Image preview clicked:", image.title)
    setSelectedImage(image)
    setIsPreviewOpen(true)
    setIsLoading(true)
    setImageLoaded(false)

    const loadingTime = Math.random() * 2000 + 1000
    setTimeout(() => {
      setIsLoading(false)
    }, loadingTime)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const closePreview = () => {
    setIsPreviewOpen(false)
    setSelectedImage(null)
    setIsLoading(false)
    setImageLoaded(false)
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
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <Button
            size="sm"
            variant="secondary"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white text-gray-900 shadow-lg"
            onClick={() => handleImageSelect(image)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
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
              Discover our curated collection of high-resolution equirectangular and fisheye images, perfect for VR
              experiences, projection mapping, and architectural visualization.
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
              <p className="text-gray-600 mt-1">Browse all available images</p>
            </div>

            {transformedImages.length > 0 ? (
              <div className="grid grid-cols-5 lg:grid-cols-10 gap-3">
                {transformedImages.map((image) => (
                  <div
                    key={image.id}
                    className="group relative cursor-pointer"
                    onClick={() => handleImageSelect(image)}
                  >
                    {/* Clean thumbnail without frame */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={image.preview_url || "/placeholder.svg"}
                        alt={image.title}
                        className="w-full h-full object-contain bg-muted/10 transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Hover overlay with image data */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/80 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="text-center text-white p-2 space-y-1">
                          <h3 className="font-semibold text-sm truncate">{image.title}</h3>
                          <p className="text-xs text-gray-300">
                            {image.category === "equirectangular" ? "360°" : "Fisheye"}
                          </p>
                          <p className="text-sm font-bold text-emerald-400">${image.price}</p>
                        </div>
                      </div>

                      {/* Small indicator for featured images */}
                      <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full opacity-60" />
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

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={closePreview}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
          <div className="relative w-full bg-gradient-to-br from-background via-background to-muted/20 border-2 border-border/50 shadow-2xl rounded-lg overflow-hidden">
            <DialogHeader className="relative px-6 py-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {selectedImage?.title}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground font-medium">Preview • Watermarked • Max 720px</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closePreview}
                  className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DialogHeader>

            <div className="p-4">
              <div className="relative w-full min-h-[300px] flex items-center justify-center">
                <div className="relative rounded-lg overflow-hidden shadow-2xl border border-border/30 w-full max-w-[580px]">
                  <img
                    src={selectedImage?.preview_url || "/placeholder.svg"}
                    alt={selectedImage?.title || "Image preview"}
                    className="w-full h-auto max-h-[400px] object-contain select-none pointer-events-none block"
                    onLoad={handleImageLoad}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                    style={{
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      MozUserSelect: "none",
                      msUserSelect: "none",
                    }}
                  />
                  {imageLoaded && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute inset-0 opacity-15">
                        {Array.from({ length: 12 }).map((_, row) => (
                          <div
                            key={row}
                            className="flex whitespace-nowrap absolute"
                            style={{
                              top: `${row * 60}px`,
                              left: "50%",
                              transform: `translateX(-50%) rotate(-45deg)`,
                              transformOrigin: "center",
                              width: "200%",
                            }}
                          >
                            {Array.from({ length: 20 }).map((_, col) => (
                              <span
                                key={col}
                                className="text-white font-bold text-2xl mx-8 drop-shadow-lg"
                                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                              >
                                N3URALI.ART
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className="absolute inset-0 bg-transparent cursor-default"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>

              {selectedImage && !isLoading && (
                <div className="mt-4 p-4 bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 rounded-xl border border-border/20">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">Description</h4>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {selectedImage?.description || "No description available"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border/20">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-medium">
                          {selectedImage?.category === "equirectangular" ? "360°" : "Fisheye"}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        <span className="text-muted-foreground">Price:</span>{" "}
                        <span className="text-primary">${selectedImage?.price || 0}</span>
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        <span className="text-muted-foreground">Size:</span>{" "}
                        {((selectedImage?.file_size || 0) / 1024 / 1024).toFixed(1)} MB
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
