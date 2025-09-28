"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  Settings,
  ImageIcon,
  MapPin,
  Palette,
  Sun,
  Building,
  Target,
  BarChart3,
  Lightbulb,
} from "lucide-react"

interface TagCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
  sort_order: number
  active: boolean
  tag_count?: number
}

interface TagData {
  id: string
  name: string
  slug: string
  description: string
  category_id: string
  category_name?: string
  usage_count: number
  is_featured: boolean
  synonyms: string[]
  active: boolean
}

const ICON_MAP = {
  Settings: Settings,
  ImageIcon: ImageIcon,
  MapPin: MapPin,
  Palette: Palette,
  Sun: Sun,
  Building: Building,
  Target: Target,
}

export function TagManagementDashboard() {
  const [categories, setCategories] = useState<TagCategory[]>([])
  const [tags, setTags] = useState<TagData[]>([])
  const [filteredTags, setFilteredTags] = useState<TagData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false)
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagData | null>(null)

  useEffect(() => {
    // Mock categories data
    setCategories([
      {
        id: "1",
        name: "Technical Format",
        description: "Image format and technical specifications",
        color: "#3B82F6",
        icon: "Settings",
        sort_order: 1,
        active: true,
        tag_count: 5,
      },
      {
        id: "2",
        name: "Subject Matter",
        description: "Main subject or content of the image",
        color: "#10B981",
        icon: "ImageIcon",
        sort_order: 2,
        active: true,
        tag_count: 8,
      },
      {
        id: "3",
        name: "Environment",
        description: "Location and environmental context",
        color: "#059669",
        icon: "MapPin",
        sort_order: 3,
        active: true,
        tag_count: 12,
      },
      {
        id: "4",
        name: "Mood & Style",
        description: "Artistic style and emotional tone",
        color: "#8B5CF6",
        icon: "Palette",
        sort_order: 4,
        active: true,
        tag_count: 6,
      },
      {
        id: "5",
        name: "Time & Weather",
        description: "Temporal and weather conditions",
        color: "#F59E0B",
        icon: "Sun",
        sort_order: 5,
        active: true,
        tag_count: 4,
      },
    ])

    // Mock tags data
    setTags([
      {
        id: "1",
        name: "360°",
        slug: "360-degree",
        description: "Full 360-degree spherical panoramic images",
        category_id: "1",
        category_name: "Technical Format",
        usage_count: 45,
        is_featured: true,
        synonyms: ["360", "spherical"],
        active: true,
      },
      {
        id: "2",
        name: "Fisheye",
        slug: "fisheye",
        description: "Ultra-wide angle fisheye lens photography",
        category_id: "1",
        category_name: "Technical Format",
        usage_count: 32,
        is_featured: true,
        synonyms: ["fisheye-lens"],
        active: true,
      },
      {
        id: "3",
        name: "Landscape",
        slug: "landscape",
        description: "Natural landscape photography",
        category_id: "2",
        category_name: "Subject Matter",
        usage_count: 67,
        is_featured: true,
        synonyms: ["scenery", "vista"],
        active: true,
      },
      {
        id: "4",
        name: "Architecture",
        slug: "architecture",
        description: "Buildings and architectural structures",
        category_id: "2",
        category_name: "Subject Matter",
        usage_count: 54,
        is_featured: true,
        synonyms: ["building", "structure"],
        active: true,
      },
      {
        id: "5",
        name: "Ocean",
        slug: "ocean",
        description: "Ocean, sea, and marine environments",
        category_id: "3",
        category_name: "Environment",
        usage_count: 38,
        is_featured: true,
        synonyms: ["sea", "water"],
        active: true,
      },
      {
        id: "6",
        name: "Mountain",
        slug: "mountain",
        description: "Mountain ranges and alpine environments",
        category_id: "3",
        category_name: "Environment",
        usage_count: 29,
        is_featured: true,
        synonyms: ["alpine", "peak"],
        active: true,
      },
      {
        id: "7",
        name: "Golden Hour",
        slug: "golden-hour",
        description: "Warm golden hour lighting",
        category_id: "5",
        category_name: "Time & Weather",
        usage_count: 41,
        is_featured: true,
        synonyms: ["sunset", "sunrise"],
        active: true,
      },
      {
        id: "8",
        name: "Dramatic",
        slug: "dramatic",
        description: "High contrast and dramatic lighting",
        category_id: "4",
        category_name: "Mood & Style",
        usage_count: 23,
        is_featured: false,
        synonyms: ["intense", "striking"],
        active: true,
      },
    ])
  }, [])

  // Filter tags based on search and category
  useEffect(() => {
    let filtered = tags

    if (searchTerm) {
      filtered = filtered.filter(
        (tag) =>
          tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tag.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tag.synonyms.some((synonym) => synonym.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((tag) => tag.category_id === selectedCategory)
    }

    setFilteredTags(filtered)
  }, [tags, searchTerm, selectedCategory])

  const handleCreateTag = (tagData: Partial<TagData>) => {
    console.log("[v0] Creating tag:", tagData)
    setIsCreateTagOpen(false)
  }

  const handleUpdateTag = (tagData: TagData) => {
    console.log("[v0] Updating tag:", tagData)
    setEditingTag(null)
  }

  const handleDeleteTag = (tagId: string) => {
    console.log("[v0] Deleting tag:", tagId)
    setTags(tags.filter((tag) => tag.id !== tagId))
  }

  const handleBulkTagSuggestion = () => {
    console.log("[v0] Generating bulk tag suggestions")
  }

  const getIconComponent = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName as keyof typeof ICON_MAP] || Tag
    return IconComponent
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tag Management</h2>
          <p className="text-muted-foreground">Organize and manage your image classification system</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleBulkTagSuggestion} variant="outline">
            <Lightbulb className="h-4 w-4 mr-2" />
            Suggest Tags
          </Button>
          <Dialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
                <DialogDescription>Add a new tag to improve image classification</DialogDescription>
              </DialogHeader>
              <TagForm categories={categories} onSubmit={handleCreateTag} onCancel={() => setIsCreateTagOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="tags" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tags" className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTags.map((tag) => {
              const category = categories.find((c) => c.id === tag.category_id)
              return (
                <Card key={tag.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: category?.color + "20", color: category?.color }}
                        >
                          {category?.name}
                        </Badge>
                        {tag.is_featured && (
                          <Badge variant="default" className="text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditingTag(tag)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTag(tag.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                    <CardDescription>{tag.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Used in {tag.usage_count} images</span>
                      </div>
                      {tag.synonyms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tag.synonyms.map((synonym) => (
                            <Badge key={synonym} variant="outline" className="text-xs">
                              {synonym}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tag Categories</h3>
            <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Tag Category</DialogTitle>
                  <DialogDescription>Create a new category to organize your tags</DialogDescription>
                </DialogHeader>
                {/* Category form would go here */}
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const IconComponent = getIconComponent(category.icon)
              return (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: category.color + "20" }}>
                        <IconComponent className="h-5 w-5" style={{ color: category.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.tag_count} tags</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tags.length}</div>
                <p className="text-xs text-muted-foreground">Across {categories.length} categories</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Used</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.max(...tags.map((t) => t.usage_count))}</div>
                <p className="text-xs text-muted-foreground">
                  {tags.find((t) => t.usage_count === Math.max(...tags.map((t) => t.usage_count)))?.name}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Featured Tags</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tags.filter((t) => t.is_featured).length}</div>
                <p className="text-xs text-muted-foreground">
                  {((tags.filter((t) => t.is_featured).length / tags.length) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Usage</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(tags.reduce((sum, t) => sum + t.usage_count, 0) / tags.length)}
                </div>
                <p className="text-xs text-muted-foreground">Per tag</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Tag Dialog */}
      {editingTag && (
        <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
              <DialogDescription>Update tag information and settings</DialogDescription>
            </DialogHeader>
            <TagForm
              categories={categories}
              initialData={editingTag}
              onSubmit={handleUpdateTag}
              onCancel={() => setEditingTag(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface TagFormProps {
  categories: TagCategory[]
  initialData?: TagData | null
  onSubmit: (data: any) => void
  onCancel: () => void
}

function TagForm({ categories, initialData, onSubmit, onCancel }: TagFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category_id: initialData?.category_id || "",
    synonyms: initialData?.synonyms?.join(", ") || "",
    is_featured: initialData?.is_featured || false,
    active: initialData?.active ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      synonyms: formData.synonyms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Tag Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter tag name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this tag represents"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category_id}
          onValueChange={(value) => setFormData({ ...formData, category_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="synonyms">Synonyms</Label>
        <Input
          id="synonyms"
          value={formData.synonyms}
          onChange={(e) => setFormData({ ...formData, synonyms: e.target.value })}
          placeholder="Enter synonyms separated by commas"
        />
        <p className="text-xs text-muted-foreground">Alternative names that should match this tag</p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="featured"
          checked={formData.is_featured}
          onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
        />
        <Label htmlFor="featured">Featured tag</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
        />
        <Label htmlFor="active">Active</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update" : "Create"} Tag</Button>
      </div>
    </form>
  )
}
