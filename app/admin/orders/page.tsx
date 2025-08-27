"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Eye, Package, DollarSign, TrendingUp, Loader2, AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

interface Order {
  id: number
  user_email: string
  total_amount: number
  status: string
  created_at: string
  updated_at: string
  order_items: {
    id: number
    price: number
    license_type: string
    images: {
      id: number
      title: string
      category: string
    }
  }[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadOrders()
    loadStats()
  }, [mounted])

  const loadOrders = async () => {
    if (!mounted) return

    const supabase = createClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            price,
            license_type,
            images (
              id,
              title,
              category
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!mounted) return

    const supabase = createClient()
    if (!supabase) return

    try {
      const { data: ordersData } = await supabase.from("orders").select("total_amount, status")

      if (ordersData) {
        const totalOrders = ordersData.length
        const totalRevenue = ordersData.reduce((sum, order) => sum + order.total_amount, 0)
        const pendingOrders = ordersData.filter((order) => order.status === "pending").length
        const completedOrders = ordersData.filter((order) => order.status === "completed").length

        setStats({
          totalOrders,
          totalRevenue,
          pendingOrders,
          completedOrders,
        })
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    const supabase = createClient()
    if (!supabase) return

    try {
      setIsUpdating(true)
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId)

      if (error) throw error

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus, updated_at: new Date().toISOString() } : order,
        ),
      )

      setSelectedOrder(null)
      loadStats() // Refresh stats
    } catch (error) {
      console.error("Error updating order:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_items.some((item) => item.images.title.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading orders...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Order Management</h1>
        <p className="text-muted-foreground">Monitor and manage customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Manage customer orders and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">Order #{order.id}</div>
                  <div className="text-sm text-muted-foreground">{order.user_email}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.order_items.length} item(s) • ${order.total_amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      order.status === "completed"
                        ? "default"
                        : order.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {order.status}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No orders found</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>Order details and management</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Customer</label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.user_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Amount</label>
                  <p className="text-sm text-muted-foreground">${selectedOrder.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge
                    variant={
                      selectedOrder.status === "completed"
                        ? "default"
                        : selectedOrder.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Order Date</label>
                  <p className="text-sm text-muted-foreground">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Order Items</label>
                <div className="mt-2 space-y-2">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.images.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.images.category} • {item.license_type} license
                        </p>
                      </div>
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.status === "pending" && (
                <div className="flex gap-2">
                  <Button onClick={() => updateOrderStatus(selectedOrder.id, "completed")} disabled={isUpdating}>
                    {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Mark as Completed
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateOrderStatus(selectedOrder.id, "failed")}
                    disabled={isUpdating}
                  >
                    Mark as Failed
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
