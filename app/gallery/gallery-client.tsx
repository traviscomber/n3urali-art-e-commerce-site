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

interface GalleryClientProps {
  initialImages: Image[]
  initialCategories: Category[]
}

export default function GalleryClient({ initialImages, initialCategories }: GalleryClientProps) {
  const { t } = useLanguage()
  const [images, setImages] = useState<Image[]>(initialImages)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [featuredImages, setFeaturedImages] = useState<Image[]>([])
  const [equirectangularImages, setEquirectangularImages] = useState<Image[]>([])
  const [heritageImages, setHeritageImages] = useState<Image[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewingPanorama, setViewingPanorama] = useState<Image | null>(null)

  useEffect(() => {
    processImages(initialImages, initialCategories)
  }, [])

  const processImages = (allImages: Image[], allCategories: Category[]) => {
    const validImages = allImages.filter((img) => {
      return img && img.id && img.title
    })

    console.log(`[v0] Loaded ${validImages.length} valid images out of ${allImages.length} total`)

    if (validImages.length > 0) {
      console.log("[v0] First image data:", validImages[0])
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
        if (heritageCategory && img.category_id === heritageCategory.id) {
          return true
        }
        if (img.category_name?.toLowerCase().includes("heritage") ||
            img.categories?.name?.toLowerCase().includes("heritage")) {
          return true
        }
        if (img.tags && Array.isArray(img.tags) && 
            img.tags.some(tag => tag.toLowerCase() === "heritage")) {
          return true
        }
        return false
      }
    )
    console.log(`[v0] Found ${heritage.length} Heritage images`)
    setHeritageImages(heritage)
  }

  const handleView360 = (image: Image) => {
    setViewingPanorama(image)
  }

  const closePanoramaViewer = () => {
    setViewingPanorama(null)
  }

  const getHeritageCategory = () => categories.find(cat => cat.name.toLowerCase() === 'heritage')

  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
          >
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WebBackdrop360-2-u6TrAzn6S3wsmynX3nuZZiVu1GcPpp.mov" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
        </div>

        <div className="absolute inset-0 opacity-[0.03] z-[1]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
        </div>

        <div className="relative container mx-auto px-4 py-20 z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="bg-primary/10 backdrop-blur-sm border-primary/20 text-sm px-4 py-2">
              {t("gallery.badge")}
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-tight text-white drop-shadow-2xl">
              {t("gallery.title")}
              <br />
              <span className="text-primary drop-shadow-[0_0_40px_rgba(139,92,246,0.8)]">{t("gallery.titleHighlight")}</span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed text-pretty drop-shadow-lg">
              {t("gallery.subtitle")}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 pt-8 max-w-4xl mx-auto">
              <div className="space-y-2 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{t("gallery.stats.resolution")}</div>
                <div className="text-xs md:text-sm text-white/80 font-medium">{t("gallery.stats.resolutionLabel")}</div>
              </div>

              <div className="space-y-2 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{images.length}+</div>
                <div className="text-xs md:text-sm text-white/80 font-medium">{t("gallery.stats.assets")}</div>
              </div>

              <div className="space-y-2 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{t("gallery.stats.waitTime")}</div>
                <div className="text-xs md:text-sm text-white/80 font-medium">{t("gallery.stats.waitTimeLabel")}</div>
              </div>

              <div className="space-y-2 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{t("gallery.stats.licensed")}</div>
                <div className="text-xs md:text-sm text-white/80 font-medium">{t("gallery.stats.licensedLabel")}</div>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-white/70 max-w-2xl mx-auto drop-shadow-lg">
                {t("gallery.algorithmNote")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-10 border-b border-border/50 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-8">
              <div className="text-center space-y-2">
                <h3 className="text-base font-semibold text-foreground">{t("gallery.exploreDataset")}</h3>
                <p className="text-sm text-muted-foreground max-w-xl">
                  {t("gallery.datasetNote")}
                </p>
              </div>
              
              <div className="flex flex-col gap-6 w-full max-w-4xl">
                <div className="flex justify-center">
                  <Badge
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    className="cursor-pointer text-base py-3 px-6 transition-all hover:scale-105 hover:shadow-md"
                    onClick={() => setSelectedCategory("all")}
                  >
                    {t("gallery.allCollections")}
                  </Badge>
                </div>

                {/* Formats Section */}
                <div className="space-y-3">
                  <div className="text-center">
                    <h4 className="text-sm font-semibold text-foreground">{t("gallery.formats")}</h4>
                    <p className="text-xs text-muted-foreground">{t("gallery.formatsNote")}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {categories
                      .filter(category => {
                        const name = category.name.toLowerCase()
                        return name.includes('equirectangular') || name.includes('fisheye')
                      })
                      .map((category) => {
                        let imageCount = 0
                        if (category.name.toLowerCase().includes('equirectangular')) {
                          imageCount = equirectangularImages.length
                        } else {
                          imageCount = images.filter(img => img.category_id === category.id).length
                        }
                        
                        return (
                          <Badge
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "outline"}
                            className="cursor-pointer text-sm py-2 px-5 transition-all hover:scale-105 hover:shadow-md"
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
