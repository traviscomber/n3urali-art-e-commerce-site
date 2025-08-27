"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Download, Eye, Calendar, CreditCard, Package } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface OrderItem {
  id: number
  image_title: string
  license_type: string
  price: number
  preview_url: string
}

interface Order {
  id: number
  total_amount: number
  status: string
  created_at: string
  stripe_payment_intent_id: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    if (!supabase) {
      toast.error("Authentication required")
      setLoading(false)
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please log in to view your orders")
        setLoading(false)
        return
      }

      // Fetch orders with order items
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          total_amount,
          status,
          created_at,
          stripe_payment_intent_id,
          order_items (
            id,
            license_type,
            price,
            images (
              title,
              preview_url
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (ordersError) throw ordersError

      // Transform the data to match our interface
      const transformedOrders =
        ordersData?.map((order) => ({
          id: order.id,
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          stripe_payment_intent_id: order.stripe_payment_intent_id,
          items: order.order_items.map((item) => ({
            id: item.id,
            image_title: item.images?.title || "Unknown Image",
            license_type: item.license_type,
            price: item.price,
            preview_url: item.images?.preview_url || "",
          })),
        })) || []

      setOrders(transformedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getLicenseBadgeColor = (license: string) => {
    switch (license.toLowerCase()) {
      case "standard":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "extended":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "commercial":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="h-5 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-48"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-16 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
        <p className="text-muted-foreground">View your order history and download purchased images</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
            <Button asChild>
              <Link href="/gallery">Browse Gallery</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order #{order.id}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />${order.total_amount.toFixed(2)}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusBadgeColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Items ({order.items.length})</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            {item.preview_url && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={item.preview_url || "/placeholder.svg"}
                                  alt={item.image_title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">{item.image_title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={getLicenseBadgeColor(item.license_type)}>
                                  {item.license_type.charAt(0).toUpperCase() + item.license_type.slice(1)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">${item.price.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            {order.status === "completed" && (
                              <Button size="sm" asChild>
                                <Link href="/account/downloads">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Payment ID: {order.stripe_payment_intent_id}</div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-lg font-semibold">${order.total_amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
