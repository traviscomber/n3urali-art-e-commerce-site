"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, DollarSign, TrendingUp, XCircle, CheckCircle, Clock, Search } from "lucide-react"
import { toast } from "sonner"
import {
  getImageSalesAnalytics,
  getOrdersByStatus,
  getSalesOverview,
  type ImageSalesData,
  type OrderWithItems,
} from "@/app/actions/sales-analytics-actions"

export function SalesAnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState<ImageSalesData[]>([])
  const [completedOrders, setCompletedOrders] = useState<OrderWithItems[]>([])
  const [pendingOrders, setPendingOrders] = useState<OrderWithItems[]>([])
  const [rejectedOrders, setRejectedOrders] = useState<OrderWithItems[]>([])
  const [overview, setOverview] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [analyticsResult, completedResult, pendingResult, rejectedResult, overviewResult] = await Promise.all([
        getImageSalesAnalytics(),
        getOrdersByStatus("completed"),
        getOrdersByStatus("pending"),
        getOrdersByStatus("rejected"),
        getSalesOverview(),
      ])

      if (analyticsResult.success) {
        setSalesData(analyticsResult.data)
      }

      if (completedResult.success) {
        setCompletedOrders(completedResult.data)
      }

      if (pendingResult.success) {
        setPendingOrders(pendingResult.data)
      }

      if (rejectedResult.success) {
        setRejectedOrders(rejectedResult.data)
      }

      if (overviewResult.success) {
        setOverview(overviewResult.data)
      }
    } catch (error) {
      console.error("[v0] Error loading sales data:", error)
      toast.error("Failed to load sales analytics")
    } finally {
      setLoading(false)
    }
  }

  const filteredSalesData = salesData.filter((item) =>
    item.image_title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading sales analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(overview.total_revenue || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed Sales</p>
                  <p className="text-2xl font-bold">{overview.total_sales || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold">{overview.pending_orders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Rejected/Abandoned</p>
                  <p className="text-2xl font-bold">{overview.rejected_orders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Images Sold</p>
                  <p className="text-2xl font-bold">{overview.total_images_sold || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Image Analytics</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedOrders.length})</TabsTrigger>
        </TabsList>

        {/* Image Analytics Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Sales Performance</CardTitle>
              <CardDescription>Track which images are selling and which need attention</CardDescription>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search images by title..."
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-right">Rejected</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead>Last Sale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalesData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        No sales data available yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSalesData.map((item) => (
                      <TableRow key={item.image_id}>
                        <TableCell>
                          <img
                            src={item.image_thumbnail || "/placeholder.svg?height=40&width=40"}
                            alt={item.image_title}
                            className="w-10 h-10 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{item.image_title}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="bg-green-600">
                            {item.completed_orders}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="bg-yellow-600">
                            {item.pending_orders}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="bg-red-600">
                            {item.rejected_orders}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(item.total_revenue)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {item.last_sale_date ? formatDate(item.last_sale_date) : "Never"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Orders Tab */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Completed Orders
              </CardTitle>
              <CardDescription>Successfully paid and delivered orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No completed orders yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    completedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.user_name}</p>
                            <p className="text-sm text-gray-600">{order.user_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {order.items.map((item) => (
                              <img
                                key={item.id}
                                src={item.image_thumbnail || "/placeholder.svg?height=32&width=32"}
                                alt={item.image_title}
                                className="w-8 h-8 object-cover rounded"
                                title={item.image_title}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(order.total_amount)}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Orders Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pending Orders
              </CardTitle>
              <CardDescription>Orders awaiting payment confirmation</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No pending orders
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.user_name}</p>
                            <p className="text-sm text-gray-600">{order.user_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {order.items.map((item) => (
                              <img
                                key={item.id}
                                src={item.image_thumbnail || "/placeholder.svg?height=32&width=32"}
                                alt={item.image_title}
                                className="w-8 h-8 object-cover rounded"
                                title={item.image_title}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-yellow-600">
                          {formatCurrency(order.total_amount)}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejected Orders Tab */}
        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Rejected/Abandoned Orders
              </CardTitle>
              <CardDescription>Orders that were not completed or rejected</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No rejected orders
                      </TableCell>
                    </TableRow>
                  ) : (
                    rejectedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.user_name}</p>
                            <p className="text-sm text-gray-600">{order.user_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {order.items.map((item) => (
                              <img
                                key={item.id}
                                src={item.image_thumbnail || "/placeholder.svg?height=32&width=32"}
                                alt={item.image_title}
                                className="w-8 h-8 object-cover rounded"
                                title={item.image_title}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-red-600">
                          {formatCurrency(order.total_amount)}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
