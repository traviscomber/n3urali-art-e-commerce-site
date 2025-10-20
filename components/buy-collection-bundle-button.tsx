"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, Package } from "lucide-react"
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

  const savings = images.reduce((sum, img) => sum + img.price, 0) - bundlePrice
  const savingsPercent = Math.round((savings / images.reduce((sum, img) => sum + img.price, 0)) * 100)

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border-2 border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">Buy Complete Collection</h3>
          <p className="text-muted-foreground mb-4">Get all {images.length} premium images in one bundle</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold">${bundlePrice.toFixed(2)}</span>
            <span className="text-muted-foreground line-through">
              ${images.reduce((sum, img) => sum + img.price, 0).toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-green-600">Save {savingsPercent}%</span>
          </div>
          <Button size="lg" onClick={handleBuyBundle} className="w-full sm:w-auto">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Buy Collection Bundle
          </Button>
        </div>
      </div>
    </div>
  )
}
