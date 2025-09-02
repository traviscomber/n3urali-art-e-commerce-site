import { ImageGallery } from "@/components/image-gallery"
import { Badge } from "@/components/ui/badge"
import { getImages } from "@/app/actions/admin-actions"

export default async function GalleryPage() {
  const result = await getImages()
  const images = result.success ? result.data : []

  const transformedImages = images.map((image: any) => ({
    id: image.id,
    title: image.title,
    category: image.category_name?.toLowerCase() === "fisheye" ? ("fisheye" as const) : ("equirectangular" as const),
    price: Number.parseFloat(image.price) || 0,
    preview_url: image.thumbnail_url || image.image_url,
    dimensions: "4096x4096", // Default dimensions
    file_size: 20000000, // Default file size
    description: image.description || "",
  }))

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
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
              Discover our curated collection of high-resolution equirectangular and fisheye images, perfect for VR
              experiences, projection mapping, and architectural visualization.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {transformedImages.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2">No images available</h3>
              <p className="text-muted-foreground">Upload some images in the admin panel to see them here</p>
            </div>
          ) : (
            <ImageGallery images={transformedImages} />
          )}
        </div>
      </section>
    </div>
  )
}
