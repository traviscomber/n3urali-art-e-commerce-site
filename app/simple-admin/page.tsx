"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getImages, createImageWithCategory, getOrders, getCategories } from "@/app/actions/admin-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Trash2, Edit, Loader2 } from "lucide-react"

interface Image {
  id: string
  title: string
  description: string
  category_id: string
  category_name?: string
  price: number
  image_url: string
  thumbnail_url: string
  active: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

interface Order {
  id: string
  user_email: string
  total_amount: number
  status: string
  customer_name: string
  created_at: string
  order_items: Array<{
    id: string
    image_title: string
    license_type: string
    price: number
  }>
}

interface User {
  id: string
  email: string
  full_name: string
  is_admin: boolean
  created_at: string
}

interface DashboardStats {
  totalImages: number
  totalOrders: number
  totalRevenue: number
  totalUsers: number
}

interface Category {
  id: string
  name: string
  description: string
  active: boolean
}

export default function SimpleAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [images, setImages] = useState<Image[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalImages: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [editingImage, setEditingImage] = useState<Image | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [categories, setCategories] = useState<Category[]>([])

  // Form states
  const [newImage, setNewImage] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    file_url: "",
    preview_url: "",
    thumbnail_url: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "C4rlit0s") {
      setIsAuthenticated(true)
      localStorage.setItem("simple_admin_auth", "true")
      await fetchDashboardStats()
    } else {
      toast.error("Invalid password. Hint: C4rlit0s")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("simple_admin_auth")
  }

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Form submission started")

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    console.log("[v0] Form data entries:")
    for (const [key, value] of formData.entries()) {
      console.log(`[v0] ${key}:`, value)
    }

    setUploadingFile(true)
    try {
      console.log("[v0] Calling createImageWithCategory server action")
      const result = await createImageWithCategory(formData)
      console.log("[v0] Server action result:", result)

      if (result.success) {
        toast.success("Image uploaded successfully")
        setNewImage({
          title: "",
          description: "",
          category: "",
          price: "",
          file_url: "",
          preview_url: "",
          thumbnail_url: "",
        })
        form.reset()
        fetchImages()
      } else {
        console.log("[v0] Server action failed:", result.error)
        toast.error(`Failed to upload image: ${result.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("[v0] Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploadingFile(false)
    }
  }

  useEffect(() => {
    if (localStorage.getItem("simple_admin_auth") === "true") {
      setIsAuthenticated(true)
      fetchDashboardStats()
    }
  }, [])

  const fetchDashboardStats = async () => {
    setLoading(true)
    try {
      const imagesResult = await getImages()
      if (imagesResult.success) {
        setImages(imagesResult.data)
        setStats((prev) => ({ ...prev, totalImages: imagesResult.data.length }))
      }

      const ordersResult = await getOrders()
      if (ordersResult.success) {
        setOrders(ordersResult.data)
        const revenue = ordersResult.data.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)
        setStats((prev) => ({
          ...prev,
          totalOrders: ordersResult.data.length,
          totalRevenue: revenue,
        }))
      }

      const categoriesResult = await getCategories()
      if (categoriesResult.success) {
        setCategories(categoriesResult.data)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const fetchImages = async () => {
    try {
      const result = await getImages()
      if (result.success) {
        setImages(result.data)
      } else {
        toast.error("Failed to load images")
      }
    } catch (error) {
      console.error("Error fetching images:", error)
      toast.error("Failed to load images")
    }
  }

  const fetchOrders = async () => {
    try {
      const result = await getOrders()
      if (result.success) {
        setOrders(result.data)
      } else {
        toast.error("Failed to load orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to load orders")
    }
  }

  const fetchUsers = async () => {
    try {
      toast.info("User management functionality is being updated")
      setUsers([])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    }
  }

  const handleFileUpload = async (file: File) => {
    console.log("[v0] Starting file upload process for:", file.name)
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return null
    }

    setUploadingFile(true)
    try {
      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      console.log("[v0] File converted to data URL successfully")
      setNewImage((prev) => ({
        ...prev,
        file_url: dataUrl,
        thumbnail_url: dataUrl,
      }))

      toast.success("File processed successfully")
      return dataUrl
    } catch (error) {
      console.error("[v0] Error processing file:", error)
      toast.error("Failed to process file")
    } finally {
      setUploadingFile(false)
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[v0] File input changed")
    const file = e.target.files?.[0]
    if (file) {
      console.log("[v0] Processing selected file:", file.name)
      await handleFileUpload(file)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      toast.info("Order status update functionality is being updated")
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    }
  }

  const toggleUserAdmin = async (userId: string, currentAdminStatus: boolean) => {
    try {
      toast.info("User admin toggle functionality is being updated")
    } catch (error) {
      console.error("Error toggling user admin status:", error)
      toast.error("Failed to update user admin status")
    }
  }

  const deleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      toast.info("Delete functionality is being updated")
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("Failed to delete image")
    }
  }

  const updateImage = async (formData: FormData) => {
    if (!editingImage) return

    try {
      toast.info("Update functionality is being updated")
    } catch (error) {
      console.error("Error updating image:", error)
      toast.error("Failed to update image")
    }
  }

  const handleEditImage = (image: Image) => {
    setEditingImage(image)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

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

  useEffect(() => {
    fetchImages()
    fetchOrders()
    fetchUsers()
  }, [isAuthenticated])

  if (!isAuthenticated) {
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Simple Admin Dashboard</h1>
          <p className="text-gray-500">Manage your content and users.</p>
          <Button onClick={handleLogout} className="mt-2">
            Logout
          </Button>
        </div>

        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard" onClick={() => setActiveTab("dashboard")}>
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="images" onClick={() => setActiveTab("images")}>
              Images
            </TabsTrigger>
            <TabsTrigger value="orders" onClick={() => setActiveTab("orders")}>
              Orders
            </TabsTrigger>
            <TabsTrigger value="users" onClick={() => setActiveTab("users")}>
              Users
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Images</CardTitle>
                  <CardDescription>Number of images in the database</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalImages}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Orders</CardTitle>
                  <CardDescription>Number of orders placed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Revenue</CardTitle>
                  <CardDescription>Total revenue generated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Users</CardTitle>
                  <CardDescription>Number of registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="images">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Image</CardTitle>
                  <CardDescription>Upload a new image to the database.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="image-upload-form" onSubmit={handleImageUpload} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        type="text"
                        id="title"
                        name="title"
                        value={newImage.title}
                        onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={newImage.description}
                        onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        name="category"
                        value={newImage.category}
                        onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        type="number"
                        id="price"
                        name="price"
                        value={newImage.price}
                        onChange={(e) => setNewImage({ ...newImage, price: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="image-file">Upload Image File</Label>
                      <Input
                        type="file"
                        id="image-file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        disabled={uploadingFile}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Choose an image file to upload, or enter URLs manually below
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="file_url">Image URL (or auto-filled from upload)</Label>
                      <Input
                        type="url"
                        id="file_url"
                        name="file_url"
                        value={newImage.file_url}
                        onChange={(e) => setNewImage({ ...newImage, file_url: e.target.value })}
                        placeholder="https://example.com/image.jpg or upload file above"
                      />
                    </div>
                    <div>
                      <Label htmlFor="thumbnail_url">Thumbnail URL (optional)</Label>
                      <Input
                        type="url"
                        id="thumbnail_url"
                        name="thumbnail_url"
                        value={newImage.thumbnail_url}
                        onChange={(e) => setNewImage({ ...newImage, thumbnail_url: e.target.value })}
                        placeholder="Auto-filled from upload or enter custom URL"
                      />
                    </div>

                    {newImage.file_url && (
                      <div>
                        <Label>Preview</Label>
                        <img
                          src={newImage.file_url || "/placeholder.svg"}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded border"
                          onError={() => console.log("[v0] Preview image failed to load")}
                        />
                      </div>
                    )}

                    <Button type="submit" disabled={uploadingFile || !newImage.file_url}>
                      {uploadingFile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving to Database...
                        </>
                      ) : (
                        "Save Image to Database"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                  <CardDescription>List of images in the database.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Alert>
                      <Loader2 className="mr-2 h-4 w-4" />
                      <AlertDescription>Fetching images...</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {images.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.thumbnail_url || "/placeholder.svg"}
                            alt={image.title}
                            className="w-full rounded-md"
                          />
                          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-md">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditImage(image)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteImage(image.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>List of orders in the database.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Alert>
                    <Loader2 className="mr-2 h-4 w-4" />
                    <AlertDescription>Fetching orders...</AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {orders.map((order) => (
                      <Card key={order.id}>
                        <CardHeader>
                          <CardTitle>Order #{order.id}</CardTitle>
                          <CardDescription>Placed on {new Date(order.created_at).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>Customer: {order.customer_name}</p>
                          <p>Email: {order.user_email}</p>
                          <p>Total: ${order.total_amount}</p>
                          <Badge>{order.status}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>List of users in the database.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Alert>
                    <Loader2 className="mr-2 h-4 w-4" />
                    <AlertDescription>Fetching users...</AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {users.map((user) => (
                      <Card key={user.id}>
                        <CardHeader>
                          <CardTitle>{user.full_name}</CardTitle>
                          <CardDescription>Joined on {new Date(user.created_at).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>Email: {user.email}</p>
                          <Badge>{user.is_admin ? "Admin" : "User"}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
