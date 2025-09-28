"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Upload, Eye, Trash2, Database, BarChart3, Crown, Edit2, Check, X, HardDrive } from "lucide-react"

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

interface NewImage {
  title: string
  description: string
  category: string
  rightsType: string
  price: string
  file: File | null
  preview: string
  originalFileUrl: string
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
  const [migrating, setMigrating] = useState(false)
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
  const [newImage, setNewImage] = useState<NewImage>({
    title: "",
    description: "",
    category: "",
    rightsType: "both",
    price: "",
    file: null,
    preview: "",
    originalFileUrl: "",
  })
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    console.log("[v0] SimpleAdmin: Authentication required")
    setIsAuthenticated(false)
  }, [])

  const getCategoryDisplayName = (category: Category) => {
    if (category.name === "equirectangular") {
      return "Equirectangular or 360°"
    }
    if (category.name === "fisheye") {
      return "Fisheye or 180°"
    }
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

  const handleMigrateFiles = async () => {
    if (
      !confirm(
        "This will move files under 40MB from Blob storage to database storage for better organization. Continue?",
      )
    ) {
      return
    }

    setMigrating(true)
    try {
      const { migrateFilesToOptimalStorage } = await import("@/app/actions/admin-actions")
      const result = await migrateFilesToOptimalStorage()

      if (result.success) {
        const { migrated, skipped, errors, total } = result.data
        toast.success(
          `Migration completed: ${migrated} files moved to database, ${skipped} skipped, ${errors} errors out of ${total} total files`,
        )
        await loadInitialData()
      } else {
        toast.error("Failed to migrate files: " + result.error)
      }
    } catch (error) {
      console.error("[v0] SimpleAdmin: Migration error:", error)
      toast.error("Failed to migrate files")
    } finally {
      setMigrating(false)
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

      console.log("[v0] Using Supabase storage for high-quality uploads...")

      const formData = new FormData()
      formData.append("file", newImage.file)

      const uploadResponse = await fetch("/api/supabase/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.log("[v0] Upload response error:", errorText)
        throw new Error("Failed to upload file to Supabase")
      }

      const { url } = await uploadResponse.json()
      imageUrl = url
      console.log("[v0] File uploaded successfully to Supabase:", imageUrl)

      // Generate thumbnail from the uploaded image
      console.log("[v0] Generating thumbnail...")
      const img = new Image()
      img.crossOrigin = "anonymous"

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
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

      const imageData = {
        title: newImage.title,
        description: newImage.description,
        category_id: newImage.category, // Changed from category to category_id
        rights_type: newImage.rightsType, // Changed from rightsType to rights_type
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

  const compressImage = (file: File, maxSizeMB = 2, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      img.onload = () => {
        // Calculate dimensions to keep under size limit
        let { width, height } = img
        const maxDimension = 2048 // Max dimension for compressed images

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width
            width = maxDimension
          } else {
            width = (width * maxDimension) / height
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        // Try different quality levels to get under size limit
        let currentQuality = quality
        let result = canvas.toDataURL("image/jpeg", currentQuality)

        // If still too large, reduce quality further
        while (result.length > maxSizeMB * 1024 * 1024 * 1.37 && currentQuality > 0.1) {
          // 1.37 accounts for base64 overhead
          currentQuality -= 0.1
          result = canvas.toDataURL("image/jpeg", currentQuality)
        }

        console.log(
          `[v0] Compressed image: ${(result.length / (1024 * 1024)).toFixed(2)}MB at quality ${currentQuality}`,
        )
        resolve(result)
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const createThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      img.onload = () => {
        // Smaller thumbnail dimensions
        const maxSize = 300
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

        resolve(canvas.toDataURL("image/jpeg", 0.6)) // Lower quality for thumbnails
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const handleUpload = async () => {
    if (!newImage.file) {
      setUploadError("Please select a file")
      return
    }

    const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
    if (newImage.file.size > MAX_FILE_SIZE) {
      setUploadError(
        `File size (${(newImage.file.size / 1024 / 1024).toFixed(1)}MB) exceeds 100MB limit. Please compress the file or contact support.`,
      )
      return
    }

    if (!newImage.title || !newImage.category || !newImage.rightsType || !newImage.price) {
      setUploadError("Please fill in all required fields")
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      console.log("[v0] Starting upload process...")

      const formData = new FormData()
      formData.append("file", newImage.file)

      console.log("[v0] Uploading to Supabase...")
      const uploadResponse = await fetch("/api/supabase/upload", {
        method: "POST",
        body: formData,
      })

      const uploadResult = await uploadResponse.json()
      console.log("[v0] Upload result:", uploadResult)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Upload failed")
      }

      console.log("[v0] File uploaded successfully, saving to database...")

      const imageData = {
        title: newImage.title,
        description: newImage.description,
        category_id: newImage.category, // Changed from category to category_id
        rights_type: newImage.rightsType, // Changed from rightsType to rights_type
        price: Number.parseFloat(newImage.price),
        image_url: uploadResult.url,
        thumbnail_url: uploadResult.url,
        original_file_url: newImage.originalFileUrl || null,
        active: true,
        featured: false,
      }

      const result = await createImageWithCategoryObject(imageData)

      if (result.success) {
        toast.success("Image uploaded successfully to Supabase!")
        console.log("[v0] Image saved to database successfully")

        // Reset form
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

        // Refresh images list
        await loadInitialData()
      } else {
        throw new Error(result.error || "Failed to save image")
      }
    } catch (error) {
      console.error("[v0] Upload error:", error)
      setUploadError(error instanceof Error ? error.message : "Upload failed")
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
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
            <p className="text-xl text-gray-600 font-medium">Full HQ Resolution Only - 4K to 16K Premium Images</p>
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

        {uploadError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-600 text-lg">{uploadError}</AlertDescription>
          </Alert>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
            <Card>
              <CardContent className="p-4">
                <Button
                  onClick={handleMigrateFiles}
                  disabled={migrating}
                  variant="outline"
                  className="w-full h-full border-orange-200 hover:bg-orange-50 bg-transparent"
                >
                  {migrating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    <>
                      <HardDrive className="mr-2 h-4 w-4" />
                      Organize Files
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Upload className="h-6 w-6" />
                Upload New Photo
              </CardTitle>
              <CardDescription className="text-lg">
                Add a new full resolution image (4K-16K) to the premium gallery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                  <Select
                    value={newImage.category}
                    onValueChange={(value) => setNewImage((prev) => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-lg">
                          {getCategoryDisplayName(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rightsType" className="text-lg font-medium">
                    Rights Type *
                  </Label>
                  <Select
                    value={newImage.rightsType}
                    onValueChange={(value) => setNewImage((prev) => ({ ...prev, rightsType: value }))}
                    required
                  >
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue placeholder="Select rights type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both" className="text-lg">
                        <div>
                          <div className="font-medium">Both Rights Available</div>
                          <div className="text-sm text-gray-500">
                            Exclusive & Non-Exclusive - Full HQ resolution (4K-16K)
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="exclusive" className="text-lg">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          <div>
                            <div className="font-medium">Exclusive Rights</div>
                            <div className="text-sm text-gray-500">
                              Full ownership - Complete HQ resolution (4K-16K)
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="non-exclusive" className="text-lg">
                        <div>
                          <div className="font-medium">Non-Exclusive Rights</div>
                          <div className="text-sm text-gray-500">Shared licensing - Full HQ resolution (4K-16K)</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    All images sold at full resolution (4K-16K). Pricing based on rights type and exclusivity.
                  </p>
                </div>

                <div>
                  <Label htmlFor="price" className="text-lg font-medium">
                    Price (USD) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newImage.price}
                    onChange={(e) => setNewImage((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="Enter price (e.g., 99.00)"
                    className="text-lg h-12"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Premium pricing for full HQ resolution (4K-16K). Starting from $99 for standard rights.
                  </p>
                </div>

                <div>
                  <Label className="text-lg font-medium">Image File * (Full HQ Resolution: 4K-16K)</Label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver
                        ? "border-orange-500 bg-orange-50"
                        : newImage.file
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {newImage.file ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center">
                          <Upload className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-lg font-medium text-green-700">{newImage.file.name}</p>
                        <p className="text-sm text-gray-500">{(newImage.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        <p className="text-sm text-gray-500">Click or drag to replace</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <Database className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            Will use database storage (Small file: {(newImage.file.size / (1024 * 1024)).toFixed(1)}
                            MB)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center">
                          <Upload className={`h-8 w-8 ${isDragOver ? "text-orange-600" : "text-gray-400"}`} />
                        </div>
                        <p className={`text-lg font-medium ${isDragOver ? "text-orange-700" : "text-white"}`}>
                          {isDragOver ? "Drop your HQ image here" : "Drag & drop your HQ image here (4K-16K)"}
                        </p>
                        <p className="text-sm text-gray-300">or click to browse files</p>
                        <div className="text-xs text-gray-300 space-y-1">
                          <p>High Quality Only: JPG, PNG, WebP</p>
                          <p>• Files &lt;40MB: Database storage (fast access)</p>
                          <p>• Files &gt;40MB: Supabase storage (unlimited, high quality)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {newImage.preview && (
                  <div className="space-y-3">
                    <Label className="text-lg font-medium">Preview</Label>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={newImage.preview || "/placeholder.svg?height=128&width=128&text=Preview"}
                            alt="Preview"
                            className="w-full sm:w-32 h-32 object-cover rounded border shadow-sm"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              console.log("[v0] Preview image failed to load:", newImage.preview)
                              e.currentTarget.src = "/placeholder.svg?height=128&width=128&text=Preview+Error"
                            }}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">File:</span>
                              <p className="text-gray-800 truncate">{newImage.file?.name}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Size:</span>
                              <p className="text-gray-800">
                                {newImage.file ? (newImage.file.size / (1024 * 1024)).toFixed(2) : "0"} MB
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Type:</span>
                              <p className="text-gray-800">{newImage.file?.type}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Status:</span>
                              <p className="text-green-600 font-medium">Ready to upload</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleImageUpload}
                  disabled={uploading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-lg h-12"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading to Supabase...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload to Supabase (High Quality)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Images List */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Eye className="h-6 w-6" />
                Uploaded Photos ({images.length})
              </CardTitle>
              <CardDescription className="text-lg">
                Manage your full resolution premium collection (4K-16K)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-lg">Loading images...</span>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-lg">No images uploaded yet</div>
              ) : (
                <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
                  {images.map((image) => (
                    <div key={image.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <img
                        src={
                          image.thumbnail_url || image.image_url || "/placeholder.svg?height=64&width=64&text=No+Image"
                        }
                        alt={image.title}
                        className="w-16 h-16 object-cover rounded"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          console.log("[v0] Image failed to load:", image.thumbnail_url || image.image_url)
                          e.currentTarget.src = "/placeholder.svg?height=64&width=64&text=Error"
                        }}
                        onLoad={() => {
                          console.log("[v0] Image loaded successfully:", image.thumbnail_url || image.image_url)
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        {editingImage === image.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editValues.title}
                              onChange={(e) => setEditValues((prev) => ({ ...prev, title: e.target.value }))}
                              placeholder="Image title"
                              className="text-sm"
                            />
                            <Textarea
                              value={editValues.description}
                              onChange={(e) => setEditValues((prev) => ({ ...prev, description: e.target.value }))}
                              placeholder="Description"
                              className="text-sm"
                              rows={2}
                            />
                            <Select
                              value={editValues.category}
                              onValueChange={(value) => setEditValues((prev) => ({ ...prev, category: value }))}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id} className="text-sm">
                                    {getCategoryDisplayName(cat)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={editValues.rightsType}
                              onValueChange={(value) => setEditValues((prev) => ({ ...prev, rightsType: value }))}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select rights type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="both" className="text-sm">
                                  Both Rights Available
                                </SelectItem>
                                <SelectItem value="exclusive" className="text-sm">
                                  Exclusive Rights
                                </SelectItem>
                                <SelectItem value="non-exclusive" className="text-sm">
                                  Non-Exclusive Rights
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editValues.price}
                              onChange={(e) => setEditValues((prev) => ({ ...prev, price: e.target.value }))}
                              placeholder="Price"
                              className="text-sm"
                            />
                          </div>
                        ) : (
                          <>
                            <h4 className="font-medium truncate text-lg">{image.title}</h4>
                            {image.description && <p className="text-sm text-gray-600 truncate">{image.description}</p>}
                            <p className="text-base text-gray-500">{getCategoryBadgeName(image.category_name || "")}</p>
                            <div className="flex items-center gap-2">
                              {image.license_name?.includes("EXCLUSIVE") && (
                                <Crown className="h-3 w-3 text-yellow-500" />
                              )}
                              <p className="text-base font-medium">${image.price > 0 ? image.price : "Price TBD"}</p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {editingImage === image.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleEditSave(image.id)}
                              className="h-8 w-8 bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleEditCancel}
                              className="h-8 w-8 bg-transparent"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditStart(image)}
                            className="h-8 w-8"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteImage(image.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

const createImageWithCategoryObject = async (imageData: any) => {
  const { createImageWithCategoryObject: actualFunction } = await import("@/app/actions/admin-actions")
  return actualFunction(imageData)
}
