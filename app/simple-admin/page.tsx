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
import { Loader2, Upload, Eye, Trash2, Database, BarChart3, Crown, Edit2, Check, X } from "lucide-react"

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
  const [newImage, setNewImage] = useState<NewImage>({
    title: "",
    description: "",
    category: "",
    rightsType: "both",
    price: "",
    file: null,
    preview: "",
  })
  const [highQualityMode, setHighQualityMode] = useState(false)

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

  const compressImageOnClient = (file: File, maxSizeKB = 2000): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()

      img.onload = () => {
        // Calculate compression ratio based on file size
        const fileSizeKB = file.size / 1024
        const compressionRatio = fileSizeKB > maxSizeKB ? Math.sqrt(maxSizeKB / fileSizeKB) * 0.8 : 1

        // Set canvas dimensions
        canvas.width = Math.floor(img.width * compressionRatio)
        canvas.height = Math.floor(img.height * compressionRatio)

        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        let quality = 0.8
        let compressedDataUrl = canvas.toDataURL("image/jpeg", quality)

        // Reduce quality until we're under the size limit
        while ((compressedDataUrl.length * 3) / 4 / 1024 > maxSizeKB && quality > 0.1) {
          quality -= 0.05
          compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
        }

        console.log(
          `[v0] Client compression: ${fileSizeKB.toFixed(1)}KB -> ${((compressedDataUrl.length * 3) / 4 / 1024).toFixed(1)}KB (quality: ${quality})`,
        )
        resolve(compressedDataUrl)
      }

      img.onerror = () => reject(new Error("Failed to load image for compression"))
      img.src = URL.createObjectURL(file)
    })
  }

  const uploadInChunks = async (imageData: any, compressedImage: string, compressedThumbnail: string) => {
    const SAFE_UPLOAD_SIZE = 2 * 1024 * 1024 // 2MB chunks (safely under 4MB Vercel limit)

    // If compressed image is small enough, upload normally
    const totalSize = ((compressedImage.length + compressedThumbnail.length) * 3) / 4 / 1024 / 1024 // Size in MB

    if (totalSize < 2) {
      console.log(`[v0] File small enough (${totalSize.toFixed(1)}MB), uploading normally`)
      return await createImageWithCategoryObject({
        ...imageData,
        image_url: compressedImage,
        thumbnail_url: compressedThumbnail,
      })
    }

    // For files between 2-4MB, apply more aggressive compression
    console.log(`[v0] File over 2MB (${totalSize.toFixed(1)}MB), applying aggressive compression`)

    const aggressiveImage = await compressImageOnClient(newImage.file!, 1200) // More aggressive compression
    const aggressiveThumbnail = await compressImageOnClient(newImage.file!, 200) // Smaller thumbnail

    const newTotalSize = ((aggressiveImage.length + aggressiveThumbnail.length) * 3) / 4 / 1024 / 1024

    if (newTotalSize < 2) {
      console.log(`[v0] Aggressive compression successful (${newTotalSize.toFixed(1)}MB), uploading`)
      return await createImageWithCategoryObject({
        ...imageData,
        image_url: aggressiveImage,
        thumbnail_url: aggressiveThumbnail,
      })
    }

    console.log(`[v0] Still over 2MB (${newTotalSize.toFixed(1)}MB), applying ultra-aggressive compression`)

    const ultraImage = await compressImageOnClient(newImage.file!, 800) // Ultra compression
    const ultraThumbnail = await compressImageOnClient(newImage.file!, 150) // Ultra small thumbnail

    const ultraTotalSize = ((ultraImage.length + ultraThumbnail.length) * 3) / 4 / 1024 / 1024

    if (ultraTotalSize < 2) {
      console.log(`[v0] Ultra compression successful (${ultraTotalSize.toFixed(1)}MB), uploading`)
      return await createImageWithCategoryObject({
        ...imageData,
        image_url: ultraImage,
        thumbnail_url: ultraThumbnail,
      })
    }

    // If still too large, return error
    throw new Error(
      `File too large even after ultra compression (${ultraTotalSize.toFixed(1)}MB). Maximum supported size is 2MB. Please use a smaller image or contact support.`,
    )
  }

  const handleFileSelect = async (file: File) => {
    console.log("[v0] SimpleAdmin: File selected:", file.name, "Size:", (file.size / (1024 * 1024)).toFixed(2), "MB")

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 200 * 1024 * 1024) {
      toast.error("File size too large. Please select a file under 200MB for optimal performance.")
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.warning("Large file detected. Applying compression for upload optimization...")
    }

    try {
      const compressedPreview = await compressImageOnClient(file, 500) // Small preview

      setNewImage((prev) => ({ ...prev, file, preview: compressedPreview }))
      console.log(
        "[v0] SimpleAdmin: File preview generated and compressed for",
        (file.size / (1024 * 1024)).toFixed(2),
        "MB file",
      )
    } catch (error) {
      console.error("[v0] SimpleAdmin: Error processing file:", error)
      toast.error("Error processing file. Please try again.")
    }
  }

  const handleInputFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
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
      handleFileSelect(imageFile)
    } else {
      toast.error("Please drop an image file")
    }
  }

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log(
      "[v0] SimpleAdmin: Starting image upload for",
      newImage.file?.name,
      "Size:",
      newImage.file ? (newImage.file.size / (1024 * 1024)).toFixed(2) + "MB" : "unknown",
    )

    if (!newImage.file) {
      toast.error("Please select an image file")
      return
    }

    if (!newImage.title || !newImage.category || !newImage.rightsType || !newImage.price) {
      toast.error("Please fill in all required fields including price")
      return
    }

    setUploading(true)
    setError(null)

    try {
      if (newImage.file.size > 50 * 1024 * 1024) {
        toast.info("Processing large file with advanced compression... This may take a moment.")
      }

      const compressedImage = await compressImageOnClient(newImage.file, 2000) // Main image
      const compressedThumbnail = await compressImageOnClient(newImage.file, 500) // Thumbnail

      const imageData = {
        title: newImage.title,
        description: newImage.description,
        category_name: newImage.category,
        rights_type: newImage.rightsType,
        price: Number.parseFloat(newImage.price) || 0,
        original_file_size: newImage.file.size,
      }

      const result = await uploadInChunks(imageData, compressedImage, compressedThumbnail)

      if (result.success) {
        console.log(
          "[v0] SimpleAdmin: Upload successful for",
          (newImage.file.size / (1024 * 1024)).toFixed(2),
          "MB file",
        )
        toast.success("Large image uploaded successfully with optimized compression!")

        setNewImage({
          title: "",
          description: "",
          category: "",
          rightsType: "both",
          price: "",
          file: null,
          preview: "",
        })

        await loadInitialData()
      } else {
        console.error("[v0] SimpleAdmin: Upload failed:", result.error)
        setError(result.error || "Upload failed")
        toast.error("Upload failed: " + (result.error || "Unknown error"))
      }
    } catch (error) {
      console.error("[v0] SimpleAdmin: Upload error:", error)

      if (error instanceof Error) {
        if (
          error.message.includes("Request Entity Too Large") ||
          error.message.includes("413") ||
          error.message.includes("FUNCTION_PAYLOAD_TOO_LARGE")
        ) {
          setError("File too large for server after compression. Please use a smaller file.")
          toast.error("File too large even after compression. Please use a smaller image or contact support.")
        } else if (error.message.includes("timeout") || error.message.includes("network")) {
          setError("Upload timeout. Please check your connection and try again.")
          toast.error("Upload timeout. Please check your internet connection and try again.")
        } else {
          setError("Upload failed: " + error.message)
          toast.error("Upload failed: " + error.message)
        }
      } else {
        setError("Upload failed")
        toast.error("Upload failed")
      }
    } finally {
      setUploading(false)
    }
  }

  const handleHighQualityUpload = async () => {
    const { file, title, description, category, rightsType, price } = newImage

    if (!file || !title || !description || !category || !rightsType || !price) {
      toast.error("Please fill in all fields and select a file")
      return
    }

    setUploading(true)
    try {
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const base64Image = await base64Promise

      const result = await createImageWithCategoryObject({
        title,
        description,
        category_name: category,
        rights_type: rightsType,
        price: Number.parseFloat(price),
        image_url: base64Image, // Full quality image
        thumbnail_url: base64Image, // Use same image as thumbnail for HQ uploads
        resolution: "4K-16K (Full HQ)",
        active: true,
      })

      if (result.success) {
        console.log("[v0] High-quality upload successful")
        toast.success("High-quality image uploaded successfully!")

        setNewImage({
          title: "",
          description: "",
          category: "",
          rightsType: "both",
          price: "",
          file: null,
          preview: "",
        })

        await loadInitialData()
      } else {
        console.error("[v0] High-quality upload failed:", result.error)
        setError(result.error || "High-quality upload failed")
        toast.error("Upload failed: " + (result.error || "Unknown error"))
      }
    } catch (error) {
      console.error("[v0] High-quality upload error:", error)
      setError("High-quality upload failed")
      toast.error("High-quality upload failed")
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
              <CardDescription className="text-lg">
                Add a new full resolution image (4K-16K) to the premium gallery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={highQualityMode ? handleHighQualityUpload : handleImageUpload} className="space-y-4">
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
                        <SelectItem key={cat.id} value={cat.name} className="text-lg">
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
                      onChange={handleInputFileSelect}
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
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center">
                          <Upload className={`h-8 w-8 ${isDragOver ? "text-orange-600" : "text-gray-400"}`} />
                        </div>
                        <p className={`text-lg font-medium ${isDragOver ? "text-orange-700" : "text-gray-700"}`}>
                          {isDragOver ? "Drop your HQ image here" : "Drag & drop your HQ image here (4K-16K)"}
                        </p>
                        <p className="text-sm text-gray-500">or click to browse files</p>
                        <p className="text-xs text-gray-400">High Quality Only: JPG, PNG, WebP (Max: 200MB)</p>
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
                            src={newImage.preview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full sm:w-32 h-32 object-cover rounded border shadow-sm"
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

                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="highQualityMode"
                    checked={highQualityMode}
                    onChange={(e) => setHighQualityMode(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="highQualityMode" className="text-sm font-medium">
                    High-Quality Mode (4K-16K without compression)
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={uploading || !newImage.file}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-lg h-12"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {highQualityMode ? "Uploading High-Quality..." : "Uploading..."}
                    </>
                  ) : (
                    `${highQualityMode ? "Upload High-Quality" : "Upload Compressed"} Image`
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
              <CardDescription className="text-lg">
                Manage your full resolution premium collection (4K-16K)
              </CardDescription>
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
                                  <SelectItem key={cat.id} value={cat.name} className="text-sm">
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
