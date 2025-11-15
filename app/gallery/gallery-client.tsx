"use client"

import { useState, useEffect } from "react"
import { getImages, getCategories } from "@/app/actions/admin-actions"
import { ProductGrid } from "@/components/product-grid"
import { PanoramaViewer } from "@/components/panorama-viewer"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from 'lucide-react'
import Link from "next/link"

interface Image {
  id: string
  title: string
  description: string
  price: number
  thumbnail_large_url: string
  thumbnail_medium_url: string
  thumbnail_small_url: string
  original_url: string
  file_path: string
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
  image_url?: string
  thumbnail_url?: string
  category_name?: string
  featured?: boolean
}

interface Category {
  id: string
  name: string
  description: string
}

export default function GalleryClient() {
  const [images, setImages] = useState<Image[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [featuredImages, setFeaturedImages] = useState<Image[]>([])
  const [equirectangularImages, setEquirectangularImages] = useState<Image[]>([])
  const [heritageImages, setHeritageImages] = useState<Image[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewingPanorama, setViewingPanorama] = useState<Image | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [imagesResult, categoriesResult] = await Promise.all([
        getImages().catch((error) => {
          console.error("Error fetching images:", error)
          return { success: false, error: error.message, data: [] }
        }),
        getCategories().catch((error) => {
          console.error("Error fetching categories:", error)
          return { success: false, error: error.message, data: [] }
        }),
      ])

      if (imagesResult.success && categoriesResult.success) {
        const allImages = imagesResult.data || []
        const allCategories = categoriesResult.data || []

        const validImages = allImages.filter((img) => {
          return img && img.id && img.title
        })

        console.log(`[v0] Loaded ${validImages.length} valid images out of ${allImages.length} total`)

        if (validImages.length > 0) {
          console.log("[v0] First image data:", validImages[0])
          console.log("[v0] First image thumbnail URLs:", {
            thumbnail_large_url: validImages[0].thumbnail_large_url,
            thumbnail_medium_url: validImages[0].thumbnail_medium_url,
            thumbnail_small_url: validImages[0].thumbnail_small_url,
            original_url: validImages[0].original_url,
            file_path: validImages[0].file_path,
          })
        }

        setImages(validImages)
        setCategories(allCategories)
        setFeaturedImages(validImages.filter((img) => img.featured || img.is_featured))

        const equirectangular = validImages.filter(
          (img) =>
            img.category_name?.toLowerCase().includes("equirectangular") ||
            img.categories?.name?.toLowerCase().includes("equirectangular") ||
            (img.category_name?.toLowerCase().includes("360") &&
              !img.category_name?.toLowerCase().includes("fisheye")) ||
            (img.categories?.name?.toLowerCase().includes("360") &&
              !img.categories?.name?.toLowerCase().includes("fisheye")) ||
            (img.title?.toLowerCase().includes("360") &&
              !img.title?.toLowerCase().includes("fisheye") &&
              !img.title?.toLowerCase().includes("180") &&
              !img.title?.toLowerCase().includes("dome")),
        )
        setEquirectangularImages(equirectangular)

        const heritage = validImages.filter(
          (img) =>
            img.category_name?.toLowerCase().includes("heritage") ||
            img.categories?.name?.toLowerCase().includes("heritage") ||
            (img.tags && Array.isArray(img.tags) && img.tags.some(tag => tag.toLowerCase() === "heritage"))
        )
        setHeritageImages(heritage)
      } else {
        console.error("Error loading data:", imagesResult.error || categoriesResult.error)
        setImages([])
        setCategories([])
        setFeaturedImages([])
        setEquirectangularImages([])
        setHeritageImages([])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setImages([])
      setCategories([])
      setFeaturedImages([])
      setEquirectangularImages([])
      setHeritageImages([])
    } finally {
      setLoading(false)
    }
  }

  const handleView360 = (image: Image) => {
    setViewingPanorama(image)
  }

  const closePanoramaViewer = () => {
    setViewingPanorama(null)
  }

  const getHeritageCategory = () => categories.find(cat => cat.name.toLowerCase() === 'heritage')

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
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
                Discover our curated collection of high-resolution equirectangular and fisheye images.
              </p>
            </div>
          </div>
        </section>

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
              Full Image
              <span className="text-primary block">Gallery</span>
            </h1>

            <p className="text-xl text-muted-foreground text-pretty">
              Browse and purchase individual 360° images. Looking for our curated bundle?{" "}
              <Link href="/collection" className="text-primary hover:underline">
                View the Featured Collection
              </Link>
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>{images.length} Total Images</span>
              <span>•</span>
              <span>{featuredImages.length} Featured</span>
              <span>•</span>
              <span>{equirectangularImages.length} 360° Images</span>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-8 border-b border-border/50 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-sm font-medium text-muted-foreground">Browse by Category</h3>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Badge
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  className="cursor-pointer text-sm py-2 px-4 transition-all hover:scale-105"
                  onClick={() => setSelectedCategory("all")}
                >
                  All Images
                </Badge>
                {categories.map((category) => {
                  const isHeritage = category.name.toLowerCase() === 'heritage'
                  const imageCount = isHeritage ? heritageImages.length : 
                    images.filter(img => img.category_id === category.id).length
                  
                  return (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      className={`cursor-pointer text-sm py-2 px-4 transition-all hover:scale-105 ${
                        isHeritage ? 'border-2 border-primary/50 shadow-lg' : ''
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                      {imageCount > 0 && (
                        <span className="ml-2 opacity-70">({imageCount})</span>
                      )}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {heritageImages.length > 0 && (selectedCategory === "all" || selectedCategory === getHeritageCategory()?.id) && (
        <section className="py-16 bg-gradient-to-b from-muted/10 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 space-y-3">
              <Badge variant="default" className="bg-primary text-primary-foreground shadow-lg">
                Featured Category
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-balance">
                Cultural Heritage
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                Explore historical landmarks, monuments, and architectural wonders captured in immersive 360° detail
              </p>
            </div>
            <ProductGrid 
              initialImages={selectedCategory === getHeritageCategory()?.id ? heritageImages : heritageImages.slice(0, 8)} 
              categoryId={getHeritageCategory()?.id}
            />
            {selectedCategory === "all" && heritageImages.length > 8 && (
              <div className="flex justify-center mt-8">
                <Link href="/gallery">
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer text-base py-3 px-6 hover:bg-primary hover:text-primary-foreground transition-all"
                    onClick={() => setSelectedCategory(getHeritageCategory()?.id || "all")}
                  >
                    View All Heritage Images ({heritageImages.length})
                  </Badge>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {selectedCategory === "all" 
                  ? "Complete Collection"
                  : `${categories.find(c => c.id === selectedCategory)?.name || "Selected"} Images`}
              </h2>
              <p className="text-muted-foreground">
                {selectedCategory === "all" 
                  ? "Browse our entire catalog of professional images"
                  : `Discover our ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} collection`}
              </p>
            </div>
            <ProductGrid 
              initialImages={
                selectedCategory === "all" 
                  ? images 
                  : images.filter(img => img.category_id === selectedCategory)
              } 
              categoryId={selectedCategory !== "all" ? selectedCategory : undefined}
            />
          </div>
        </div>
      </section>

      {viewingPanorama && (
        <PanoramaViewer
          imageUrl={viewingPanorama.original_url || viewingPanorama.image_url || viewingPanorama.thumbnail_large_url}
          title={viewingPanorama.title}
          onClose={closePanoramaViewer}
        />
      )}
    </div>
  )
}
