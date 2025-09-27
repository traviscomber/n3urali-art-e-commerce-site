"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Grid3X3, List, Eye, Download } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import NextImage from "next/image"
import { ImageUrlHandler } from "@/lib/image-url-handler"
import { LicenseSelector } from "@/components/license-selector"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

interface ImageGalleryProps {
  images?: GalleryImage[]
  onImageSelect?: (image: GalleryImage) => void
}

export function ImageGallery({ images = [], onImageSelect }: ImageGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>(images)
  const [selectedImageForLicense, setSelectedImageForLicense] = useState<GalleryImage | null>(null)
  const { addItem } = useCart()

  const transformedImages = useMemo(() => {
    return images.map((image) => ({
      ...image,
      preview_url: ImageUrlHandler.convertToDisplayUrl(image.preview_url, { useProxy: true }),
    }))
  }, [images])

  useEffect(() => {
    let filtered = transformedImages

    if (searchTerm) {
      filtered = filtered.filter(
        (image) =>
          image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          image.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((image) => image.category === categoryFilter)
    }

    setFilteredImages(filtered)
  }, [transformedImages, searchTerm, categoryFilter])

  const handleAddToCart = (image: GalleryImage) => {
    setSelectedImageForLicense(image)
  }

  const handleLicenseSelect = (license: any, totalPrice: number) => {
    if (!selectedImageForLicense) return

    addItem({
      id: `${selectedImageForLicense.id}-${license.id}`,
      imageId: selectedImageForLicense.id,
      title: selectedImageForLicense.title,
      price: totalPrice,
      licenseId: license.id,
      licenseName: license.name,
      licensePrice: license.price,
      previewUrl: selectedImageForLicense.preview_url,
      category: selectedImageForLicense.category,
      quantity: 1,
    })

    setSelectedImageForLicense(null)
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card/30 backdrop-blur-sm p-6 rounded-xl border border-border/20">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-all duration-300"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-background/50 border-border/50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="equirectangular">360° Images</SelectItem>
              <SelectItem value="fisheye">Fisheye</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="transition-all duration-300"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="transition-all duration-300"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredImages.length} {filteredImages.length === 1 ? "image" : "images"} found
        </p>
      </div>

      {/* Image Grid */}
      <div
        className={`grid gap-6 ${
          viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        }`}
      >
        {filteredImages.map((image, index) => (
          <Card
            key={image.id}
            className="group overflow-hidden hover:glow-accent transition-all duration-500 animate-float bg-card/50 backdrop-blur-sm border-border/20"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-0">
              <div className="relative aspect-square overflow-hidden">
                <NextImage
                  src={image.preview_url || "/placeholder.svg"}
                  alt={image.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category Badge */}
                <Badge variant="secondary" className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm">
                  {image.category === "equirectangular" ? "360°" : "Fisheye"}
                </Badge>

                {/* Action Buttons */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onImageSelect?.(image)}
                    className="bg-background/80 backdrop-blur-sm hover:bg-background"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(image)}
                    className="bg-primary/90 backdrop-blur-sm hover:bg-primary glow-primary"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="font-semibold text-lg text-balance group-hover:text-primary transition-colors">
                  {image.title}
                </h3>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{image.dimensions}</span>
                  <span>{(image.file_size / 1024 / 1024).toFixed(1)} MB</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-bold text-primary">${image.price}</span>
                  <Button size="sm" onClick={() => handleAddToCart(image)} className="glow-primary">
                    Add to Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No images found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* License Selection Dialog */}
      <Dialog open={!!selectedImageForLicense} onOpenChange={(open) => !open && setSelectedImageForLicense(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose License</DialogTitle>
          </DialogHeader>
          {selectedImageForLicense && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold">{selectedImageForLicense.title}</h3>
                <p className="text-sm text-muted-foreground">Base price: ${selectedImageForLicense.price}</p>
              </div>

              <LicenseSelector basePrice={selectedImageForLicense.price} onLicenseSelect={handleLicenseSelect} />

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedImageForLicense(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
