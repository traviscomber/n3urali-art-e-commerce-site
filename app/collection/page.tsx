import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, Package2 } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Curated Collections - Premium 360° Images | n3uralia360.art",
  description:
    "Discover our curated collections of premium 360° images. Each collection tells a unique visual story, perfect for VR experiences, architectural visualization, and immersive projects.",
}

export const dynamic = 'force-dynamic'
export const revalidate = 300

export default async function CollectionsPage() {
  const supabase = await createClient()

  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })

  const collectionsData = collections || []

  const collectionsWithPreviews = await Promise.all(
    collectionsData.map(async (collection) => {
      // Step 1: Get image IDs from collection_images
      const { data: collectionImageLinks } = await supabase
        .from("collection_images")
        .select("image_id, position")
        .eq("collection_id", collection.id)
        .order("position", { ascending: true })
        .limit(6)

      // Step 2: Fetch actual image data if we have IDs
      let images: any[] = []
      if (collectionImageLinks && collectionImageLinks.length > 0) {
        const imageIds = collectionImageLinks.map(ci => ci.image_id)
        const { data: imageData } = await supabase
          .from("images")
          .select("id, title, thumbnail_large_url, thumbnail_medium_url, original_url, file_path")
          .in("id", imageIds)
          .eq("active", true)
        
        images = imageData || []
      }

      // Get total count
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
    <div className="min-h-screen">
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="text-sm px-4 py-1">
              <Sparkles className="h-3 w-3 mr-2" />
              Curated Collections
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              Visual Stories in
              <span className="block text-primary mt-2">Immersive Detail</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              Each collection is a carefully crafted narrative—from ancient monuments preserving human heritage
              to futuristic landscapes imagining tomorrow. Discover thematic sets designed for creators who
              value artistry and authenticity.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{collectionsData.length}</div>
                <div className="text-sm text-muted-foreground">Collections</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold">8K–16K</div>
                <div className="text-sm text-muted-foreground">Resolution</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold">VR Ready</div>
                <div className="text-sm text-muted-foreground">Format</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          {collectionsWithPreviews.length === 0 ? (
            <div className="text-center py-20 max-w-lg mx-auto space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Package2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Coming Soon</h3>
                <p className="text-muted-foreground">
                  Our curators are assembling extraordinary collections. Check back soon to discover immersive visual narratives.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href="/gallery">
                  Explore Individual Images
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-32">
              {collectionsWithPreviews.map((collection, index) => (
                <article
                  key={collection.id}
                  className="group max-w-7xl mx-auto"
                >
                  <Link href={`/collection/${collection.code}`} className="block">
                    <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                      {/* Image Showcase */}
                      <div className={`relative ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                          {collection.previewImages.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1 h-full">
                              {collection.previewImages.slice(0, 6).map((image: any, idx: number) => {
                                const imageUrl = 
                                  image.thumbnail_large_url ||
                                  image.thumbnail_medium_url ||
                                  image.file_path ||
                                  image.original_url ||
                                  `/placeholder.svg?height=600&width=800&text=${encodeURIComponent(image.title || 'Heritage Image')}`
                                
                                return (
                                  <div
                                    key={image.id}
                                    className="relative overflow-hidden"
                                    style={{
                                      gridColumn: idx === 0 ? 'span 2' : undefined,
                                      gridRow: idx === 0 ? 'span 2' : undefined,
                                    }}
                                  >
                                    <Image
                                      src={imageUrl || "/placeholder.svg"}
                                      alt={image.title || 'Collection image'}
                                      fill
                                      className="object-cover transition-all duration-700 group-hover:scale-105"
                                      sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full bg-muted">
                              <Package2 className="h-20 w-20 text-muted-foreground" />
                            </div>
                          )}
                          
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-8">
                            <Button size="lg" variant="secondary" className="gap-2">
                              Explore Collection
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Floating badge */}
                        <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg">
                          <div className="text-sm font-semibold">{collection.imageCount} Images</div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                        <div className="space-y-3">
                          {collection.code && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {collection.code}
                            </Badge>
                          )}
                          
                          <h2 className="text-4xl md:text-5xl font-bold tracking-tight group-hover:text-primary transition-colors">
                            {collection.title}
                          </h2>
                        </div>

                        {collection.description && (
                          <p className="text-lg text-muted-foreground leading-relaxed">
                            {collection.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-6 pt-4">
                          {collection.bundle_price && (
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Bundle Price</div>
                              <div className="text-3xl font-bold text-primary">
                                ${collection.bundle_price}
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Format</div>
                            <div className="font-semibold">360° Panoramic</div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">License</div>
                            <div className="font-semibold">Commercial Use</div>
                          </div>
                        </div>

                        <Button size="lg" className="gap-2 group/btn mt-6">
                          View Full Collection
                          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Prefer Individual Images?
            </h2>
            <p className="text-lg text-muted-foreground">
              Browse our complete gallery to find specific 360° images with advanced filtering by format,
              theme, and style. Perfect for single-use projects.
            </p>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link href="/gallery">
                Browse Gallery
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
