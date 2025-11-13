"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Eye } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
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
  const [isLoading, setIsLoading] = useState(false)

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

  const hasDiscount = product.price && product.price < 100 // Example: if original price was higher
  const discountPercentage = hasDiscount ? Math.round(((100 - product.price) / 100) * 100) : 0

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

  const isValidUrl = (url: string | null | undefined): url is string => {
    return !!url && url.trim() !== "" && !url.includes("placeholder.svg")
  }

  const imageUrl =
    (isValidUrl(product.thumbnail_large_url) && product.thumbnail_large_url) ||
    (isValidUrl(product.thumbnail_medium_url) && product.thumbnail_medium_url) ||
    (isValidUrl(product.thumbnail_small_url) && product.thumbnail_small_url) ||
    (isValidUrl(product.file_path) && product.file_path) ||
    (isValidUrl(product.original_url) && product.original_url)

  if (!imageUrl) {
    return null
  }

  return (
    <Link href={`/photo/${product.id}`} className="block group">
      <Card className="overflow-hidden bg-card/50 border-border/50 hover:bg-card hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            quality={85}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.is_featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Featured</Badge>
          )}
          {discountPercentage > 0 && (
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400/40 to-orange-500/40 text-black font-bold border-0">
              -{discountPercentage}% OFF
            </Badge>
          )}

          {isEquirectangular && (
            <Badge className="absolute bottom-3 left-3 bg-primary/90 text-primary-foreground">360°</Badge>
          )}

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" onClick={(e) => e.preventDefault()}>
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </CardContent>
      </Card>
    </Link>
  )
}
