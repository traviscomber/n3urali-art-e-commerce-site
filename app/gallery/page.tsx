"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, Filter, Grid, List } from "lucide-react"
import { getImagesPaginated, getCategoriesOptimized } from "@/app/actions/admin-actions"
import NextImage from "next/image"
import React from "react"
import { useInView } from "react-intersection-observer"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { QuickPreviewModal } from "@/components/quick-preview-modal"
import { useToast } from "@/components/toast-notifications"

interface GalleryImage {
  id: string
  title: string
  category: "equirectangular" | "fisheye"
  price: number
  preview_url: string
  dimensions: string
  file_size: number
  description?: string
}

interface Category {
  id: string
  name: string
  display_name: string
  image_count: number
}

const ImageCard = React.memo(
  ({
    image,
    size = "normal",
    onImageSelect,
    onQuickPreview,
  }: {
    image: GalleryImage
    size?: "normal" | "large" | "xlarge"
    onImageSelect: (image: GalleryImage) => void
    onQuickPreview: (image: GalleryImage) => void
  }) => {
    const [imageError, setImageError] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const { ref, inView } = useInView({
      threshold: 0.1,
      triggerOnce: true,
      rootMargin: "50px",
    })

    const handleImageError = useCallback(() => {
      console.log("[v0] Image failed to load:", image.preview_url)
      setImageError(true)
      setIsLoading(false)
    }, [image.preview_url])

    const handleImageLoad = useCallback(() => {
      console.log("[v0] Image loaded successfully:", image.preview_url)
      setIsLoading(false)
    }, [image.preview_url])

    const getImageSrc = useCallback(() => {
      if (imageError) {
        return "/placeholder.svg?height=400&width=400&text=Image+Unavailable"
      }

      // Always return the actual image URL, don't wait for inView
      return image.preview_url || "/placeholder.svg?height=400&width=400&text=No+Image"
    }, [image.preview_url, imageError])

    return (
      <div
        ref={ref}
        className={`group relative bg-card rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-border overflow-hidden cursor-pointer ${
          size === "xlarge"
            ? "min-w-[420px] max-w-[420px]"
            : size === "large"
              ? "min-w-[280px] max-w-[280px]"
              : "min-w-[250px] max-w-[250px]"
        }`}
        onClick={() => onImageSelect(image)}
      >
        <div
          className={`relative ${
            size === "xlarge"
              ? "aspect-video h-[236px]"
              : size === "large"
                ? "aspect-video h-[157px]"
                : "aspect-video h-[140px]"
          } overflow-hidden`}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          <NextImage
            src={getImageSrc()}
            alt={image.title}
            fill
            className="object-contain bg-muted/20 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={handleImageError}
            onLoad={handleImageLoad}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />

          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
              <div className="text-center text-xs text-muted-foreground">
                <div className="w-8 h-8 mx-auto mb-1 bg-muted-foreground/20 rounded" />
                Image Unavailable
              </div>
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-foreground truncate text-sm">{image.title}</h3>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {image.category === "equirectangular" ? "360°" : "Fisheye"}
            </Badge>
            <span className="text-sm font-bold text-emerald-500">${image.price}</span>
          </div>
          <Button onClick={() => onQuickPreview(image)} variant="outline" size="sm">
            Quick Preview
          </Button>
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.image.id === nextProps.image.id &&
      prevProps.image.title === nextProps.image.title &&
      prevProps.size === nextProps.size
    )
  },
)

ImageCard.displayName = "ImageCard"

export default function GalleryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const [images, setImages] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [quickPreviewImage, setQuickPreviewImage] = useState<any>(null)
  const [isQuickPreviewOpen, setIsQuickPreviewOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const pageSize = 20

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await getCategoriesOptimized()
        if (result.success) {
          setCategories(result.data)
          console.log("[v0] Loaded categories:", result.data)
        }
      } catch (error) {
        console.error("[v0] Error loading categories:", error)
      }
    }
    loadCategories()
  }, [])

  const fetchImages = useCallback(
    async (page = 1, append = false, category?: string) => {
      if (!append) setLoading(true)

      try {
        console.log("[v0] Fetching images - page:", page, "pageSize:", pageSize, "category:", category)
        const result = await getImagesPaginated(page, pageSize, category === "all" ? undefined : category)
        console.log("[v0] getImagesPaginated result:", result)

        const fetchedData = result.success ? result.data : { images: [], pagination: { totalPages: 1 } }
        console.log("[v0] Fetched data:", fetchedData)
        console.log("[v0] Images count:", fetchedData.images?.length || 0)

        if (append) {
          setImages((prev) => [...prev, ...fetchedData.images])
        } else {
          setImages(fetchedData.images)
        }

        setTotalPages(fetchedData.pagination?.totalPages || 1)
        setHasMore(page < (fetchedData.pagination?.totalPages || 1))
      } catch (error) {
        console.error("[v0] Error fetching images:", error)
      } finally {
        setLoading(false)
      }
    },
    [pageSize],
  )

  useEffect(() => {
    const categoryParam = searchParams.get("category") || "all"
    setSelectedCategory(categoryParam)
    setCurrentPage(1)
    fetchImages(1, false, categoryParam)
  }, [fetchImages, searchParams])

  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category)
      setCurrentPage(1)

      // Update URL without page reload
      const params = new URLSearchParams(searchParams.toString())
      if (category === "all") {
        params.delete("category")
      } else {
        params.set("category", category)
      }

      const newUrl = params.toString() ? `?${params.toString()}` : "/gallery"
      window.history.pushState({}, "", newUrl)

      fetchImages(1, false, category)
    },
    [searchParams, fetchImages],
  )

  const transformedImages = useMemo(() => {
    console.log("[v0] Transforming images, raw count:", images.length)
    console.log("[v0] Raw images sample:", images.slice(0, 2))

    const transformed = images.map((image: any) => {
      console.log("[v0] Processing image:", {
        id: image.id,
        title: image.title,
        file_path: image.file_path,
        image_url: image.image_url,
        thumbnail_url: image.thumbnail_url,
        category_name: image.category_name,
        category_id: image.category_id,
      })

      const preview_url =
        image.file_path ||
        image.image_url ||
        image.thumbnail_url ||
        "/placeholder.svg?height=400&width=400&text=No+Image"

      let category: "equirectangular" | "fisheye" = "equirectangular"
      if (image.category_name) {
        const categoryLower = image.category_name.toLowerCase()
        if (categoryLower.includes("fisheye") || categoryLower.includes("180")) {
          category = "fisheye"
        } else if (categoryLower.includes("equirectangular") || categoryLower.includes("360")) {
          category = "equirectangular"
        }
      }

      const transformedImage = {
        id: image.id,
        title: image.title,
        category,
        price: Number.parseFloat(image.price) || 0,
        preview_url, // Now correctly mapped from available URL fields
        dimensions: "4096x4096",
        file_size: 20000000,
        description: image.description || "",
      }

      console.log("[v0] Transformed image:", {
        id: transformedImage.id,
        title: transformedImage.title,
        category: transformedImage.category,
        preview_url: transformedImage.preview_url.substring(0, 100) + "...",
      })

      return transformedImage
    })

    console.log("[v0] Transformed images count:", transformed.length)
    console.log(
      "[v0] Categories found:",
      transformed.map((img) => img.category),
    )
    return transformed
  }, [images])

  const { equirectangularImages, fisheyeImages } = useMemo(() => {
    const equirectangular = transformedImages.filter((img) => img.category === "equirectangular")
    const fisheye = transformedImages.filter((img) => img.category === "fisheye")

    console.log("[v0] Filtered images:", {
      total: transformedImages.length,
      equirectangular: equirectangular.length,
      fisheye: fisheye.length,
    })

    return { equirectangularImages: equirectangular, fisheyeImages: fisheye }
  }, [transformedImages])

  const handleImageSelect = useCallback(
    async (image: GalleryImage) => {
      console.log("[v0] Image clicked, redirecting to photo:", image.title, "ID:", image.id)
      router.push(`/photo/${image.id}`)
    },
    [router],
  )

  const handleQuickPreview = useCallback((image: GalleryImage) => {
    setQuickPreviewImage(image)
    setIsQuickPreviewOpen(true)
  }, [])

  const scrollSection = useCallback((direction: "left" | "right", sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      const scrollAmount = 320
      section.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }, [])

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchImages(nextPage, true, selectedCategory)
    }
  }, [hasMore, loading, currentPage, fetchImages, selectedCategory])

  const { ref: loadMoreRef } = useInView({
    threshold: 0.1,
    onChange: (inView) => {
      if (inView && hasMore && !loading) {
        loadMore()
      }
    },
  })

  if (loading && images.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-b from-muted/30 to-background">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Badge variant="secondary" className="animate-pulse-glow">
                Professional Collection
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
                Immersive
                <span className="text-primary block">Image Gallery</span>
              </h1>

              <p className="text-xl text-muted-foreground text-pretty">
                Discover our curated collection of high-resolution equirectangular and fisheye images. Click any image
                to view details and purchase directly.
              </p>
            </div>
          </div>
        </section>

        {/* Loading Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading gallery images...</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <BreadcrumbNav />
      </div>

      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <div
            className="absolute top-20 left-10 w-24 h-24 bg-primary/8 rounded-full animate-pulse"
            style={{ animationDuration: "6s" }}
          />
          <div
            className="absolute bottom-20 right-20 w-20 h-20 bg-secondary/8 rounded-full animate-pulse"
            style={{ animationDuration: "8s" }}
          />
        </div>

        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary">Professional Collection</Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
              Immersive
              <span className="text-primary block">Image Gallery</span>
            </h1>

            <p className="text-xl text-muted-foreground text-pretty">
              Discover our curated collection of high-resolution equirectangular and fisheye images. Click any image to
              view details and purchase directly.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 border-b bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filter by category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange("all")}
                  className="h-8"
                >
                  All Images ({transformedImages.length})
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(category.name)}
                    className="h-8"
                  >
                    {category.display_name} ({category.image_count})
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 space-y-16">
        <div className="container mx-auto px-4">
          {selectedCategory !== "all" ? (
            /* Filtered Results */
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">
                  {categories.find((c) => c.name === selectedCategory)?.display_name || selectedCategory} Images
                </h2>
                <p className="text-muted-foreground mt-1">
                  {transformedImages.length} images found • Click any image to view details and purchase
                </p>
              </div>

              {transformedImages.length > 0 ? (
                <>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {transformedImages.map((image) => (
                        <div
                          key={image.id}
                          className="group relative cursor-pointer hover:scale-105 transition-transform duration-200"
                          onClick={() => handleImageSelect(image)}
                        >
                          <div className="relative aspect-square overflow-hidden rounded-lg">
                            <NextImage
                              src={image.preview_url}
                              alt={image.title}
                              fill
                              className="object-contain bg-muted/10"
                              loading="lazy"
                              onError={(e) => {
                                console.log("[v0] Grid image failed to load:", image.preview_url)
                                const target = e.currentTarget as HTMLImageElement
                                target.src = "/placeholder.svg?height=200&width=200&text=Error"
                              }}
                              onLoad={() => {
                                console.log("[v0] Grid image loaded successfully:", image.preview_url)
                              }}
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                                {image.title}
                              </div>
                            </div>
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="text-xs">
                                ${image.price}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transformedImages.map((image) => (
                        <div
                          key={image.id}
                          className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleImageSelect(image)}
                        >
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <NextImage
                              src={image.preview_url}
                              alt={image.title}
                              fill
                              className="object-contain bg-muted/10 rounded"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">{image.title}</h3>
                            {image.description && (
                              <p className="text-sm text-muted-foreground truncate mt-1">{image.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {image.category === "equirectangular" ? "360°" : "Fisheye"}
                              </Badge>
                              <span className="text-sm font-bold text-emerald-500">${image.price}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuickPreview(image)
                            }}
                          >
                            Preview
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {hasMore && (
                    <div ref={loadMoreRef} className="flex justify-center py-8">
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-muted-foreground">Loading more images...</span>
                        </div>
                      ) : (
                        <Button onClick={loadMore} variant="outline">
                          Load More Images
                        </Button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">No images found</h3>
                  <p className="text-muted-foreground">No images available in this category</p>
                  <Button onClick={() => handleCategoryChange("all")} variant="outline" className="mt-4">
                    View All Images
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Category Sections (All Images View) */
            <>
              {/* 360° Images Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">360° Images</h2>
                    <p className="text-muted-foreground mt-1">Equirectangular panoramic photography</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scrollSection("left", "equirectangular-scroll")}
                      className="h-10 w-10 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scrollSection("right", "equirectangular-scroll")}
                      className="h-10 w-10 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div
                  id="equirectangular-scroll"
                  className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {equirectangularImages.length > 0 ? (
                    equirectangularImages
                      .slice(0, 6)
                      .map((image) => (
                        <ImageCard
                          key={image.id}
                          image={image}
                          size="xlarge"
                          onImageSelect={handleImageSelect}
                          onQuickPreview={handleQuickPreview}
                        />
                      ))
                  ) : (
                    <div className="text-center py-8 w-full">
                      <p className="text-muted-foreground">No 360° images available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fisheye Images Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">180° Images</h2>
                    <p className="text-muted-foreground mt-1">Fisheye lens photography</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scrollSection("left", "fisheye-scroll")}
                      className="h-10 w-10 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scrollSection("right", "fisheye-scroll")}
                      className="h-10 w-10 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div
                  id="fisheye-scroll"
                  className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {fisheyeImages.length > 0 ? (
                    fisheyeImages
                      .slice(0, 6)
                      .map((image) => (
                        <ImageCard
                          key={image.id}
                          image={image}
                          size="xlarge"
                          onImageSelect={handleImageSelect}
                          onQuickPreview={handleQuickPreview}
                        />
                      ))
                  ) : (
                    <div className="text-center py-8 w-full">
                      <p className="text-muted-foreground">No fisheye images available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Complete Gallery Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-foreground">Complete Gallery</h2>
                  <p className="text-muted-foreground mt-1">Click any image to view details and purchase</p>
                </div>

                {transformedImages.length > 0 ? (
                  <>
                    <div className="grid grid-cols-5 lg:grid-cols-10 gap-3">
                      {transformedImages.map((image) => (
                        <div
                          key={image.id}
                          className="group relative cursor-pointer hover:scale-105 transition-transform duration-200"
                          onClick={() => handleImageSelect(image)}
                        >
                          <div className="relative aspect-square overflow-hidden rounded-lg">
                            <NextImage
                              src={image.preview_url}
                              alt={image.title}
                              fill
                              className="object-contain bg-muted/10"
                              loading="lazy"
                              onError={(e) => {
                                console.log("[v0] Grid image failed to load:", image.preview_url)
                                const target = e.currentTarget as HTMLImageElement
                                target.src = "/placeholder.svg?height=200&width=200&text=Error"
                              }}
                              onLoad={() => {
                                console.log("[v0] Grid image loaded successfully:", image.preview_url)
                              }}
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                            />
                            <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-60" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {hasMore && (
                      <div ref={loadMoreRef} className="flex justify-center py-8">
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-muted-foreground">Loading more images...</span>
                          </div>
                        ) : (
                          <Button onClick={loadMore} variant="outline">
                            Load More Images
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">No images available</h3>
                    <p className="text-muted-foreground">Upload some images in the admin panel to see them here</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <QuickPreviewModal
        image={quickPreviewImage}
        isOpen={isQuickPreviewOpen}
        onClose={() => setIsQuickPreviewOpen(false)}
        onViewFull={handleImageSelect}
      />
    </div>
  )
}
