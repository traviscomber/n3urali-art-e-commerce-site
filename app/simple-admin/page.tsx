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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, Upload, Eye, Trash2, Database, BarChart3, Crown, Edit2, Check, X, HardDrive, Tag, Tags, FileText, Calendar, DollarSign } from 'lucide-react'
import { TagManagementDashboard } from "@/components/admin/tag-management-dashboard"
import { FeaturedGalleryManager } from "@/components/admin/featured-gallery-manager"
import { CollectionsManager } from "@/components/admin/collections-manager" // Added for Collections tab
import { PaymentsManager } from "@/components/admin/payments-manager" // Added for Payments tab
import { SalesAnalyticsDashboard } from "@/components/admin/sales-analytics-dashboard" // Added import for Sales Analytics
import { BackblazeUrlManager } from "@/components/admin/backblaze-url-manager" // Added import for BackblazeUrlManager

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
  file_path?: string // New field added
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
  const [migratingTags, setMigratingTags] = useState(false)
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
  const [categoriesLoading, setCategoriesLoading] = useState(false)

  useEffect(() => {
    console.log("[v0] SimpleAdmin: Authentication required")
    setIsAuthenticated(false)
  }, [])

  const getCategoryDisplayName = (category: Category) => {
    const name = category.name.toLowerCase()
    if (name === "equirectangular") {
      return "Equirectangular or 360°"
    }
    if (name === "fisheye") {
      return "Fisheye or 180°"
    }
    if (name === "standard") {
      return "Standard"
    }
    return category.display_name || category.name
  }

  const getCategoryBadgeName = (categoryName: string) => {
    const name = categoryName?.toLowerCase() || ""
    if (name === "equirectangular") return "360°"
    if (name === "fisheye") return "180°"
    if (name === "standard") return "Standard"
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
    setCategoriesLoading(true)
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
        console.log("[v0] SimpleAdmin: Loaded", categoriesResult.data.length, "categories:", categoriesResult.data)
        categoriesResult.data.forEach(cat => {
          console.log("[v0] Category:", cat.id, cat.name, cat.display_name)
        })
      } else {
        console.error("[v0] SimpleAdmin: Failed to load categories:", categoriesResult.error)
        toast.error("Failed to load categories. Please refresh the page.")
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
      toast.error("Failed to load admin data. Please try again.")
    } finally {
      setLoading(false)
      setCategoriesLoading(false)
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

  const handleMigrateExistingTags = async () => {
    if (
      !confirm("This will migrate existing array-based tags to the new enhanced tag classification system. Continue?")
    ) {
      return
    }

    setMigratingTags(true)
    try {
      const { migrateExistingTags } = await import("@/app/actions/admin-actions")
      const result = await migrateExistingTags()

      if (result.success) {
        toast.success(result.message || "Tag migration completed successfully")
        await loadInitialData()
      } else {
        toast.error("Failed to migrate tags: " + result.error)
      }
    } catch (error) {
      console.error("[v0] SimpleAdmin: Tag migration error:", error)
      toast.error("Failed to migrate tags")
    } finally {
      setMigratingTags(false)
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
      const { createImageWithCategoryObject } = await import("@/app/actions/admin-actions")
      
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
        category_id: newImage.category,
        rights_type: newImage.rightsType,
        price: Number.parseFloat(newImage.price) || 0,
        image_url: imageUrl,
        thumbnail_url: thumbnailBase64,
        original_file_url: newImage.originalFileUrl || null,
        original_file_size: newImage.file.size,
      }

      const result = await createImageWithCategoryObject(imageData)

      if (!result.success) {
        throw new Error(result.error || "Failed to save image")
      }

      console.log("[v0] Image saved successfully")
      toast.success("Image uploaded successfully!")
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
          } else {
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
      const { createImageWithCategoryObject } = await import("@/app/actions/admin-actions")
      
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
        category_id: newImage.category,
        rights_type: newImage.rightsType,
        price: Number.parseFloat(newImage.price),
        image_url: uploadResult.url,
        thumbnail_url: uploadResult.url, // This should ideally be a generated thumbnail, not the same URL
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
            <CardTitle className="text-3xl font-bold text-orange-600">n3uralia360.art Admin</CardTitle>
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
            <h1 className="text-4xl font-bold text-gray-900">n3uralia360.art Admin</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
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
                  onClick={() => (window.location.href = "/simple-admin/contracts")}
                  variant="outline"
                  className="w-full h-full border-purple-200 hover:bg-purple-50 bg-transparent"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Contracts
                </Button>
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

        {stats && (
          <div className="mb-8">
            <Card>
              <CardContent className="p-4">
                <Button
                  onClick={handleMigrateExistingTags}
                  disabled={migratingTags}
                  variant="outline"
                  className="w-full border-blue-200 hover:bg-blue-50 bg-transparent"
                >
                  {migratingTags ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Migrating Tags...
                    </>
                  ) : (
                    <>
                      <Tags className="mr-2 h-4 w-4" />
                      Migrate Tags to Enhanced System
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="images" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            {" "}
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Image Management
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tag Management
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Featured Gallery
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Images
            </TabsTrigger>
            <TabsTrigger value="backblaze" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Backblaze URLs
            </TabsTrigger>
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Sales Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Eye className="h-5 w-5" />
                  Image Management ({images.length} images)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image) => (
                      <Card key={image.id} className="overflow-hidden">
                        <div className="aspect-video relative">
                          <img
                            src={image.thumbnail_url || image.image_url}
                            alt={image.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          {editingImage === image.id ? (
                            <div className="space-y-2">
                              <Input
                                value={editValues.title}
                                onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                                placeholder="Title"
                              />
                              <Input
                                type="number"
                                value={editValues.price}
                                onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                                placeholder="Price"
                              />
                              <Textarea
                                value={editValues.description}
                                onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                                placeholder="Description"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleEditSave(image.id)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleEditCancel}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-semibold">{image.title}</h3>
                              <p className="text-sm text-muted-foreground">${image.price}</p>
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline" onClick={() => handleEditStart(image)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteImage(image.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags" className="space-y-6">
            <TagManagementDashboard />
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <FeaturedGalleryManager />
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Upload New Photo</CardTitle>
                <CardDescription>Add a new full resolution image (4K-16K) to the premium gallery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newImage.title}
                    onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                    placeholder="Enter image title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newImage.description}
                    onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                    placeholder="Enter image description"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  {categoriesLoading ? (
                    <div className="flex items-center gap-2 p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading categories...</span>
                    </div>
                  ) : categories.length === 0 ? (
                    <Alert>
                      <AlertDescription>No categories found. Please add categories first.</AlertDescription>
                    </Alert>
                  ) : (
                    <Select value={newImage.category} onValueChange={(value) => setNewImage({ ...newImage, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {getCategoryDisplayName(category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div>
                  <Label htmlFor="rightsType">Rights Type *</Label>
                  <Select value={newImage.rightsType} onValueChange={(value) => setNewImage({ ...newImage, rightsType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both Rights Available</SelectItem>
                      <SelectItem value="exclusive">Exclusive & Non-Exclusive - Full HQ resolution (4K-16K)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newImage.price}
                    onChange={(e) => setNewImage({ ...newImage, price: e.target.value })}
                    placeholder="Enter price (e.g., 99.00)"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Premium pricing for full HQ resolution (4K-16K). Starting from $99 for standard rights.
                  </p>
                </div>

                <div>
                  <Label htmlFor="originalFileUrl">High-Res Download URL (Optional)</Label>
                  <Input
                    id="originalFileUrl"
                    value={newImage.originalFileUrl}
                    onChange={(e) => setNewImage({ ...newImage, originalFileUrl: e.target.value })}
                    placeholder="https://your-backblaze-bucket.com/path/to/high-res-file.jpg"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Direct link to the final high-resolution file (e.g., from Backblaze). This link will only be accessible to customers after payment and will be sent via email with their purchase confirmation.
                  </p>
                </div>

                <div>
                  <Label htmlFor="file">Image File * (Full HQ Resolution: 4K-16K)</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    {newImage.preview ? (
                      <div className="space-y-4">
                        <img src={newImage.preview || "/placeholder.svg"} alt="Preview" className="max-h-64 mx-auto rounded" />
                        <p className="text-sm text-muted-foreground">
                          {newImage.file ? `${(newImage.file.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="text-lg">Drop your image here or click to browse</p>
                        <p className="text-sm text-muted-foreground">Supports images up to 100MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                <Button onClick={handleUpload} disabled={uploading} className="w-full" size="lg">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backblaze" className="space-y-6">
            <BackblazeUrlManager />
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <CollectionsManager />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentsManager />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <SalesAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
