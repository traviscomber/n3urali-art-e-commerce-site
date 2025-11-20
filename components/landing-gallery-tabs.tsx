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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {dailyImages.map((image, index) => (
          <Card
            key={image.id}
            className="group overflow-hidden hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-0">
              <Link href={`/photo/${image.id}`} className="block">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={
                      image.thumbnail_medium_url ||
                      image.thumbnail_small_url ||
                      image.thumbnail_large_url ||
                      image.file_path ||
                      image.original_url ||
                      "/placeholder.svg?height=400&width=400" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={image.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 flex flex-col justify-between p-4">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className="text-xs bg-black/50 backdrop-blur-sm">
                          {image.image_format || t("360Degrees")}
                        </Badge>
                        <Badge className="bg-gradient-to-r from-yellow-400/40 to-orange-500/40 text-foreground text-xs font-bold border-0">
                          {t("10PercentOff")}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-semibold text-white text-base line-clamp-2">{image.title}</h3>
                        <Button size="sm" variant="secondary" className="w-full">
                          <Eye className="w-4 h-4 mr-1" />
                          {t("viewDetails")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
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
