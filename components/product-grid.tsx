"use client"

import { ProductCard } from "./product-card"
import { PanoramaViewer } from "./panorama-viewer"
import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Tag, Search } from 'lucide-react'
import { useTagFilter } from "@/lib/contexts/tag-filter-context"
import { Input } from "@/components/ui/input"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [viewingPanorama, setViewingPanorama] = useState<Image | null>(null)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [displayCount, setDisplayCount] = useState(20)
  const [hasMoreInDB, setHasMoreInDB] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)
  const BATCH_SIZE = 30

  const { selectedTags, clearTags, hasActiveTags, toggleTag } = useTagFilter()

  // Initialize Supabase client only in browser
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        setSupabase(createClient())
      }
    } catch (error) {
      console.error('[v0] Failed to create Supabase client:', error)
    }
  }, [])

  useEffect(() => {
    if (!initialImages || initialImages.length === 0) {
      loadImages()
    } else {
      setLoading(false)
      setHasMoreInDB(false)
    }
  }, [])

  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages)
      setHasMoreInDB(false)
      setLoading(false)
    }
  }, [initialImages])

  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      return
    }
    setImages([])
    setHasMoreInDB(true)
    loadImages()
  }, [sortBy])

  useEffect(() => {
    const tags = new Set<string>()
    images.forEach((image) => {
      if (image.tags && Array.isArray(image.tags)) {
        image.tags.forEach((tag) => tags.add(tag))
      }
    })
    setAvailableTags(Array.from(tags).sort())
  }, [images])

  const loadImages = async (append = false) => {
    if (!initialImages || initialImages.length === 0) {
      setHasMoreInDB(false)
    }
    if (initialImages && initialImages.length > 0) {
      setLoading(false)
      setHasMoreInDB(false)
      return
    }

    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    try {
      // Ensure Supabase client is initialized before querying
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      const startIndex = append ? images.length : 0
      const endIndex = startIndex + BATCH_SIZE - 1

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
          tags
        `)
        .eq("active", true)
        .range(startIndex, endIndex)

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

      if (!data || data.length < BATCH_SIZE) {
        setHasMoreInDB(false)
      }

      if (append) {
        setImages((prev) => [...prev, ...(data || [])])
      } else {
        setImages(data || [])
      }
    } catch (error) {
      console.error("Error loading images:", error)
      if (error instanceof Error && error.message.includes("JSON")) {
        console.error("Database contains corrupted data. Please contact support.")
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
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
      !searchQuery ||
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (image.description && image.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTags =
      selectedTags.length === 0 ||
      (image.tags && Array.isArray(image.tags) && selectedTags.some((selectedTag) => image.tags.includes(selectedTag)))

    return matchesSearch && matchesTags
  })

  const sortedAndFilteredImages = sortImages(filteredImages)
  const displayedImages = sortedAndFilteredImages.slice(0, displayCount)
  const hasMore = displayCount < sortedAndFilteredImages.length

  const clearFilters = () => {
    setSortBy("created_at")
    setSearchQuery("")
    clearTags()
  }

  const handleView360 = (image: Image) => {
    setViewingPanorama(image)
  }

  const closePanoramaViewer = () => {
    setViewingPanorama(null)
  }

  const loadMore = () => {
    if (hasMore) {
      setDisplayCount((prev) => Math.min(prev + 20, sortedAndFilteredImages.length))
    } else if (hasMoreInDB && !loadingMore) {
      loadImages(true)
    }
  }

  useEffect(() => {
    setDisplayCount(20)
  }, [sortBy, selectedTags])

  useEffect(() => {
    if (
      !loading &&
      !loadingMore &&
      displayCount >= sortedAndFilteredImages.length &&
      hasMoreInDB &&
      images.length > 0
    ) {
      loadImages(true)
    }
  }, [displayCount, sortedAndFilteredImages.length, hasMoreInDB, loading, loadingMore])

  return (
    <div className="space-y-6">
      <div className="bg-card/30 rounded-lg p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>

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

        <div className="flex justify-end">
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

        {(sortBy !== "created_at" || hasActiveTags || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="default" className="bg-primary text-primary-foreground">
                Search: "{searchQuery}"
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchQuery("")} />
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
              {(hasActiveTags || searchQuery) && (
                <span className="ml-2 text-primary">
                  (filtered by {[searchQuery && "search", hasActiveTags && `${selectedTags.length} tag${selectedTags.length !== 1 ? "s" : ""}`].filter(Boolean).join(" and ")})
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

          {(hasMore || (hasMoreInDB && !loadingMore)) && (
            <div className="flex justify-center pt-8">
              <Button
                onClick={loadMore}
                variant="outline"
                size="lg"
                className="bg-card/50 hover:bg-card"
                disabled={loadingMore}
              >
                {loadingMore
                  ? "Loading..."
                  : `Load More Images ${hasMore ? `(${sortedAndFilteredImages.length - displayCount} remaining)` : ""}`}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No images found matching your criteria.</p>
          {(hasActiveTags || searchQuery) && (
            <p className="text-sm text-muted-foreground mt-2">
              Try {searchQuery && "changing your search term"}{searchQuery && hasActiveTags && " or "}{ hasActiveTags && "removing some tag filters"}.
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
