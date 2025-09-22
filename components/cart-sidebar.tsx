"use client"

import { useCart } from "@/lib/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Trash2, ShoppingCart, Plus, Minus } from "lucide-react"
import { ImageWithFallback } from "@/components/image-with-fallback"
import Link from "next/link"

export function CartSidebar() {
  const { state, removeItem, updateQuantity, closeCart } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const getLicenseBadgeColor = (licenseType: string) => {
    switch (licenseType) {
      case "NON_EXCLUSIVE":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "EXCLUSIVE":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getLicenseDisplayName = (licenseType: string) => {
    switch (licenseType) {
      case "NON_EXCLUSIVE":
        return "Non-Exclusive"
      case "EXCLUSIVE":
        return "Exclusive"
      default:
        return licenseType
    }
  }

  return (
    <Sheet open={state.isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({state.items.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {state.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-2">Browse our gallery to find amazing 360° images</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-6">
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <ImageWithFallback
                          src={item.previewUrl || "/placeholder.svg?height=64&width=64"}
                          alt={item.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate mb-2">{item.title}</h4>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className={`text-xs ${getLicenseBadgeColor(item.licenseType)}`}>
                            {getLicenseDisplayName(item.licenseType)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium min-w-[20px] text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4 flex-shrink-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Subtotal:</span>
                    <span>{formatPrice(state.total)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Processing Fee (3%):</span>
                    <span>{formatPrice(state.total * 0.03)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatPrice(state.total * 1.03)}</span>
                  </div>
                </div>

                <Link href="/checkout" onClick={closeCart}>
                  <Button className="w-full glow-primary" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p>✓ Secure cryptocurrency payment</p>
                  <p>✓ Instant download after purchase</p>
                  <p>✓ 30-day download access</p>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
