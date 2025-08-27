"use client"

import { useState, useEffect } from "react"
import { Search, Grid3X3, List, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PanoramaViewer } from "@/components/panorama-viewer"
import Image from "next/image"

interface EquirectangularImage {
  id: string
  title: string
  description: string
  price: number
  previewUrl: string
  fullUrl: string
  dimensions: string
  fileSize: string
  tags: string[]
  resolution: string
}

const sampleEquirectangularImages: EquirectangularImage[] = [
  {
    id: "1",
    title: "Mountain Panorama 360° Sunrise",
    description:
      "Breathtaking 360-degree mountain sunrise panorama perfect for VR environments and immersive installations.",
    price: 149.99,
    previewUrl: "/mountain-panorama-360-sunrise.png",
    fullUrl: "/mountain-panorama-360-sunrise.png",
    dimensions: "8192x4096",
    fileSize: "24.5 MB",
    tags: ["nature", "mountains", "sunrise", "outdoor"],
    resolution: "8K",
  },
  {
    id: "2",
    title: "Modern Office Space 360°",
    description: "Contemporary office environment captured in full 360-degree detail for architectural visualization.",
    price: 199.99,
    previewUrl: "/office-space-360-modern.png",
    fullUrl: "/office-space-360-modern.png",
    dimensions: "7680x3840",
    fileSize: "18.2 MB",
    tags: ["interior", "office", "modern", "business"],
    resolution: "7.5K",
  },
  {
    id: "3",
    title: "Tropical Beach Sunset 360°",
    description: "Stunning tropical beach sunset in full equirectangular format for immersive experiences.",
    price: 179.99,
    previewUrl: "/beach-sunset-360-tropical.png",
    fullUrl: "/beach-sunset-360-tropical.png",
    dimensions: "8192x4096",
    fileSize: "22.8 MB",
    tags: ["beach", "sunset", "tropical", "ocean"],
    resolution: "8K",
  },
  {
    id: "4",
    title: "Art Museum Gallery 360°",
    description: "Complete 360-degree view of a contemporary art museum gallery space.",
    price: 229.99,
    previewUrl: "/museum-gallery-360-art.png",
    fullUrl: "/museum-gallery-360-art.png",
    dimensions: "8192x4096",
    fileSize: "26.1 MB",
    tags: ["museum", "art", "interior", "culture"],
    resolution: "8K",
  },
  {
    id: "5",
    title: "City Rooftop Night 360°",
    description: "Urban nightscape captured from a rooftop perspective in full 360-degree panoramic view.",
    price: 189.99,
    previewUrl: "/city-rooftop-360-night.png",
    fullUrl: "/city-rooftop-360-night.png",
    dimensions: "7680x3840",
    fileSize: "20.4 MB",
    tags: ["city", "night", "urban", "lights"],
    resolution: "7.5K",
  },
]

export default function EquirectangularCategoryPage() {
  const [images, setImages] = useState<EquirectangularImage[]>(sampleEquirectangularImages)
  const [filteredImages, setFilteredImages] = useState<EquirectangularImage[]>(sampleEquirectangularImages)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [viewingPanorama, setViewingPanorama] = useState<EquirectangularImage | null>(null)

  useEffect(() => {
    const filtered = images.filter(
      (image) =>
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
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
      case "resolution":
        filtered.sort((a, b) => a.resolution.localeCompare(b.resolution))
        break
      default:
        // Keep original order for 'newest'
        break
    }

    setFilteredImages(filtered)
  }, [searchTerm, sortBy, images])

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
                <SelectItem value="resolution">Resolution</SelectItem>
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

        {/* Results Count */}
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
              onClick={() => setViewingPanorama(image)}
            >
              <div className="relative aspect-[2/1] overflow-hidden">
                <Image
                  src={image.previewUrl || "/placeholder.svg"}
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
                    {image.resolution}
                  </Badge>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button size="sm" variant="secondary" className="bg-background/90 hover:bg-background">
                    <Eye className="h-4 w-4 mr-2" />
                    View 360°
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                    {image.title}
                  </h3>
                  <div className="text-xs text-muted-foreground">{image.dimensions}</div>
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

      {/* Panorama Viewer */}
      {viewingPanorama && (
        <PanoramaViewer
          imageUrl={viewingPanorama.fullUrl}
          title={viewingPanorama.title}
          onClose={() => setViewingPanorama(null)}
        />
      )}
    </div>
  )
}
