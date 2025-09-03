"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Loader2, Upload, Eye, Trash2, Database, BarChart3 } from "lucide-react"

interface Image {
  id: string
  title: string
  description: string
  category_name?: string
  price: number
  image_url: string
  thumbnail_url: string
  active: boolean
  created_at: string
}

interface Category {
  id: string
  name: string
  description: string
  display_name?: string // Added display_name property for category display names
}

interface DatabaseStats {
  images: number
  categories: number
  orders: number
}

export default function SimpleAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [images, setImages] = useState<Image[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newImage, setNewImage] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    file: null as File | null,
    preview: "",
  })

  useEffect(() => {
    console.log("[v0] SimpleAdmin: Clearing any existing auth and forcing login")
    localStorage.removeItem("simple_admin_auth")
    setIsAuthenticated(false)
  }, [])

  const getCategoryDisplayName = (category: Category) => {
    return category.display_name || category.name
  }

  const getCategoryBadgeName = (categoryName: string) => {
    if (categoryName === "equirectangular") return "360°"
    if (categoryName === "fisheye") return "180°"
    return categoryName
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] SimpleAdmin: Login attempt")

    if (password === "C4rlit0s") {
      console.log("[v0] SimpleAdmin: Login successful")
      setIsAuthenticated(true)
      localStorage.setItem("simple_admin_auth", "true")
      await loadInitialData()
    } else {
      console.log("[v0] SimpleAdmin: Login failed")
      setError("Invalid password")
      toast.error("Invalid password. Use: C4rlit0s")
    }
  }

  const loadInitialData = async () => {
    console.log("[v0] SimpleAdmin: Loading initial data")
    setLoading(true)
    setError(null)

    try {
      // Dynamic import to avoid middleware issues
      const { getImages, getCategories, getDatabaseStats } = await import("@/app/actions/admin-actions")

      const [imagesResult, categoriesResult, statsResult] = await Promise.all([
        getImages(),
        getCategories(),
        getDatabaseStats(),
      ])

      if (imagesResult.success) {
        setImages(imagesResult.data)
        console.log("[v0] SimpleAdmin: Loaded", imagesResult.data.length, "images")
      } else {
        console.error("[v0] SimpleAdmin: Failed to load images:", imagesResult.error)
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data)
        console.log("[v0] SimpleAdmin: Loaded", categoriesResult.data.length, "categories")
      } else {
        console.error("[v0] SimpleAdmin: Failed to load categories:", categoriesResult.error)
      }

      if (statsResult.success) {
        setStats(statsResult.data)
        console.log("[v0] SimpleAdmin: Loaded database stats:", statsResult.data)
      } else {
        console.error("[v0] SimpleAdmin: Failed to load stats:", statsResult.error)
      }
    } catch (error) {
      console.error("[v0] SimpleAdmin: Error loading data:", error)
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleCleanupSampleImages = async () => {
    if (!confirm("Are you sure you want to delete all sample/placeholder images? This action cannot be undone.")) {
      return
    }

    setCleaning(true)
    try {
      const { cleanupSampleImages } = await import("@/app/actions/admin-actions")
      const result = await cleanupSampleImages()

      if (result.success) {
        toast.success(result.message || `Deleted ${result.data.length} sample images`)
        await loadInitialData() // Reload data to reflect changes
      } else {
        toast.error("Failed to cleanup sample images: " + result.error)
      }
    } catch (error) {
      console.error("[v0] SimpleAdmin: Cleanup error:", error)
      toast.error("Failed to cleanup sample images")
    } finally {
      setCleaning(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("[v0] SimpleAdmin: File selected:", file.name)

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const preview = e.target?.result as string
        setNewImage((prev) => ({ ...prev, file, preview }))
        console.log("[v0] SimpleAdmin: File preview generated")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] SimpleAdmin: Starting image upload")

    if (!newImage.file) {
      toast.error("Please select an image file")
      return
    }

    if (!newImage.title || !newImage.category || !newImage.price) {
      toast.error("Please fill in all required fields")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const { createImageWithCategory } = await import("@/app/actions/admin-actions")

      const formData = new FormData()
      formData.append("title", newImage.title)
      formData.append("description", newImage.description)
      formData.append("category", newImage.category)
      formData.append("price", newImage.price)
      formData.append("file_url", newImage.preview)
      formData.append("thumbnail_url", newImage.preview)

      console.log("[v0] SimpleAdmin: Calling server action")
      const result = await createImageWithCategory(formData)

      if (result.success) {
        console.log("[v0] SimpleAdmin: Upload successful")
        toast.success("Image uploaded successfully!")

        // Reset form
        setNewImage({
          title: "",
          description: "",
          category: "",
          price: "",
          file: null,
          preview: "",
        })

        // Reload images
        await loadInitialData()
      } else {
        console.error("[v0] SimpleAdmin: Upload failed:", result.error)
        setError(result.error || "Upload failed")
        toast.error("Upload failed: " + (result.error || "Unknown error"))
      }
    } catch (error) {
      console.error("[v0] SimpleAdmin: Upload error:", error)
      setError("Upload failed")
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const { deleteImage } = await import("@/app/actions/admin-actions")
      const result = await deleteImage(imageId)

      if (result.success) {
        toast.success("Image deleted successfully")
        await loadInitialData()
      } else {
        toast.error("Failed to delete image")
      }
    } catch (error) {
      console.error("[v0] SimpleAdmin: Delete error:", error)
      toast.error("Failed to delete image")
    }
  }

  const handleLogout = () => {
    console.log("[v0] SimpleAdmin: Logging out")
    setIsAuthenticated(false)
    localStorage.removeItem("simple_admin_auth")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-orange-600">n3urali.art Admin</CardTitle>
            <CardDescription className="text-lg">Enter password to access admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-lg font-medium">
                  Admin Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="mt-1 text-lg h-12"
                  autoFocus
                  required
                />
                <p className="text-sm text-gray-500 mt-1 font-medium">Password: C4rlit0s</p>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-lg">{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-lg h-12">
                Access Admin Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">n3urali.art Admin</h1>
            <p className="text-xl text-gray-600 font-medium">Photo Upload & Management</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="text-lg h-12 px-6 bg-transparent">
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-600 text-lg">{error}</AlertDescription>
          </Alert>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Images</p>
                    <p className="text-2xl font-bold">{stats.images}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Categories</p>
                    <p className="text-2xl font-bold">{stats.categories}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Orders</p>
                    <p className="text-2xl font-bold">{stats.orders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Button
                  onClick={handleCleanupSampleImages}
                  disabled={cleaning}
                  variant="destructive"
                  className="w-full h-full"
                >
                  {cleaning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Cleanup Samples
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Upload className="h-6 w-6" />
                Upload New Photo
              </CardTitle>
              <CardDescription className="text-lg">Add a new image to the gallery</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleImageUpload} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-lg font-medium">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={newImage.title}
                    onChange={(e) => setNewImage((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter image title"
                    className="text-lg h-12"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-lg font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newImage.description}
                    onChange={(e) => setNewImage((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter image description"
                    rows={3}
                    className="text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-lg font-medium">
                    Category *
                  </Label>
                  <select
                    id="category"
                    value={newImage.category}
                    onChange={(e) => setNewImage((prev) => ({ ...prev, category: e.target.value }))}
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {getCategoryDisplayName(cat)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="price" className="text-lg font-medium">
                    Price (USD) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newImage.price}
                    onChange={(e) => setNewImage((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="29.99"
                    className="text-lg h-12"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="file" className="text-lg font-medium">
                    Image File *
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="cursor-pointer text-lg h-12"
                    required
                  />
                </div>

                {newImage.preview && (
                  <div>
                    <Label className="text-lg font-medium">Preview</Label>
                    <img
                      src={newImage.preview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full max-w-xs h-32 object-cover rounded border mt-2"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={uploading || !newImage.file}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-lg h-12"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Photo"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Images List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Eye className="h-6 w-6" />
                Uploaded Photos ({images.length})
              </CardTitle>
              <CardDescription className="text-lg">Manage your uploaded images</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-lg">Loading images...</span>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-lg">No images uploaded yet</div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {images.map((image) => (
                    <div key={image.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <img
                        src={image.thumbnail_url || image.image_url}
                        alt={image.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-lg">{image.title}</h4>
                        <p className="text-base text-gray-500">{getCategoryBadgeName(image.category_name || "")}</p>
                        <p className="text-base font-medium">${image.price}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(image.id)}
                        className="h-10 w-10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
