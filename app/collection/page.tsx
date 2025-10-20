import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { BuyCollectionBundleButton } from "@/components/buy-collection-bundle-button"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Weekly Collection - Premium 360° Image Bundle",
  description:
    "This week's curated collection of 20 premium 360° images. Buy the complete collection at a special bundle price and get instant access to all images.",
  keywords: ["360 collection", "image bundle", "VR collection", "panoramic bundle", "premium 360 images"],
}

export const revalidate = 300 // Revalidate every 5 minutes

export default async function CollectionPage() {
  const supabase = await createClient()

  const { data: images, error } = await supabase
    .from("images")
    .select("*")
    .eq("featured_collection", true)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("[v0] Error fetching collection images:", error)
  }

  const collectionImages = images || []

  // Calculate pricing
  const bundlePrice = 999 // Fixed bundle price for 20 images
  const totalPrice = collectionImages.reduce((sum, img) => sum + (img.price || 0), 0)
  const savings = totalPrice - bundlePrice

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
              <Star className="h-3 w-3 mr-1" />
              Featured Collection
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
              Premium
              <span className="text-primary block">360° Collection</span>
            </h1>

            <p className="text-xl text-muted-foreground text-pretty">
              Our handpicked selection of 20 premium 360° images. Buy the complete collection and save 30% compared to
              individual purchases.
            </p>

            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold">{collectionImages.length}</span>
                <span className="text-muted-foreground">Premium Images</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-primary">${bundlePrice}</span>
                <span className="text-muted-foreground">Bundle Price</span>
              </div>
              {savings > 0 && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-bold text-green-500">${savings}</span>
                    <span className="text-muted-foreground">You Save</span>
                  </div>
                </>
              )}
            </div>

            {collectionImages.length > 0 && (
              <div className="pt-4">
                <BuyCollectionBundleButton
                  images={collectionImages.map((img) => ({
                    id: img.id,
                    title: img.title,
                    price: img.price,
                    thumbnail_medium_url: img.thumbnail_medium_url,
                    thumbnail_small_url: img.thumbnail_small_url,
                    file_path: img.file_path,
                    original_url: img.original_url,
                  }))}
                  bundlePrice={bundlePrice}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Collection Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">What's Included</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              All {collectionImages.length} images in high resolution, perfect for VR experiences, projection mapping,
              and professional visualization projects.
            </p>
          </div>

          {collectionImages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">The collection is being curated. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {collectionImages.map((image, index) => {
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
                            <Link href={`/gallery?image=${image.id}`}>
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

          <div className="mt-12 text-center">
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
