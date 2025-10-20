"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createCollection, deleteCollection, getAllCollections } from "@/app/actions/collection-actions"
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
  const [newCollection, setNewCollection] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    bundle_price: "199",
  })

  useEffect(() => {
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

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId].slice(0, 20),
    )
  }

  return (
    <div className="space-y-6">
      {/* Create New Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Collection
          </CardTitle>
          <CardDescription>Schedule a new weekly collection with up to 20 images</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Collection Title *</Label>
              <Input
                id="title"
                value={newCollection.title}
                onChange={(e) => setNewCollection((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Weekly Collection - Jan 19, 2025"
              />
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newCollection.description}
              onChange={(e) => setNewCollection((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this week's collection..."
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
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-2 max-h-96 overflow-y-auto border rounded-lg p-2">
              {images.map((image) => {
                const isSelected = selectedImages.includes(image.id)
                const imageUrl =
                  image.thumbnail_small_url || image.thumbnail_medium_url || image.file_path || "/placeholder.svg"

                return (
                  <div
                    key={image.id}
                    onClick={() => toggleImageSelection(image.id)}
                    className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected ? "border-primary ring-2 ring-primary" : "border-transparent hover:border-gray-300"
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
                        <Badge variant="default" className="text-xs">
                          {selectedImages.indexOf(image.id) + 1}
                        </Badge>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <Button onClick={handleCreateCollection} disabled={creating} className="w-full">
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Collection
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Collections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Collections
          </CardTitle>
          <CardDescription>Manage your weekly collections</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : collections.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No collections scheduled yet</p>
          ) : (
            <div className="space-y-4">
              {collections.map((collection) => {
                const startDate = new Date(collection.start_date)
                const endDate = new Date(collection.end_date)
                const isActive = startDate <= new Date() && endDate >= new Date()
                const isPast = endDate < new Date()
                const isFuture = startDate > new Date()

                return (
                  <div key={collection.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{collection.title}</h3>
                          {isActive && <Badge variant="default">Active</Badge>}
                          {isFuture && <Badge variant="secondary">Scheduled</Badge>}
                          {isPast && <Badge variant="outline">Past</Badge>}
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
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
