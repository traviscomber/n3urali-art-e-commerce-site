"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye, X } from "lucide-react"
import NextImage from "next/image"
import { useCart } from "@/lib/contexts/cart-context"
import { useToast } from "./toast-notifications"

interface QuickPreviewModalProps {
  image: {
    id: string
    title: string
    category: "equirectangular" | "fisheye"
    price: number
    preview_url: string
    dimensions: string
    file_size: number
    description?: string
  } | null
  isOpen: boolean
  onClose: () => void
  onViewFull: (image: any) => void
}

export function QuickPreviewModal({ image, isOpen, onClose, onViewFull }: QuickPreviewModalProps) {
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [imageLoading, setImageLoading] = useState(true)

  if (!image) return null

  const handleAddToCart = () => {
    addItem({
      id: image.id,
      imageId: image.id,
      title: image.title,
      price: image.price,
      licenseType: "standard",
      previewUrl: image.preview_url,
      category: image.category,
      quantity: 1,
    })

    showToast({
      type: "success",
      title: "Added to Cart",
      message: `${image.title} has been added to your cart`,
      duration: 3000,
    })
  }

  const handleViewFull = () => {
    onViewFull(image)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{image.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{image.category === "equirectangular" ? "360°" : "Fisheye"}</Badge>
                <span className="text-sm text-muted-foreground">
                  {image.dimensions} • {(image.file_size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative aspect-video bg-muted/20 rounded-lg overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            <NextImage
              src={image.preview_url}
              alt={image.title}
              fill
              className="object-contain"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 text-2xl font-bold rotate-12 select-none">
                n3uralia.art
              </div>
            </div>
          </div>

          {image.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{image.description}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-2xl font-bold text-primary">${image.price}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleViewFull}>
                <Eye className="w-4 h-4 mr-2" />
                Full View
              </Button>
              <Button onClick={handleAddToCart}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
