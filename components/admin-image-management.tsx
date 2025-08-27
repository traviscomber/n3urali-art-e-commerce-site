"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Filter, Upload, Edit, Trash2, Eye, MoreHorizontal, Plus, Loader2, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PanoramaViewer } from "./panorama-viewer"

interface DatabaseImage {
  id: number
  title: string
  description: string | null
  category: "equirectangular" | "fisheye"
  price: number
  file_url: string
  preview_url: string
  thumbnail_url: string
  file_size: number | null
  tags: string[]
  active: boolean
  featured: boolean
  created_at: string
  metadata: any
}

export function AdminImageManagement() {
  const [images, setImages] = useState<DatabaseImage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingImage, setEditingImage] = useState<DatabaseImage | null>(null)
  const [previewImage, setPreviewImage] = useState<DatabaseImage | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DatabaseImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    if (!supabase) return

    try {
      setLoading(true)
      const { data, error } = await supabase.from("images").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setImages(data || [])
    } catch (err) {
      console.error("Error loading images:", err)
      setError(err instanceof Error ? err.message : "Failed to load images")
    } finally {
      setLoading(false)
    }
  }

  const filteredImages = images.filter((image) => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || image.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleUpdateImage = async (imageId: number, updates: Partial<DatabaseImage>) => {
    if (!supabase) return

    try {
      setIsUpdating(true)
      const { error } = await supabase.from("images").update(updates).eq("id", imageId)

      if (error) throw error

      // Update local state
      setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, ...updates } : img)))

      setEditingImage(null)
    } catch (err) {
      console.error("Error updating image:", err)
      setError(err instanceof Error ? err.message : "Failed to update image")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteImage = async (image: DatabaseImage) => {
    if (!supabase) return

    try {
      setIsUpdating(true)

      // Delete from storage
      const fileName = image.file_url.split("/").pop()
      if (fileName) {
        await supabase.storage.from("images").remove([fileName])
      }

      // Delete from database
      const { error } = await supabase.from("images").delete().eq("id", image.id)

      if (error) throw error

      // Update local state
      setImages((prev) => prev.filter((img) => img.id !== image.id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error("Error deleting image:", err)
      setError(err instanceof Error ? err.message : "Failed to delete image")
    } finally {
      setIsUpdating(false)
    }
  }

  const toggleFeatured = async (image: DatabaseImage) => {
    await handleUpdateImage(image.id, { featured: !image.featured })
  }

  const toggleActive = async (image: DatabaseImage) => {
    await handleUpdateImage(image.id, { active: !image.active })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading images...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Image Management</h1>
          <p className="text-muted-foreground">Manage your image catalog and uploads</p>
        </div>
        <Button className="gap-2" onClick={() => router.push("/admin/uploads")}>
          <Plus className="h-4 w-4" />
          Upload Images
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive">
            {error}
            <Button
              variant="link"
              className="p-0 h-auto ml-2 text-destructive underline"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="all">All Categories</option>
              <option value="equirectangular">Equirectangular</option>
              <option value="fisheye">Fisheye</option>
            </select>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      <div className="grid gap-6">
        {filteredImages.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No Images Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== "all"
                  ? "No images match your current filters."
                  : "Start by uploading your first panoramic image."}
              </p>
              <Button onClick={() => router.push("/admin/uploads")}>Upload Images</Button>
            </CardContent>
          </Card>
        ) : (
          filteredImages.map((image) => (
            <Card key={image.id} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={image.thumbnail_url || "/placeholder.svg"}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Image Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-card-foreground">{image.title}</h3>
                      {image.featured && <Badge className="bg-accent text-accent-foreground">Featured</Badge>}
                      <Badge variant="outline" className="capitalize">
                        {image.category}
                      </Badge>
                      <Badge variant={image.active ? "default" : "secondary"} className="capitalize">
                        {image.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>Price: ${image.price}</span>
                      <span>
                        Size: {image.file_size ? (image.file_size / 1024 / 1024).toFixed(2) + " MB" : "Unknown"}
                      </span>
                      <span>Uploaded: {new Date(image.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => setPreviewImage(image)}
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => setEditingImage(image)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleFeatured(image)}>
                          {image.featured ? "Remove from Featured" : "Add to Featured"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleActive(image)}>
                          {image.active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteConfirm(image)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>Update the image details and metadata.</DialogDescription>
          </DialogHeader>

          {editingImage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingImage.title}
                    onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingImage.category}
                    onValueChange={(value: "equirectangular" | "fisheye") =>
                      setEditingImage({ ...editingImage, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equirectangular">Equirectangular</SelectItem>
                      <SelectItem value="fisheye">Fisheye</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editingImage.price}
                    onChange={(e) =>
                      setEditingImage({ ...editingImage, price: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-tags">Tags</Label>
                  <Input
                    id="edit-tags"
                    value={editingImage.tags.join(", ")}
                    onChange={(e) =>
                      setEditingImage({
                        ...editingImage,
                        tags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="architecture, urban, 360"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingImage.description || ""}
                  onChange={(e) => setEditingImage({ ...editingImage, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingImage(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => editingImage && handleUpdateImage(editingImage.id, editingImage)}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewImage?.title}</DialogTitle>
            <DialogDescription>360° panoramic preview</DialogDescription>
          </DialogHeader>

          {previewImage && (
            <div className="h-96">
              <PanoramaViewer imageUrl={previewImage.preview_url} title={previewImage.title} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDeleteImage(deleteConfirm)}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
