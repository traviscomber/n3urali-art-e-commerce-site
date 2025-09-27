"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { createImageWithCategoryObject } from "@/app/actions/admin-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Save, X, Upload, LogOut, Database, Loader2 } from "lucide-react"

interface Image {
  id: string
  title: string
  description: string
  category_name?: string
  license_name?: string
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
  display_name?: string
}

interface License {
  id: string
  name: string
  description: string
  price: number
  metadata?: {
    resolution?: string
    formats?: string[]
    use_cases?: string[]
    exclusivity?: boolean
    resale_rights?: boolean
    nft_rights?: boolean
  }
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
  const [licenses, setLicenses] = useState<License[]>([])
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    rightsType: "",
  })
  const [newImage, setNewImage] = useState({
    title: "",
    description: "",
    category: "",
    rightsType: "both",
    price: "",
    file: null as File | null,
    preview: "",
    originalFileUrl: "",
  })
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    console.log("[v0] SimpleAdmin: Authentication required")
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
    setError(null)

    if (password === "C4rlit0s") {
      console.log("[v0] SimpleAdmin: Login successful")
      setIsAuthenticated(true)
      setPassword("")
      await loadInitialData()
    } else {
      console.log("[v0] SimpleAdmin: Login failed")
      setError("Invalid password")
      toast.error("Invalid password. Use: C4rlit0s")
      setPassword("")
    }
  }

  const loadInitialData = async () => {
    console.log("[v0] SimpleAdmin: Loading initial data")
    setLoading(true)
    setError(null)

    try {
      const { getImages, getCategories, getLicenses, getDatabaseStats } = await import("@/app/actions/admin-actions")

      const [imagesResult, categoriesResult, licensesResult, statsResult] = await Promise.all([
        getImages(),
        getCategories(),
        getLicenses(),
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

      if (licensesResult.success) {
        setLicenses(licensesResult.data)
        console.log("[v0] SimpleAdmin: Loaded", licensesResult.data.length, "licenses")
      } else {
        console.error("[v0] SimpleAdmin: Failed to load licenses:", licensesResult.error)
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
        await loadInitialData()
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log("[v0] SimpleAdmin: File selected:", file.name, (file.size / (1024 * 1024)).toFixed(2), "MB")

    try {
      const reader = new FileReader()
      const previewPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const preview = await previewPromise
      setNewImage((prev) => ({ ...prev, file, preview }))
      console.log("[v0] SimpleAdmin: File preview generated for", (file.size / (1024 * 1024)).toFixed(2), "MB file")
    } catch (error) {
      console.error("[v0] SimpleAdmin: Error processing file:", error)
      toast.error("Error processing file. Please try again.")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find((file) => file.type.startsWith("image/"))

    if (imageFile) {
      handleFileSelect({ target: { files: [imageFile] } } as React.ChangeEvent<HTMLInputElement>)
    } else {
      toast.error("Please drop an image file")
    }
  }

  const handleImageUpload = async () => {
    if (!newImage.file) return

    setUploading(true)
    setUploadError(null)
    try {
      console.log("[v0] Starting image upload process...")

      const fileSizeMB = newImage.file.size / (1024 * 1024)
      console.log(`[v0] Original file size: ${fileSizeMB.toFixed(2)}MB`)

      let imageUrl: string
      let thumbnailBase64: string

      console.log("[v0] Using Supabase storage...")

      // Get presigned URL for Supabase upload
      const presignedResponse = await fetch("/api/supabase/presigned-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: newImage.file.name,
          contentType: newImage.file.type || "application/octet-stream",
        }),
      })

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json()
        throw new Error(errorData.error || "Failed to get upload URL")
      }

      const { uploadUrl, key } = await presignedResponse.json()
      console.log("[v0] Got Supabase presigned URL, key:", key)

      // Upload directly to Supabase using PUT method
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": newImage.file.type || "application/octet-stream",
        },
        body: newImage.file,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error("[v0] Upload response error:", uploadResponse.status, errorText)
        throw new Error(`Failed to upload file to Supabase: ${uploadResponse.status} ${uploadResponse.statusText}`)
      }

      // Construct the public URL
      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${key}`
      console.log("[v0] File uploaded successfully to Supabase:", imageUrl)

      // Generate thumbnail from the uploaded image
      console.log("[v0] Generating thumbnail...")
      const img = new Image()
      img.crossOrigin = "anonymous"

      try {
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = (event) => {
            console.log("[v0] Image failed to load for thumbnail generation:", event)
            reject(new Error("Failed to load image for thumbnail generation"))
          }
          img.src = imageUrl
        })

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!

        // Calculate thumbnail dimensions (max 400px)
        const maxSize = 400
        let { width, height } = img
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        thumbnailBase64 = canvas.toDataURL("image/jpeg", 0.8)

        console.log("[v0] Thumbnail generated successfully")
      } catch (thumbnailError) {
        console.log("[v0] Thumbnail generation failed, creating placeholder:", thumbnailError)
        // Create a simple placeholder thumbnail
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        canvas.width = 400
        canvas.height = 300

        // Fill with a gradient background
        const gradient = ctx.createLinearGradient(0, 0, 400, 300)
        gradient.addColorStop(0, "#f3f4f6")
        gradient.addColorStop(1, "#e5e7eb")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 400, 300)

        // Add placeholder text
        ctx.fillStyle = "#6b7280"
        ctx.font = "16px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Image Preview", 200, 150)

        thumbnailBase64 = canvas.toDataURL("image/jpeg", 0.8)
        console.log("[v0] Placeholder thumbnail created")
      }

      const imageData = {
        title: newImage.title,
        description: newImage.description,
        category_name: newImage.category,
        rights_type: newImage.rightsType,
        price: Number.parseFloat(newImage.price) || 0,
        image_url: imageUrl,
        thumbnail_url: thumbnailBase64,
        original_file_size: newImage.file.size,
      }

      const result = await createImageWithCategoryObject(imageData)

      if (!result.success) {
        throw new Error(result.error || "Failed to save image")
      }

      console.log("[v0] Image saved successfully")
      setNewImage({
        title: "",
        description: "",
        category: "",
        rightsType: "both",
        price: "",
        file: null,
        preview: "",
        originalFileUrl: "",
      })
      await loadInitialData()
    } catch (error) {
      console.error("[v0] Upload error:", error)
      setUploadError(error instanceof Error ? error.message : "Upload failed")
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

  const handleEditStart = (image: Image) => {
    setEditingImage(image.id)
    setEditValues({
      title: image.title,
      price: image.price.toString(),
      description: image.description || "",
      category: image.category_name || "",
      rightsType: "both", // Default since we don't store this separately
    })
  }

  const handleEditCancel = () => {
    setEditingImage(null)
    setEditValues({ title: "", price: "", description: "", category: "", rightsType: "" })
  }

  const handleEditSave = async (imageId: string) => {
    if (!editValues.title.trim()) {
      toast.error("Title cannot be empty")
      return
    }

    const price = Number.parseFloat(editValues.price)
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price")
      return
    }

    if (!editValues.category) {
      toast.error("Please select a category")
      return
    }

    try {
      const { updateImageDetails } = await import("@/app/actions/admin-actions")
      const result = await updateImageDetails(imageId, {
        title: editValues.title.trim(),
        price: price,
        description: editValues.description.trim(),
        category: editValues.category,
        rightsType: editValues.rightsType,
      })

      if (result.success) {
        toast.success("Image updated successfully")
        setEditingImage(null)
        setEditValues({ title: "", price: "", description: "", category: "", rightsType: "" })
        await loadInitialData()
      } else {
        toast.error("Failed to update image: " + result.error)
      }
    } catch (error) {
      console.error("[v0] SimpleAdmin: Update error:", error)
      toast.error("Failed to update image")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Simple Admin</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Images</p>
                    <p className="text-2xl font-bold">{stats.images}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Categories</p>
                    <p className="text-2xl font-bold">{stats.categories}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Orders</p>
                    <p className="text-2xl font-bold">{stats.orders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={newImage.title}
                  onChange={(e) => setNewImage((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Image title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newImage.price}
                  onChange={(e) => setNewImage((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newImage.description}
                onChange={(e) => setNewImage((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Image description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newImage.category}
                  onChange={(e) => setNewImage((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {getCategoryDisplayName(category)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rights Type</label>
                <select
                  value={newImage.rightsType}
                  onChange={(e) => setNewImage((prev) => ({ ...prev, rightsType: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="both">Both Personal & Commercial</option>
                  <option value="personal">Personal Only</option>
                  <option value="commercial">Commercial Only</option>
                </select>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-medium">Image File</label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {newImage.preview ? (
                  <div className="space-y-4">
                    <img
                      src={newImage.preview || "/placeholder.svg"}
                      alt="Preview"
                      className="max-w-full max-h-64 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-600">
                      {newImage.file?.name} ({((newImage.file?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewImage((prev) => ({ ...prev, file: null, preview: "" }))
                      }}
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium">Drop your image here</p>
                      <p className="text-sm text-gray-600">or click to browse</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement("input")
                        input.type = "file"
                        input.accept = "image/*"
                        input.onchange = (e) => handleFileSelect(e as any)
                        input.click()
                      }}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{uploadError}</p>
              </div>
            )}

            <Button
              onClick={handleImageUpload}
              disabled={uploading || !newImage.file || !newImage.title || !newImage.category || !newImage.price}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Database Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCleanupSampleImages} disabled={cleaning} variant="destructive">
              {cleaning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cleanup Sample Images
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Images List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={
                      image.image_url
                        ? `/api/image-proxy?url=${encodeURIComponent(image.image_url)}`
                        : image.thumbnail_url
                    }
                    alt={image.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to thumbnail if proxy fails
                      const target = e.target as HTMLImageElement
                      if (target.src.includes("/api/image-proxy")) {
                        target.src = image.thumbnail_url || "/placeholder.svg?height=300&width=400"
                      }
                    }}
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button size="sm" variant="secondary" onClick={() => handleEditStart(image)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteImage(image.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  {editingImage === image.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editValues.title}
                        onChange={(e) => setEditValues((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Title"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={editValues.price}
                        onChange={(e) => setEditValues((prev) => ({ ...prev, price: e.target.value }))}
                        placeholder="Price"
                      />
                      <Textarea
                        value={editValues.description}
                        onChange={(e) => setEditValues((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Description"
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleEditSave(image.id)}>
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleEditCancel}>
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{image.title}</h3>
                      <p className="text-2xl font-bold text-green-600">${image.price}</p>
                      {image.description && <p className="text-sm text-gray-600 line-clamp-2">{image.description}</p>}
                      {image.category_name && (
                        <Badge variant="secondary">{getCategoryBadgeName(image.category_name)}</Badge>
                      )}
                      <p className="text-xs text-gray-500">
                        Created: {new Date(image.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
