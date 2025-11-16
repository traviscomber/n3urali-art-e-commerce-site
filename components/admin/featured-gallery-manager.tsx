"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Star, ImageIcon, Loader2, Check, X } from 'lucide-react'
import { toast } from "sonner"
import {
  updateImageFeaturedSettings,
  bulkUpdateFeaturedCollection,
  getFeaturedGalleryStats,
} from "@/app/actions/admin-actions"
import Image from "next/image"

interface ImageData {
  id: string
  title: string
  thumbnail_small_url: string
  image_format: "dome" | "equirectangular" | null
  featured_collection: boolean
  upscaled_url: string | null
  active: boolean
}

interface FeaturedGalleryManagerProps {
  images: ImageData[]
}

export function FeaturedGalleryManager({ images: initialImages }: FeaturedGalleryManagerProps) {
  const [images, setImages] = useState<ImageData[]>(initialImages || [])
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [filterFormat, setFilterFormat] = useState<string>("all")
  const [filterFeatured, setFilterFeatured] = useState<string>("all")
  const [editingImage, setEditingImage] = useState<ImageData | null>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ dome: 0, equirectangular: 0, collection: 0 })

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    if (initialImages) {
      setImages(initialImages)
    }
  }, [initialImages])

  const loadStats = async () => {
    const result = await getFeaturedGalleryStats()
    if (result.success && result.stats) {
      setStats(result.stats)
    }
  }

  const filteredImages = (images || []).filter((img) => {
    if (filterFormat !== "all" && img.image_format !== filterFormat) return false
    if (filterFeatured === "featured" && !img.featured_collection) return false
    if (filterFeatured === "not-featured" && img.featured_collection) return false
    return true
  })

  const handleToggleSelect = (imageId: string) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId)
    } else {
      newSelected.add(imageId)
    }
    setSelectedImages(newSelected)
  }

  const handleBulkSetFeatured = async (featured: boolean) => {
    if (selectedImages.size === 0) {
      toast.error("No images selected")
      return
    }

    setLoading(true)
    const result = await bulkUpdateFeaturedCollection(Array.from(selectedImages), featured)
    setLoading(false)

    if (result.success) {
      toast.success(`${selectedImages.size} images ${featured ? "added to" : "removed from"} featured collection`)
      setImages(images.map((img) => (selectedImages.has(img.id) ? { ...img, featured_collection: featured } : img)))
      setSelectedImages(new Set())
      loadStats()
    } else {
      toast.error(result.error || "Failed to update images")
    }
  }

  const handleUpdateImage = async (imageId: string, settings: Partial<ImageData>) => {
    setLoading(true)
    const result = await updateImageFeaturedSettings(imageId, settings)
    setLoading(false)

    if (result.success) {
      toast.success("Image updated successfully")
      setImages(images.map((img) => (img.id === imageId ? { ...img, ...settings } : img)))
      setEditingImage(null)
      loadStats()
    } else {
      toast.error(result.error || "Failed to update image")
    }
  }

  const featuredCount = (images || []).filter((img) => img.featured_collection).length

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dome Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dome}</div>
            <p className="text-xs text-muted-foreground">Active dome format images</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equirectangular</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.equirectangular}</div>
            <p className="text-xs text-muted-foreground">Active equirectangular images</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Collection</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.collection}
              <span className="text-sm font-normal text-muted-foreground">/20</span>
            </div>
            <p className="text-xs text-muted-foreground">{20 - stats.collection} slots remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedImages.size}</div>
            <p className="text-xs text-muted-foreground">Images selected for bulk action</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="flex gap-4 items-center flex-wrap">
        <Select value={filterFormat} onValueChange={setFilterFormat}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            <SelectItem value="dome">Dome</SelectItem>
            <SelectItem value="equirectangular">Equirectangular</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterFeatured} onValueChange={setFilterFeatured}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Images</SelectItem>
            <SelectItem value="featured">Featured Only</SelectItem>
            <SelectItem value="not-featured">Not Featured</SelectItem>
          </SelectContent>
        </Select>

        {selectedImages.size > 0 && (
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={() => handleBulkSetFeatured(true)}
              disabled={loading || featuredCount + selectedImages.size > 20}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Star className="h-4 w-4 mr-2" />}
              Add to Featured ({selectedImages.size})
            </Button>
            <Button variant="outline" onClick={() => handleBulkSetFeatured(false)} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
              Remove from Featured
            </Button>
            <Button variant="ghost" onClick={() => setSelectedImages(new Set())}>
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      {/* Images Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredImages.map((image) => (
          <Card
            key={image.id}
            className={`cursor-pointer transition-all ${selectedImages.has(image.id) ? "ring-2 ring-primary" : ""}`}
            onClick={() => handleToggleSelect(image.id)}
          >
            <CardHeader className="p-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                <Image
                  src={image.thumbnail_small_url || "/placeholder.svg"}
                  alt={image.title}
                  fill
                  className="object-cover"
                />
                {image.featured_collection && (
                  <Badge className="absolute top-2 right-2" variant="default">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {selectedImages.has(image.id) && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="h-8 w-8 text-primary" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2 line-clamp-1">{image.title}</h3>
              <div className="flex gap-2 mb-3">
                {image.image_format && (
                  <Badge variant="secondary" className="text-xs">
                    {image.image_format}
                  </Badge>
                )}
                {image.upscaled_url && (
                  <Badge variant="outline" className="text-xs">
                    Upscaled
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingImage(image)
                }}
              >
                Edit Settings
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingImage && (
        <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Image Settings</DialogTitle>
              <DialogDescription>{editingImage.title}</DialogDescription>
            </DialogHeader>
            <ImageEditForm
              image={editingImage}
              onSave={(settings) => handleUpdateImage(editingImage.id, settings)}
              onCancel={() => setEditingImage(null)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface ImageEditFormProps {
  image: ImageData
  onSave: (settings: Partial<ImageData>) => void
  onCancel: () => void
  loading: boolean
}

function ImageEditForm({ image, onSave, onCancel, loading }: ImageEditFormProps) {
  const [format, setFormat] = useState<string>(image.image_format || "none")
  const [featured, setFeatured] = useState(image.featured_collection)
  const [upscaledUrl, setUpscaledUrl] = useState(image.upscaled_url || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      image_format: format === "none" ? null : (format as "dome" | "equirectangular"),
      featured_collection: featured,
      upscaled_url: upscaledUrl.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="format">Image Format</Label>
        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger>
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="dome">Dome</SelectItem>
            <SelectItem value="equirectangular">Equirectangular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
        <Label htmlFor="featured">Add to Featured Collection</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="upscaled">Upscaled URL (optional)</Label>
        <Input
          id="upscaled"
          value={upscaledUrl}
          onChange={(e) => setUpscaledUrl(e.target.value)}
          placeholder="https://..."
          type="url"
        />
        <p className="text-xs text-muted-foreground">URL to the upscaled version of this image</p>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
