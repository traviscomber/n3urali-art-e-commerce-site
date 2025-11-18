import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Eye, Sparkles } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { BuyCollectionBundleButton } from "@/components/buy-collection-bundle-button"
import { CollectionMusicPlayer } from "@/components/collection-music-player"
import { TheatreMode } from "@/components/theatre-mode"
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
    notFound()
  }

  const { data: collectionImageLinks } = await supabase
    .from("collection_images")
    .select("image_id, position")
    .eq("collection_id", collection.id)
    .order("position", { ascending: true })

  let images: any[] = []
  if (collectionImageLinks && collectionImageLinks.length > 0) {
    const imageIds = collectionImageLinks.map(ci => ci.image_id)
    const { data: imageData } = await supabase
      .from("images")
      .select(`
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
      `)
      .in("id", imageIds)
      .eq("active", true)
    
    images = imageData || []
  }

  console.log("[v0] Collection code:", code)
  console.log("[v0] Collection found:", collection?.title)
  console.log("[v0] Raw collection images:", collectionImageLinks?.length || 0)

  console.log("[v0] Filtered active images:", images.length)
  console.log("[v0] Sample image:", images[0])

  const totalIndividualPrice = images.reduce((sum, img) => sum + parseFloat(img.price || '0'), 0)
  const bundlePrice = parseFloat(collection.bundle_price || '0')
  const savings = totalIndividualPrice - bundlePrice
  const savingsPercentage = totalIndividualPrice > 0 ? Math.round((savings / totalIndividualPrice) * 100) : 0

  const isHeritageCollection = code === 'HERITAGE'

  return (
    <div className="min-h-screen">
      {(collection.music_playlist || collection.music_url) && (
        <CollectionMusicPlayer
          musicPlaylist={collection.music_playlist}
          musicUrl={collection.music_url}
          collectionTitle={collection.title}
          variant="minimal"
        />
      )}

      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="relative container mx-auto px-4 pb-16 pt-8">
          <Button variant="ghost" size="sm" className="mb-8" asChild>
            <Link href="/collection">
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Collections
            </Link>
          </Button>

          <div className="max-w-4xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {collection.code && (
                <Badge variant="outline" className="font-mono">
                  {collection.code}
                </Badge>
              )}
              {collection.is_auto_curated && (
                <Badge variant="default" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Curated
                </Badge>
              )}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              {collection.title}
            </h1>

            {collection.description && (
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl text-pretty">
                {collection.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-8 pt-4">
              <div className="space-y-1">
                <div className="text-4xl font-bold">{images.length}</div>
                <div className="text-sm text-muted-foreground">Premium Images</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="space-y-1">
                <div className="text-4xl font-bold text-primary">${bundlePrice.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Complete Bundle</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="space-y-1">
                <div className="text-4xl font-bold">8K+</div>
                <div className="text-sm text-muted-foreground">Resolution</div>
              </div>
            </div>

            {images.length > 0 && (
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Individual Purchase</div>
                      <div className="text-2xl font-bold text-muted-foreground line-through">
                        ${totalIndividualPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Buying all {images.length} photos separately
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-primary">Bundle Price</div>
                      <div className="text-4xl font-bold text-primary">
                        ${bundlePrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Complete collection discount
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-green-600 dark:text-green-400">You Save</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${savings.toFixed(2)}
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
                        {savingsPercentage}% OFF
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {isHeritageCollection && images.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  A Living Testament to Indonesian Heritage
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Every stone tells a story. Every carving preserves a memory.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-2">
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-xl font-semibold">Borobudur Temple</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Built in the 8th-9th century during the Sailendra dynasty, Borobudur stands as the world's largest Buddhist monument. Its nine stacked platforms represent the path to enlightenment, adorned with 2,672 relief panels and 504 Buddha statues that have witnessed over a millennium of history.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-xl font-semibold">Prambanan Complex</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Rising majestically since 850 CE, Prambanan's towering spires celebrate the Hindu Trimurti. The largest temple compound in Indonesia features 240 temples, with intricate carvings depicting the Ramayana epic across its sacred walls.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-xl font-semibold">Sacred Landscapes</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Nestled within volcanic terrain, these monuments embody the Indonesian philosophy of harmony between humanity, nature, and the divine. Each site reflects centuries of artistic mastery and spiritual devotion.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-xl font-semibold">Cultural Preservation</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      These UNESCO World Heritage sites represent Indonesia's commitment to preserving its cultural legacy. Through advanced 360° imaging, we help share these treasures with the world while supporting their conservation.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-24">
        <div className="container mx-auto px-4">
          {images.length === 0 ? (
            <div className="text-center py-20 max-w-lg mx-auto space-y-4">
              <h3 className="text-2xl font-semibold">Curating Excellence</h3>
              <p className="text-muted-foreground">
                This collection is being carefully assembled. Each image is selected to tell part of a greater story. Check back soon.
              </p>
              <Button asChild>
                <Link href="/gallery">Browse Gallery</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-16">
              {isHeritageCollection && (
                <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    The Complete Collection
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {images.length} meticulously captured 360° panoramic images showcasing the finest examples of Indonesian architectural heritage.
                  </p>
                </div>
              )}

              <div className="flex justify-center mb-12">
                <TheatreMode
                  images={images.map((img: any) => ({
                    id: img.id,
                    title: img.title,
                    thumbnail_large_url: img.thumbnail_large_url,
                    thumbnail_medium_url: img.thumbnail_medium_url,
                    file_path: img.file_path,
                    original_url: img.original_url,
                  }))}
                  collectionTitle={collection.title}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image: any, index: number) => {
                  const imageUrl =
                    image.thumbnail_large_url ||
                    image.thumbnail_medium_url ||
                    image.thumbnail_small_url ||
                    image.file_path ||
                    image.original_url ||
                    `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(image.title || `Image ${index + 1}`)}`

                  return (
                    <Link
                      key={image.id}
                      href={`/product/${image.id}`}
                      className="group block"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted shadow-md hover:shadow-2xl transition-all duration-500">
                        <Image
                          src={imageUrl || "/placeholder.svg"}
                          alt={image.title || `Collection image ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4">
                          <p className="text-white text-sm font-medium text-center mb-2">{image.title}</p>
                          <div className="text-white/90 text-lg font-bold mb-1">
                            ${parseFloat(image.price || '0').toFixed(2)}
                          </div>
                          <div className="flex items-center gap-2 text-white/90 text-xs">
                            <Eye className="h-3 w-3" />
                            View Details
                          </div>
                        </div>

                        <Badge variant="secondary" className="absolute top-2 left-2 text-xs font-mono">
                          #{String(index + 1).padStart(2, '0')}
                        </Badge>

                        <Badge variant="default" className="absolute top-2 right-2 text-xs font-semibold">
                          ${parseFloat(image.price || '0').toFixed(0)}
                        </Badge>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {images.length > 0 && (
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-12 text-center">
                <div className="space-y-3">
                  <div className="text-5xl font-bold">8K–16K</div>
                  <div className="text-muted-foreground">Ultra-high resolution for professional projects</div>
                </div>
                <div className="space-y-3">
                  <div className="text-5xl font-bold flex items-center justify-center gap-2">
                    <Download className="h-10 w-10" />
                  </div>
                  <div className="text-muted-foreground">Instant download after purchase</div>
                </div>
                <div className="space-y-3">
                  <div className="text-5xl font-bold">VR</div>
                  <div className="text-muted-foreground">Perfect for immersive experiences</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {images.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center space-y-6 mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Get the Complete Collection
                </h2>
                <p className="text-lg text-muted-foreground">
                  Save ${savings.toFixed(2)} ({savingsPercentage}% off) with the bundle price. All {images.length} high-resolution images, ready for commercial use.
                </p>
                <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>{images.length} Images (Individual Prices)</span>
                    <span className="line-through">${totalIndividualPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-xl text-primary">
                    <span>Bundle Price</span>
                    <span>${bundlePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-green-600 dark:text-green-400 font-semibold">
                    <span>Your Savings</span>
                    <span>${savings.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
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
    </div>
  )
}
