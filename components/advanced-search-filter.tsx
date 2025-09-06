"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, X, SlidersHorizontal, Tag } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export interface SearchFilters {
  searchTerm: string
  category: string
  priceRange: [number, number]
  sortBy: string
  tags: string[]
  featured: boolean | null
  resolution: string
  fileSize: string
}

interface AdvancedSearchFilterProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  availableTags?: string[]
  totalResults: number
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "featured", label: "Featured First" },
]

const RESOLUTION_OPTIONS = [
  { value: "all", label: "All Resolutions" },
  { value: "4k", label: "4K (3840×2160)" },
  { value: "8k", label: "8K (7680×4320)" },
  { value: "16k", label: "16K (15360×8640)" },
  { value: "custom", label: "Custom Resolution" },
]

const FILE_SIZE_OPTIONS = [
  { value: "all", label: "All Sizes" },
  { value: "small", label: "< 10 MB" },
  { value: "medium", label: "10-50 MB" },
  { value: "large", label: "50-100 MB" },
  { value: "xlarge", label: "> 100 MB" },
]

export function AdvancedSearchFilter({
  filters,
  onFiltersChange,
  availableTags = [],
  totalResults,
}: AdvancedSearchFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const generateSearchSuggestions = useCallback(
    (term: string) => {
      if (!term || term.length < 2) {
        setSearchSuggestions([])
        return
      }

      const commonTerms = [
        "landscape",
        "architecture",
        "interior",
        "nature",
        "urban",
        "sky",
        "panorama",
        "spherical",
        "equirectangular",
        "fisheye",
        "360",
        "vr",
      ]

      const suggestions = [
        ...availableTags.filter((tag) => tag.toLowerCase().includes(term.toLowerCase())),
        ...commonTerms.filter((term_item) => term_item.toLowerCase().includes(term.toLowerCase())),
      ].slice(0, 5)

      setSearchSuggestions(suggestions)
    },
    [availableTags],
  )

  useEffect(() => {
    generateSearchSuggestions(filters.searchTerm)
  }, [filters.searchTerm, generateSearchSuggestions])

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag]
    handleFilterChange("tags", newTags)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: "",
      category: "all",
      priceRange: [0, 1000],
      sortBy: "newest",
      tags: [],
      featured: null,
      resolution: "all",
      fileSize: "all",
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.category !== "all") count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++
    if (filters.tags.length > 0) count++
    if (filters.featured !== null) count++
    if (filters.resolution !== "all") count++
    if (filters.fileSize !== "all") count++
    return count
  }

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search images, tags, descriptions..."
            value={filters.searchTerm}
            onChange={(e) => {
              handleFilterChange("searchTerm", e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background transition-all duration-300"
          />

          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 bg-background border border-border/50 rounded-md shadow-lg mt-1">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors text-sm"
                  onClick={() => {
                    handleFilterChange("searchTerm", suggestion)
                    setShowSuggestions(false)
                  }}
                >
                  <Tag className="w-3 h-3 inline mr-2" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Filters */}
        <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
          <SelectTrigger className="w-48 h-12 bg-background/50 border-border/50">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="equirectangular">360° Images</SelectItem>
            <SelectItem value="fisheye">Fisheye</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
          <SelectTrigger className="w-48 h-12 bg-background/50 border-border/50">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-12 px-4 relative bg-transparent">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Advanced
              {getActiveFilterCount() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                Advanced Filters
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Price Range</Label>
                <div className="px-2">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => handleFilterChange("priceRange", value as [number, number])}
                    max={1000}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Resolution Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Resolution</Label>
                <Select value={filters.resolution} onValueChange={(value) => handleFilterChange("resolution", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOLUTION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Size Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">File Size</Label>
                <Select value={filters.fileSize} onValueChange={(value) => handleFilterChange("fileSize", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILE_SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Featured Toggle */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Featured Images</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured-only"
                    checked={filters.featured === true}
                    onCheckedChange={(checked) => handleFilterChange("featured", checked ? true : null)}
                  />
                  <Label htmlFor="featured-only" className="text-sm">
                    Show featured images only
                  </Label>
                </div>
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.slice(0, 20).map((tag) => (
                      <Badge
                        key={tag}
                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80 transition-colors"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                        {filters.tags.includes(tag) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {filters.searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.searchTerm}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange("searchTerm", "")} />
            </Badge>
          )}

          {filters.category !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.category === "equirectangular" ? "360°" : "Fisheye"}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange("category", "all")} />
            </Badge>
          )}

          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
            <Badge variant="secondary" className="gap-1">
              ${filters.priceRange[0]} - ${filters.priceRange[1]}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange("priceRange", [0, 1000])} />
            </Badge>
          )}

          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleTagToggle(tag)} />
            </Badge>
          ))}

          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {totalResults} {totalResults === 1 ? "image" : "images"} found
          {getActiveFilterCount() > 0 &&
            ` with ${getActiveFilterCount()} filter${getActiveFilterCount() > 1 ? "s" : ""} applied`}
        </span>
      </div>
    </div>
  )
}
