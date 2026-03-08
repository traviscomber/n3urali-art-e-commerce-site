"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, Check } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import { useState } from "react"

interface Product {
  id: string
  title: string
  price: number
  preview_image_url: string
}

interface AddToCartButtonProps {
  product: Product
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function AddToCartButton({
  product,
  variant = "default",
  size = "default",
  className = "",
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)

    try {
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        preview_image_url: product.preview_image_url,
        license_id: "standard",
        license_name: "Standard License",
      })

      setJustAdded(true)
      setTimeout(() => {
        setJustAdded(false)
        openCart() // Open cart sidebar after adding
      }, 1000)
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  if (justAdded) {
    return (
      <Button variant="outline" size={size} className={`w-full ${className}`} disabled>
        <Check className="h-4 w-4 mr-2 text-green-500" />
        Added to Cart
      </Button>
    )
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding}
      variant={variant}
      size={size}
      className={`w-full ${className}`}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  )
}
