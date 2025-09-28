"use client"

import { ProductCard } from "./product-card"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

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
  categories?: {
    name: string
    description: string
  }
  licenses?: {
    name: string
    description: string
  }
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

  const supabase = createClient()

  useEffect(() => {
    loadCategories()
    if (!initialImages.length) {
      loadImages()
    }
  }, [])

  useEffect(() => {
    if (!initialImages.length) {
      loadImages()
    }
  }, [selectedCategory, sortBy])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("id, name").order("name")

      if (error) throw error
      setCategories(data || [])
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
          *,
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

      // Apply sorting
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
        default:
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

  const filteredImages = images.filter((image) => {
    const matchesSearch =
      searchTerm === "" ||
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.categories?.name.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSortBy("created_at")
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card/30 rounded-lg p-4 space-y-4">
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

        {/* Active filters */}
        {(searchTerm || selectedCategory !== "all" || sortBy !== "created_at") && (
          <div className="flex items-center gap-2">
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
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `${filteredImages.length} images found`}
        </p>
      </div>

      {/* Image grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card/30 rounded-lg h-96 animate-pulse" />
          ))}
        </div>
      ) : filteredImages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <ProductCard key={image.id} image={image} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No images found matching your criteria.</p>
          <Button variant="outline" onClick={clearFilters} className="mt-4 bg-transparent">
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}
