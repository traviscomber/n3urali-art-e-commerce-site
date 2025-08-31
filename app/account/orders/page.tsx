"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Eye, Calendar, Package, Download, CreditCard } from "lucide-react"
import { toast } from "sonner"

interface OrderItem {
  id: string
  image_title: string
  image_url: string
  license_type: string
  price: number
  download_count: number
  download_limit: number
}

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  order_date: string
  items: OrderItem[]
  payment_method: string
  billing_email: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sampleOrders: Order[] = [
      {
        id: "order_001",
        order_number: "N3U-2024-001",
        status: "completed",
        total_amount: 89.97,
        order_date: "2024-08-25T10:30:00Z",
        payment_method: "Credit Card",
        billing_email: "developer@local.dev",
        items: [
          {
            id: "item_001",
            image_title: "Sunset Beach 360° Panorama",
            image_url: "/placeholder.svg?height=200&width=300",
            license_type: "standard",
            price: 29.99,
            download_count: 2,
            download_limit: 5,
          },
          {
            id: "item_002",
            image_title: "Modern Office Interior Fisheye",
            image_url: "/placeholder.svg?height=200&width=300",
            license_type: "extended",
            price: 59.98,
            download_count: 0,
            download_limit: 10,
          },
        ],
      },
      {
        id: "order_002",
        order_number: "N3U-2024-002",
        status: "processing",
        total_amount: 149.95,
        order_date: "2024-08-28T14:15:00Z",
        payment_method: "PayPal",
        billing_email: "developer@local.dev",
        items: [
          {
            id: "item_003",
            image_title: "Urban Cityscape 360° Night View",
            image_url: "/placeholder.svg?height=200&width=300",
            license_type: "commercial",
            price: 99.99,
            download_count: 0,
            download_limit: 20,
          },
          {
            id: "item_004",
            image_title: "Forest Trail Equirectangular",
            image_url: "/placeholder.svg?height=200&width=300",
            license_type: "standard",
            price: 49.96,
            download_count: 1,
            download_limit: 5,
          },
        ],
      },
      {
        id: "order_003",
        order_number: "N3U-2024-003",
        status: "completed",
        total_amount: 199.99,
        order_date: "2024-08-20T09:45:00Z",
        payment_method: "Credit Card",
        billing_email: "developer@local.dev",
        items: [
          {
            id: "item_005",
            image_title: "Luxury Hotel Lobby 360°",
            image_url: "/placeholder.svg?height=200&width=300",
            license_type: "commercial",
            price: 199.99,
            download_count: 5,
            download_limit: 20,
          },
        ],
      },
    ]

    setTimeout(() => {
      setOrders(sampleOrders)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLicenseBadgeColor = (license: string) => {
    switch (license) {
      case "standard":
        return "bg-blue-100 text-blue-800"
      case "extended":
        return "bg-purple-100 text-purple-800"
      case "commercial":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDownload = (item: OrderItem) => {
    toast.success(`Download started for ${item.image_title}`)
    // In a real app, this would generate a download link
  }

  const handleViewOrder = (orderId: string) => {
    toast.info(`Viewing order details for ${orderId}`)
    // In a real app, this would navigate to order details page
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
                        {new Date(order.order_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        {order.payment_method}
                      </span>
                      <span className="font-semibold">${order.total_amount.toFixed(2)}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusBadgeColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleViewOrder(order.id)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.image_title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.image_title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getLicenseBadgeColor(item.license_type)} variant="secondary">
                            {item.license_type.charAt(0).toUpperCase() + item.license_type.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Downloads: {item.download_count}/{item.download_limit}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${item.price.toFixed(2)}</div>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm">
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
