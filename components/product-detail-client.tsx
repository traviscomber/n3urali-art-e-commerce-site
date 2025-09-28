"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Eye, ArrowLeft, Share2 } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"
import Link from "next/link"
import { ImagePreviewModal } from "@/components/image-preview-modal"
import { LicenseSelector } from "@/components/license-selector"

interface ProductDetailClientProps {
  image: {
    id: string
    title: string
    description: string
    price: number
    thumbnail_large_url: string
    thumbnail_medium_url: string
    thumbnail_small_url: string
    original_url: string
    is_featured: boolean
    active: boolean
    category_id: string
    license_id: string
    created_at: string
    categories?: {
      id: string
      name: string
      description: string
    }
    licenses?: {
      id: string
      name: string
      description: string
    }
  }
}

export function ProductDetailClient({ image }: ProductDetailClientProps) {
  const [selectedLicenseId, setSelectedLicenseId] = useState(image.license_id)
  const [selectedLicense, setSelectedLicense] = useState<any>(null)
  const [totalPrice, setTotalPrice] = useState(Number(image.price))
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()

  const isEquirectangularImage = () => {
    const categoryName = image.categories?.name?.toLowerCase() || ""
    const title = image.title?.toLowerCase() || ""

    // Only show 360° preview for true equirectangular images
    return (
      categoryName.includes("equirectangular") ||
      (categoryName.includes("360") &&
        !categoryName.includes("fisheye") &&
        !title.includes("180") &&
        !title.includes("dome"))
    )
  }

  const isFisheyeOrDomeImage = () => {
    const categoryName = image.categories?.name?.toLowerCase() || ""
    const title = image.title?.toLowerCase() || ""

    return (
      categoryName.includes("fisheye") ||
      categoryName.includes("dome") ||
      title.includes("fisheye") ||
      title.includes("dome") ||
      title.includes("180")
    )
  }

  const handleLicenseSelect = (license: any, calculatedTotalPrice: number) => {
    setSelectedLicense(license)
    setSelectedLicenseId(license.id)
    setTotalPrice(calculatedTotalPrice)
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    setIsLoading(true)
    try {
      addItem({
        id: image.id,
        title: image.title,
        price: totalPrice, // Use calculated total price instead of base price
        preview_image_url: image.thumbnail_medium_url,
        license_id: selectedLicenseId,
        license_name: selectedLicense?.name || image.licenses?.name || "Standard License",
        quantity: 1,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handlePreviewToggle = () => {
    console.log("[v0] ProductDetailClient: Opening preview modal")
    console.log("[v0] ProductDetailClient: showPreview state before:", showPreview)
    setShowPreview(true)
    console.log("[v0] ProductDetailClient: showPreview state after:", true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/gallery">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              <Image
                src={
                  image.thumbnail_large_url ||
                  "/placeholder.svg?height=600&width=800&query=360 degree panoramic image" ||
                  "/placeholder.svg" ||
                  "/placeholder.svg" ||
                  "/placeholder.svg" ||
                  "/placeholder.svg" ||
                  "/placeholder.svg"
                }
                alt={image.title}
                fill
                className={isFisheyeOrDomeImage() ? "object-contain" : "object-cover"}
                priority
              />
              {image.is_featured && (
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">Featured</Badge>
              )}
              {image.categories?.name && (
                <Badge className="absolute top-4 right-4" variant="secondary">
                  {image.categories.name}
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              {isEquirectangularImage() && (
                <Button variant="outline" onClick={handlePreviewToggle} className="flex-1 bg-transparent">
                  <Eye className="h-4 w-4 mr-2" />
                  360° Preview
                </Button>
              )}
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {image.categories?.name && <Badge variant="secondary">{image.categories.name}</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-balance mb-4">{image.title}</h1>
              <p className="text-lg text-muted-foreground text-pretty">{image.description}</p>
            </div>

            <Separator />

            {/* License Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">License Options</h3>
              <LicenseSelector
                selectedLicenseId={selectedLicenseId}
                onLicenseSelect={handleLicenseSelect}
                basePrice={Number(image.price)}
              />
            </div>

            <Separator />

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <span>High Resolution JPEG/PNG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{image.categories?.name || "Digital Image"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolution:</span>
                  <span>Up to 16K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">License:</span>
                  <span>{selectedLicense?.name || image.licenses?.name || "Standard License"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery:</span>
                  <span>Instant Download</span>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Section */}
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-bold text-primary">${totalPrice.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">One-time purchase</div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isLoading ? "Adding to Cart..." : "Add to Cart"}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Secure checkout • Instant download • 30-day money-back guarantee
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        imageUrl={image.original_url || image.thumbnail_large_url}
        title={image.title}
        isEquirectangular={isEquirectangularImage()}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="login" />
    </div>
  )
}
