"use client"

import { useState, useEffect } from "react"
import { ImageGallery } from "@/components/image-gallery"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
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
    dimensions: "4096x4096", // Default dimensions
    file_size: 20000000, // Default file size
    description: image.description || "",
  }))

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
      <section className="py-16">
        <div className="container mx-auto px-4">
          {transformedImages.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2">No images available</h3>
              <p className="text-muted-foreground">Upload some images in the admin panel to see them here</p>
            </div>
          ) : (
            <ImageGallery images={transformedImages} onImageSelect={handleImageSelect} />
          )}
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
