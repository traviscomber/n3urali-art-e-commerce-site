"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Trash2, Loader2, Edit2, Copy, Eye, Search, Filter, GripVertical, Check, X } from "lucide-react"
import { toast } from "sonner"
import {
  createCollection,
  deleteCollection,
  getAllCollections,
  updateCollection,
  updateCollectionImages,
  getCollectionWithImages,
  duplicateCollection,
  bulkUpdateCollectionStatus,
  generateCollectionCode,
} from "@/app/actions/collection-actions"
import ImageComponent from "next/image"

interface CollectionImage {
  id: string
  title: string
  thumbnail_medium_url: string | null
  thumbnail_small_url: string | null
  file_path: string | null
}

interface CollectionsManagerProps {
  images: CollectionImage[]
}

export function CollectionsManager({ images }: CollectionsManagerProps) {
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [editingCollection, setEditingCollection] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "past" | "future">("all")
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [newCollection, setNewCollection] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    bundle_price: "199",
    code: "",
  })

  useEffect(() => {
    const autoGenerateCode = async () => {
      if (!newCollection.code) {
        const code = await generateCollectionCode()
        setNewCollection((prev) => ({ ...prev, code }))
      }
    }
    autoGenerateCode()
    loadCollections()
  }, [])

  const loadCollections = async () => {
    setLoading(true)
    try {
      const data = await getAllCollections()
      setCollections(data)
    } catch (error) {
      console.error("[v0] Error loading collections:", error)
      toast.error("Failed to load collections")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCollection = async () => {
    if (!newCollection.title || !newCollection.start_date || !newCollection.end_date) {
      toast.error("Please fill in all required fields")
      return
    }

    if (selectedImages.length === 0) {
      toast.error("Please select at least one image")
      return
    }

    if (selectedImages.length > 20) {
      toast.error("Maximum 20 images per collection")
      return
    }

    setCreating(true)
    try {
      const result = await createCollection({
        ...newCollection,
        bundle_price: Number.parseFloat(newCollection.bundle_price),
        image_ids: selectedImages,
      })

      if (result.success) {
        toast.success("Collection created successfully")
        setNewCollection({
          title: "",
          description: "",
          start_date: "",
          end_date: "",
          bundle_price: "199",
          code: "",
        })
        setSelectedImages([])
        await loadCollections()
      } else {
        toast.error(result.error || "Failed to create collection")
      }
    } catch (error) {
      console.error("[v0] Error creating collection:", error)
      toast.error("Failed to create collection")
    } finally {
      setCreating(false)
    }
  }

  const handleEditCollection = async (collectionId: string) => {
    setLoading(true)
    try {
      const result = await getCollectionWithImages(collectionId)
      if (result.success && result.data) {
        setEditingCollection(result.data)
        setSelectedImages(result.data.images.map((img: any) => img.image.id))
        setNewCollection({
          title: result.data.title,
          description: result.data.description || "",
          start_date: result.data.start_date.slice(0, 16), // Format for datetime-local
          end_date: result.data.end_date.slice(0, 16),
          bundle_price: result.data.bundle_price.toString(),
          code: result.data.code || "",
        })
      } else {
        toast.error("Failed to load collection")
      }
    } catch (error) {
      console.error("[v0] Error loading collection:", error)
      toast.error("Failed to load collection")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCollection = async () => {
    if (!newCollection.title || !newCollection.start_date || !newCollection.end_date) {
      toast.error("Please fill in all required fields")
      return
    }

    if (selectedImages.length === 0) {
      toast.error("Please select at least one image")
      return
    }

    if (selectedImages.length > 20) {
      toast.error("Maximum 20 images per collection")
      return
    }

    setCreating(true)
    try {
      if (editingCollection) {
        // Update existing collection
        const updateResult = await updateCollection(editingCollection.id, {
          title: newCollection.title,
          description: newCollection.description,
          start_date: newCollection.start_date,
          end_date: newCollection.end_date,
          bundle_price: Number.parseFloat(newCollection.bundle_price),
        })

        if (!updateResult.success) {
          throw new Error(updateResult.error)
        }

        // Update images
        const imagesResult = await updateCollectionImages(editingCollection.id, selectedImages)

        if (!imagesResult.success) {
          throw new Error(imagesResult.error)
        }

        toast.success("Collection updated successfully")
      } else {
        // Create new collection
        const result = await createCollection({
          ...newCollection,
          bundle_price: Number.parseFloat(newCollection.bundle_price),
          image_ids: selectedImages,
        })

        if (!result.success) {
          throw new Error(result.error)
        }

        toast.success("Collection created successfully")
      }

      // Reset form
      setNewCollection({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        bundle_price: "199",
        code: "",
      })
      setSelectedImages([])
      setEditingCollection(null)

      // Generate new code for next collection
      const newCode = await generateCollectionCode()
      setNewCollection((prev) => ({ ...prev, code: newCode }))

      await loadCollections()
    } catch (error) {
      console.error("[v0] Error saving collection:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save collection")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return

    try {
      const result = await deleteCollection(collectionId)
      if (result.success) {
        toast.success("Collection deleted successfully")
        await loadCollections()
      } else {
        toast.error(result.error || "Failed to delete collection")
      }
    } catch (error) {
      console.error("[v0] Error deleting collection:", error)
      toast.error("Failed to delete collection")
    }
  }

  const handleDuplicateCollection = async (collectionId: string) => {
    try {
      const result = await duplicateCollection(collectionId)
      if (result.success) {
        toast.success("Collection duplicated successfully")
        await loadCollections()
      } else {
        toast.error(result.error || "Failed to duplicate collection")
      }
    } catch (error) {
      console.error("[v0] Error duplicating collection:", error)
      toast.error("Failed to duplicate collection")
    }
  }

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedCollections.length === 0) {
      toast.error("Please select collections first")
      return
    }

    try {
      const result = await bulkUpdateCollectionStatus(selectedCollections, isActive)
      if (result.success) {
        toast.success(`${selectedCollections.length} collections ${isActive ? "activated" : "deactivated"}`)
        setSelectedCollections([])
        await loadCollections()
      } else {
        toast.error(result.error || "Failed to update collections")
      }
    } catch (error) {
      console.error("[v0] Error updating collections:", error)
      toast.error("Failed to update collections")
    }
  }

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId].slice(0, 20),
    )
  }

  const handleDragStart = (e: React.DragEvent, imageId: string) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", imageId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetImageId: string) => {
    e.preventDefault()
    const draggedImageId = e.dataTransfer.getData("text/plain")

    if (draggedImageId === targetImageId) return

    const newOrder = [...selectedImages]
    const draggedIndex = newOrder.indexOf(draggedImageId)
    const targetIndex = newOrder.indexOf(targetImageId)

    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedImageId)

    setSelectedImages(newOrder)
  }

  const filteredCollections = collections.filter((collection) => {
    // Search filter
    const matchesSearch =
      collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    // Status filter
    const now = new Date()
    const startDate = new Date(collection.start_date)
    const endDate = new Date(collection.end_date)
    const isActive = startDate <= now && endDate >= now && collection.is_active
    const isPast = endDate < now
    const isFuture = startDate > now

    switch (filterStatus) {
      case "active":
        return isActive
      case "inactive":
        return !collection.is_active
      case "past":
        return isPast
      case "future":
        return isFuture
      default:
        return true
    }
  })

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search collections by title, code, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collections</SelectItem>
                <SelectItem value="active">Active Now</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="future">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedCollections.length > 0 && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedCollections.length} selected</span>
              <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate(true)}>
                <Check className="h-4 w-4 mr-1" />
                Activate
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate(false)}>
                <X className="h-4 w-4 mr-1" />
                Deactivate
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedCollections([])}>
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingCollection ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editingCollection ? "Edit Collection" : "Create New Collection"}
          </CardTitle>
          <CardDescription>
            {editingCollection
              ? "Update collection details and images"
              : "Schedule a new weekly collection with up to 20 images"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Collection Code *</Label>
              <Input
                id="code"
                value={newCollection.code}
                onChange={(e) => setNewCollection((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="e.g., NAT-001, ARCH-001"
                disabled={!!editingCollection}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Auto-generated. Use prefixes like NAT, ARCH, ABS for categories.
              </p>
            </div>
            <div>
              <Label htmlFor="bundle_price">Bundle Price (USD) *</Label>
              <Input
                id="bundle_price"
                type="number"
                min="0"
                step="0.01"
                value={newCollection.bundle_price}
                onChange={(e) => setNewCollection((prev) => ({ ...prev, bundle_price: e.target.value }))}
                placeholder="199.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title">Collection Title *</Label>
            <Input
              id="title"
              value={newCollection.title}
              onChange={(e) => setNewCollection((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Mystical Forests Collection"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newCollection.description}
              onChange={(e) => setNewCollection((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this collection..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={newCollection.start_date}
                onChange={(e) => setNewCollection((prev) => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={newCollection.end_date}
                onChange={(e) => setNewCollection((prev) => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Select Images ({selectedImages.length}/20)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              {editingCollection
                ? "Drag to reorder. Click to add/remove."
                : "Click to select images for this collection."}
            </p>

            {/* Selected Images (with drag-and-drop for reordering) */}
            {selectedImages.length > 0 && (
              <div className="mb-4 p-4 border rounded-lg bg-muted/30">
                <h4 className="text-sm font-medium mb-2">Selected Images (Drag to reorder)</h4>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2">
                  {selectedImages.map((imageId, index) => {
                    const image = images.find((img) => img.id === imageId)
                    if (!image) return null

                    const imageUrl =
                      image.thumbnail_small_url || image.thumbnail_medium_url || image.file_path || "/placeholder.svg"

                    return (
                      <div
                        key={imageId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, imageId)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, imageId)}
                        className="relative aspect-square cursor-move rounded-lg overflow-hidden border-2 border-primary ring-2 ring-primary/20 hover:ring-primary/40 transition-all group"
                      >
                        <ImageComponent
                          src={imageUrl || "/placeholder.svg"}
                          alt={image.title}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="default" className="absolute top-1 left-1 text-xs">
                          {index + 1}
                        </Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setSelectedImages((prev) => prev.filter((id) => id !== imageId))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Available Images */}
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-96 overflow-y-auto border rounded-lg p-2">
              {images.map((image) => {
                const isSelected = selectedImages.includes(image.id)
                const imageUrl =
                  image.thumbnail_small_url || image.thumbnail_medium_url || image.file_path || "/placeholder.svg"

                return (
                  <div
                    key={image.id}
                    onClick={() => toggleImageSelection(image.id)}
                    className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary opacity-50"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <ImageComponent
                      src={imageUrl || "/placeholder.svg"}
                      alt={image.title}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveCollection} disabled={creating} className="flex-1">
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingCollection ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {editingCollection ? <Edit2 className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                  {editingCollection ? "Update Collection" : "Create Collection"}
                </>
              )}
            </Button>
            {editingCollection && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingCollection(null)
                  setSelectedImages([])
                  setNewCollection({
                    title: "",
                    description: "",
                    start_date: "",
                    end_date: "",
                    bundle_price: "199",
                    code: "",
                  })
                  generateCollectionCode().then((code) => setNewCollection((prev) => ({ ...prev, code })))
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Collections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Collections ({filteredCollections.length})
          </CardTitle>
          <CardDescription>Manage your collections</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredCollections.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery || filterStatus !== "all" ? "No collections match your filters" : "No collections yet"}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredCollections.map((collection) => {
                const startDate = new Date(collection.start_date)
                const endDate = new Date(collection.end_date)
                const now = new Date()
                const isActive = startDate <= now && endDate >= now && collection.is_active
                const isPast = endDate < now
                const isFuture = startDate > now
                const isSelected = selectedCollections.includes(collection.id)

                return (
                  <div
                    key={collection.id}
                    className={`border rounded-lg p-4 space-y-2 transition-all ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCollections((prev) => [...prev, collection.id])
                            } else {
                              setSelectedCollections((prev) => prev.filter((id) => id !== collection.id))
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {collection.code && (
                              <Badge variant="outline" className="font-mono">
                                {collection.code}
                              </Badge>
                            )}
                            <h3 className="font-semibold">{collection.title}</h3>
                            {isActive && <Badge variant="default">Active</Badge>}
                            {isFuture && <Badge variant="secondary">Scheduled</Badge>}
                            {isPast && <Badge variant="outline">Past</Badge>}
                            {!collection.is_active && <Badge variant="destructive">Inactive</Badge>}
                            {collection.is_auto_curated && <Badge variant="outline">Auto-Curated</Badge>}
                          </div>
                          {collection.description && (
                            <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>
                              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>${collection.bundle_price}</span>
                            <span>•</span>
                            <span>{collection.collection_images?.[0]?.count || 0} images</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>{collection.title}</DialogTitle>
                              <DialogDescription>Collection Preview</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Code:</span> {collection.code}
                                </div>
                                <div>
                                  <span className="font-medium">Price:</span> ${collection.bundle_price}
                                </div>
                                <div>
                                  <span className="font-medium">Start:</span> {startDate.toLocaleString()}
                                </div>
                                <div>
                                  <span className="font-medium">End:</span> {endDate.toLocaleString()}
                                </div>
                              </div>
                              {collection.description && (
                                <p className="text-sm text-muted-foreground">{collection.description}</p>
                              )}
                              <div>
                                <h4 className="font-medium mb-2">
                                  Images ({collection.collection_images?.[0]?.count || 0})
                                </h4>
                                <div className="grid grid-cols-6 gap-2 max-h-96 overflow-y-auto">
                                  {/* Preview would load actual images here */}
                                  <div className="aspect-square bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                    Preview
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline" onClick={() => handleEditCollection(collection.id)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDuplicateCollection(collection.id)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCollection(collection.id)}
                          disabled={isActive}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
