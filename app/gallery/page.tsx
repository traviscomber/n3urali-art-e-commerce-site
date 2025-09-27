"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { getImagesPaginated } from "@/app/actions/admin-actions"
import NextImage from "next/image"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"

export default function GalleryPage() {
  console.log("[v0] Gallery component loaded")

  const router = useRouter()
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] Gallery useEffect starting...")

    const fetchImages = async () => {
      try {
        console.log("[v0] Calling getImagesPaginated...")
        const result = await getImagesPaginated(1, 50)
        console.log("[v0] getImagesPaginated result:", result)

        if (result.success && result.data) {
          const fetchedImages = result.data.images || result.data || []
          console.log("[v0] Setting images:", fetchedImages.length, "images")
          setImages(fetchedImages)
        } else {
          console.log("[v0] No images found or error:", result)
          setImages([])
        }
      } catch (error) {
        console.error("[v0] Error fetching images:", error)
        setImages([])
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  console.log("[v0] Rendering gallery with", images.length, "images, loading:", loading)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <BreadcrumbNav />
        </div>

        <section className="relative py-16 bg-gradient-to-b from-muted/30 to-background">
          <div className="relative container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Badge variant="secondary">Professional Collection</Badge>
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
      <div className="container mx-auto px-4">
        <BreadcrumbNav />
      </div>

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
              Discover our curated collection of high-resolution equirectangular and fisheye images. Click any image to
              view details and purchase directly.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Complete Gallery</h2>
            <p className="text-muted-foreground">
              {images.length > 0 ? `${images.length} images available` : "No images available"}
            </p>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((image: any, index: number) => {
                let imageUrl =
                  image.thumbnail_url || image.image_url || "/placeholder.svg?height=300&width=300&text=No+Image"

                // Convert base64 to blob URL if it's base64 data
                if (
                  image.image_data &&
                  typeof image.image_data === "string" &&
                  image.image_data.startsWith("data:image/")
                ) {
                  try {
                    const response = fetch(image.image_data)
                    response
                      .then((res) => res.blob())
                      .then((blob) => {
                        imageUrl = URL.createObjectURL(blob)
                      })
                  } catch (error) {
                    console.log("[v0] Error converting base64 to blob:", error)
                  }
                }

                return (
                  <div
                    key={image.id || index}
                    className="group relative cursor-pointer hover:scale-105 transition-transform duration-200 bg-card rounded-lg overflow-hidden shadow-lg"
                    onClick={() => {
                      console.log("[v0] Image clicked:", image.title, "ID:", image.id)
                      router.push(`/photo/${image.id}`)
                    }}
                  >
                    <div className="relative aspect-square">
                      <NextImage
                        src={imageUrl}
                        alt={image.title || `Image ${index + 1}`}
                        fill
                        className="object-cover"
                        loading="lazy"
                        onError={(e) => {
                          console.log("[v0] Image failed to load:", imageUrl)
                          e.currentTarget.src = "/placeholder.svg?height=300&width=300&text=Error"
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm truncate">{image.title || `Image ${index + 1}`}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {image.category_name || "360°"}
                        </Badge>
                        <span className="text-sm font-bold text-emerald-500">${image.price || "0.00"}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2 text-foreground">No images available</h3>
              <p className="text-muted-foreground">Upload some images in the admin panel to see them here</p>
              <Button onClick={() => router.push("/admin")} className="mt-4" variant="outline">
                Go to Admin Panel
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
