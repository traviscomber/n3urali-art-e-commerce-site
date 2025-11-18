import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Star, ArrowLeft } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { BuyCollectionBundleButton } from "@/components/buy-collection-bundle-button"
import { createClient } from "@/lib/supabase/server"
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const supabase = await createClient()

  const { data: collection } = await supabase
    .from("collections")
    .select("title, description")
    .eq("code", code)
    .eq("is_active", true)
    .single()

  if (!collection) {
    return {
      title: "Collection Not Found",
    }
  }

  return {
    title: `${collection.title} - Premium 360° Collection | n3uralia360.art`,
    description: collection.description || `View the ${collection.title} collection of premium 360° images.`,
  }
}

export const revalidate = 300

export default async function CollectionDetailPage({ params }: Props) {
  const { code } = await params
  const supabase = await createClient()

  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .single()

  if (collectionError || !collection) {
    console.error("[v0] Error fetching collection:", collectionError)
    notFound()
  }

  const { data: collectionImages, error: imagesError } = await supabase
    .from("collection_images")
    .select(`
      position,
      image_id,
      images (
        id,
        title,
        description,
        price,
        image_format,
        thumbnail_small_url,
        thumbnail_medium_url,
        thumbnail_large_url,
        file_path,
        original_url,
        active
      )
    `)
    .eq("collection_id", collection.id)
    .order("position", { ascending: true })

  if (imagesError) {
    console.error("[v0] Error fetching collection images:", imagesError)
  }

  const images =
    collectionImages
      ?.map((ci: any) => ci.images)
      .filter((img: any) => img && img.active) || []

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
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/collection">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Collections
            </Link>
          </Button>

          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-2">
              {collection.code && (
                <Badge variant="outline" className="font-mono">
                  {collection.code}
                </Badge>
              )}
              {collection.is_auto_curated && (
                <Badge variant="default">
                  <Star className="h-3 w-3 mr-1" />
                  Auto-Curated
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">{collection.title}</h1>

            {collection.description && (
              <p className="text-xl text-muted-foreground text-pretty">{collection.description}</p>
            )}

            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-bold">{images.length}</span>
                <span className="text-muted-foreground">Premium Images</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-bold text-primary">${collection.bundle_price}</span>
                <span className="text-muted-foreground">Complete Bundle</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">What's Included</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              All {images.length} images in high resolution, perfect for VR experiences, projection mapping, and
              professional visualization projects.
            </p>
          </div>

          {images.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">This collection is being curated. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((image: any, index: number) => {
                const getImageUrl = () => {
                  if (image.thumbnail_medium_url) return image.thumbnail_medium_url
                  if (image.thumbnail_small_url) return image.thumbnail_small_url
                  if (image.thumbnail_large_url) return image.thumbnail_large_url
                  if (image.file_path) return image.file_path
                  if (image.original_url) return image.original_url
                  return `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(image.title)}`
                }

                const imageUrl = getImageUrl()

                return (
                  <Card key={image.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={imageUrl || "/placeholder.svg"}
                          alt={image.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button size="sm" variant="secondary" asChild>
                            <Link href={`/product/${image.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </div>
                        <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm truncate mb-1">{image.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground line-through">${image.price}</span>
                          <Badge variant="outline" className="text-xs">
                            {image.image_format || "360°"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      {images.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold">4K-16K</h3>
                <p className="text-muted-foreground">Ultra high resolution</p>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold">Instant</h3>
                <p className="text-muted-foreground">Download after purchase</p>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold">VR Ready</h3>
                <p className="text-muted-foreground">Perfect for immersive experiences</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Buy Bundle Section */}
      {images.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <BuyCollectionBundleButton
                images={images.map((img: any) => ({
                  id: img.id,
                  title: img.title,
                  price: img.price,
                  thumbnail_medium_url: img.thumbnail_medium_url,
                  thumbnail_small_url: img.thumbnail_small_url,
                  file_path: img.file_path,
                  original_url: img.original_url,
                }))}
                bundlePrice={collection.bundle_price}
              />
            </div>
          </div>
        </section>
      )}

      {/* Browse Gallery CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Looking for individual images? Browse our full gallery</p>
            <Button variant="outline" size="lg" asChild>
              <Link href="/gallery">View Gallery</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
