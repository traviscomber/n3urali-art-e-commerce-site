"use client"

import { useState, useEffect } from "react"
import { Search, Grid3X3, List, Eye, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PanoramaViewer } from "@/components/panorama-viewer"
import { getImages } from "@/app/actions/admin-actions"
import Image from "next/image"

interface EquirectangularImage {
  id: string
  title: string
  description: string
  price: number
  image_url: string
  thumbnail_url: string
  category_name: string
  active: boolean
  featured: boolean
}

export default function EquirectangularCategoryPage() {
  const [images, setImages] = useState<EquirectangularImage[]>([])
  const [filteredImages, setFilteredImages] = useState<EquirectangularImage[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [viewingPanorama, setViewingPanorama] = useState<EquirectangularImage | null>(null)
  const [loadingImage, setLoadingImage] = useState<string | null>(null)
  const [showWatermarkedImage, setShowWatermarkedImage] = useState<EquirectangularImage | null>(null)

  useEffect(() => {
    const fetchImages = async () => {
      const result = await getImages()
      if (result.success && result.data) {
        // Filter for equirectangular images (360° or similar categories)
        const equirectangularImages = result.data.filter(
          (img: EquirectangularImage) =>
            img.category_name?.toLowerCase().includes("equirectangular") ||
            img.category_name?.toLowerCase().includes("360") ||
            img.category_name?.toLowerCase().includes("panoramic"),
        )
        setImages(equirectangularImages)
        setFilteredImages(equirectangularImages)
      }
    }
    fetchImages()
  }, [])

  useEffect(() => {
    const filtered = images.filter(
      (image) =>
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.category_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Sort images
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        // Keep original order for 'newest'
        break
    }

    setFilteredImages(filtered)
  }, [searchTerm, sortBy, images])

  const handleImageClick = async (image: EquirectangularImage) => {
    setLoadingImage(image.id)

    // Simulate loading time (1-3 seconds)
    const loadingTime = Math.random() * 2000 + 1000

    setTimeout(() => {
      setLoadingImage(null)
      setShowWatermarkedImage(image)
    }, loadingTime)
  }

  const closeWatermarkedView = () => {
    setShowWatermarkedImage(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,119,6,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
              360° Panoramic Gallery
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Equirectangular Images
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore our collection of immersive 360-degree panoramic images. Perfect for VR environments, projection
              mapping, and architectural visualization.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {["360° Preview", "High Resolution", "VR Compatible", "Professional Quality"].map((feature) => (
                <Badge key={feature} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search equirectangular images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 backdrop-blur-sm border-primary/20"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-background/50 backdrop-blur-sm border-primary/20">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="bg-primary/10 hover:bg-primary/20 border-primary/20"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="bg-primary/10 hover:bg-primary/20 border-primary/20"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredImages.length} of {images.length} equirectangular images
          </p>
        </div>

        <div
          className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"}`}
        >
          {filteredImages.map((image) => (
            <Card
              key={image.id}
              className="group overflow-hidden bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
              onClick={() => handleImageClick(image)}
            >
              <div className="relative aspect-[2/1] overflow-hidden">
                <Image
                  src={image.thumbnail_url || image.image_url || "/placeholder.svg"}
                  alt={image.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-primary text-primary-foreground text-xs">360°</Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-background/80 text-foreground text-xs">
                    ${image.price}
                  </Badge>
                </div>
                {loadingImage === image.id ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="sm" variant="secondary" className="bg-background/90 hover:bg-background">
                      <Eye className="h-4 w-4 mr-2" />
                      View Image
                    </Button>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                    {image.title}
                  </h3>
                  <div className="text-xs text-muted-foreground">{image.category_name}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-muted-foreground text-lg mb-4">
              No equirectangular images found matching your search.
            </div>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="border-primary/20 hover:bg-primary/10"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {/* Updated watermarked image modal with simplified single background watermark */}
      {showWatermarkedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            <Button
              onClick={closeWatermarkedView}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Image
                src={showWatermarkedImage.image_url || "/placeholder.svg"}
                alt={showWatermarkedImage.title}
                width={1200}
                height={600}
                className="max-w-full max-h-[80vh] object-contain"
              />

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-15">
                  {Array.from({ length: 12 }).map((_, row) => (
                    <div
                      key={row}
                      className="flex whitespace-nowrap"
                      style={{
                        transform: `translateY(${row * 80}px) rotate(-45deg) translateX(-50%)`,
                        transformOrigin: "center",
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

              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded z-10">
                <h3 className="font-medium">{showWatermarkedImage.title}</h3>
                <p className="text-sm opacity-80">${showWatermarkedImage.price}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panorama Viewer */}
      {viewingPanorama && (
        <PanoramaViewer
          imageUrl={viewingPanorama.image_url}
          title={viewingPanorama.title}
          onClose={() => setViewingPanorama(null)}
        />
      )}
    </div>
  )
}
