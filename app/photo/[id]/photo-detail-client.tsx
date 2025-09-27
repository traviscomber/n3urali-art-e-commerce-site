"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { useCart } from "@/lib/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageWithFallback } from "@/components/image-with-fallback"
import { LicenseSelector } from "@/components/license-selector"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { ArrowLeft, ShoppingCart, Eye, Share2, Heart, Info } from "lucide-react"
import { Simple360Viewer } from "@/components/simple-360-viewer"

interface Image {
  id: string
  title: string
  description: string
  categories?: { name: string; description?: string }
  licenses?: { name: string; description?: string }
  price: number
  original_url: string
  thumbnail_small_url?: string
  thumbnail_medium_url?: string
  thumbnail_large_url?: string
  file_path?: string
  is_featured: boolean
  created_at: string
  updated_at?: string
}

interface Props {
  initialImage: Image
}

export default function PhotoDetailClient({ initialImage }: Props) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const [image] = useState<Image>(initialImage)
  const [showPanoramaViewer, setShowPanoramaViewer] = useState(false)
  const [showLicenseSelector, setShowLicenseSelector] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const displayUrl =
    image.thumbnail_large_url || image.thumbnail_medium_url || image.thumbnail_small_url || image.original_url
  const category = image.categories?.name || "360°"
  const isEquirectangular = category.toLowerCase().includes("equirectangular") || category.includes("360")

  console.log("[v0] PhotoDetailClient - Image ID:", image.id)
  console.log("[v0] PhotoDetailClient - Category:", category)
  console.log("[v0] PhotoDetailClient - isEquirectangular:", isEquirectangular)
  console.log("[v0] PhotoDetailClient - showPanoramaViewer:", showPanoramaViewer)
  console.log("[v0] PhotoDetailClient - original_url:", image.original_url)

  const handleAddToCart = () => {
    setShowLicenseSelector(true)
  }

  const handleLicenseSelect = (license: any, totalPrice: number) => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    addItem({
      id: `${image.id}-${license.id}`,
      imageId: image.id,
      title: image.title,
      price: totalPrice,
      licenseId: license.id,
      licenseName: license.name,
      licensePrice: license.price,
      previewUrl: displayUrl,
      category: isEquirectangular ? "equirectangular" : "fisheye",
      quantity: 1,
    })
    setShowLicenseSelector(false)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNav />

        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-muted/50">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gallery
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-muted/20">
                  {showPanoramaViewer && isEquirectangular ? (
                    <Simple360Viewer
                      imageUrl={image.original_url}
                      title={image.title}
                      onClose={() => setShowPanoramaViewer(false)}
                      inline={true}
                      isPaid={false}
                    />
                  ) : (
                    <>
                      <ImageWithFallback
                        src={displayUrl || "/placeholder.svg"}
                        alt={image.title}
                        fill
                        className="object-contain"
                        priority
                      />

                      {/* Watermark */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 text-4xl font-bold rotate-12 select-none">
                          n3uralia.art
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Image Info */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">{category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Resolution:</span>
                    <p className="font-medium">4K - 16K</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format:</span>
                    <p className="font-medium">JPEG</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">License:</span>
                    <p className="font-medium">Commercial Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-balance mb-2">{image.title}</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{category}</Badge>
                    {image.is_featured && <Badge variant="default">Featured</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    className={isLiked ? "text-red-500" : ""}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {image.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Description
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{image.description}</p>
                </div>
              )}
            </div>

            {/* Pricing & Purchase */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">${image.price}</div>
                    <p className="text-sm text-muted-foreground">Base price • Multiple license options available</p>
                  </div>

                  <div className="space-y-3">
                    <Button onClick={handleAddToCart} className="w-full glow-primary" size="lg">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => {
                        console.log("[v0] Preview button clicked - isEquirectangular:", isEquirectangular)
                        console.log("[v0] Setting showPanoramaViewer to true")
                        setShowPanoramaViewer(true)
                      }}
                      disabled={!isEquirectangular}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {isEquirectangular ? "Preview 360°" : "Preview Image"}
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground text-center space-y-1">
                    <p>✓ Instant download after purchase</p>
                    <p>✓ Multiple resolution options</p>
                    <p>✓ Commercial license available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Technical Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Image Type:</span>
                    <span>{isEquirectangular ? "Equirectangular 360°" : "Fisheye 180°"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AI Generated:</span>
                    <span>Yes, professionally enhanced</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Use Cases:</span>
                    <span>VR, Projection Mapping, Visualization</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(image.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* License Selection Dialog */}
      <Dialog open={showLicenseSelector} onOpenChange={setShowLicenseSelector}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose License</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold">{image.title}</h3>
              <p className="text-sm text-muted-foreground">Base price: ${image.price}</p>
            </div>

            <LicenseSelector basePrice={image.price} onLicenseSelect={handleLicenseSelect} />

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowLicenseSelector(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
