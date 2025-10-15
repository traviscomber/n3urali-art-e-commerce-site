"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  ImageIcon,
  Download,
  X,
  Search,
  Grid3x3,
  List,
  ArrowUpDown,
  Trash2,
  Star,
  CheckSquare,
  Square,
} from "lucide-react"
import { toast } from "sonner"
import { listBackblazeImages, deleteBackblazeImage } from "@/app/actions/backblaze-actions"

interface B2Image {
  fileName: string
  fileId: string
  contentLength: number
  contentType: string
  uploadTimestamp: number
  url: string
  isFavorite?: boolean
}

type SortField = "name" | "date" | "size"
type SortOrder = "asc" | "desc"

export default function BackblazeGalleryPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [images, setImages] = useState<B2Image[]>([])
  const [filteredImages, setFilteredImages] = useState<B2Image[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<B2Image | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem("b2_gallery_auth")
    const storedFavorites = localStorage.getItem("b2_favorites")
    if (storedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(storedFavorites)))
      } catch (e) {
        console.error("[v0] Error loading favorites:", e)
      }
    }

    if (auth === "true") {
      setIsAuthenticated(true)
      loadImages()
    }
  }, [])

  useEffect(() => {
    let result = images.map((img) => ({
      ...img,
      isFavorite: favorites.has(img.fileName),
    }))

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter((img) => img.fileName.toLowerCase().includes(query))
    }

    result = [...result].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1
      if (!a.isFavorite && b.isFavorite) return 1

      let comparison = 0

      switch (sortField) {
        case "name":
          comparison = a.fileName.localeCompare(b.fileName)
          break
        case "date":
          comparison = a.uploadTimestamp - b.uploadTimestamp
          break
        case "size":
          comparison = a.contentLength - b.contentLength
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredImages(result)
  }, [searchQuery, images, sortField, sortOrder, favorites])

  const handleToggleFavorite = (image: B2Image, e: React.MouseEvent) => {
    e.stopPropagation()

    const newFavorites = new Set(favorites)
    if (newFavorites.has(image.fileName)) {
      newFavorites.delete(image.fileName)
      toast.success("Removed from favorites")
    } else {
      newFavorites.add(image.fileName)
      toast.success("Added to favorites")
    }

    setFavorites(newFavorites)
    localStorage.setItem("b2_favorites", JSON.stringify(Array.from(newFavorites)))
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password === "C4rlit0s") {
      setIsAuthenticated(true)
      localStorage.setItem("b2_gallery_auth", "true")
      setPassword("")
      loadImages()
      toast.success("Access granted")
    } else {
      setError("Invalid password")
      toast.error("Invalid password")
      setPassword("")
    }
  }

  const loadImages = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await listBackblazeImages(0, 100)

      if (result.success) {
        setImages(result.data)
        setFilteredImages(result.data)
        setOffset(100)
        setHasMore(result.hasMore || false)
        setTotalCount(result.totalCount || 0)
        toast.success(`Loaded ${result.data.length} images from Backblaze B2`)
      } else {
        setError(result.error || "Failed to load images")
        toast.error("Failed to load images from Backblaze B2")
      }
    } catch (error) {
      console.error("[v0] Error loading images:", error)
      setError("Failed to load images")
      toast.error("Failed to load images")
    } finally {
      setLoading(false)
    }
  }

  const loadMoreImages = async () => {
    if (!hasMore || loadingMore) return

    setLoadingMore(true)

    try {
      const result = await listBackblazeImages(offset, 100)

      if (result.success) {
        setImages((prev) => [...prev, ...result.data])
        setOffset((prev) => prev + 100)
        setHasMore(result.hasMore || false)
        toast.success(`Loaded ${result.data.length} more images`)
      } else {
        toast.error("Failed to load more images")
      }
    } catch (error) {
      console.error("[v0] Error loading more images:", error)
      toast.error("Failed to load more images")
    } finally {
      setLoadingMore(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("b2_gallery_auth")
    setImages([])
    setFilteredImages([])
    toast.success("Logged out")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDeleteImage = async (image: B2Image, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm(`Are you sure you want to delete "${image.fileName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const result = await deleteBackblazeImage(image.fileId, image.fileName)

      if (result.success) {
        setImages((prev) => prev.filter((img) => img.fileId !== image.fileId))
        setFilteredImages((prev) => prev.filter((img) => img.fileId !== image.fileId))
        toast.success(`Deleted ${image.fileName}`)
      } else {
        toast.error(`Failed to delete: ${result.error}`)
      }
    } catch (error) {
      console.error("[v0] Error deleting image:", error)
      toast.error("Failed to delete image")
    }
  }

  const toggleImageSelection = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelection = new Set(selectedImages)
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId)
    } else {
      newSelection.add(fileId)
    }
    setSelectedImages(newSelection)
  }

  const selectAllImages = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set())
      toast.success("Deselected all images")
    } else {
      setSelectedImages(new Set(filteredImages.map((img) => img.fileId)))
      toast.success(`Selected ${filteredImages.length} images`)
    }
  }

  const deleteSelectedImages = async () => {
    if (selectedImages.size === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedImages.size} images? This action cannot be undone.`)) {
      return
    }

    const deletePromises = Array.from(selectedImages).map((fileId) => {
      const image = images.find((img) => img.fileId === fileId)
      if (image) {
        return deleteBackblazeImage(image.fileId, image.fileName)
      }
      return Promise.resolve({ success: false, error: "Image not found" })
    })

    try {
      const results = await Promise.all(deletePromises)
      const successCount = results.filter((r) => r.success).length
      const failCount = results.length - successCount

      setImages((prev) => prev.filter((img) => !selectedImages.has(img.fileId)))
      setFilteredImages((prev) => prev.filter((img) => !selectedImages.has(img.fileId)))
      setSelectedImages(new Set())

      if (failCount === 0) {
        toast.success(`Successfully deleted ${successCount} images`)
      } else {
        toast.warning(`Deleted ${successCount} images, ${failCount} failed`)
      }
    } catch (error) {
      console.error("[v0] Error deleting images:", error)
      toast.error("Failed to delete some images")
    }
  }

  const favoriteSelectedImages = () => {
    if (selectedImages.size === 0) return

    const newFavorites = new Set(favorites)
    const selectedFileNames = images.filter((img) => selectedImages.has(img.fileId)).map((img) => img.fileName)

    selectedFileNames.forEach((fileName) => {
      newFavorites.add(fileName)
    })

    setFavorites(newFavorites)
    localStorage.setItem("b2_favorites", JSON.stringify(Array.from(newFavorites)))
    setSelectedImages(new Set())
    toast.success(`Added ${selectedFileNames.length} images to favorites`)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                <ImageIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white">Backblaze B2 Gallery</CardTitle>
            <CardDescription className="text-slate-300 text-lg">Enter password to access photo storage</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="h-12 text-lg bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Access Gallery
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Backblaze B2 Gallery</h1>
                <p className="text-sm text-slate-400">
                  {filteredImages.length} of {totalCount} {totalCount === 1 ? "image" : "images"}
                  {searchQuery && ` matching "${searchQuery}"`}
                  {favorites.size > 0 && ` • ${favorites.size} favorited`}
                  {selectedImages.size > 0 && ` • ${selectedImages.size} selected`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllImages}
                className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
              >
                {selectedImages.size === filteredImages.length ? (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
              >
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadImages}
                disabled={loading}
                className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
              >
                Logout
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search images by filename..."
                className="pl-10 h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="flex gap-2">
              <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                <SelectTrigger className="w-[140px] h-12 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="name" className="text-white hover:bg-slate-700">
                    Name
                  </SelectItem>
                  <SelectItem value="date" className="text-white hover:bg-slate-700">
                    Last Modified
                  </SelectItem>
                  <SelectItem value="size" className="text-white hover:bg-slate-700">
                    Size
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="h-12 w-12 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                <ArrowUpDown className={`h-5 w-5 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        {error && (
          <Alert className="mb-6 border-red-500/50 bg-red-500/10">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-lg text-slate-300">Loading images from Backblaze B2...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-xl text-slate-400">
              {searchQuery ? `No images found matching "${searchQuery}"` : "No images found in Backblaze B2"}
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredImages.map((image) => (
                  <Card
                    key={image.fileId}
                    className={`group overflow-hidden bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all ${
                      selectedImages.has(image.fileId) ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div className="aspect-square relative overflow-hidden bg-slate-900 max-w-[200px] max-h-[200px]">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.fileName}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                        loading="lazy"
                        decoding="async"
                        onClick={() => setSelectedImage(image)}
                      />
                      <div className="absolute inset-0 pointer-events-none">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => toggleImageSelection(image.fileId, e)}
                          className={`absolute top-2 left-2 h-8 w-8 shadow-lg pointer-events-auto ${
                            selectedImages.has(image.fileId)
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : "bg-slate-700/90 hover:bg-slate-600 text-white"
                          }`}
                          title={selectedImages.has(image.fileId) ? "Deselect" : "Select"}
                        >
                          {selectedImages.has(image.fileId) ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleFavorite(image, e)
                          }}
                          className="absolute top-2 right-2 h-8 w-8 bg-yellow-500/90 hover:bg-yellow-600 text-white shadow-lg pointer-events-auto"
                          title={image.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star className={`h-4 w-4 ${image.isFavorite ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteImage(image, e)
                          }}
                          className="absolute bottom-2 right-2 h-8 w-8 bg-red-500/90 hover:bg-red-600 text-white shadow-lg pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-white text-xs font-medium truncate">{image.fileName}</p>
                          <p className="text-slate-300 text-[10px]">{formatFileSize(image.contentLength)}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredImages.map((image) => (
                  <Card
                    key={image.fileId}
                    className={`bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all ${
                      selectedImages.has(image.fileId) ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => toggleImageSelection(image.fileId, e)}
                          className={`flex-shrink-0 ${
                            selectedImages.has(image.fileId)
                              ? "text-blue-500 hover:text-blue-600"
                              : "text-slate-400 hover:text-slate-300"
                          }`}
                          title={selectedImages.has(image.fileId) ? "Deselect" : "Select"}
                        >
                          {selectedImages.has(image.fileId) ? (
                            <CheckSquare className="h-5 w-5" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </Button>
                        <div
                          className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-slate-900 cursor-pointer"
                          onClick={() => setSelectedImage(image)}
                        >
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.fileName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedImage(image)}>
                          <p className="text-white font-medium truncate">{image.fileName}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                            <span>{formatFileSize(image.contentLength)}</span>
                            <span>{formatDate(image.uploadTimestamp)}</span>
                            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">{image.contentType}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleFavorite(image, e)
                          }}
                          className="text-yellow-400 hover:text-yellow-500"
                          title={image.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star className={`h-4 w-4 ${image.isFavorite ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteImage(image, e)
                          }}
                          className="text-red-400 hover:text-red-500"
                          title="Delete image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(image.url, "_blank")
                          }}
                          className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {hasMore && !searchQuery && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMoreImages}
                  disabled={loadingMore}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Loading More...
                    </>
                  ) : (
                    `Load More Images (${images.length} of ${totalCount})`
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating batch action toolbar */}
      {selectedImages.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
          <Card className="bg-slate-800 border-slate-700 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-white font-medium">
                  {selectedImages.size} {selectedImages.size === 1 ? "image" : "images"} selected
                </div>
                <div className="h-6 w-px bg-slate-600" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={favoriteSelectedImages}
                  className="bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Favorite Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteSelectedImages}
                  className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImages(new Set())}
                  className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl bg-slate-900 border-slate-700 p-0">
          {selectedImage && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="p-4">
                <img
                  src={selectedImage.url || "/placeholder.svg"}
                  alt={selectedImage.fileName}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              </div>
              <div className="p-6 bg-slate-800/50 border-t border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">{selectedImage.fileName}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">File Size</p>
                    <p className="text-white font-medium">{formatFileSize(selectedImage.contentLength)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Type</p>
                    <p className="text-white font-medium">{selectedImage.contentType}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Uploaded</p>
                    <p className="text-white font-medium">{formatDate(selectedImage.uploadTimestamp)}</p>
                  </div>
                  <div>
                    <Button
                      onClick={() => window.open(selectedImage.url, "_blank")}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
