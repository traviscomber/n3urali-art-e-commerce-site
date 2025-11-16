import type { Metadata } from "next"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ArrowRight, Sparkles } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Featured Collection - Premium 360° Images | n3uralia360.art",
  description:
    "Explore our curated featured collection of premium 360° images. High-quality immersive environments ready for your projects.",
  keywords: ["360 collection", "featured images", "VR collection", "panoramic images", "premium 360 images"],
}

export const revalidate = 300

export default async function CollectionsPage() {
  const supabase = await createClient()

  const { data: collectionImages } = await supabase
    .from("images")
    .select(
      "id, title, file_path, original_url, upscaled_url, price, image_format, thumbnail_small_url, thumbnail_medium_url, thumbnail_large_url, description, created_at",
    )
    .eq("featured_collection", true)
    .eq("active", true)
    .order("created_at", { ascending: false })

  const images = collectionImages || []

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse"
            style={{ animationDuration: "4s" }}
          />
        </div>

        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="default" className="animate-pulse-glow">
              <Sparkles className="h-3 w-3 mr-1" />
              Featured Collection
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
              Curated 360° Image
              <span className="text-primary block">Collection</span>
            </h1>

            <p className="text-xl text-muted-foreground text-pretty">
              Browse our featured collection of premium 360° images. Each image is carefully selected and ready for
              professional use with full commercial licensing.
            </p>

            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-bold">{images.length}</span>
                <span className="text-muted-foreground">Featured Images</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-bold">8K-16K</span>
                <span className="text-muted-foreground">Resolution</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {images.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Images Yet</h3>
              <p className="text-muted-foreground mb-6">Collection images are being curated. Check back soon!</p>
              <Button asChild>
                <Link href="/gallery">Browse Gallery</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <Link
                  key={image.id}
                  href={`/photo/${image.id}`}
                  className="group block"
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Image
                        src={
                          image.thumbnail_large_url ||
                          image.thumbnail_medium_url ||
                          image.upscaled_url ||
                          image.original_url ||
                          image.file_path ||
                          "/placeholder.svg"
                         || "/placeholder.svg"}
                        alt={image.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      
                      {/* Dark overlay with title - only shows on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-6 w-full">
                          <h3 className="font-semibold text-lg text-white line-clamp-2">
                            {image.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Browse Gallery CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold mb-4">Explore More Images</h2>
            <p className="text-muted-foreground mb-6">Browse our complete gallery with advanced filtering options</p>
            <Button variant="outline" size="lg" asChild>
              <Link href="/gallery">
                View Full Gallery
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
