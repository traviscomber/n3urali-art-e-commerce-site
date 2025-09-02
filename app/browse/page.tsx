"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Edit3, Eye, X, Check } from "lucide-react"
import { getImages, getCategories } from "@/app/actions/admin-actions"
import { useAuth } from "@/lib/contexts/auth-context"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Image {
  id: string
  title: string
  description: string
  price: number
  image_url: string
  thumbnail_url: string
  category_name: string
  category_id: string
  featured: boolean
  active: boolean
}

interface Category {
  id: string
  name: string
  description: string
  active: boolean
}

interface CategoryWithImages extends Category {
  images: Image[]
}

export default function BrowsePage() {
  const [categoriesWithImages, setCategoriesWithImages] = useState<CategoryWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editingImage, setEditingImage] = useState<Image | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const { user } = useAuth()

  const isAdmin = user?.is_admin

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [imagesResult, categoriesResult] = await Promise.all([getImages(), getCategories()])

      if (imagesResult.success && categoriesResult.success) {
        const images = imagesResult.data || []
        const cats = categoriesResult.data || []

        setCategories(cats)

        // Group images by category
        const categoryMap = new Map<string, CategoryWithImages>()

        // Initialize categories
        cats.forEach((cat) => {
          categoryMap.set(cat.id, {
            ...cat,
            images: [],
          })
        })

        // Add images to their categories
        images.forEach((image) => {
          if (image.category_id && categoryMap.has(image.category_id)) {
            categoryMap.get(image.category_id)!.images.push(image)
          }
        })

        // Convert to array and filter out empty categories
        const categoriesWithImagesArray = Array.from(categoryMap.values())
          .filter((cat) => cat.images.length > 0)
          .sort((a, b) => a.name.localeCompare(b.name))

        setCategoriesWithImages(categoriesWithImagesArray)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const scrollCategory = (categoryId: string, direction: "left" | "right") => {
    const container = document.getElementById(`category-${categoryId}`)
    if (container) {
      const scrollAmount = 320 // Width of one card plus gap
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleEditImage = (image: Image) => {
    setEditingImage({ ...image })
  }

  const handleSaveEdit = async () => {
    if (!editingImage) return

    // Here you would call an update server action
    // For now, just close the edit mode
    setEditingImage(null)
    await loadData() // Refresh data
  }

  const handleCancelEdit = () => {
    setEditingImage(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Browse Gallery
              </h1>
              <p className="text-muted-foreground mt-2">Discover our collection organized by category</p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-4">
                <Button
                  variant={editMode ? "default" : "outline"}
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2"
                >
                  {editMode ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  {editMode ? "View Mode" : "Edit Mode"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {categoriesWithImages.map((category) => (
          <div key={category.id} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{category.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {category.images.length} image{category.images.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollCategory(category.id, "left")}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollCategory(category.id, "right")}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Images Row */}
            <div className="relative">
              <div
                id={`category-${category.id}`}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {category.images.map((image) => (
                  <Card
                    key={image.id}
                    className="flex-shrink-0 w-80 bg-card/50 border-border/50 hover:bg-card hover:border-border transition-all duration-300 group cursor-pointer"
                    onClick={() => (editMode && isAdmin ? handleEditImage(image) : null)}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={image.thumbnail_url || image.image_url}
                          alt={image.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {image.featured && (
                          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">Featured</Badge>
                        )}
                        {editMode && isAdmin && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Edit3 className="h-8 w-8 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{image.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{image.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">${image.price}</span>
                          <Badge variant="secondary" className="text-xs">
                            {category.name}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ))}

        {categoriesWithImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No images found. Upload some images to get started!</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Edit Image</h3>
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="aspect-video overflow-hidden rounded-lg mb-4">
                  <img
                    src={editingImage.thumbnail_url || editingImage.image_url}
                    alt={editingImage.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={editingImage.title}
                    onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={editingImage.description}
                    onChange={(e) => setEditingImage({ ...editingImage, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingImage.price}
                      onChange={(e) =>
                        setEditingImage({ ...editingImage, price: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select
                      value={editingImage.category_id}
                      onValueChange={(value) => setEditingImage({ ...editingImage, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Apply Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
