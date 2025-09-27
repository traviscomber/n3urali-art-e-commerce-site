import { getImages } from "@/app/actions/admin-actions"
import { ImageGallery } from "@/components/image-gallery"
import { Badge } from "@/components/ui/badge"

interface GalleryImage {
  id: string
  title: string
  category: "equirectangular" | "fisheye"
  price: number
  preview_url: string
  dimensions: string
  file_size: number
  description?: string
}

async function transformImageData(images: any[]): Promise<GalleryImage[]> {
  return images.map((image) => ({
    id: image.id,
    title: image.title || "Untitled",
    category: (image.category_name?.toLowerCase() === "fisheye" ? "fisheye" : "equirectangular") as const,
    price: Number.parseFloat(image.price) || 0,
    preview_url: image.file_path || image.image_url || "/placeholder.svg",
    dimensions: "4096x4096", // Default dimensions
    file_size: 20000000, // Default file size
    description: image.description || "",
  }))
}

export default async function GalleryPage() {
  const result = await getImages()
  const images = result.success ? await transformImageData(result.data) : []

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
              Discover our curated collection of high-resolution equirectangular and fisheye images. Click any image to
              view details and purchase directly.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <ImageGallery images={images} />
        </div>
      </section>
    </div>
  )
}
