"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Grid, List, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import { getImages } from "@/app/actions/admin-actions"
import NextImage from "next/image"
import React from "react"

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface FisheyeImage {
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

const FisheyeCard = React.memo(
  ({
    image,
    onPreview,
    onAddToCart,
  }: {
    image: FisheyeImage
    onPreview: (image: FisheyeImage) => void
    onAddToCart: (image: FisheyeImage) => void
  }) => (
    <Card className="group overflow-hidden bg-background/70 backdrop-blur-sm border-primary/15 hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <div className="relative w-full min-h-[200px] overflow-hidden cursor-pointer" onClick={() => onPreview(image)}>
        <NextImage
          src={image.previewUrl || "/placeholder.svg"}
          alt={image.title}
          width={400}
          height={400}
          className="w-full h-auto object-contain transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 text-xl font-bold rotate-12 select-none">
            n3uralia.art
          </div>
        </div>

        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/90 text-foreground">
            Fisheye
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2">
            {image.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{image.description}</p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{image.dimensions}</span>
            <span>{image.fileSize}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="font-bold text-primary">${image.price}</span>
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart(image)
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
)

FisheyeCard.displayName = "FisheyeCard"

export default function FisheyeCategoryPage() {
  const [images, setImages] = useState<FisheyeImage[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)
  const [previewImage, setPreviewImage] = useState<FisheyeImage | null>(null)
  const { addItem } = useCart()

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const filteredImages = useMemo(() => {
    const filtered = images.filter(
      (image) =>
        image.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        image.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        image.tags.some((tag) => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase())),
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

    return filtered
  }, [images, debouncedSearchTerm, sortBy])

  useEffect(() => {
    const fetchImages = async () => {
      try {
        console.log("[v0] Fetching images for fisheye category...")
        const result = await getImages()
        if (result.success) {
          console.log("[v0] Total images received:", result.data.length)

          const allActiveImages = result.data
            .filter((img: any) => img.active !== false) // Only filter out inactive images
            .map((image: any) => ({
              id: image.id,
              title: image.title,
              description: image.description || "",
              category: image.category_name?.toLowerCase().includes("fisheye")
                ? ("fisheye" as const)
                : ("equirectangular" as const),
              price: Number.parseFloat(image.price) || 0,
              previewUrl: image.image_url || image.thumbnail_url,
              dimensions: "4096x4096",
              fileSize: "15.0 MB",
              tags: [image.category_name?.toLowerCase() || "image"],
            }))

          console.log("[v0] All active images count:", allActiveImages.length)
          setImages(allActiveImages)
        } else {
          console.error("[v0] Failed to fetch images:", result.error)
        }
      } catch (error) {
        console.error("[v0] Error fetching images:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [])

  const handleAddToCart = useCallback(
    (image: FisheyeImage) => {
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
    },
    [addItem],
  )

  const handlePreview = useCallback((image: FisheyeImage) => {
    setPreviewImage(image)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
              Fisheye Collection
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Fisheye Images
            </h1>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="text-xl text-muted-foreground">Loading fisheye images...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <div className="relative">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
              Fisheye Collection
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Fisheye Images
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our curated collection of fisheye images perfect for immersive experiences, projection mapping,
              and creative installations.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span>{filteredImages.length} Images Available</span>
              <span>High Resolution</span>
              <span>Commercial License</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="bg-background/60 backdrop-blur-sm border border-primary/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search fisheye images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-background/80 border-primary/20 rounded-lg"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-52 h-12 bg-background/80 border-primary/20 rounded-lg">
                  <SelectValue />
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
                size="lg"
                onClick={() => setViewMode("grid")}
                className="h-12 px-4 rounded-lg"
              >
                <Grid className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="lg"
                onClick={() => setViewMode("list")}
                className="h-12 px-4 rounded-lg"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-lg text-muted-foreground font-medium">
            {filteredImages.length} fisheye {filteredImages.length === 1 ? "image" : "images"} available
          </p>
        </div>

        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
        >
          {filteredImages.map((image) => (
            <FisheyeCard key={image.id} image={image} onPreview={handlePreview} onAddToCart={handleAddToCart} />
          ))}
        </div>

        {filteredImages.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-muted-foreground text-lg mb-4">No fisheye images found matching your search.</div>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {previewImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative bg-card rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-primary to-accent p-4 text-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{previewImage.title}</h2>
                  <p className="text-white/90 text-sm">Preview • Watermarked • Size: {previewImage.dimensions}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewImage(null)}
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 flex justify-center">
              <div className="relative max-w-full">
                <NextImage
                  src={previewImage.previewUrl || "/placeholder.svg"}
                  alt={previewImage.title}
                  width={720}
                  height={720}
                  className="max-w-full max-h-full object-contain rounded-md"
                  loading="lazy"
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/25 text-3xl font-bold rotate-12 select-none">
                    n3uralia.art
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-muted-foreground">{previewImage.description}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">Fisheye</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-bold text-primary text-xl">${previewImage.price}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => handleAddToCart(previewImage)}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart - ${previewImage.price}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
