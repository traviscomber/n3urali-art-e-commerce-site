"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { ProtectedRoute } from "@/components/protected-route"
import {
  BarChart3,
  Settings,
  Users,
  ShoppingCart,
  ImageIcon,
  DownloadIcon,
  CreditCard,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react"

interface Order {
  id: string
  user_email: string
  total_amount: number
  status: string
  created_at: string
  items: Array<{
    image_id: string
    title: string
    price: number
    license_name: string
  }>
}

interface AdminDownload {
  id: string
  user_email: string
  image_title: string
  downloaded_at: string
  license_name: string
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("analytics")
  const [orders, setOrders] = useState<Order[]>([])
  const [downloads, setDownloads] = useState<AdminDownload[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders()
    } else if (activeTab === "downloads") {
      fetchDownloads()
    }
  }, [activeTab])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDownloads = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/downloads")
      if (response.ok) {
        const data = await response.json()
        setDownloads(data.downloads || [])
      }
    } catch (error) {
      console.error("Failed to fetch downloads:", error)
    } finally {
      setLoading(false)
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
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-background">
        <div className="bg-card shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">N3urali.art E-commerce Management</p>
              </div>
              <div className="flex items-center gap-3">
                {(activeTab === "orders" || activeTab === "downloads") && (
                  <Button
                    onClick={activeTab === "orders" ? fetchOrders : fetchDownloads}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                )}
                <Button onClick={() => (window.location.href = "/simple-admin")} variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Simple Admin
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="downloads" className="flex items-center gap-2">
                <DownloadIcon className="h-4 w-4" />
                Downloads
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Order Management</CardTitle>
                    <Badge variant="secondary">{orders.length} orders</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                              <TableCell>{order.user_email}</TableCell>
                              <TableCell className="font-medium">${order.total_amount.toFixed(2)}</TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {orders.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No orders found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images">
              <Card>
                <CardHeader>
                  <CardTitle>Image Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Image Management</h3>
                    <p className="text-muted-foreground mb-4">
                      Use the Simple Admin interface for comprehensive image management including uploads, editing, and
                      organization.
                    </p>
                    <Button onClick={() => (window.location.href = "/simple-admin")}>
                      <Settings className="h-4 w-4 mr-2" />
                      Go to Simple Admin
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="downloads">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Download Management</CardTitle>
                    <Badge variant="secondary">{downloads.length} downloads</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Download ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>License</TableHead>
                            <TableHead>Downloaded</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {downloads.map((download) => (
                            <TableRow key={download.id}>
                              <TableCell className="font-mono text-sm">{download.id.slice(0, 8)}...</TableCell>
                              <TableCell>{download.user_email}</TableCell>
                              <TableCell className="font-medium">{download.image_title}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{download.license_name}</Badge>
                              </TableCell>
                              <TableCell>{new Date(download.downloaded_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                          {downloads.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No downloads found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">User Management</h3>
                    <p className="text-muted-foreground mb-4">
                      User management features including customer profiles, purchase history, and account administration
                      are coming soon.
                    </p>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Payment Processing</h3>
                    <p className="text-muted-foreground mb-4">
                      Advanced payment processing, refund management, and transaction monitoring features are in
                      development.
                    </p>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
