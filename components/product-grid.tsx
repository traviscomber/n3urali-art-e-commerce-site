"use client"

import { ProductCard } from "./product-card"
import { PanoramaViewer } from "./panorama-viewer"
import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, X, Tag } from "lucide-react"
import { useTagFilter } from "@/lib/contexts/tag-filter-context"

interface Image {
  id: string
  title: string
  description: string
  price: number
  thumbnail_large_url: string
  thumbnail_medium_url: string
  thumbnail_small_url: string
  is_featured: boolean
  active: boolean
  category_id: string
  license_id: string
  created_at: string
  tags: string[]
  categories?: {
    name: string
    description: string
  }
  licenses?: {
    name: string
    description: string
  }
  original_url?: string
}

interface ProductGridProps {
  initialImages?: Image[]
  categoryId?: string
}

export function ProductGrid({ initialImages = [], categoryId }: ProductGridProps) {
  const [images, setImages] = useState<Image[]>(initialImages)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || "all")
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [viewingPanorama, setViewingPanorama] = useState<Image | null>(null)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [displayCount, setDisplayCount] = useState(20)

  const { selectedTags, clearTags, hasActiveTags, toggleTag } = useTagFilter()

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    loadCategories()
    loadImages()
  }, [])

  useEffect(() => {
    loadImages()
  }, [selectedCategory, sortBy])

  useEffect(() => {
    const tags = new Set<string>()
    images.forEach((image) => {
      if (image.tags && Array.isArray(image.tags)) {
        image.tags.forEach((tag) => tags.add(tag))
      }
    })
    setAvailableTags(Array.from(tags).sort())
  }, [images])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("id, name").order("name")

      if (error) throw error

      const filteredCategories = (data || []).filter((category) => {
        const name = category.name
        if (
          name.toLowerCase() === "equirectangular" ||
          name.toLowerCase() === "fisheye" ||
          name.toLowerCase() === "stereographic"
        ) {
          return name[0] === name[0].toUpperCase()
        }
        return true
      })

      setCategories(filteredCategories)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadImages = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("images")
        .select(`
          id,
          title,
          description,
          price,
          thumbnail_large_url,
          thumbnail_medium_url,
          thumbnail_small_url,
          file_path,
          original_url,
          is_featured,
          active,
          category_id,
          license_id,
          created_at,
          tags,
          categories (
            name,
            description
          ),
          licenses (
            name,
            description
          )
        `)
        .eq("active", true)

      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory)
      }

      switch (sortBy) {
        case "price_asc":
          query = query.order("price", { ascending: true })
          break
        case "price_desc":
          query = query.order("price", { ascending: false })
          break
        case "title":
          query = query.order("title", { ascending: true })
          break
        default: // created_at
          query = query.order("created_at", { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error("Error loading images:", error)
    } finally {
      setLoading(false)
    }
  }

  const sortImages = (imagesToSort: Image[]) => {
    return [...imagesToSort].sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price
        case "price_desc":
          return b.price - a.price
        case "title":
          return a.title.localeCompare(b.title)
        default: // created_at
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }

  const filteredImages = images.filter((image) => {
    const matchesSearch =
      searchTerm === "" ||
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.categories?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (image.tags &&
        Array.isArray(image.tags) &&
        image.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())))

    const matchesTags =
      selectedTags.length === 0 ||
      (image.tags && Array.isArray(image.tags) && selectedTags.some((selectedTag) => image.tags.includes(selectedTag)))

    return matchesSearch && matchesTags
  })

  const sortedAndFilteredImages = sortImages(filteredImages)
  const displayedImages = sortedAndFilteredImages.slice(0, displayCount)
  const hasMore = displayCount < sortedAndFilteredImages.length

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSortBy("created_at")
    clearTags()
  }

  const handleView360 = (image: Image) => {
    setViewingPanorama(image)
  }

  const closePanoramaViewer = () => {
    setViewingPanorama(null)
  }

  const loadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 20, sortedAndFilteredImages.length))
  }

  useEffect(() => {
    setDisplayCount(20)
  }, [searchTerm, selectedCategory, sortBy, selectedTags])

  return (
    <div className="space-y-6">
      <div className="bg-card/30 rounded-lg p-4 space-y-4">
        {availableTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4" />
              <span>Filter by Tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <Badge
                    key={tag}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-muted"
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
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
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Newest First</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(searchTerm || selectedCategory !== "all" || sortBy !== "created_at" || hasActiveTags) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary">
                Search: {searchTerm}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchTerm("")} />
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary">
                Category: {categories.find((c) => c.id === selectedCategory)?.name}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedCategory("all")} />
              </Badge>
            )}
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="default" className="bg-primary text-primary-foreground">
                Tag: {tag}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => clearTags()} />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? (
            "Loading..."
          ) : (
            <>
              Showing {displayedImages.length} of {sortedAndFilteredImages.length} images
              {hasActiveTags && (
                <span className="ml-2 text-primary">
                  (filtered by {selectedTags.length} tag{selectedTags.length !== 1 ? "s" : ""})
                </span>
              )}
            </>
          )}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card/30 rounded-lg h-96 animate-pulse" />
          ))}
        </div>
      ) : sortedAndFilteredImages.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedImages.map((image, index) => (
              <ProductCard key={image.id} product={image} onView360={handleView360} priority={index < 8} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-8">
              <Button onClick={loadMore} variant="outline" size="lg" className="bg-card/50 hover:bg-card">
                Load More Images ({sortedAndFilteredImages.length - displayCount} remaining)
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No images found matching your criteria.</p>
          {hasActiveTags && (
            <p className="text-sm text-muted-foreground mt-2">
              Try removing some tag filters or search for different terms.
            </p>
          )}
          <Button variant="outline" onClick={clearFilters} className="mt-4 bg-transparent">
            Clear filters
          </Button>
        </div>
      )}

      {viewingPanorama && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[80vh] bg-background rounded-lg shadow-2xl overflow-hidden">
            <div className="h-[70vh]">
              <PanoramaViewer
                imageUrl={viewingPanorama.original_url || viewingPanorama.thumbnail_large_url}
                title={viewingPanorama.title}
                onClose={closePanoramaViewer}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
