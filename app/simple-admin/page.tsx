"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Images,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Eye,
  Search,
  Filter,
  Calendar,
  Mail,
  Clock,
  Edit,
  Trash2,
  Star,
  ToggleLeft,
  ToggleRight,
  Plus,
  BarChart3,
} from "lucide-react"
import Image from "next/image"

interface DashboardStats {
  totalImages: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  recentActivity: Array<{
    id: string
    type: "order" | "user" | "image"
    description: string
    timestamp: string
  }>
}

interface Order {
  id: string
  user_email: string
  total_amount: number
  status: "pending" | "completed" | "failed" | "refunded"
  customer_name: string | null
  created_at: string
  updated_at: string
  order_items?: Array<{
    id: string
    image_title: string
    license_type: string
    price: number
  }>
}

interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
  order_count?: number
  total_spent?: number
  last_order_date?: string
}

interface ImageData {
  id: string
  title: string
  description: string | null
  category: string
  price: number
  file_url: string
  preview_url: string | null
  thumbnail_url: string | null
  active: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

export default function SimpleAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "users" | "images" | "analytics">("dashboard")
  const [stats, setStats] = useState<DashboardStats>({
    totalImages: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentActivity: [],
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [images, setImages] = useState<ImageData[]>([])
  const [editingImage, setEditingImage] = useState<ImageData | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "completed" | "failed" | "refunded">("all")
  const [userFilter, setUserFilter] = useState<"all" | "admin" | "regular">("all")
  const [imageFilter, setImageFilter] = useState<"all" | "active" | "inactive" | "featured">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [imageSearchTerm, setImageSearchTerm] = useState("")
  const [analyticsData, setAnalyticsData] = useState({
    salesChart: [] as Array<{ month: string; revenue: number; orders: number }>,
    topImages: [] as Array<{ title: string; downloads: number; revenue: number }>,
    userGrowth: [] as Array<{ month: string; users: number }>,
    downloadTrends: [] as Array<{ category: string; downloads: number }>,
  })
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchDashboardStats = async () => {
    if (!mounted || typeof window === "undefined") return

    setLoadingStats(true)
    try {
      const supabase = createClient()

      // Fetch statistics from database
      const [imagesResult, ordersResult, usersResult] = await Promise.all([
        supabase.from("images").select("id", { count: "exact" }),
        supabase.from("orders").select("id, total_amount", { count: "exact" }),
        supabase.from("user_profiles").select("id", { count: "exact" }),
      ])

      // Calculate total revenue
      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      setStats({
        totalImages: imagesResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalRevenue,
        recentActivity: [
          {
            id: "1",
            type: "order",
            description: "New order received",
            timestamp: "2 hours ago",
          },
          {
            id: "2",
            type: "user",
            description: "New user registered",
            timestamp: "4 hours ago",
          },
          {
            id: "3",
            type: "image",
            description: "New image uploaded",
            timestamp: "6 hours ago",
          },
        ],
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast.error("Failed to load dashboard statistics")
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchAnalyticsData = async () => {
    if (!mounted || typeof window === "undefined") return

    setLoadingAnalytics(true)
    try {
      const supabase = createClient()

      // Mock analytics data - in real app, this would come from database queries
      setAnalyticsData({
        salesChart: [
          { month: "Jan", revenue: 1200, orders: 15 },
          { month: "Feb", revenue: 1800, orders: 22 },
          { month: "Mar", revenue: 2400, orders: 28 },
          { month: "Apr", revenue: 2100, orders: 25 },
          { month: "May", revenue: 2800, orders: 32 },
          { month: "Jun", revenue: 3200, orders: 38 },
        ],
        topImages: [
          { title: "Sunset Beach 360°", downloads: 145, revenue: 725 },
          { title: "Mountain Peak Fisheye", downloads: 132, revenue: 660 },
          { title: "City Skyline 360°", downloads: 118, revenue: 590 },
          { title: "Forest Path Fisheye", downloads: 95, revenue: 475 },
          { title: "Ocean View 360°", downloads: 87, revenue: 435 },
        ],
        userGrowth: [
          { month: "Jan", users: 45 },
          { month: "Feb", users: 62 },
          { month: "Mar", users: 78 },
          { month: "Apr", users: 94 },
          { month: "May", users: 112 },
          { month: "Jun", users: 135 },
        ],
        downloadTrends: [
          { category: "360° Images", downloads: 342 },
          { category: "Fisheye Images", downloads: 278 },
          { category: "Panoramic", downloads: 156 },
          { category: "VR Ready", downloads: 89 },
        ],
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast.error("Failed to load analytics data")
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const fetchOrders = async () => {
    if (!mounted || typeof window === "undefined") return

    setLoadingOrders(true)
    try {
      const supabase = createClient()

      let query = supabase
        .from("orders")
        .select(`
          id,
          user_email,
          total_amount,
          status,
          customer_name,
          created_at,
          updated_at,
          order_items (
            id,
            license_type,
            price,
            images (
              title
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (orderFilter !== "all") {
        query = query.eq("status", orderFilter)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform the data to flatten image titles
      const transformedOrders =
        data?.map((order) => ({
          ...order,
          order_items: order.order_items?.map((item) => ({
            id: item.id,
            image_title: item.images?.title || "Unknown Image",
            license_type: item.license_type,
            price: item.price,
          })),
        })) || []

      setOrders(transformedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setLoadingOrders(false)
    }
  }

  const fetchUsers = async () => {
    if (!mounted || typeof window === "undefined") return

    setLoadingUsers(true)
    try {
      const supabase = createClient()

      // Fetch users with their order statistics
      const { data: usersData, error: usersError } = await supabase
        .from("user_profiles")
        .select(`
          id,
          email,
          full_name,
          avatar_url,
          is_admin,
          created_at,
          updated_at
        `)
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      // Fetch order statistics for each user
      const usersWithStats = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: orderStats, error: orderError } = await supabase
            .from("orders")
            .select("total_amount, created_at")
            .eq("user_email", user.email)
            .eq("status", "completed")

          if (orderError) {
            console.error("Error fetching order stats for user:", user.email, orderError)
            return {
              ...user,
              order_count: 0,
              total_spent: 0,
              last_order_date: null,
            }
          }

          const orderCount = orderStats?.length || 0
          const totalSpent = orderStats?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
          const lastOrderDate =
            orderStats?.length > 0
              ? orderStats.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                  .created_at
              : null

          return {
            ...user,
            order_count: orderCount,
            total_spent: totalSpent,
            last_order_date: lastOrderDate,
          }
        }),
      )

      setUsers(usersWithStats)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchImages = async () => {
    if (!mounted || typeof window === "undefined") return

    setLoadingImages(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase.from("images").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setImages(data || [])
    } catch (error) {
      console.error("Error fetching images:", error)
      toast.error("Failed to load images")
    } finally {
      setLoadingImages(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      toast.success(`Order status updated to ${newStatus}`)
      fetchOrders() // Refresh orders list
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    }
  }

  const toggleUserAdmin = async (userId: string, currentAdminStatus: boolean) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("user_profiles")
        .update({
          is_admin: !currentAdminStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error

      toast.success(`User admin status ${!currentAdminStatus ? "granted" : "revoked"}`)
      fetchUsers() // Refresh users list
    } catch (error) {
      console.error("Error updating user admin status:", error)
      toast.error("Failed to update user admin status")
    }
  }

  const toggleImageStatus = async (imageId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("images")
        .update({
          active: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", imageId)

      if (error) throw error

      toast.success(`Image ${!currentStatus ? "activated" : "deactivated"}`)
      fetchImages() // Refresh images list
    } catch (error) {
      console.error("Error updating image status:", error)
      toast.error("Failed to update image status")
    }
  }

  const toggleImageFeatured = async (imageId: string, currentFeatured: boolean) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("images")
        .update({
          featured: !currentFeatured,
          updated_at: new Date().toISOString(),
        })
        .eq("id", imageId)

      if (error) throw error

      toast.success(`Image ${!currentFeatured ? "featured" : "unfeatured"}`)
      fetchImages() // Refresh images list
    } catch (error) {
      console.error("Error updating image featured status:", error)
      toast.error("Failed to update image featured status")
    }
  }

  const deleteImage = async (imageId: string, imageTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${imageTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase.from("images").delete().eq("id", imageId)

      if (error) throw error

      toast.success(`Image "${imageTitle}" deleted successfully`)
      fetchImages() // Refresh images list
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("Failed to delete image")
    }
  }

  const handleEditImage = (image: ImageData) => {
    setEditingImage(image)
    setIsEditDialogOpen(true)
  }

  const handleUpdateImage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingImage) return

    const formData = new FormData(e.currentTarget)

    try {
      const supabase = createClient()

      const imageData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        price: Number.parseFloat(formData.get("price") as string),
        file_url: formData.get("file_url") as string,
        preview_url: formData.get("preview_url") as string,
        thumbnail_url: formData.get("thumbnail_url") as string,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("images").update(imageData).eq("id", editingImage.id)

      if (error) throw error

      toast.success("Image updated successfully!")
      setIsEditDialogOpen(false)
      setEditingImage(null)
      fetchImages() // Refresh images list
    } catch (error) {
      console.error("Error updating image:", error)
      toast.error("Failed to update image")
    }
  }

  const handleLogin = () => {
    if (password === "C4rlit0s") {
      setIsAuthenticated(true)
      toast.success("Admin access granted")
      fetchDashboardStats()
    } else {
      toast.error("Invalid password")
    }
  }

  const handleImageUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    if (!mounted || typeof window === "undefined") return

    try {
      const supabase = createClient()

      const imageData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        price: Number.parseFloat(formData.get("price") as string),
        file_url: formData.get("file_url") as string,
        preview_url: formData.get("preview_url") as string,
        thumbnail_url: formData.get("thumbnail_url") as string,
        active: true,
        featured: false,
      }

      const { error } = await supabase.from("images").insert([imageData])

      if (error) throw error

      toast.success("Image added successfully!")
      e.currentTarget.reset()
      fetchImages()
    } catch (error) {
      console.error("Error adding image:", error)
      toast.error("Failed to add image")
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      userSearchTerm === "" ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(userSearchTerm.toLowerCase())

    const matchesFilter =
      userFilter === "all" || (userFilter === "admin" && user.is_admin) || (userFilter === "regular" && !user.is_admin)

    return matchesSearch && matchesFilter
  })

  const filteredImages = images.filter((image) => {
    const matchesSearch =
      imageSearchTerm === "" ||
      image.title.toLowerCase().includes(imageSearchTerm.toLowerCase()) ||
      image.description?.toLowerCase().includes(imageSearchTerm.toLowerCase()) ||
      image.category.toLowerCase().includes(imageSearchTerm.toLowerCase())

    const matchesFilter =
      imageFilter === "all" ||
      (imageFilter === "active" && image.active) ||
      (imageFilter === "inactive" && !image.active) ||
      (imageFilter === "featured" && image.featured)

    return matchesSearch && matchesFilter
  })

  if (!mounted) {
    return <div className="p-8">Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter admin password to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">n3urali.art Admin</h1>
            <p className="text-gray-600 mt-1">Manage your 360° image marketplace</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchDashboardStats} disabled={loadingStats}>
              <Activity className="h-4 w-4 mr-2" />
              {loadingStats ? "Loading..." : "Refresh"}
            </Button>
            <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
              Logout
            </Button>
          </div>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("dashboard")}
            className="flex-1"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("orders")}
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Orders
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("users")}
            className="flex-1"
          >
            <Users className="w-4 h-4 mr-2" />
            Users
          </Button>
          <Button
            variant={activeTab === "images" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("images")}
            className="flex-1"
          >
            <Images className="w-4 h-4 mr-2" />
            Images
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveTab("analytics")
              fetchAnalyticsData()
            }}
            className="flex-1"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        {activeTab === "dashboard" && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Images</CardTitle>
                  <Images className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalImages}</div>
                  <p className="text-xs text-muted-foreground">360° and fisheye images</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">Customer purchases</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered customers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">All-time earnings</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common admin tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => window.open("/gallery", "_blank")}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Gallery
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setActiveTab("orders")}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Manage Orders
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => toast.info("Feature coming soon")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => toast.info("Feature coming soon")}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0">
                        {activity.type === "order" && <ShoppingCart className="h-4 w-4 text-green-600" />}
                        {activity.type === "user" && <Users className="h-4 w-4 text-blue-600" />}
                        {activity.type === "image" && <Images className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Order Management</h2>
                <p className="text-gray-600">View and manage customer orders</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={orderFilter} onValueChange={(value: any) => setOrderFilter(value)}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingOrders ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                  <p className="text-gray-600">No orders match your current filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {order.user_email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />${order.total_amount.toFixed(2)}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusBadgeColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                              <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Order Items:</h4>
                          <div className="space-y-2">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{item.image_title}</span>
                                  <Badge className={getLicenseBadgeColor(item.license_type)} variant="secondary">
                                    {item.license_type}
                                  </Badge>
                                </div>
                                <span className="font-semibold text-sm">${item.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-gray-600">View and manage registered users</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={userFilter} onValueChange={(value: any) => setUserFilter(value)}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="regular">Regular Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingUsers ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No users found</h3>
                  <p className="text-gray-600">No users match your current filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {user.full_name || "Unnamed User"}
                            {user.is_admin && <Badge className="bg-purple-100 text-purple-800">Admin</Badge>}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Joined {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={user.is_admin ? "destructive" : "default"}
                            size="sm"
                            onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                          >
                            {user.is_admin ? "Revoke Admin" : "Make Admin"}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{user.order_count || 0} Orders</p>
                            <p className="text-xs text-gray-500">Total purchases</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">${(user.total_spent || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Total spent</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">
                              {user.last_order_date ? new Date(user.last_order_date).toLocaleDateString() : "Never"}
                            </p>
                            <p className="text-xs text-gray-500">Last order</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "images" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Image Management</h2>
                <p className="text-gray-600">Manage your 360° and fisheye image collection</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search images..."
                    value={imageSearchTerm}
                    onChange={(e) => setImageSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={imageFilter} onValueChange={(value: any) => setImageFilter(value)}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Images</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Add Image Form */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Image
                  </CardTitle>
                  <CardDescription>Upload a new 360° or fisheye image to your marketplace</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleImageUpload} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" required />
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select id="category" name="category" className="w-full p-2 border rounded-md" required>
                        <option value="">Select category</option>
                        <option value="360">360° Images</option>
                        <option value="fisheye">Fisheye Images</option>
                        <option value="panoramic">Panoramic</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" rows={3} />
                    </div>

                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input id="price" name="price" type="number" step="0.01" required />
                    </div>

                    <div>
                      <Label htmlFor="file_url">Image URL</Label>
                      <Input id="file_url" name="file_url" type="url" required />
                    </div>

                    <div>
                      <Label htmlFor="preview_url">Preview URL</Label>
                      <Input id="preview_url" name="preview_url" type="url" />
                    </div>

                    <div>
                      <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                      <Input id="thumbnail_url" name="thumbnail_url" type="url" />
                    </div>

                    <Button type="submit" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Images List */}
              <div className="lg:col-span-2 space-y-4">
                {loadingImages ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-32 bg-gray-200 rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredImages.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Images className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No images found</h3>
                      <p className="text-gray-600">No images match your current filters</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredImages.map((image) => (
                      <Card key={image.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="relative w-20 h-20 flex-shrink-0">
                                <Image
                                  src={
                                    image.thumbnail_url || image.preview_url || "/placeholder.svg?height=80&width=80"
                                  }
                                  alt={image.title}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                              <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {image.title}
                                  {image.featured && (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                      <Star className="h-3 w-3 mr-1" />
                                      Featured
                                    </Badge>
                                  )}
                                  <Badge variant={image.active ? "default" : "secondary"}>
                                    {image.active ? "Active" : "Inactive"}
                                  </Badge>
                                </CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Images className="h-4 w-4" />
                                    {image.category}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />${image.price.toFixed(2)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(image.created_at).toLocaleDateString()}
                                  </span>
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleImageFeatured(image.id, image.featured)}
                              >
                                <Star className={`h-4 w-4 ${image.featured ? "fill-current" : ""}`} />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleImageStatus(image.id, image.active)}
                              >
                                {image.active ? (
                                  <ToggleRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleEditImage(image)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteImage(image.id, image.title)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {image.description && (
                          <CardContent>
                            <p className="text-sm text-gray-600">{image.description}</p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Image Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Image</DialogTitle>
                  <DialogDescription>Update the details for "{editingImage?.title}"</DialogDescription>
                </DialogHeader>
                {editingImage && (
                  <form onSubmit={handleUpdateImage} className="space-y-4">
                    <div>
                      <Label htmlFor="edit-title">Title</Label>
                      <Input id="edit-title" name="title" defaultValue={editingImage.title} required />
                    </div>

                    <div>
                      <Label htmlFor="edit-category">Category</Label>
                      <select
                        id="edit-category"
                        name="category"
                        className="w-full p-2 border rounded-md"
                        defaultValue={editingImage.category}
                        required
                      >
                        <option value="">Select category</option>
                        <option value="360">360° Images</option>
                        <option value="fisheye">Fisheye Images</option>
                        <option value="panoramic">Panoramic</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        name="description"
                        defaultValue={editingImage.description || ""}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-price">Price ($)</Label>
                      <Input
                        id="edit-price"
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={editingImage.price}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-file_url">Image URL</Label>
                      <Input
                        id="edit-file_url"
                        name="file_url"
                        type="url"
                        defaultValue={editingImage.file_url}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-preview_url">Preview URL</Label>
                      <Input
                        id="edit-preview_url"
                        name="preview_url"
                        type="url"
                        defaultValue={editingImage.preview_url || ""}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-thumbnail_url">Thumbnail URL</Label>
                      <Input
                        id="edit-thumbnail_url"
                        name="thumbnail_url"
                        type="url"
                        defaultValue={editingImage.thumbnail_url || ""}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        Update Image
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Analytics & Reports</h2>
                <p className="text-gray-600">Insights into your business performance</p>
              </div>
            </div>

            {loadingAnalytics ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$84.50</div>
                      <p className="text-xs text-green-600">+12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3.2%</div>
                      <p className="text-xs text-green-600">+0.4% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">865</div>
                      <p className="text-xs text-blue-600">+18% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Return Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">42%</div>
                      <p className="text-xs text-green-600">+5% from last month</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Sales Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue & Orders</CardTitle>
                      <CardDescription>Monthly performance over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.salesChart.map((data, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 text-sm font-medium">{data.month}</div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <div className="h-2 bg-gray-200 rounded-full flex-1 max-w-[120px]">
                                    <div
                                      className="h-2 bg-orange-600 rounded-full"
                                      style={{ width: `${(data.revenue / 3200) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">${data.revenue}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">{data.orders} orders</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Growth */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                      <CardDescription>New user registrations by month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.userGrowth.map((data, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 text-sm font-medium">{data.month}</div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <div className="h-2 bg-gray-200 rounded-full flex-1 max-w-[120px]">
                                    <div
                                      className="h-2 bg-blue-600 rounded-full"
                                      style={{ width: `${(data.users / 135) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">{data.users} users</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bottom Row */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Top Performing Images */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Images</CardTitle>
                      <CardDescription>Best selling images by downloads and revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.topImages.map((image, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{image.title}</p>
                              <p className="text-xs text-gray-500">{image.downloads} downloads</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">${image.revenue}</p>
                              <p className="text-xs text-gray-500">revenue</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Download Trends by Category */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Download Trends</CardTitle>
                      <CardDescription>Downloads by image category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.downloadTrends.map((trend, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-24 text-sm font-medium">{trend.category}</div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <div className="h-2 bg-gray-200 rounded-full flex-1 max-w-[100px]">
                                    <div
                                      className="h-2 bg-purple-600 rounded-full"
                                      style={{ width: `${(trend.downloads / 342) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">{trend.downloads}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
