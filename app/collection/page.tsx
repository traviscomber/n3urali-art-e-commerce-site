import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Collections - Premium 360° Image Bundles | n3uralia360.art",
  description:
    "Browse our curated collections of premium 360° images. Each collection is carefully organized with unique codes and bundle pricing for professional projects.",
  keywords: ["360 collections", "image bundles", "VR collections", "panoramic bundles", "premium 360 images"],
}

export const revalidate = 300 // Revalidate every 5 minutes

export default async function CollectionsPage() {
  const supabase = await createClient()

  const { data: collections, error: collectionsError } = await supabase
    .from("collections")
    .select(
      `
      *,
      collection_images (
        image_id
      )
    `,
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (collectionsError) {
    console.error("[v0] Error fetching collections:", collectionsError)
  }

  const collectionsData = collections || []

  // Get image counts and first image for each collection
  const collectionsWithDetails = await Promise.all(
    collectionsData.map(async (collection) => {
      const imageCount = collection.collection_images?.length || 0

      // Get first image as thumbnail
      const firstImageId = collection.collection_images?.[0]?.image_id
      let thumbnailUrl = null

      if (firstImageId) {
        const { data: image } = await supabase
          .from("images")
          .select("thumbnail_medium_url, file_path")
          .eq("id", firstImageId)
          .single()

        thumbnailUrl = image?.thumbnail_medium_url || image?.file_path
      }

      return {
        ...collection,
        imageCount,
        thumbnailUrl,
      }
    }),
  )

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
              <Package className="h-3 w-3 mr-1" />
              Premium Collections
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
              Curated 360° Image
              <span className="text-primary block">Collections</span>
            </h1>

            <p className="text-xl text-muted-foreground text-pretty">
              Browse our organized collections of premium 360° images. Each collection is carefully curated with unique
              codes for easy reference and professional use.
            </p>

            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-bold">{collectionsWithDetails.length}</span>
                <span className="text-muted-foreground">Active Collections</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {collectionsWithDetails.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Collections Yet</h3>
              <p className="text-muted-foreground mb-6">Collections are being curated. Check back soon!</p>
              <Button asChild>
                <Link href="/gallery">Browse Gallery</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collectionsWithDetails.map((collection) => (
                <Card key={collection.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {collection.thumbnailUrl ? (
                      <Image
                        src={collection.thumbnailUrl || "/placeholder.svg"}
                        alt={collection.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {collection.code && (
                      <Badge variant="secondary" className="absolute top-3 left-3 font-mono">
                        {collection.code}
                      </Badge>
                    )}
                    {collection.is_auto_curated && (
                      <Badge variant="default" className="absolute top-3 right-3">
                        <Star className="h-3 w-3 mr-1" />
                        Auto
                      </Badge>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {collection.title}
                    </CardTitle>
                    {collection.description && (
                      <CardDescription className="line-clamp-2">{collection.description}</CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{collection.imageCount} images</span>
                      <span className="text-2xl font-bold text-primary">${collection.bundle_price}</span>
                    </div>

                    <Button asChild className="w-full group/btn">
                      <Link href={`/collection/${collection.code || collection.id}`}>
                        View Collection
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Browse Gallery CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Looking for Individual Images?</h2>
            <p className="text-muted-foreground mb-6">Browse our full gallery to find specific images</p>
            <Button variant="outline" size="lg" asChild>
              <Link href="/gallery">View Gallery</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
