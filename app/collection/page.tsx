import type { Metadata } from "next"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, Package2, Calendar, Images } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Curated Collections - Premium 360° Images | n3uralia360.art",
  description:
    "Explore our curated collections of premium 360° images. Heritage landmarks, futuristic landscapes, and thematic sets. High-quality immersive environments ready for your projects.",
  keywords: ["360 collections", "heritage collection", "VR collections", "panoramic sets", "premium 360 bundles"],
}

export const dynamic = 'force-dynamic'
export const revalidate = 300

export default async function CollectionsPage() {
  const supabase = await createClient()

  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true }) // Heritage will be first

  const collectionsData = collections || []

  const collectionsWithPreviews = await Promise.all(
    collectionsData.map(async (collection) => {
      const { data: collectionImages } = await supabase
        .from("collection_images")
        .select(`
          image_id,
          images (
            id,
            title,
            thumbnail_large_url,
            thumbnail_medium_url,
            original_url
          )
        `)
        .eq("collection_id", collection.id)
        .limit(4)

      const images = collectionImages?.map((ci: any) => ci.images).filter(Boolean) || []
      const { count } = await supabase
        .from("collection_images")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", collection.id)

      return {
        ...collection,
        previewImages: images,
        imageCount: count || 0,
      }
    })
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse"
            style={{ animationDuration: "4s" }}
          />
        </div>

        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="default" className="animate-pulse-glow">
              <Sparkles className="h-3 w-3 mr-1" />
              Curated Collections
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
              Explore Thematic
              <span className="text-primary block">360° Collections</span>
            </h1>

            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Discover our carefully curated collections of premium 360° images. Each collection tells a unique story,
              from heritage landmarks to futuristic landscapes, ready for professional use with full commercial licensing.
            </p>

            <div className="flex items-center justify-center gap-8 text-sm pt-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-bold">{collectionsData.length}</span>
                <span className="text-muted-foreground">Collections</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-bold">8K-16K</span>
                <span className="text-muted-foreground">Resolution</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-bold">Bundle</span>
                <span className="text-muted-foreground">Pricing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {collectionsWithPreviews.length === 0 ? (
            <div className="text-center py-12">
              <Package2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Collections Yet</h3>
              <p className="text-muted-foreground mb-6">Collections are being curated. Check back soon!</p>
              <Button asChild>
                <Link href="/gallery">Browse Gallery</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {collectionsWithPreviews.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collection/${collection.code}`}
                  className="group block"
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:border-primary/50 h-full">
                    {/* Preview Images Grid */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      {collection.previewImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-1 h-full">
                          {collection.previewImages.slice(0, 4).map((image: any, idx: number) => (
                            <div key={image.id} className="relative overflow-hidden">
                              <Image
                                src={
                                  image.thumbnail_large_url ||
                                  image.thumbnail_medium_url ||
                                  image.original_url ||
                                  "/placeholder.svg?height=400&width=600"
                                 || "/placeholder.svg"}
                                alt={image.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package2 className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Collection Info */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          {collection.code && (
                            <Badge variant="secondary" className="text-xs font-mono">
                              {collection.code}
                            </Badge>
                          )}
                          <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                            {collection.title}
                          </h3>
                        </div>
                        {collection.bundle_price && (
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Bundle Price</div>
                            <div className="text-2xl font-bold text-primary">${collection.bundle_price}</div>
                          </div>
                        )}
                      </div>

                      {collection.description && (
                        <p className="text-muted-foreground line-clamp-3">
                          {collection.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                        <div className="flex items-center gap-1">
                          <Images className="h-4 w-4" />
                          <span>{collection.imageCount} images</span>
                        </div>
                        {collection.is_auto_curated && (
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Auto-Curated
                          </Badge>
                        )}
                        {collection.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(collection.start_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <Button 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        variant="outline"
                      >
                        View Collection
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
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
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Explore Individual Images</h2>
            <p className="text-muted-foreground mb-6">
              Not looking for a collection? Browse our complete gallery with advanced filtering options
              to find the perfect 360° image for your project.
            </p>
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
