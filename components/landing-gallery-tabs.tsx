import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { BuyCollectionBundleButton } from "@/components/buy-collection-bundle-button"

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
  featured_collection: boolean
}

async function getFeaturedImages() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("images")
    .select(
      "id, title, thumbnail_medium_url, thumbnail_small_url, thumbnail_large_url, file_path, original_url, upscaled_url, image_format, price, featured_collection",
    )
    .eq("active", true)
    .or("image_format.eq.dome,image_format.eq.equirectangular,featured_collection.eq.true")
    .order("created_at", { ascending: false })
    .limit(24)

  if (error) {
    console.error("[v0] Error fetching featured images:", error)
    return { dome: [], equirectangular: [], collection: [] }
  }

  const images = data || []

  return {
    dome: images.filter((img) => img.image_format === "dome").slice(0, 8),
    equirectangular: images.filter((img) => img.image_format === "equirectangular").slice(0, 8),
    collection: images.filter((img) => img.featured_collection === true).slice(0, 8),
  }
}

function ImageGrid({ images }: { images: FeaturedImage[] }) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No images available in this category yet.</p>
        <p className="text-sm text-muted-foreground mt-2">Check back soon for new additions!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <Card key={image.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
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
                  <Link href={`/gallery?image=${image.id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
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
              <h3 className="font-semibold text-sm truncate mb-1">{image.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">${image.price}</span>
                <Badge variant="outline" className="text-xs">
                  {image.image_format || "360°"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function LandingGalleryTabs() {
  const { dome, equirectangular, collection } = await getFeaturedImages()

  const bundlePrice = 999

  return (
    <Tabs defaultValue="dome" className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
        <TabsTrigger value="dome">Dome</TabsTrigger>
        <TabsTrigger value="equirectangular">Equirectangular</TabsTrigger>
        <TabsTrigger value="collection">Collection</TabsTrigger>
      </TabsList>

      <TabsContent value="dome" className="mt-0">
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold mb-2">Dome Format Images</h3>
          <p className="text-muted-foreground">Perfect for planetarium projections and dome installations</p>
        </div>
        <ImageGrid images={dome} />
      </TabsContent>

      <TabsContent value="equirectangular" className="mt-0">
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold mb-2">Equirectangular Images</h3>
          <p className="text-muted-foreground">Ideal for VR experiences and 360° panoramic views</p>
        </div>
        <ImageGrid images={equirectangular} />
      </TabsContent>

      <TabsContent value="collection" className="mt-0">
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold mb-2">Featured Collection</h3>
          <p className="text-muted-foreground">
            20 handpicked premium images sold as one bundle.{" "}
            <Link href="/collection" className="text-primary hover:underline font-medium">
              View full collection →
            </Link>
          </p>
        </div>
        {collection.length > 0 && (
          <div className="mb-8">
            <BuyCollectionBundleButton images={collection} bundlePrice={bundlePrice} />
          </div>
        )}
        <ImageGrid images={collection} />
      </TabsContent>

      <div className="text-center mt-8">
        <Button size="lg" variant="outline" asChild>
          <Link href="/gallery">Browse All Images</Link>
        </Button>
      </div>
    </Tabs>
  )
}
