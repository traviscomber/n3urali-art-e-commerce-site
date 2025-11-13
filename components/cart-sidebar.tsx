"use client"

import { useCart } from "@/lib/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Trash2, ShoppingCart, Plus, Minus, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function CartSidebar() {
  const { state, removeItem, updateQuantity, closeCart } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price * 950) // Convert USD to CLP (approximate rate: 1 USD = 950 CLP)
  }
  // </CHANGE>

  return (
    <Sheet open={state.isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito de Compras ({state.items.length})
          </SheetTitle>
          {/* </CHANGE> */}
        </SheetHeader>

        <div className="flex flex-col h-full">
          {state.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Tu carrito está vacío</p>
                <Button variant="outline" onClick={closeCart}>
                  Continuar Comprando
                </Button>
                {/* </CHANGE> */}
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-6">
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={`${item.id}-${item.license_id}`} className="flex gap-4 p-4 border rounded-lg">
                      {item.isBundle && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="default" className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            Paquete
                          </Badge>
                        </div>
                      )}

                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={
                            item.preview_image_url ||
                            "/placeholder.svg?height=64&width=64&query=360 panoramic thumbnail" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={item.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.title}</h4>
                        {item.isBundle && item.bundleImageCount ? (
                          <p className="text-xs text-muted-foreground">{item.bundleImageCount} imágenes incluidas</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">{item.license_name}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">{formatPrice(item.price)}</p>

                        {!item.isBundle && (
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        <p className="font-semibold text-sm mt-2">{formatPrice(item.price * item.quantity)}</p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">{formatPrice(state.total)}</span>
                </div>

                <div className="space-y-2">
                  <Link href="/checkout" onClick={closeCart}>
                    <Button className="w-full" size="lg">
                      Ir al Pago
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full bg-transparent" onClick={closeCart}>
                    Continuar Comprando
                  </Button>
                  {/* </CHANGE> */}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
