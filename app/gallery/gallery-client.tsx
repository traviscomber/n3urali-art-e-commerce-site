"use client"

import { useState, useEffect } from "react"
import { getImages, getCategories } from "@/app/actions/admin-actions"
import { ProductGrid } from "@/components/product-grid"
import { PanoramaViewer } from "@/components/panorama-viewer"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from 'lucide-react'
import Link from "next/link"
import { useLanguage } from "@/lib/contexts/language-context"

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
  const { t } = useLanguage()
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

        const heritageCategory = allCategories.find(cat => cat.name.toLowerCase() === 'heritage')
        const heritage = validImages.filter(
          (img) => {
            // Match by category_id
            if (heritageCategory && img.category_id === heritageCategory.id) {
              return true
            }
            // Match by category name
            if (img.category_name?.toLowerCase().includes("heritage") ||
                img.categories?.name?.toLowerCase().includes("heritage")) {
              return true
            }
            // Match by tags
            if (img.tags && Array.isArray(img.tags) && 
                img.tags.some(tag => tag.toLowerCase() === "heritage")) {
              return true
            }
            return false
          }
        )
        console.log(`[v0] Found ${heritage.length} Heritage images`)
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
                {t("gallery.badge")}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
                {t("gallery.title")}
                <span className="text-primary block">{t("gallery.titleHighlight")}</span>
              </h1>
              <p className="text-xl text-muted-foreground text-pretty">
                {t("gallery.subtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">{t("loading")}</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-24 bg-gradient-to-b from-muted/30 via-background to-background overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-pulse"
            style={{ animationDuration: "8s" }}
          />
          <div className="absolute top-1/4 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              {t("gallery.badge")}
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-balance leading-tight">
              {t("gallery.title")}
              <span className="text-primary block mt-2">{t("gallery.titleHighlight")}</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground text-pretty leading-relaxed max-w-3xl mx-auto">
              {t("gallery.subtitle")}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 max-w-3xl mx-auto">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">{t("gallery.stats.resolution")}</div>
                <div className="text-sm text-muted-foreground">{t("gallery.stats.resolutionLabel")}</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">{images.length}+</div>
                <div className="text-sm text-muted-foreground">{t("gallery.stats.assets")}</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">{t("gallery.stats.waitTime")}</div>
                <div className="text-sm text-muted-foreground">{t("gallery.stats.waitTimeLabel")}</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">{t("gallery.stats.licensed")}</div>
                <div className="text-sm text-muted-foreground">{t("gallery.stats.licensedLabel")}</div>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground/80 max-w-2xl mx-auto">
                {t("gallery.algorithmNote")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-10 border-b border-border/50 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-6">
              <div className="text-center space-y-2">
                <h3 className="text-base font-semibold text-foreground">{t("gallery.exploreDataset")}</h3>
                <p className="text-sm text-muted-foreground max-w-xl">
                  {t("gallery.datasetNote")}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Badge
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  className="cursor-pointer text-sm py-2 px-5 transition-all hover:scale-105 hover:shadow-md"
                  onClick={() => setSelectedCategory("all")}
                >
                  {t("gallery.allCollections")}
                </Badge>
                {categories.map((category) => {
                  const isHeritage = category.name.toLowerCase() === 'heritage'
                  let imageCount = 0
                  if (isHeritage) {
                    imageCount = heritageImages.length
                  } else if (category.name.toLowerCase().includes('equirectangular')) {
                    imageCount = equirectangularImages.length
                  } else {
                    imageCount = images.filter(img => img.category_id === category.id).length
                  }
                  
                  return (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      className={`cursor-pointer text-sm py-2 px-5 transition-all hover:scale-105 hover:shadow-md ${
                        isHeritage ? 'border-2 border-primary/60 shadow-lg shadow-primary/20' : ''
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
        <section className="py-20 bg-gradient-to-b from-muted/10 via-background to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)]" />
          <div className="relative container mx-auto px-4">
            <div className="text-center mb-12 space-y-4">
              <Badge variant="default" className="bg-primary text-primary-foreground shadow-lg px-4 py-2">
                {t("gallery.heritageTitle").split(" ")[0]} {t("gallery.heritageTitle").split(" ")[1]}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-balance">
                {t("gallery.heritageTitle")}
                <span className="text-primary block mt-1">{t("gallery.heritageSubtitle")}</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
                {t("gallery.heritageDescription")} {t("gallery.heritageUseCase")}
              </p>
              <div className="flex items-center justify-center gap-8 pt-4 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-muted-foreground">{t("gallery.multiEraStyles")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-muted-foreground">{t("gallery.temporalLighting")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-muted-foreground">{t("gallery.materialTexture")}</span>
                </div>
              </div>
            </div>
            <ProductGrid 
              initialImages={selectedCategory === getHeritageCategory()?.id ? heritageImages : heritageImages.slice(0, 8)} 
              categoryId={getHeritageCategory()?.id}
            />
            {selectedCategory === "all" && heritageImages.length > 8 && (
              <div className="flex justify-center mt-10">
                <Link href="/gallery">
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer text-base py-3 px-8 hover:bg-primary hover:text-primary-foreground transition-all shadow-md"
                    onClick={() => setSelectedCategory(getHeritageCategory()?.id || "all")}
                  >
                    {t("gallery.exploreHeritage")} ({heritageImages.length})
                  </Badge>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                {selectedCategory === "all" 
                  ? t("gallery.exploreDatasetTitle")
                  : `${categories.find(c => c.id === selectedCategory)?.name || "Selected"} Collection`}
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
                {selectedCategory === "all" 
                  ? t("gallery.datasetDescription")
                  : `Browse the ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} collection`}
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
