"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Grid, List, Eye, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import { getImages } from "@/app/actions/admin-actions"

interface Image {
  id: string
  title: string
  description: string
  category: "equirectangular" | "fisheye"
  price: number
  previewUrl: string
  dimensions: string
  fileSize: string
  tags: string[]
}

export default function FisheyeCategoryPage() {
  const [images, setImages] = useState<Image[]>([])
  const [filteredImages, setFilteredImages] = useState<Image[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const result = await getImages()
        if (result.success) {
          const fisheyeImages = result.data
            .filter((img: any) => img.category_name?.toLowerCase().includes("fisheye"))
            .map((image: any) => ({
              id: image.id,
              title: image.title,
              description: image.description || "",
              category: "fisheye" as const,
              price: Number.parseFloat(image.price) || 0,
              previewUrl: image.thumbnail_url || image.image_url,
              dimensions: "4096x4096",
              fileSize: "15.0 MB",
              tags: [image.category_name?.toLowerCase() || "fisheye"],
            }))
          setImages(fisheyeImages)
          setFilteredImages(fisheyeImages)
        }
      } catch (error) {
        console.error("Error fetching images:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [])

  useEffect(() => {
    const filtered = images.filter(
      (image) =>
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
    )

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
        break
    }

    setFilteredImages(filtered)
  }, [searchTerm, sortBy, images])

  const handleAddToCart = (image: Image) => {
    addItem({
      id: image.id,
      imageId: image.id,
      title: image.title,
      price: image.price,
      licenseType: "standard",
      previewUrl: image.previewUrl,
      category: image.category,
      quantity: 1,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading fisheye images...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
              Fisheye Collection
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Fisheye Images
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover our curated collection of fisheye images perfect for immersive experiences, projection mapping,
              and creative installations.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {filteredImages.length} Images Available
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                High Resolution
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Commercial License
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search fisheye images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/50 border-border/50 focus:border-primary/50"
            />
          </div>

          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-card/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border border-border/50 rounded-lg bg-card/50">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {filteredImages.map((image) => (
            <Card
              key={image.id}
              className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={image.previewUrl || "/placeholder.svg"}
                  alt={image.title}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-card/90 text-card-foreground border border-border">
                    Fisheye
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-card/90 backdrop-blur-sm text-card-foreground border border-border hover:bg-card"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-card/90 backdrop-blur-sm text-card-foreground border border-border hover:bg-card"
                      onClick={() => handleAddToCart(image)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {image.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{image.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{image.dimensions}</span>
                    <span>{image.fileSize}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {image.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-border/50">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-2xl font-bold text-primary">${image.price}</span>
                    <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => handleAddToCart(image)}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredImages.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No fisheye images found</h3>
            <p className="text-muted-foreground">Upload some fisheye images in the admin panel to see them here</p>
          </div>
        )}
      </div>
    </div>
  )
}
