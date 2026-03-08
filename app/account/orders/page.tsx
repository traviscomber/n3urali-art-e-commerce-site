"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Eye, Calendar, Package, Download, CreditCard } from 'lucide-react'
import { toast } from "sonner"
import { getOrders } from "@/app/actions/admin-actions"
import { useAuth } from "@/lib/contexts/auth-context"

interface OrderItem {
  id: string
  image_id: string
  license_id: string
  price: number
  download_count: number
  download_limit: number
  images: {
    title: string
    thumbnail_url: string
  }
}

interface Order {
  id: string
  order_number?: string
  status: string
  total_amount: string | number
  created_at: string
  order_items: OrderItem[]
  payment_method?: string
  payment_id?: string
  user_email?: string
  user_name?: string
  updated_at?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userEmail = user?.email
        if (!isAuthenticated || !userEmail) {
          setLoading(false)
          return
        }

        const result = await getOrders(userEmail)

        if (result.success && result.data) {
          setOrders(result.data)
        } else {
          toast.error("Failed to load orders")
        }
      } catch (error) {
        toast.error("Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, isAuthenticated])

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-accent text-accent-foreground"
      case "processing":
        return "bg-secondary text-secondary-foreground"
      case "cancelled":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getLicenseBadgeColor = (license: string) => {
    switch (license) {
      case "standard":
        return "bg-secondary text-secondary-foreground"
      case "extended":
        return "bg-primary text-primary-foreground"
      case "commercial":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleDownload = async (item: OrderItem) => {
    try {
      const response = await fetch(`/api/download/${item.image_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_item_id: item.id,
          license_id: item.license_id,
        }),
      })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const blob = await response.blob()

      if (blob.size === 0) {
        throw new Error("Downloaded file is empty")
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${item.images.title}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Downloaded ${item.images.title}`)
    } catch (error) {
      toast.error("Download failed. Please try again.")
    }
  }

  const handlePreview = (item: OrderItem) => {
    window.open(`/photo/${item.image_id}`, "_blank")
  }

  const handleViewOrder = (orderId: string) => {
    toast.info(`Viewing order details for ${orderId}`)
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Please sign in</h3>
            <p className="text-muted-foreground mb-4">You need to be signed in to view your orders</p>
            <Button onClick={() => (window.location.href = "/")}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
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
        <p className="text-muted-foreground">View and manage your order history</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
            <Button asChild>
              <a href="/gallery">Browse Gallery</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order #{order.order_number}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        {order.payment_method || "Credit Card"}
                      </span>
                      <span className="font-semibold">
                        $
                        {typeof order.total_amount === "string"
                          ? Number.parseFloat(order.total_amount).toFixed(2)
                          : order.total_amount.toFixed(2)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusBadgeColor(order.status || "pending")}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Pending"}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleViewOrder(order.id)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={item.images.thumbnail_url || "/placeholder.svg"}
                        alt={item.images.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.images.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getLicenseBadgeColor("standard")} variant="secondary">
                            Standard License
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Downloads: {item.download_count}/{item.download_limit}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${item.price.toFixed(2)}</div>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" onClick={() => handlePreview(item)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          {order.status === "completed" && (
                            <Button
                              size="sm"
                              onClick={() => handleDownload(item)}
                              disabled={item.download_count >= item.download_limit}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
