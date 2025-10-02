"use client"

import { useState, useEffect } from "react"
import { getImages, getCategories } from "@/app/actions/admin-actions"
import { ProductGrid } from "@/components/product-grid"
import { PanoramaViewer } from "@/components/panorama-viewer"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

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
      } else {
        console.error("Error loading data:", imagesResult.error || categoriesResult.error)
        setImages([])
        setCategories([])
        setFeaturedImages([])
        setEquirectangularImages([])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setImages([])
      setCategories([])
      setFeaturedImages([])
      setEquirectangularImages([])
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
              Immersive
              <span className="text-primary block">Image Gallery</span>
            </h1>

            <p className="text-xl text-muted-foreground text-pretty">
              Discover our curated collection of high-resolution equirectangular and fisheye images. Perfect for VR,
              projection mapping, and architectural visualization.
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

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Complete Collection</h2>
              <p className="text-muted-foreground">Browse our entire catalog of professional images</p>
            </div>
            <ProductGrid initialImages={images} />
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
