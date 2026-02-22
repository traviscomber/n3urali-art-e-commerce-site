"use client"

import { useState, useMemo, memo } from "react"
import { ProductGrid } from "@/components/product-grid"
import { PanoramaViewer } from "@/components/panorama-viewer"
import { Badge } from "@/components/ui/badge"
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
  image_format?: string
}

interface Category {
  id: string
  name: string
  description: string
}

interface GalleryClientProps {
  initialImages: Image[]
  initialCategories: Category[]
  galleryStats: {
    total: number
    equirectangular: number
    fisheye: number
  }
}

function GalleryClientComponent({ initialImages, initialCategories, galleryStats }: GalleryClientProps) {
  const { t } = useLanguage()
  const [images, setImages] = useState<Image[]>(initialImages)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [selectedFormat, setSelectedFormat] = useState<string>("all")
  const [viewingPanorama, setViewingPanorama] = useState<Image | null>(null)

  const { equirectangularImages, fisheyeImages } = useMemo(() => {
    // Filter only active images with valid thumbnails
    const activeImages = images.filter((img) => img.active && img.thumbnail_medium_url)

    const equirectangular = activeImages.filter(
      (img) =>
        img.category_name?.toLowerCase().includes("equirectangular") ||
        img.categories?.name?.toLowerCase().includes("equirectangular") ||
        img.image_format?.toLowerCase().includes("equirectangular") ||
        (img.category_name?.toLowerCase().includes("360") && !img.category_name?.toLowerCase().includes("fisheye")),
    )

    const fisheye = activeImages.filter(
      (img) =>
        img.category_name?.toLowerCase().includes("fisheye") ||
        img.categories?.name?.toLowerCase().includes("fisheye") ||
        img.image_format?.toLowerCase().includes("fisheye") ||
        img.category_name?.toLowerCase().includes("180"),
    )

    return { equirectangularImages: equirectangular, fisheyeImages: fisheye }
  }, [images])

  const handleView360 = (image: Image) => {
    setViewingPanorama(image)
  }

  const closePanoramaViewer = () => {
    setViewingPanorama(null)
  }

  const displayedImages = useMemo(() => {
    // Only show active images with valid content
    const activeImages = images.filter((img) => img.active && img.thumbnail_medium_url)
    
    if (selectedFormat === "equirectangular") return equirectangularImages
    if (selectedFormat === "fisheye") return fisheyeImages
    return activeImages
  }, [selectedFormat, images, equirectangularImages, fisheyeImages])

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
            style={{ objectFit: "cover" }}
          >
            <source src="/images/webbackdrop360-2.mov" type="video/mp4" />
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
              <span className="text-primary drop-shadow-[0_0_40px_rgba(139,92,246,0.8)]">
                {t("gallery.titleHighlight")}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed text-pretty drop-shadow-lg">
              {t("gallery.subtitle")}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 pt-8 max-w-4xl mx-auto">
              <div className="space-y-2 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {t("gallery.stats.resolution")}
                </div>
                <div className="text-xs md:text-sm text-white/80 font-medium">{t("gallery.stats.resolutionLabel")}</div>
              </div>

              <div className="space-y-2 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {galleryStats.total > 0 ? `${galleryStats.total}+` : "..."}
                </div>
                <div className="text-xs md:text-sm text-white/80 font-medium">{t("gallery.stats.assets")}</div>
              </div>

              <div className="space-y-2 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {t("gallery.stats.waitTime")}
                </div>
                <div className="text-xs md:text-sm text-white/80 font-medium">{t("gallery.stats.waitTimeLabel")}</div>
              </div>

              <div className="space-y-2 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {t("gallery.stats.licensed")}
                </div>
                <div className="text-xs md:text-sm text-white/80 font-medium">{t("gallery.stats.licensedLabel")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 border-b border-border/50 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-foreground">{t("gallery.formats")}</h3>
              <p className="text-sm text-muted-foreground max-w-2xl">{t("gallery.formatsNote")}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Badge
                variant={selectedFormat === "all" ? "default" : "outline"}
                className="cursor-pointer text-base py-3 px-6 transition-all hover:scale-105 hover:shadow-lg font-medium"
                onClick={() => setSelectedFormat("all")}
              >
                {t("gallery.allFormats")}
                <span className="ml-2 opacity-80 font-normal">({galleryStats.total})</span>
              </Badge>
              <Badge
                variant={selectedFormat === "equirectangular" ? "default" : "outline"}
                className="cursor-pointer text-base py-3 px-6 transition-all hover:scale-105 hover:shadow-lg font-medium"
                onClick={() => setSelectedFormat("equirectangular")}
              >
                {t("gallery.equirectangular")}
                <span className="ml-2 opacity-80 font-normal">({galleryStats.equirectangular})</span>
              </Badge>
              <Badge
                variant={selectedFormat === "fisheye" ? "default" : "outline"}
                className="cursor-pointer text-base py-3 px-6 transition-all hover:scale-105 hover:shadow-lg font-medium"
                onClick={() => setSelectedFormat("fisheye")}
              >
                {t("gallery.fisheye")}
                <span className="ml-2 opacity-80 font-normal">({galleryStats.fisheye})</span>
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <ProductGrid initialImages={displayedImages} categoryId={undefined} />
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

export default memo(GalleryClientComponent)
