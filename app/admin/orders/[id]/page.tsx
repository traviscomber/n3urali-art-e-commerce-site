"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProtectedRoute } from "@/components/protected-route"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Download,
  Receipt,
  CreditCard,
  User,
  Calendar,
  DollarSign,
} from "lucide-react"
import Image from "next/image"

interface OrderDetails {
  id: string
  user_email: string
  user_name: string
  total_amount: number
  status: string
  payment_method: string
  payment_intent_id: string
  created_at: string
  items: Array<{
    id: string
    image_id: string
    title: string
    price: number
    license_name: string
    preview_url?: string
  }>
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else {
        setError("Failed to load order details")
      }
    } catch (error) {
      console.error("Failed to fetch order:", error)
      setError("Failed to load order details")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveOrder = async () => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        await fetchOrderDetails() // Refresh order data
      } else {
        setError("Failed to approve order")
      }
    } catch (error) {
      console.error("Failed to approve order:", error)
      setError("Failed to approve order")
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectOrder = async () => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/reject`, {
        method: "POST",
      })

      if (response.ok) {
        await fetchOrderDetails() // Refresh order data
      } else {
        setError("Failed to reject order")
      }
    } catch (error) {
      console.error("Failed to reject order:", error)
      setError("Failed to reject order")
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Verification
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const isReceiptOrder = order?.payment_method === "manual_receipt"
  const receiptUrl = isReceiptOrder ? order?.payment_intent_id : null

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !order) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold">Order Not Found</h1>
            <p className="text-muted-foreground">{error || "The requested order could not be found."}</p>
            <Button onClick={() => router.push("/admin/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-background">
        <div className="bg-card shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => router.push("/admin/dashboard")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl font-bold">Order Details</h1>
                  <p className="text-muted-foreground mt-1">Order ID: {order.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">{getStatusBadge(order.status)}</div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="font-medium">{order.user_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="font-medium">{order.user_email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                      <p className="font-medium capitalize">{order.payment_method.replace("_", " ")}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                      <p className="font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />${order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {isReceiptOrder && receiptUrl && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Payment Receipt</label>
                      <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            <span className="font-medium">Receipt Uploaded</span>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(receiptUrl, "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isReceiptOrder && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                      <p className="font-mono text-sm bg-muted p-2 rounded">{order.payment_intent_id}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={item.preview_url || "/placeholder.svg?height=64&width=64"}
                            alt={item.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.license_name}</p>
                          <p className="font-semibold mt-1">${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions Panel */}
            <div className="space-y-6">
              {order.status === "pending" && isReceiptOrder && (
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This order requires manual verification of the payment receipt. Review the uploaded receipt and
                      approve or reject the order.
                    </p>

                    <div className="space-y-3">
                      <Button
                        onClick={handleApproveOrder}
                        disabled={processing}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {processing ? "Processing..." : "Approve Order"}
                      </Button>

                      <Button
                        onClick={handleRejectOrder}
                        disabled={processing}
                        variant="destructive"
                        className="w-full"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {processing ? "Processing..." : "Reject Order"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Items ({order.items.length})</span>
                      <span>${(order.total_amount / 1.03).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Fee (3%)</span>
                      <span>${((order.total_amount * 0.03) / 1.03).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {order.status === "completed" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Download Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-green-600">
                      <Download className="h-4 w-4" />
                      <span className="text-sm font-medium">Download tokens generated</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Customer has access to download purchased items
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
