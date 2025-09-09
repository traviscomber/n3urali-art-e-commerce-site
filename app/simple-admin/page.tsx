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
import {
  Loader2,
  Upload,
  Eye,
  Trash2,
  Database,
  BarChart3,
  Crown,
  Edit2,
  Check,
  X,
  HardDrive,
  Cloud,
} from "lucide-react"

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
  })

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
    try {
      console.log("[v0] Starting image upload process...")

      const imageData = {
        title: newImage.title,
        description: newImage.description,
        category_name: newImage.category,
        rights_type: newImage.rightsType,
        price: Number.parseFloat(newImage.price) || 0,
      }

      // Use hybrid storage system that automatically chooses Blob or Database
      const result = await createImageWithHybridStorage(newImage.file, imageData, licenses)

      if (!result.success) {
        throw new Error(result.error || "Failed to save image")
      }

      console.log("[v0] Image saved successfully with hybrid storage")
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
    } catch (error: any) {
      console.error("[v0] Upload error:", error.message || error)
      alert(`Upload error: ${error.message || error}`)
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
                          {newImage.file.size > 40 * 1024 * 1024 ? (
                            <>
                              <Cloud className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-600 font-medium">
                                Will use Backblaze B2 storage (Large file:{" "}
                                {(newImage.file.size / (1024 * 1024)).toFixed(1)}MB)
                              </span>
                            </>
                          ) : (
                            <>
                              <Database className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">
                                Will use database storage (Small file: {(newImage.file.size / (1024 * 1024)).toFixed(1)}
                                MB)
                              </span>
                            </>
                          )}
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
                          <p>• Files &gt;40MB: Backblaze B2 storage (unlimited, cost-effective)</p>
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

                <Button
                  onClick={handleImageUpload}
                  disabled={uploading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-lg h-12"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading with Backblaze B2...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload with Backblaze B2
                    </>
                  )}
                </Button>
              </div>
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

const createImageWithHybridStorage = async (file: File, imageData: any, licenses: License[]) => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("title", imageData.title || "")
  formData.append("description", imageData.description || "")
  formData.append("category", imageData.category_name || "")

  console.log("[v0] License mapping debug - rights_type:", imageData.rights_type)
  console.log(
    "[v0] License mapping debug - available licenses:",
    licenses.map((l) => ({ id: l.id, name: l.name })),
  )

  let licenseId = ""
  if (imageData.rights_type === "exclusive") {
    // Find the exclusive license ID
    const exclusiveLicense = licenses.find((license) => license.name === "EXCLUSIVE")
    console.log("[v0] License mapping debug - found exclusive license:", exclusiveLicense)
    licenseId = exclusiveLicense?.id || ""
  } else if (imageData.rights_type === "non-exclusive") {
    // Find the non-exclusive license ID
    const nonExclusiveLicense = licenses.find((license) => license.name === "NON_EXCLUSIVE")
    console.log("[v0] License mapping debug - found non-exclusive license:", nonExclusiveLicense)
    licenseId = nonExclusiveLicense?.id || ""
  } else {
    // For "both", default to non-exclusive license
    const nonExclusiveLicense = licenses.find((license) => license.name === "NON_EXCLUSIVE")
    console.log("[v0] License mapping debug - found non-exclusive license (both case):", nonExclusiveLicense)
    licenseId = nonExclusiveLicense?.id || ""
  }

  console.log("[v0] License mapping debug - final licenseId:", licenseId)

  if (!licenseId) {
    throw new Error(
      `License not found for rights_type: ${imageData.rights_type}. Available licenses: ${licenses.map((l) => l.name).join(", ")}`,
    )
  }

  formData.append("license_id", licenseId)

  const { createImageWithHybridStorage: actualFunction } = await import("@/app/actions/admin-actions")
  return actualFunction(formData)
}
