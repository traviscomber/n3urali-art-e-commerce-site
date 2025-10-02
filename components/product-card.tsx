"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingCart, Eye, RotateCcw } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import { useTagFilter } from "@/lib/contexts/tag-filter-context"
import { useState } from "react"

interface Product {
  id: string
  title: string
  description: string
  price: number
  thumbnail_large_url: string
  thumbnail_medium_url: string
  thumbnail_small_url: string
  file_path?: string
  original_url?: string
  is_featured: boolean
  active: boolean
  category_id: string
  license_id: string
  created_at: string
  tags: string[]
  categories?: {
    name: string
    description: string
  }
  licenses?: {
    name: string
    description: string
  }
}

interface ProductCardProps {
  product: Product
  onView360?: (product: Product) => void
  priority?: boolean
}

export function ProductCard({ product, onView360, priority = false }: ProductCardProps) {
  const { addItem } = useCart()
  const { selectedTags, toggleTag } = useTagFilter()
  const [isLoading, setIsLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  if (!product) {
    return null
  }

  const isEquirectangular =
    product.categories?.name?.toLowerCase().includes("equirectangular") ||
    (product.categories?.name?.toLowerCase().includes("360") &&
      !product.categories?.name?.toLowerCase().includes("fisheye")) ||
    (product.title?.toLowerCase().includes("360") &&
      !product.title?.toLowerCase().includes("fisheye") &&
      !product.title?.toLowerCase().includes("180") &&
      !product.title?.toLowerCase().includes("dome"))

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      addItem({
        id: product.id,
        title: product.title,
        price: Number(product.price),
        preview_image_url: product.thumbnail_medium_url,
        license_id: product.license_id,
        license_name: product.licenses?.name || "Standard License",
        quantity: 1,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handle360Preview = () => {
    if (onView360) {
      onView360(product)
    }
  }

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleTag(tag)
  }

  const isValidUrl = (url: string | null | undefined): url is string => {
    return !!url && url.trim() !== "" && !url.includes("placeholder.svg")
  }

  const imageUrl =
    (isValidUrl(product.thumbnail_large_url) && product.thumbnail_large_url) ||
    (isValidUrl(product.thumbnail_medium_url) && product.thumbnail_medium_url) ||
    (isValidUrl(product.thumbnail_small_url) && product.thumbnail_small_url) ||
    (isValidUrl(product.file_path) && product.file_path) ||
    (isValidUrl(product.original_url) && product.original_url) ||
    "/placeholder.svg?height=300&width=400"

  console.log("[v0] ProductCard image URLs:", {
    id: product.id,
    title: product.title,
    thumbnail_large_url: product.thumbnail_large_url,
    thumbnail_medium_url: product.thumbnail_medium_url,
    thumbnail_small_url: product.thumbnail_small_url,
    file_path: product.file_path,
    original_url: product.original_url,
    selectedImageUrl: imageUrl,
  })

  return (
    <Card className="group overflow-hidden bg-card/50 border-border/50 hover:bg-card hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
        {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-muted/50" />}
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          quality={85}
          className={`object-contain transition-all duration-500 ${
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          } group-hover:scale-105`}
          onLoad={() => setImageLoaded(true)}
        />
        {product.is_featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Featured</Badge>
        )}
        <Badge className="absolute top-3 right-3 bg-background/80 text-foreground capitalize">
          {product.categories?.name || "Uncategorized"}
        </Badge>

        {isEquirectangular && (
          <Badge className="absolute bottom-3 left-3 bg-primary/90 text-primary-foreground">360°</Badge>
        )}

        {/* Overlay with quick actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" asChild>
            <Link href={`/product/${product.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
          {isEquirectangular && onView360 && (
            <Button size="sm" variant="secondary" onClick={handle360Preview}>
              <RotateCcw className="h-4 w-4 mr-1" />
              360°
            </Button>
          )}
          <Button size="sm" onClick={handleAddToCart} disabled={isLoading} className="bg-primary hover:bg-primary/90">
            <ShoppingCart className="h-4 w-4 mr-1" />
            {isLoading ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

          {/* License info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{product.licenses?.name || "Standard License"}</span>
            <span>•</span>
            <span>High Resolution</span>
            <span>•</span>
            <span>Instant Download</span>
          </div>

          {/* Category badge */}
          <div className="flex flex-wrap gap-1">
            {product.categories?.name && (
              <Badge variant="outline" className="text-xs">
                {product.categories.name}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {product.tags &&
              Array.isArray(product.tags) &&
              product.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`text-xs cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-primary/10 hover:border-primary/50"
                  }`}
                  onClick={(e) => handleTagClick(tag, e)}
                >
                  {tag}
                </Badge>
              ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-2xl font-bold text-primary">${Number(product.price).toFixed(2)}</div>
        <Button onClick={handleAddToCart} disabled={isLoading} size="sm" className="bg-primary hover:bg-primary/90">
          <ShoppingCart className="h-4 w-4 mr-1" />
          {isLoading ? "Adding..." : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
