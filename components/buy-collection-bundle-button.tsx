"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, Sparkles } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import { toast } from "sonner"

interface BuyCollectionBundleButtonProps {
  images: Array<{
    id: string
    title: string
    thumbnail_small_url: string
    price: number
  }>
  bundlePrice: number
}

export function BuyCollectionBundleButton({ images, bundlePrice }: BuyCollectionBundleButtonProps) {
  const { addItem, openCart } = useCart()

  const handleBuyBundle = () => {
    if (images.length === 0) {
      toast.error("No images in collection")
      return
    }

    // Add bundle as a single cart item
    addItem({
      id: "featured-collection-bundle",
      title: `Featured Collection Bundle (${images.length} Images)`,
      price: bundlePrice,
      preview_image_url: images[0]?.thumbnail_small_url || "/placeholder.svg",
      license_id: "bundle-license",
      license_name: "Collection Bundle License",
      isBundle: true,
      bundleType: "featured-collection",
      bundleImageIds: images.map((img) => img.id),
      bundleImageCount: images.length,
    })

    toast.success(`Added Featured Collection Bundle to cart!`)
    openCart()
  }

  return (
    <div className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-xl p-8 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start gap-6">
        <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl shadow-md">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-2xl font-bold mb-2 text-balance">Buy Complete Collection</h3>
            <p className="text-muted-foreground text-pretty">Get all {images.length} premium images in one bundle</p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">${bundlePrice}</span>
            <span className="text-sm text-muted-foreground">for {images.length} images</span>
          </div>

          <Button
            size="lg"
            onClick={handleBuyBundle}
            className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Buy Collection Bundle
          </Button>
        </div>
      </div>
    </div>
  )
}
