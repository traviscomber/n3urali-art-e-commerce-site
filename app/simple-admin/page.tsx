"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getImages, createImage, updateImage } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { BarChart3, ShoppingCart, ImageIcon, Upload, Eye, EyeOff, Star, StarOff, LogOut, Plus } from "lucide-react"

interface ImageData {
  id: string
  title: string
  description: string
  category: string
  price: number
  file_url: string
  preview_url: string
  thumbnail_url: string
  active: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

interface DashboardStats {
  totalImages: number
  activeImages: number
  featuredImages: number
  totalOrders: number
}

export default function SimpleAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"dashboard" | "images">("dashboard")
  const [stats, setStats] = useState<DashboardStats>({
    totalImages: 0,
    activeImages: 0,
    featuredImages: 0,
    totalOrders: 0,
  })
  const [images, setImages] = useState<ImageData[]>([])
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    setMounted(true)
    const adminSession = localStorage.getItem("admin_session")
    if (adminSession === "active") {
      setIsAuthenticated(true)
      fetchDashboardStats()
      fetchImages()
    }
  }, [])

  const fetchDashboardStats = async () => {
    if (!mounted) return
    setLoadingStats(true)
    try {
      const imagesData = await getImages()
      const safeImagesData = Array.isArray(imagesData) ? imagesData : []
      const totalImages = safeImagesData.length
      const activeImages = safeImagesData.filter((img: any) => img.active).length
      const featuredImages = safeImagesData.filter((img: any) => img.featured).length

      setStats({
        totalImages,
        activeImages,
        featuredImages,
        totalOrders: 0, // Mock data for now
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      toast.error("Failed to load dashboard stats")
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchImages = async () => {
    if (!mounted) return
    setLoadingImages(true)
    try {
      const imagesData = await getImages()
      setImages(Array.isArray(imagesData) ? imagesData : [])
    } catch (error) {
      console.error("Error fetching images:", error)
      toast.error("Failed to load images")
      setImages([])
    } finally {
      setLoadingImages(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (password === "C4rlit0s") {
        setIsAuthenticated(true)
        localStorage.setItem("admin_session", "active")
        await fetchDashboardStats()
        await fetchImages()
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

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin_session")
    toast.success("Logged out successfully")
  }

  const toggleImageStatus = async (imageId: string) => {
    try {
      const image = images.find((img) => img.id === imageId)
      if (!image) return

      await updateImage(imageId, { active: !image.active })
      await fetchImages() // Refresh the list
      toast.success(`Image ${!image.active ? "activated" : "deactivated"}`)
    } catch (error) {
      console.error("Error updating image status:", error)
      toast.error("Failed to update image status")
    }
  }

  const toggleImageFeatured = async (imageId: string) => {
    try {
      const image = images.find((img) => img.id === imageId)
      if (!image) return

      await updateImage(imageId, { featured: !image.featured })
      await fetchImages() // Refresh the list
      toast.success(`Image ${!image.featured ? "featured" : "unfeatured"}`)
    } catch (error) {
      console.error("Error updating image featured status:", error)
      toast.error("Failed to update featured status")
    }
  }

  const handleFileUpload = async (file: File, formData: FormData) => {
    setUploadingFile(true)
    try {
      // Convert file to base64 for immediate display
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Url = e.target?.result as string

        const imageData = {
          title: formData.get("title") as string,
          description: (formData.get("description") as string) || "",
          category: formData.get("category") as string,
          price: Number.parseFloat(formData.get("price") as string) || 0,
          file_url: base64Url,
          preview_url: base64Url,
          thumbnail_url: base64Url,
          active: true,
          featured: false,
        }

        await createImage(imageData)
        await fetchImages() // Refresh the list
        await fetchDashboardStats() // Update stats
        toast.success("Image uploaded successfully!")
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploadingFile(false)
    }
  }

  const handleImageUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get("image") as File

    if (!file) {
      toast.error("Please select an image file")
      return
    }

    await handleFileUpload(file, formData)

    // Reset form
    e.currentTarget.reset()
  }

  const addSampleData = async () => {
    const sampleImages = [
      {
        title: "Sunset Beach 360°",
        description:
          "Stunning 360° panoramic view of a tropical beach at sunset with crystal clear waters and palm trees",
        category: "Nature & Landscapes",
        price: 29.99,
        file_url:
          "/placeholder.svg?height=800&width=800&text=Sunset+Beach+360°+panoramic+view+of+tropical+beach+at+golden+hour",
        preview_url: "/placeholder.svg?height=400&width=400&text=Sunset+Beach+360°+preview",
        thumbnail_url: "/placeholder.svg?height=200&width=200&text=Sunset+Beach+thumbnail",
        active: true,
        featured: true,
      },
      {
        title: "Modern Office Interior",
        description: "Professional 360° view of a contemporary office space with modern furniture and natural lighting",
        category: "Interior Spaces",
        price: 39.99,
        file_url:
          "/placeholder.svg?height=800&width=800&text=Modern+office+interior+360°+view+with+contemporary+furniture",
        preview_url: "/placeholder.svg?height=400&width=400&text=Modern+office+interior+preview",
        thumbnail_url: "/placeholder.svg?height=200&width=200&text=Modern+office+thumbnail",
        active: true,
        featured: false,
      },
      {
        title: "City Skyline Fisheye",
        description: "Dynamic fisheye perspective of a bustling city skyline with skyscrapers and urban architecture",
        category: "Urban & Architecture",
        price: 24.99,
        file_url:
          "/placeholder.svg?height=800&width=800&text=City+skyline+fisheye+view+with+skyscrapers+and+urban+architecture",
        preview_url: "/placeholder.svg?height=400&width=400&text=City+skyline+fisheye+preview",
        thumbnail_url: "/placeholder.svg?height=200&width=200&text=City+skyline+thumbnail",
        active: true,
        featured: true,
      },
    ]

    try {
      for (const imageData of sampleImages) {
        await createImage(imageData)
      }
      await fetchImages()
      await fetchDashboardStats()
      toast.success("Sample data added successfully!")
    } catch (error) {
      console.error("Error adding sample data:", error)
      toast.error("Failed to add sample data")
    }
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

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find((file) => file.type.startsWith("image/"))

    if (imageFile) {
      const formData = new FormData()
      formData.append("title", imageFile.name.replace(/\.[^/.]+$/, ""))
      formData.append("description", "")
      formData.append("category", "Nature & Landscapes")
      formData.append("price", "29.99")

      await handleFileUpload(imageFile, formData)
    }
  }

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">n3urali.art Admin</CardTitle>
            <p className="text-sm text-gray-600 text-center">Enter password to access admin dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="C4rlit0s"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Hint: C4rlit0s</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">n3urali.art Admin</h1>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="images">
              <ImageIcon className="w-4 h-4 mr-2" />
              Images
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <ImageIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Images</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalImages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Eye className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Images</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeImages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Featured</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.featuredImages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <ShoppingCart className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={() => setActiveTab("images")} className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Photo
                  </Button>
                  <Button onClick={addSampleData} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sample Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <form onSubmit={handleImageUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input id="title" name="title" placeholder="e.g., Sunset Beach 360°" required />
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          name="category"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        >
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
                        <Label htmlFor="image">Image File</Label>
                        <Input id="image" name="image" type="file" accept="image/*" required />
                      </div>
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

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={uploadingFile}>
                      {uploadingFile ? "Uploading..." : "💾 Save Image to Database"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Images ({images.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingImages ? (
                  <div className="text-center py-8">Loading images...</div>
                ) : images.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No images found. Upload your first image above!</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((image) => (
                      <div key={image.id} className="border rounded-lg p-4 space-y-3">
                        <img
                          src={image.thumbnail_url || image.preview_url || image.file_url}
                          alt={image.title}
                          className="w-full h-32 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-semibold text-sm">{image.title}</h3>
                          <p className="text-xs text-gray-600 line-clamp-2">{image.description}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant={image.active ? "default" : "secondary"}>
                            {image.active ? "Active" : "Inactive"}
                          </Badge>
                          {image.featured && <Badge variant="outline">Featured</Badge>}
                          <Badge variant="outline">${image.price}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => toggleImageStatus(image.id)}>
                            {image.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleImageFeatured(image.id)}>
                            {image.featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
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
