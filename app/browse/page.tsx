"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  license_id?: string // Added license_id property for image license IDs
}

interface Category {
  id: string
  name: string
  description: string
  active: boolean
  display_name?: string // Added display_name property for category display names
}

interface CategoryWithImages extends Category {
  images: Image[]
}

const LazyImage = ({
  src,
  alt,
  className,
  onClick,
}: { src: string; alt: string; className: string; onClick?: () => void }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={imgRef} className={className} onClick={onClick}>
      {isInView ? (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover bg-muted/10 transition-all duration-200"
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      ) : (
        <div className="w-full h-full bg-muted/30 animate-pulse" />
      )}
    </div>
  )
}

export default function BrowsePage() {
  const [categoriesWithImages, setCategoriesWithImages] = useState<CategoryWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editingImage, setEditingImage] = useState<Image | null>(null)
  const [previewImage, setPreviewImage] = useState<Image | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [displayedImages, setDisplayedImages] = useState<Image[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalImages, setTotalImages] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const { user } = useAuth()

  const isAdmin = user?.is_admin
  const IMAGES_PER_LOAD = 24 // Load 24 images at a time (4 rows of 6)

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

        console.log("[v0] Total images loaded:", images.length)
        console.log("[v0] Categories loaded:", cats.length)

        setCategories(cats)
        setTotalImages(images.length)
        setDisplayedImages(images.slice(0, IMAGES_PER_LOAD))
        setHasMore(images.length > IMAGES_PER_LOAD)

        console.log("[v0] Displayed images:", Math.min(images.length, IMAGES_PER_LOAD))
        console.log("[v0] Has more images:", images.length > IMAGES_PER_LOAD)

        const categoryMap = new Map<string, CategoryWithImages>()

        cats.forEach((cat) => {
          categoryMap.set(cat.id, {
            ...cat,
            images: [],
          })
        })

        images.forEach((image) => {
          if (image.category_id && categoryMap.has(image.category_id)) {
            categoryMap.get(image.category_id)!.images.push(image)
          }
        })

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

  const loadMoreImages = useCallback(async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)

    try {
      const imagesResult = await getImages()
      if (imagesResult.success) {
        const allImages = imagesResult.data || []
        const currentLength = displayedImages.length
        const nextBatch = allImages.slice(currentLength, currentLength + IMAGES_PER_LOAD)

        if (nextBatch.length > 0) {
          setDisplayedImages((prev) => [...prev, ...nextBatch])
          setHasMore(currentLength + nextBatch.length < allImages.length)
        } else {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error("Error loading more images:", error)
    } finally {
      setLoadingMore(false)
    }
  }, [displayedImages.length, loadingMore, hasMore])

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreImages()
        }
      },
      { threshold: 0.1 },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [loadMoreImages, hasMore, loadingMore])

  const getCategoryDisplayName = (category: Category) => {
    return category.display_name || category.name
  }

  const getCategoryBadgeName = (categoryName: string) => {
    if (categoryName === "equirectangular") return "360°"
    if (categoryName === "fisheye") return "180°"
    return categoryName
  }

  const scrollCategory = (categoryId: string, direction: "left" | "right") => {
    const container = document.getElementById(`category-${categoryId}`)
    if (container) {
      const scrollAmount = 320
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleEditImage = (image: Image) => {
    setEditingImage({ ...image })
  }

  const handlePreviewImage = (image: Image) => {
    setPreviewImage(image)
  }

  const handleClosePreview = () => {
    setPreviewImage(null)
  }

  const handleSaveEdit = async () => {
    if (!editingImage) return

    setEditingImage(null)
    await loadData()
  }

  const handleCancelEdit = () => {
    setEditingImage(null)
  }

  const handlePurchaseImage = async (image: Image) => {
    if (!user) {
      // Redirect to login or show auth modal
      alert("Please sign in to purchase images")
      return
    }

    try {
      // Create order for the image
      const orderData = {
        user_email: user.email,
        items: [
          {
            image_id: image.id,
            license_id: image.license_id || "default-license-id", // You may need to add license selection
            price: image.price,
          },
        ],
      }

      // Here you would integrate with your payment system
      // For now, we'll simulate a successful purchase
      const confirmed = confirm(`Purchase "${image.title}" for $${image.price}?`)

      if (confirmed) {
        // Simulate successful purchase
        alert(`Thank you! Your purchase of "${image.title}" is complete. Check your email for download instructions.`)

        // Close preview modal if open
        setPreviewImage(null)

        // You could redirect to orders page or show download link
        // window.location.href = '/account/orders'
      }
    } catch (error) {
      console.error("Purchase error:", error)
      alert("There was an error processing your purchase. Please try again.")
    }
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
      <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-xl border-b border-border/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
                Premium Gallery
              </h1>
              <p className="text-muted-foreground text-lg font-medium">
                Discover our curated collection of professional imagery
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-4">
                <Button
                  variant={editMode ? "default" : "outline"}
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2 px-6 py-3 text-base font-medium"
                >
                  {editMode ? <Eye className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
                  {editMode ? "View Mode" : "Edit Mode"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {categoriesWithImages.map((category) => (
          <div key={category.id} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-2">{getCategoryDisplayName(category)}</h2>
                <p className="text-lg text-muted-foreground font-medium">
                  {category.images.length} premium image{category.images.length !== 1 ? "s" : ""} available
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollCategory(category.id, "left")}
                  className="h-12 w-12 p-0 hover:bg-accent/10 hover:text-accent"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollCategory(category.id, "right")}
                  className="h-12 w-12 p-0 hover:bg-accent/10 hover:text-accent"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <div
                id={`category-${category.id}`}
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-6"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {category.images.slice(0, 6).map((image) => (
                  <div
                    key={image.id}
                    className="flex-shrink-0 w-72 gallery-frame rounded-xl p-3 transition-all duration-500 hover:animate-elegant-float group cursor-pointer"
                  >
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted/10">
                      <LazyImage
                        src={image.thumbnail_url || image.image_url}
                        alt={image.title}
                        className="w-full h-full transition-all duration-500 group-hover:scale-[1.02]"
                      />
                      {image.featured && (
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground font-semibold px-2 py-1 text-xs">
                          Featured
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handlePreviewImage(image)}
                          className="flex items-center gap-2 bg-white/90 text-foreground hover:bg-white font-semibold px-3 py-2 backdrop-blur-sm text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handlePurchaseImage(image)}
                          className="flex items-center gap-2 bg-primary/90 text-primary-foreground hover:bg-primary font-semibold px-3 py-2 backdrop-blur-sm text-sm"
                        >
                          Buy ${image.price}
                        </Button>
                        {editMode && isAdmin && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditImage(image)}
                            className="flex items-center gap-2 bg-accent/90 text-accent-foreground hover:bg-accent font-semibold px-3 py-2 backdrop-blur-sm text-sm"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="pt-3 space-y-2">
                      <h3 className="font-bold text-lg text-foreground line-clamp-1">{image.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{image.description}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xl font-bold text-primary">${image.price}</span>
                        <Badge variant="secondary" className="text-xs font-semibold px-2 py-1">
                          {getCategoryBadgeName(image.category_name)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {totalImages > 0 && (
          <div className="space-y-8 pt-16 border-t border-border/30">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-foreground mb-4">Complete Gallery</h2>
              <p className="text-lg text-muted-foreground font-medium">
                {totalImages} premium images • 6 per row • Click to view details
              </p>
            </div>

            <div className="grid grid-cols-5 lg:grid-cols-10 gap-3">
              {displayedImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square overflow-hidden cursor-pointer group"
                  onClick={() => handlePreviewImage(image)}
                >
                  <LazyImage
                    src={image.thumbnail_url || image.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
                    <div className="text-center text-white">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{image.title}</h3>
                      <p className="text-2xl font-bold text-green-400">${image.price}</p>
                      <p className="text-sm text-gray-300 mt-1">{getCategoryBadgeName(image.category_name)}</p>
                    </div>
                  </div>
                  {image.featured && <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full"></div>}
                  {editMode && isAdmin && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditImage(image)
                        }}
                        className="h-8 w-8 p-0 bg-white/90 text-foreground hover:bg-white"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {loadingMore ? (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="font-medium">Loading more images...</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground font-medium">Scroll to load more</div>
                )}
              </div>
            )}

            {!hasMore && displayedImages.length > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground font-medium">
                  You've reached the end • {displayedImages.length} images total
                </p>
              </div>
            )}
          </div>
        )}

        {categoriesWithImages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-xl font-medium">
              No images found. Upload some images to get started!
            </p>
          </div>
        )}
      </div>

      {previewImage && !editingImage && (
        <div className="fixed inset-0 premium-backdrop z-50 flex items-center justify-center p-6">
          <div className="relative w-full max-w-5xl max-h-[95vh] bg-card rounded-2xl overflow-hidden shadow-2xl border border-border/20">
            <div className="relative p-6 bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClosePreview}
                  className="text-primary-foreground hover:bg-primary-foreground/20 h-10 w-10 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
                <div>
                  <h3 className="text-2xl font-bold">{previewImage.title}</h3>
                  <p className="text-primary-foreground/80 text-base font-medium">
                    Preview • Watermarked • Size: 720×720px
                  </p>
                </div>
              </div>
            </div>

            <div className="relative bg-muted/20 flex items-center justify-center min-h-[500px] max-h-[60vh] overflow-hidden p-8">
              <div className="relative max-w-[720px] max-h-[720px] gallery-frame rounded-lg p-4 bg-background">
                <img
                  src={previewImage.image_url || "/placeholder.svg"}
                  alt={previewImage.title}
                  className="max-w-full max-h-full object-contain rounded-md"
                  style={{ maxWidth: "720px", maxHeight: "720px" }}
                />
                <div
                  className="absolute inset-4 pointer-events-none opacity-15 rounded-md"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' fontFamily='Arial, sans-serif' fontSize='48' fontWeight='700' textAnchor='middle' dominantBaseline='middle' fill='%23FFFFFF' stroke='%23E5E5E5' strokeWidth='1' opacity='0.6' transform='rotate(-45 200 200)'%3EN3URALI.ART%3C/text%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "380px 380px",
                  }}
                />
              </div>
            </div>

            <div className="p-8 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-lg text-foreground mb-3">Description</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {previewImage.description || "No description available"}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-muted-foreground font-medium">Type:</span>
                    <Badge variant="secondary" className="font-semibold px-3 py-1">
                      {getCategoryBadgeName(previewImage.category_name)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-muted-foreground font-medium">Price:</span>
                    <span className="text-primary font-bold text-xl">${previewImage.price}</span>
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={() => handlePurchaseImage(previewImage)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-lg"
                    >
                      Purchase & Download - ${previewImage.price}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-foreground font-medium">
                  <strong className="text-primary">Preview Notice:</strong> This is a watermarked preview limited to
                  720×720px. Purchase to download the full resolution image (4K-16K) without watermark.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <div className="aspect-video overflow-hidden rounded-lg mb-4 bg-muted/10">
                  <img
                    src={editingImage.thumbnail_url || editingImage.image_url}
                    alt={editingImage.title}
                    className="w-full h-full object-contain"
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
                            {getCategoryDisplayName(cat)}
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
