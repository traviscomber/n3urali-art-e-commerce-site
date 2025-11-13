import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"

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

function getDailyImageSelection(images: FeaturedImage[], count: number): FeaturedImage[] {
  if (images.length <= count) return images

  // Use current date as seed for consistent daily selection
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()

  // Simple seeded random number generator
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000
    return x - Math.floor(x)
  }

  // Create array of indices and shuffle with seeded random
  const indices = images.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  // Return first 'count' images based on shuffled indices
  return indices.slice(0, count).map((i) => images[i])
}

async function getDailyFeaturedImages() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("images")
    .select(
      "id, title, thumbnail_medium_url, thumbnail_small_url, thumbnail_large_url, file_path, original_url, upscaled_url, image_format, price",
    )
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("[v0] Error fetching featured images:", error)
    return []
  }

  const images = data || []

  return getDailyImageSelection(images, 16)
}

export default async function LandingGalleryTabs() {
  const dailyImages = await getDailyFeaturedImages()

  if (dailyImages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No images available yet.</p>
        <p className="text-sm text-muted-foreground mt-2">Check back soon for new additions!</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="mb-6 text-center">
        <Badge variant="default" className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
          Daily Selection
        </Badge>
        <h3 className="text-2xl font-bold mb-2">Today's Featured Images</h3>
        <p className="text-muted-foreground">16 handpicked images rotating daily • New selection every 24 hours</p>
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
                    "/placeholder.svg" ||
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
                      View Details
                    </Link>
                  </Button>
                  {image.upscaled_url && (
                    <Badge variant="default" className="absolute top-2 right-2">
                      4K-16K
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 mb-2">{image.title}</h3>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {image.image_format || "360°"}
                  </Badge>
                  <Badge variant="default" className="bg-green-500 text-white text-xs">
                    10% OFF
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button size="lg" variant="outline" asChild>
          <Link href="/gallery">Browse All Images</Link>
        </Button>
      </div>
    </div>
  )
}
