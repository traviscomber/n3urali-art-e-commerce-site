import { ImageGallery } from "@/components/image-gallery"
import { Badge } from "@/components/ui/badge"

// Mock data for demonstration
const mockImages = [
  {
    id: "1",
    title: "Urban Skyline 360°",
    category: "equirectangular" as const,
    price: 49.99,
    preview_url: "/urban-skyline-360-degree-view.png",
    dimensions: "8192x4096",
    file_size: 25600000,
    description: "Stunning urban skyline captured in full 360° for immersive experiences",
  },
  {
    id: "2",
    title: "Forest Canopy Fisheye",
    category: "fisheye" as const,
    price: 39.99,
    preview_url: "/forest-canopy-fisheye-view.png",
    dimensions: "4096x4096",
    file_size: 18400000,
    description: "Dense forest canopy captured with fisheye lens for unique perspective",
  },
  {
    id: "3",
    title: "Modern Architecture 360°",
    category: "equirectangular" as const,
    price: 59.99,
    preview_url: "/modern-architecture-360-interior.png",
    dimensions: "8192x4096",
    file_size: 28800000,
    description: "Contemporary architectural interior in full 360° detail",
  },
]

export default function GalleryPage() {
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
          <ImageGallery images={mockImages} />
        </div>
      </section>
    </div>
  )
}
