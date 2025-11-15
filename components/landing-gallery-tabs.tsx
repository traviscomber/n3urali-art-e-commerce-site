"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/lib/contexts/language-context"

interface FeaturedImage {
  id: string
  title: string
  thumbnail_small_url: string
  thumbnail_medium_url: string
  thumbnail_large_url: string
  file_path: string
  original_url: string
  upscaled_url: string | null
  image_format: string
  price: number
}

interface LandingGalleryTabsProps {
  dailyImages: FeaturedImage[]
}

export default function LandingGalleryTabs({ dailyImages }: LandingGalleryTabsProps) {
  const { t } = useLanguage()

  if (dailyImages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("noImagesAvailable")}</p>
        <p className="text-sm text-muted-foreground mt-2">{t("checkBackSoon")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="mb-6 text-center">
        <Badge variant="default" className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
          {t("dailySelection")}
        </Badge>
        <h3 className="text-2xl font-bold mb-2">{t("todaysFeaturedImages")}</h3>
        <p className="text-muted-foreground">{t("handpickedImages")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {dailyImages.map((image, index) => (
          <Card
            key={image.id}
            className="group overflow-hidden hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <Image
                  src={
                    image.thumbnail_medium_url ||
                    image.thumbnail_small_url ||
                    image.thumbnail_large_url ||
                    image.file_path ||
                    image.original_url ||
                    "/placeholder.svg?height=400&width=400" ||
                    "/placeholder.svg"
                  }
                  alt={image.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/photo/${image.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      {t("viewDetails")}
                    </Link>
                  </Button>
                  {image.upscaled_url && (
                    <Badge variant="default" className="absolute top-2 right-2">
                      {t("4Kto16K")}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 mb-2">{image.title}</h3>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {image.image_format || t("360Degrees")}
                  </Badge>
                  <Badge className="bg-gradient-to-r from-yellow-400/40 to-orange-500/40 text-black text-xs font-bold border-0">
                    {t("10PercentOff")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button size="lg" variant="outline" asChild>
          <Link href="/gallery">{t("browseAllImages")}</Link>
        </Button>
      </div>
    </div>
  )
}
