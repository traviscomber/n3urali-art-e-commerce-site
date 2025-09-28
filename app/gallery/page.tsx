"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { ProductGrid } from "@/components/product-grid"
import { PanoramaViewer } from "@/components/panorama-viewer"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Image {
  id: string
  title: string
  description: string
  price: number
  thumbnail_large_url: string
  thumbnail_medium_url: string
  thumbnail_small_url: string
  original_url: string
  file_path: string
  is_featured: boolean
  active: boolean
  category_id: string
  license_id: string
  created_at: string
  tags: string[]
  categories?: {
    name: string
    description: string
  }
  licenses?: {
    name: string
    description: string
  }
}

interface Category {
  id: string
  name: string
  description: string
}

export default function GalleryPage() {
  const [images, setImages] = useState<Image[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [featuredImages, setFeaturedImages] = useState<Image[]>([])
  const [equirectangularImages, setEquirectangularImages] = useState<Image[]>([])
  const [viewingPanorama, setViewingPanorama] = useState<Image | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name")

      if (categoriesError) throw categoriesError

      // Load images with category information
      const { data: imagesData, error: imagesError } = await supabase
        .from("images")
        .select(`
          *,
          categories (
            name,
            description
          ),
          licenses (
            name,
            description
          )
        `)
        .eq("active", true)
        .order("created_at", { ascending: false })

      if (imagesError) throw imagesError

      const allImages = imagesData || []
      const allCategories = categoriesData || []

      setImages(allImages)
      setCategories(allCategories)
      setFeaturedImages(allImages.filter((img) => img.is_featured))

      const equirectangular = allImages.filter(
        (img) =>
          img.categories?.name?.toLowerCase().includes("equirectangular") ||
          (img.categories?.name?.toLowerCase().includes("360") &&
            !img.categories?.name?.toLowerCase().includes("fisheye")) ||
          (img.title?.toLowerCase().includes("360") &&
            !img.title?.toLowerCase().includes("fisheye") &&
            !img.title?.toLowerCase().includes("180") &&
            !img.title?.toLowerCase().includes("dome")),
      )
      setEquirectangularImages(equirectangular)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleView360 = (image: Image) => {
    console.log("[v0] Gallery: Opening panorama viewer for:", image.title)
    setViewingPanorama(image)
  }

  const closePanoramaViewer = () => {
    setViewingPanorama(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="relative py-16 bg-gradient-to-b from-muted/30 to-background">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Badge variant="secondary" className="animate-pulse-glow">
                Professional Collection
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
                Immersive
                <span className="text-primary block">Image Gallery</span>
              </h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Discover our curated collection of high-resolution equirectangular and fisheye images.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading gallery images...</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <div
            className="absolute top-20 left-10 w-24 h-24 bg-primary/8 rounded-full animate-pulse"
            style={{ animationDuration: "6s" }}
          />
          <div
            className="absolute bottom-20 right-20 w-20 h-20 bg-secondary/8 rounded-full animate-pulse"
            style={{ animationDuration: "8s" }}
          />
        </div>

        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary">Professional Collection</Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
              Immersive
              <span className="text-primary block">Image Gallery</span>
            </h1>

            <p className="text-xl text-muted-foreground text-pretty">
              Discover our curated collection of high-resolution equirectangular and fisheye images. Perfect for VR,
              projection mapping, and architectural visualization.
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>{images.length} Total Images</span>
              <span>•</span>
              <span>{featuredImages.length} Featured</span>
              <span>•</span>
              <span>{equirectangularImages.length} 360° Images</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="all">All Images</TabsTrigger>
                <TabsTrigger value="360">360° Images</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Complete Collection</h2>
                <p className="text-muted-foreground">Browse our entire catalog of professional images</p>
              </div>
              <ProductGrid initialImages={images} />
            </TabsContent>

            <TabsContent value="360" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">360° Equirectangular Images</h2>
                <p className="text-muted-foreground">
                  Immersive spherical panoramas perfect for VR, projection mapping, and virtual tours
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-4">
                  <span>Interactive 360° Viewer</span>
                  <span>•</span>
                  <span>8K Resolution</span>
                  <span>•</span>
                  <span>VR Ready</span>
                </div>
              </div>

              {equirectangularImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {equirectangularImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      <div className="aspect-[2/1] relative overflow-hidden">
                        <img
                          src={image.file_path || image.thumbnail_large_url || "/placeholder.svg?height=400&width=800"}
                          alt={image.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                            360°
                          </Badge>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            onClick={() => handleView360(image)}
                            size="sm"
                            className="bg-white/90 text-black hover:bg-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            360° View
                          </Button>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{image.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{image.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">${image.price}</span>
                          <div className="flex gap-2">
                            <Button onClick={() => handleView360(image)} variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">No 360° images found.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="featured" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Featured Images</h2>
                <p className="text-muted-foreground">Hand-picked selections from our premium collection</p>
              </div>
              {featuredImages.length > 0 ? (
                <ProductGrid initialImages={featuredImages} />
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">No featured images available.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {viewingPanorama && (
        <PanoramaViewer
          imageUrl={viewingPanorama.original_url || viewingPanorama.thumbnail_large_url}
          title={viewingPanorama.title}
          onClose={closePanoramaViewer}
        />
      )}
    </div>
  )
}
