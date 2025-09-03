"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, ShoppingCart, Eye, Crown } from "lucide-react"
import { getImages } from "@/app/actions/admin-actions"
import { useAuth } from "@/lib/contexts/auth-context"

interface Image {
  id: string
  title: string
  description: string
  category_name: string
  price: number
  image_url: string
  thumbnail_url: string
  license_name?: string
  metadata?: any
}

export default function PhotoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [image, setImage] = useState<Image | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const result = await getImages()
        if (result.success) {
          const foundImage = result.data.find((img: any) => img.id === params.id)
          if (foundImage) {
            setImage(foundImage)
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching image:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchImage()
    }
  }, [params.id])

  const handlePurchase = async () => {
    if (!user) {
      router.push("/?auth=required")
      return
    }

    setPurchasing(true)
    try {
      // Simulate purchase process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real implementation, this would create an order and process payment
      console.log("[v0] Purchase completed for image:", image?.id)

      // Redirect to orders page or show success message
      router.push("/account/orders")
    } catch (error) {
      console.error("[v0] Purchase error:", error)
    } finally {
      setPurchasing(false)
    }
  }

  const getRightsTypeDisplay = () => {
    const rightsType = image?.metadata?.rights_type
    if (rightsType === "exclusive") return { text: "Exclusive Rights", icon: Crown, color: "text-yellow-600" }
    if (rightsType === "non-exclusive") return { text: "Non-Exclusive Rights", icon: Eye, color: "text-blue-600" }
    if (rightsType === "both") return { text: "Both Rights Available", icon: Crown, color: "text-purple-600" }
    return { text: "Standard License", icon: Eye, color: "text-gray-600" }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading image details...</p>
        </div>
      </div>
    )
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Image Not Found</h1>
          <p className="text-muted-foreground mb-6">The requested image could not be found.</p>
          <Button onClick={() => router.push("/gallery")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
      </div>
    )
  }

  const rightsDisplay = getRightsTypeDisplay()
  const RightsIcon = rightsDisplay.icon

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/gallery")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Image Preview */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square bg-muted/10">
                  <img
                    src={image.image_url || image.thumbnail_url}
                    alt={image.title}
                    className="w-full h-full object-contain"
                  />

                  {/* Watermark overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="relative w-full h-full overflow-hidden">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute text-white/15 font-bold text-4xl transform -rotate-45 select-none"
                          style={{
                            left: `${(i % 4) * 25}%`,
                            top: `${Math.floor(i / 4) * 33}%`,
                            textStroke: "1px rgba(255,255,255,0.1)",
                          }}
                        >
                          n3urali.art
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground">
              Preview • Watermarked • Full resolution available after purchase
            </div>
          </div>

          {/* Image Details & Purchase */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {image.category_name === "Fisheye" ? "180° Fisheye" : "360° Equirectangular"}
                </Badge>
                <Badge variant="secondary" className={rightsDisplay.color}>
                  <RightsIcon className="w-3 h-3 mr-1" />
                  {rightsDisplay.text}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold mb-4">{image.title}</h1>

              {image.description && (
                <p className="text-muted-foreground text-lg leading-relaxed">{image.description}</p>
              )}
            </div>

            {/* Specifications */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Specifications</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Resolution:</span>
                    <p className="font-medium">4K - 16K (Full HQ)</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format:</span>
                    <p className="font-medium">JPG, PNG</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">License:</span>
                    <p className="font-medium">{image.license_name || "Premium License"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Usage:</span>
                    <p className="font-medium">Commercial & Personal</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Purchase */}
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-3xl font-bold text-primary">${image.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Instant Download</p>
                    <p className="text-sm font-medium">Full Resolution</p>
                  </div>
                </div>

                <Button onClick={handlePurchase} disabled={purchasing} className="w-full h-12 text-lg" size="lg">
                  {purchasing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Buy & Download Now
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    Instant Download
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Full Resolution
                  </div>
                </div>
              </CardContent>
            </Card>

            {!user && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Sign in required:</strong> You'll be redirected to sign in before completing your purchase.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
