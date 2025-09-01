"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createBrowserClient } from "@supabase/ssr"
import { getImages, createImage } from "@/lib/actions"

interface DashboardStats {
  totalImages: number
  activeImages: number
  featuredImages: number
  totalOrders: number
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
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "users" | "images" | "analytics">("dashboard")
  const [stats, setStats] = useState<DashboardStats>({
    totalImages: 0,
    activeImages: 0,
    featuredImages: 0,
    totalOrders: 0,
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
  const [uploadingFile, setUploadingFile] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)

    // Check if admin is already logged in (simple session check)
    const adminSession = localStorage.getItem("admin_session")
    if (adminSession === "active") {
      setUser({
        id: "admin",
        email: "admin@n3urali.art",
        user_metadata: { full_name: "Admin" },
      })
      fetchDashboardStats()
    }
  }, [])

  const fetchDashboardStats = async () => {
    if (!mounted || typeof window === "undefined") return

    try {
      const imagesData = await getImages()
      const totalImages = imagesData?.length || 0
      const activeImages = imagesData?.filter((img) => img.active)?.length || 0
      const featuredImages = imagesData?.filter((img) => img.featured)?.length || 0

      setStats({
        totalImages,
        activeImages,
        featuredImages,
        totalOrders: 0, // Will be implemented when orders are added to database
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setStats({
        totalImages: 0,
        activeImages: 0,
        featuredImages: 0,
        totalOrders: 0,
      })
    }
  }

  const populateSampleData = async () => {
    const sampleImages = [
      {
        title: "Sunset Beach 360°",
        description:
          "Stunning 360° panoramic view of a tropical beach at sunset with crystal clear waters and palm trees",
        category: "Nature & Landscapes",
        price: 29.99,
        file_url: "/placeholder.svg?height=800&width=800&text=Sunset+Beach+360",
        preview_url: "/placeholder.svg?height=400&width=400&text=Sunset+Beach+Preview",
        thumbnail_url: "/placeholder.svg?height=200&width=200&text=Sunset+Beach+Thumb",
      },
      {
        title: "Modern Office Interior",
        description: "Professional 360° view of a contemporary office space with modern furniture and natural lighting",
        category: "Interior Spaces",
        price: 39.99,
        file_url: "/placeholder.svg?height=800&width=800&text=Modern+Office+360",
        preview_url: "/placeholder.svg?height=400&width=400&text=Modern+Office+Preview",
        thumbnail_url: "/placeholder.svg?height=200&width=200&text=Modern+Office+Thumb",
      },
      {
        title: "City Skyline Fisheye",
        description: "Dynamic fisheye perspective of a bustling city skyline with skyscrapers and urban architecture",
        category: "Urban & Architecture",
        price: 24.99,
        file_url: "/placeholder.svg?height=800&width=800&text=City+Skyline+Fisheye",
        preview_url: "/placeholder.svg?height=400&width=400&text=City+Skyline+Preview",
        thumbnail_url: "/placeholder.svg?height=200&width=200&text=City+Skyline+Thumb",
      },
      {
        title: "Mountain Peak 360°",
        description: "Breathtaking 360° panoramic view from a mountain summit with valleys and peaks in all directions",
        category: "Nature & Landscapes",
        price: 34.99,
        file_url: "/placeholder.svg?height=800&width=800&text=Mountain+Peak+360",
        preview_url: "/placeholder.svg?height=400&width=400&text=Mountain+Peak+Preview",
        thumbnail_url: "/placeholder.svg?height=200&width=200&text=Mountain+Peak+Thumb",
      },
      {
        title: "Luxury Hotel Lobby",
        description:
          "Elegant 360° view of a five-star hotel lobby with marble floors, chandeliers, and premium furnishings",
        category: "Interior Spaces",
        price: 44.99,
        file_url: "/placeholder.svg?height=800&width=800&text=Luxury+Hotel+Lobby",
        preview_url: "/placeholder.svg?height=400&width=400&text=Luxury+Hotel+Preview",
        thumbnail_url: "/placeholder.svg?height=200&width=200&text=Luxury+Hotel+Thumb",
      },
    ]

    try {
      const supabase = createClient()

      const { data: imagesData, error: imagesError } = await supabase.from("images").select("*")
      if (imagesError) throw imagesError

      const existingImages = imagesData || []

      const newImages = sampleImages.map((imageData) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...imageData,
        active: true,
        featured: Math.random() > 0.5, // Randomly feature some images
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const updatedImages = [...existingImages, ...newImages]
      const { error: insertError } = await supabase.from("images").insert(updatedImages)
      if (insertError) throw insertError

      toast.success("Sample data added successfully!")
      await fetchImages() // Refresh the list
    } catch (error) {
      console.error("Error adding sample data:", error)
      toast.error("Failed to add sample data")
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

  const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[v0] Missing Supabase admin credentials")
      return createClient() // Fallback to regular client
    }

    return createBrowserClient(supabaseUrl, serviceRoleKey)
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return null
    }

    setUploadingFile(true)
    try {
      // Convert file to base64 data URL for immediate display
      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      toast.success("File processed successfully")
      return dataUrl
    } catch (error) {
      console.error("Error processing file:", error)
      toast.error("Failed to process file")
      return null
    } finally {
      setUploadingFile(false)
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

  const fetchImages = async () => {
    try {
      const imagesData = await getImages()
      setImages(imagesData || [])
    } catch (error) {
      console.error("Error fetching images:", error)
      setImages([])
    }
  }

  const toggleImageStatus = async (imageId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("images")
        .update({ active: !images.find((img) => img.id === imageId)?.active })
        .eq("id", imageId)
      if (error) throw error

      await fetchImages()
      toast.success(`Image ${!images.find((img) => img.id === imageId)?.active ? "activated" : "deactivated"}`)
    } catch (error) {
      console.error("Error updating image status:", error)
      toast.error("Failed to update image status")
    }
  }

  const toggleImageFeatured = async (imageId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("images")
        .update({ featured: !images.find((img) => img.id === imageId)?.featured })
        .eq("id", imageId)
      if (error) throw error

      await fetchImages()
      toast.success(`Image ${!images.find((img) => img.id === imageId)?.featured ? "featured" : "unfeatured"}`)
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (password === "C4rlit0s") {
        const adminUser = {
          id: "admin",
          email: "admin@n3urali.art",
          user_metadata: { full_name: "Admin" },
        }
        setUser(adminUser)
        localStorage.setItem("admin_session", "active")
        fetchDashboardStats()
        toast.success("Admin access granted")
      } else {
        throw new Error("Invalid password")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Invalid password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setUser(null)
    localStorage.removeItem("admin_session")
    toast.success("Logged out successfully")
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const url = await handleFileUpload(file)
      if (url) {
        const form = document.getElementById("image-upload-form") as HTMLFormElement
        if (form) {
          ;(form.elements.namedItem("file_url") as HTMLInputElement).value = url
          ;(form.elements.namedItem("preview_url") as HTMLInputElement).value = url
          ;(form.elements.namedItem("thumbnail_url") as HTMLInputElement).value = url
        }
      }
    }
  }

  const handleImageUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get("image") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const price = Number.parseFloat(formData.get("price") as string)

    if (!file || !title || !description || !category || !price) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64String = event.target?.result as string

        const imageData = {
          title,
          description,
          category,
          price,
          file_url: base64String,
          preview_url: base64String,
          thumbnail_url: base64String,
          active: true,
          featured: false,
        }

        const { error } = await createImage(imageData)
        if (error) throw error

        await fetchImages()
        toast.success("Image added successfully!")

        e.currentTarget.reset()
        setUploadedFiles([])
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
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

  const addSampleData = async () => {
    const sampleImages = [
      {
        title: "Sunset Beach 360°",
        description:
          "Stunning 360° panoramic view of a tropical beach at sunset with crystal clear waters and palm trees",
        category: "Nature & Landscapes",
        price: 29.99,
        file_url: "/placeholder.svg?height=800&width=1600",
        preview_url: "/placeholder.svg?height=400&width=800",
        thumbnail_url: "/placeholder.svg?height=200&width=200",
      },
      {
        title: "Modern Office Interior",
        description: "Professional 360° view of a contemporary office space with modern furniture and natural lighting",
        category: "Interior Spaces",
        price: 39.99,
        file_url: "/placeholder.svg?height=800&width=1600",
        preview_url: "/placeholder.svg?height=400&width=800",
        thumbnail_url: "/placeholder.svg?height=200&width=200",
      },
      {
        title: "City Skyline Fisheye",
        description: "Dramatic fisheye view of urban cityscape with skyscrapers and bustling street life",
        category: "Urban & Architecture",
        price: 24.99,
        file_url: "/placeholder.svg?height=800&width=800",
        preview_url: "/placeholder.svg?height=400&width=400",
        thumbnail_url: "/placeholder.svg?height=200&width=200",
      },
    ]

    try {
      const supabase = createClient()

      const { data: imagesData, error: imagesError } = await supabase.from("images").select("*")
      if (imagesError) throw imagesError

      const existingImages = imagesData || []

      const newImages = sampleImages.map((imageData) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...imageData,
        active: true,
        featured: Math.random() > 0.5, // Randomly feature some images
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const updatedImages = [...existingImages, ...newImages]
      const { error: insertError } = await supabase.from("images").insert(updatedImages)
      if (insertError) throw insertError

      toast.success("Sample data added successfully!")
      await fetchImages() // Refresh the list
    } catch (error) {
      console.error("Error adding sample data:", error)
      toast.error("Failed to add sample data")
    }
  }

  useEffect(() => {
    if (user) {
      fetchImages()
    }
  }, [user])

  if (!mounted) {
    return <div className="p-8">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Sign in with your admin account to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@n3urali.art"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Hint: Use password "C4rlit0s" for admin access</p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your n3urali.art e-commerce platform</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sign Out
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: "📊" },
              { id: "images", label: "Images", icon: "🖼️" },
              { id: "orders", label: "Orders", icon: "📦" },
              { id: "users", label: "Users", icon: "👥" },
              { id: "analytics", label: "Analytics", icon: "📈" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveTab("images")}
                    className="h-20 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">📸</div>
                      <div>Upload New Photo</div>
                    </div>
                  </Button>
                  <Button onClick={populateSampleData} className="h-20 bg-green-600 hover:bg-green-700 text-white">
                    <div className="text-center">
                      <div className="text-2xl mb-1">📊</div>
                      <div>Add Sample Data</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("analytics")}
                    className="h-20 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">📈</div>
                      <div>View Analytics</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">🖼️</div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Images</p>
                      <p className="text-2xl font-bold">{stats.totalImages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">📦</div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">👥</div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">💰</div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold">${stats.totalRevenue}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Image Upload Form */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Image</CardTitle>
                    <CardDescription>Upload a new 360° or fisheye image</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form id="image-upload-form" onSubmit={handleImageUpload} className="space-y-4">
                      {/* Drag and Drop Area */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="text-4xl mb-2">📸</div>
                        <p className="text-sm text-gray-600 mb-2">Drag and drop your image here, or click to browse</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const url = await handleFileUpload(file)
                              if (url) {
                                const form = document.getElementById("image-upload-form") as HTMLFormElement
                                if (form) {
                                  ;(form.elements.namedItem("file_url") as HTMLInputElement).value = url
                                  ;(form.elements.namedItem("preview_url") as HTMLInputElement).value = url
                                  ;(form.elements.namedItem("thumbnail_url") as HTMLInputElement).value = url
                                }
                              }
                            }
                          }}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-500">
                          Browse files
                        </label>
                      </div>

                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input id="title" name="title" placeholder="e.g., Sunset Beach 360°" required />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <textarea
                          id="description"
                          name="description"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows={3}
                          placeholder="Describe your image..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          name="category"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="">Select a category</option>
                          <option value="Nature & Landscapes">Nature & Landscapes</option>
                          <option value="Interior Spaces">Interior Spaces</option>
                          <option value="Urban & Architecture">Urban & Architecture</option>
                          <option value="Fisheye">Fisheye</option>
                          <option value="Panoramic">Panoramic</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="price">Price ($)</Label>
                        <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="29.99" required />
                      </div>

                      <div>
                        <Label htmlFor="image">Image</Label>
                        <Input id="image" name="image" type="file" accept="image/*" required />
                      </div>

                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                        💾 Save Image to Database
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Images List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Images</CardTitle>
                    <CardDescription>View and manage your uploaded images</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {images.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-4">📷</div>
                          <p className="text-gray-500">No images uploaded yet</p>
                          <p className="text-sm text-gray-400">Upload your first image using the form on the left</p>
                        </div>
                      ) : (
                        images.map((image) => (
                          <div key={image.id} className="border rounded-lg p-4 bg-white">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{image.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">{image.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="bg-gray-100 px-2 py-1 rounded">{image.category}</span>
                                  <span>${image.price}</span>
                                  <span>{new Date(image.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant={image.featured ? "default" : "outline"}
                                  onClick={() => toggleImageFeatured(image.id)}
                                >
                                  ⭐ {image.featured ? "Featured" : "Feature"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant={image.active ? "default" : "outline"}
                                  onClick={() => toggleImageStatus(image.id)}
                                >
                                  {image.active ? "✅ Active" : "❌ Inactive"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would go here */}
        {activeTab === "orders" && (
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>View and manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Orders management functionality coming soon...</p>
            </CardContent>
          </Card>
        )}

        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">User management functionality coming soon...</p>
            </CardContent>
          </Card>
        )}

        {activeTab === "analytics" && (
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>View sales and performance analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Analytics functionality coming soon...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
