"use client"

import { useState, useEffect, useMemo } from "react"
import type { SearchFilters } from "@/components/advanced-search-filter"

interface SearchableImage {
  id: string
  title: string
  description?: string
  category: "equirectangular" | "fisheye"
  price: number
  featured?: boolean
  file_size?: number
  dimensions?: string
  tags?: string[]
  created_at?: string
}

interface UseAdvancedSearchProps {
  images: SearchableImage[]
  initialFilters?: Partial<SearchFilters>
}

export function useAdvancedSearch({ images, initialFilters = {} }: UseAdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    category: "all",
    priceRange: [0, 1000],
    sortBy: "newest",
    tags: [],
    featured: null,
    resolution: "all",
    fileSize: "all",
    ...initialFilters,
  })

  // Extract available tags from images
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    images.forEach((image) => {
      if (image.tags) {
        image.tags.forEach((tag) => tagSet.add(tag))
      }
      // Add category as a tag
      tagSet.add(image.category)
    })
    return Array.from(tagSet).sort()
  }, [images])

  // Filter and sort images based on current filters
  const filteredImages = useMemo(() => {
    let filtered = [...images]

    // Text search
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (image) =>
          image.title.toLowerCase().includes(searchLower) ||
          image.description?.toLowerCase().includes(searchLower) ||
          image.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((image) => image.category === filters.category)
    }

    // Price range filter
    filtered = filtered.filter((image) => image.price >= filters.priceRange[0] && image.price <= filters.priceRange[1])

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter((image) =>
        filters.tags.some((tag) => image.tags?.includes(tag) || image.category === tag),
      )
    }

    // Featured filter
    if (filters.featured === true) {
      filtered = filtered.filter((image) => image.featured === true)
    }

    // File size filter
    if (filters.fileSize !== "all") {
      filtered = filtered.filter((image) => {
        const sizeMB = (image.file_size || 0) / (1024 * 1024)
        switch (filters.fileSize) {
          case "small":
            return sizeMB < 10
          case "medium":
            return sizeMB >= 10 && sizeMB < 50
          case "large":
            return sizeMB >= 50 && sizeMB < 100
          case "xlarge":
            return sizeMB >= 100
          default:
            return true
        }
      })
    }

    // Resolution filter (simplified - would need actual dimension data)
    if (filters.resolution !== "all") {
      // This would need to be implemented based on actual dimension data
      // For now, we'll just return the filtered results
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "name-asc":
          return a.title.localeCompare(b.title)
        case "name-desc":
          return b.title.localeCompare(a.title)
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        case "oldest":
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        case "newest":
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      }
    })

    return filtered
  }, [images, filters])

  // Search history management
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  useEffect(() => {
    if (filters.searchTerm && filters.searchTerm.length > 2) {
      setSearchHistory((prev) => {
        const newHistory = [filters.searchTerm, ...prev.filter((term) => term !== filters.searchTerm)]
        return newHistory.slice(0, 10) // Keep only last 10 searches
      })
    }
  }, [filters.searchTerm])

  return {
    filters,
    setFilters,
    filteredImages,
    availableTags,
    searchHistory,
    totalResults: filteredImages.length,
  }
}
