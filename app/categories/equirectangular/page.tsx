"use client"

import { useState, useEffect } from "react"
import { Search, Grid3X3, List, Eye, X, Loader2, Play, ShoppingCart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PanoramaViewer } from "@/components/panorama-viewer"
import { getImages } from "@/app/actions/admin-actions"
import { useCart } from "@/lib/contexts/cart-context"
import Image from "next/image"

interface EquirectangularImage {
  id: string
  title: string
  description: string
  price: number
  image_url: string
  thumbnail_url: string
  category_name: string
  active: boolean
  featured: boolean
}

export default function EquirectangularCategoryPage() {
  const [images, setImages] = useState<EquirectangularImage[]>([])
  const [filteredImages, setFilteredImages] = useState<EquirectangularImage[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [viewingPanorama, setViewingPanorama] = useState<EquirectangularImage | null>(null)
  const [loadingImage, setLoadingImage] = useState<string | null>(null)
  const [showWatermarkedImage, setShowWatermarkedImage] = useState<EquirectangularImage | null>(null)
  const [show360Viewer, setShow360Viewer] = useState(false)
  const [current360Image, setCurrent360Image] = useState<EquirectangularImage | null>(null)
  const [pannellumLoaded, setPannellumLoaded] = useState(false)
  const { addItem, openCart } = useCart()
  const [addedToCart, setAddedToCart] = useState<string | null>(null)

  const loadPannellum = async () => {
    if (pannellumLoaded || window.pannellum) {
      return true
    }

    return new Promise<boolean>((resolve) => {
      // Load CSS
      const cssLink = document.createElement("link")
      cssLink.rel = "stylesheet"
      cssLink.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"
      document.head.appendChild(cssLink)

      // Load JS
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"
      script.onload = () => {
        setPannellumLoaded(true)
        resolve(true)
      }
      script.onerror = () => {
        console.error("Failed to load Pannellum")
        resolve(false)
      }
      document.head.appendChild(script)
    })
  }

  const init360Viewer = async (image: EquirectangularImage) => {
    console.log("[v0] Starting Pannellum 360° viewer initialization...")

    const loaded = await loadPannellum()
    if (!loaded || !window.pannellum) {
      console.error("[v0] Pannellum failed to load")
      return
    }

    setCurrent360Image(image)
    setShow360Viewer(true)

    // Wait for the container to be rendered
    setTimeout(() => {
      const container = document.getElementById("pannellum-container")
      if (!container) {
        console.error("[v0] Pannellum container not found")
        return
      }

      try {
        console.log("[v0] Creating Pannellum viewer instance...")
        window.pannellum.viewer("pannellum-container", {
          type: "equirectangular",
          panorama: image.image_url || image.thumbnail_url,
          autoLoad: true,
          showControls: true,
          showFullscreenCtrl: true,
          showZoomCtrl: true,
          mouseZoom: true,
          doubleClickZoom: true,
          draggable: true,
          keyboardZoom: true,
          compass: true,
          northOffset: 0,
          preview: image.thumbnail_url,
          title: image.title,
          author: "n3urali.art",
          hfov: 100,
          pitch: 0,
          yaw: 0,
          minHfov: 50,
          maxHfov: 120,
        })
        console.log("[v0] Pannellum 360° viewer initialized successfully")
      } catch (error) {
        console.error("[v0] Error initializing Pannellum viewer:", error)
      }
    }, 100)
  }

  const close360Viewer = () => {
    setShow360Viewer(false)
    setCurrent360Image(null)

    // Clean up Pannellum instance
    setTimeout(() => {
      const container = document.getElementById("pannellum-container")
      if (container) {
        container.innerHTML = ""
      }
    }, 100)
  }

  useEffect(() => {
    const fetchImages = async () => {
      const result = await getImages()
      if (result.success && result.data) {
        // Filter for equirectangular images (360° or similar categories)
        const equirectangularImages = result.data.filter(
          (img: EquirectangularImage) =>
            img.category_name?.toLowerCase().includes("equirectangular") ||
            img.category_name?.toLowerCase().includes("360") ||
            img.category_name?.toLowerCase().includes("panoramic"),
        )
        setImages(equirectangularImages)
        setFilteredImages(equirectangularImages)
      }
    }
    fetchImages()
  }, [])

  useEffect(() => {
    const filtered = images.filter(
      (image) =>
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.category_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Sort images
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        // Keep original order for 'newest'
        break
    }

    setFilteredImages(filtered)
  }, [searchTerm, sortBy, images])

  const handleImageClick = async (image: EquirectangularImage) => {
    setLoadingImage(image.id)

    // Simulate loading time (1-3 seconds)
    const loadingTime = Math.random() * 2000 + 1000

    setTimeout(() => {
      setLoadingImage(null)
      setShowWatermarkedImage(image)
    }, loadingTime)
  }

  const closeWatermarkedView = () => {
    setShowWatermarkedImage(null)
  }

  const handleAddToCart = (image: EquirectangularImage) => {
    const cartItem = {
      id: `${image.id}-standard`, // Unique ID for cart item
      imageId: image.id,
      title: image.title,
      price: image.price,
      licenseType: "standard" as const,
      previewUrl: image.thumbnail_url || image.image_url || "/placeholder.svg",
      category: "equirectangular" as const,
      quantity: 1,
    }

    addItem(cartItem)
    setAddedToCart(image.id)

    // Show feedback for 2 seconds
    setTimeout(() => {
      setAddedToCart(null)
    }, 2000)

    // Open cart sidebar to show the added item
    setTimeout(() => {
      openCart()
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,6,0.15),transparent_70%)]" />
        <div className="container mx-auto px-6 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <Badge
                variant="outline"
                className="border-primary/30 text-primary bg-primary/10 px-4 py-2 text-sm font-medium"
              >
                360° Panoramic Gallery
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
                Equirectangular
                <br />
                <span className="text-4xl md:text-6xl">Images</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
              Immersive 360-degree panoramic experiences for VR, projection mapping, and architectural visualization
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {["360° Interactive", "8K Resolution", "VR Ready", "Professional"].map((feature) => (
                <Badge
                  key={feature}
                  variant="secondary"
                  className="bg-primary/15 text-primary border-primary/25 px-4 py-2 text-sm"
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="bg-background/60 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search panoramic images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-background/80 backdrop-blur-sm border-primary/20 rounded-xl text-base"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-52 h-12 bg-background/80 backdrop-blur-sm border-primary/20 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="lg"
                onClick={() => setViewMode("grid")}
                className="h-12 px-6 rounded-xl"
              >
                <Grid3X3 className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="lg"
                onClick={() => setViewMode("list")}
                className="h-12 px-6 rounded-xl"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-lg text-muted-foreground font-medium">
            {filteredImages.length} panoramic {filteredImages.length === 1 ? "image" : "images"} available
          </p>
        </div>

        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
        >
          {filteredImages.map((image) => (
            <Card
              key={image.id}
              className="group overflow-hidden bg-background/70 backdrop-blur-sm border-primary/15 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={image.thumbnail_url || image.image_url || "/placeholder.svg"}
                  alt={image.title}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary/90 text-primary-foreground text-sm font-semibold px-3 py-1 backdrop-blur-sm">
                    <Play className="h-3 w-3 mr-1" />
                    360°
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge
                    variant="secondary"
                    className="bg-background/90 text-foreground text-sm font-bold px-3 py-1 backdrop-blur-sm"
                  >
                    ${image.price}
                  </Badge>
                </div>

                {loadingImage === image.id ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="text-center text-white">
                      <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2" />
                      <p className="text-sm font-medium">Loading preview...</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex gap-3">
                      <Button
                        size="lg"
                        variant="secondary"
                        className="bg-white/95 hover:bg-white text-gray-900 border border-gray-200 shadow-xl backdrop-blur-sm px-6 py-3 rounded-xl font-semibold"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleImageClick(image)
                        }}
                      >
                        <Eye className="h-5 w-5 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="lg"
                        variant="default"
                        className="bg-primary/95 hover:bg-primary text-primary-foreground shadow-xl backdrop-blur-sm px-6 py-3 rounded-xl font-semibold"
                        onClick={(e) => {
                          e.stopPropagation()
                          init360Viewer(image)
                        }}
                      >
                        <Play className="h-5 w-5 mr-2" />
                        360° View
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <CardContent className="p-5">
                <div className="space-y-3">
                  <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {image.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">{image.category_name}</span>
                    <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                      High-Res
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-muted-foreground text-lg mb-4">
              No equirectangular images found matching your search.
            </div>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="border-primary/20 hover:bg-primary/10"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {showWatermarkedImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl w-full max-h-[95vh] overflow-y-auto">
            <div className="absolute top-4 right-4 z-20">
              <Button
                onClick={closeWatermarkedView}
                className="bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-sm rounded-xl h-12 w-12 p-0"
                size="sm"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="bg-background/95 backdrop-blur-sm rounded-2xl overflow-hidden border border-primary/20 shadow-2xl">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-primary via-accent to-primary p-6">
                <h2 className="text-2xl font-bold text-white mb-2">{showWatermarkedImage.title}</h2>
                <p className="text-white/90">Preview • Watermarked • Size: 720×720px</p>
              </div>

              {/* Image container with proper aspect ratio */}
              <div className="relative bg-muted/20 p-6">
                <div className="relative mx-auto max-w-4xl">
                  <Image
                    src={showWatermarkedImage.image_url || "/placeholder.svg"}
                    alt={showWatermarkedImage.title}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-contain rounded-lg"
                  />

                  {/* Watermark overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 opacity-15">
                      {Array.from({ length: 12 }).map((_, row) => (
                        <div
                          key={row}
                          className="flex whitespace-nowrap"
                          style={{
                            transform: `translateY(${row * 80}px) rotate(-45deg) translateX(-50%)`,
                            transformOrigin: "center",
                          }}
                        >
                          {Array.from({ length: 20 }).map((_, col) => (
                            <span
                              key={col}
                              className="text-white font-bold text-2xl mx-8 drop-shadow-lg"
                              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                            >
                              N3URALI.ART
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details section */}
              <div className="p-6 bg-background/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-muted-foreground mb-2">Description</h4>
                    <p className="text-foreground">{showWatermarkedImage.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground mb-2">Type</h4>
                    <Badge variant="outline" className="text-primary border-primary/30">
                      {showWatermarkedImage.category_name}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground mb-2">Price</h4>
                    <p className="text-2xl font-bold text-primary">${showWatermarkedImage.price}</p>
                  </div>
                </div>

                <Button
                  size="lg"
                  className={`w-full font-semibold py-4 text-lg rounded-xl transition-all duration-300 ${
                    addedToCart === showWatermarkedImage.id
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                  onClick={() => handleAddToCart(showWatermarkedImage)}
                  disabled={addedToCart === showWatermarkedImage.id}
                >
                  {addedToCart === showWatermarkedImage.id ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart - ${showWatermarkedImage.price}
                    </>
                  )}
                </Button>

                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Preview Notice:</strong> This is a watermarked preview limited to 720×720px. Purchase to
                    download the full resolution image (4K-16K) without watermark.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panorama Viewer */}
      {viewingPanorama && (
        <PanoramaViewer
          imageUrl={viewingPanorama.image_url}
          title={viewingPanorama.title}
          onClose={() => setViewingPanorama(null)}
        />
      )}

      {show360Viewer && current360Image && (
        <div className="fixed inset-0 bg-black z-50">
          <div className="absolute top-6 left-6 right-6 z-30 flex items-start justify-between">
            <div className="bg-black/80 text-white px-6 py-4 rounded-xl backdrop-blur-sm border border-white/20 max-w-md">
              <h2 className="text-2xl font-bold mb-2">{current360Image.title}</h2>
              <p className="text-white/80">Interactive 360° Experience</p>
              <p className="text-xs text-white/60">
                Drag to explore • Scroll to zoom • Click fullscreen for best experience
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              onClick={close360Viewer}
              className="bg-black/80 hover:bg-black/90 text-white border border-white/20 backdrop-blur-sm rounded-xl h-14 w-14 p-0"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div id="pannellum-container" className="w-full h-full" style={{ position: "relative" }} />

          {/* Existing watermark overlay */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 15 }).map((_, row) => (
                <div
                  key={row}
                  className="flex whitespace-nowrap"
                  style={{
                    transform: `translateY(${row * 100}px) rotate(-45deg) translateX(-50%)`,
                    transformOrigin: "center",
                  }}
                >
                  {Array.from({ length: 25 }).map((_, col) => (
                    <span
                      key={col}
                      className="text-white font-bold text-3xl mx-12 drop-shadow-lg"
                      style={{
                        textShadow: "3px 3px 6px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5)",
                        WebkitTextStroke: "1px rgba(255,255,255,0.3)",
                      }}
                    >
                      N3URALI.ART
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
