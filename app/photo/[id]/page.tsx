"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, ShoppingCart, Eye, Crown, RotateCcw, Zap, Clock } from "lucide-react"
import { getImages } from "@/app/actions/admin-actions"
import { useAuth } from "@/lib/contexts/auth-context"

declare global {
  interface Window {
    pannellum: any
  }
}

interface Image {
  id: string
  title: string
  description: string
  category_name: string
  price: number
  image_url: string
  thumbnail_url: string
  license_name?: string
  metadata?: any
}

export default function PhotoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [image, setImage] = useState<Image | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [showQualityPreview, setShowQualityPreview] = useState(false)
  const [previewPosition, setPreviewPosition] = useState({ x: 50, y: 50 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [zoomLevel, setZoomLevel] = useState(6)
  const [show360Viewer, setShow360Viewer] = useState(false)
  const [viewerLoaded, setViewerLoaded] = useState(false)
  const viewerRef = useRef<HTMLDivElement>(null)
  const pannellumViewerRef = useRef<any>(null)
  const watermarkRefreshInterval = useRef<NodeJS.Timeout | null>(null)

  const [auctionPrice, setAuctionPrice] = useState<number | null>(null)
  const [auctionTimestamp, setAuctionTimestamp] = useState<Date | null>(null)
  const [auctionTimeLeft, setAuctionTimeLeft] = useState<number>(0)

  useEffect(() => {
    const priceParam = searchParams.get("auctionPrice")
    const timestampParam = searchParams.get("auctionTimestamp")

    if (priceParam && timestampParam) {
      const price = Number.parseFloat(priceParam)
      const timestamp = new Date(timestampParam)
      setAuctionPrice(price)
      setAuctionTimestamp(timestamp)

      // Set 10 minute timer for auction price lock
      const lockDuration = 10 * 60 * 1000 // 10 minutes in milliseconds
      const timeLeft = lockDuration - (Date.now() - timestamp.getTime())
      setAuctionTimeLeft(Math.max(0, timeLeft))

      console.log("[v0] Auction price loaded:", { price, timestamp, timeLeft })
    }
  }, [searchParams])

  useEffect(() => {
    if (auctionTimeLeft <= 0) return

    const interval = setInterval(() => {
      setAuctionTimeLeft((prev) => {
        const newTime = prev - 1000
        if (newTime <= 0) {
          setAuctionPrice(null)
          setAuctionTimestamp(null)
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [auctionTimeLeft])

  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const loadPannellum = () => {
    return new Promise((resolve, reject) => {
      if (window.pannellum) {
        resolve(window.pannellum)
        return
      }

      // Load CSS
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"
      document.head.appendChild(link)

      // Load JS
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"
      script.onload = () => {
        console.log("[v0] Pannellum loaded successfully")
        resolve(window.pannellum)
      }
      script.onerror = (error) => {
        console.error("[v0] Pannellum loading error:", error)
        reject(new Error("Failed to load Pannellum"))
      }
      document.head.appendChild(script)
    })
  }

  const init360Viewer = async () => {
    if (!viewerRef.current || !image) return

    try {
      console.log("[v0] Starting Pannellum 360° viewer initialization...")
      await loadPannellum()

      if (!window.pannellum) {
        throw new Error("Pannellum library not loaded properly")
      }

      // Destroy existing viewer if any
      if (pannellumViewerRef.current) {
        try {
          window.pannellum.destroy(viewerRef.current)
        } catch (e) {
          console.warn("[v0] Error destroying previous viewer:", e)
        }
      }

      console.log("[v0] Creating Pannellum viewer instance...")

      // Determine projection type based on category
      const projection = image.category_name === "Fisheye" ? "fisheye" : "equirectangular"

      pannellumViewerRef.current = window.pannellum.viewer(viewerRef.current, {
        type: projection,
        panorama: image.image_url, // Always use original image for best quality
        autoLoad: true,
        autoRotate: -2,
        compass: true,
        showZoomCtrl: true,
        showFullscreenCtrl: true,
        showControls: true,
        mouseZoom: true,
        doubleClickZoom: true,
        draggable: true,
        keyboardZoom: true,
        preview: "/placeholder.svg?height=500&width=500",
        loadButtonLabel: "Click to Load 360° View",
        noscriptErrorMsg: "JavaScript must be enabled to view this panorama.",
        notSupportedMsg: "Your browser does not support WebGL.",
      })

      // Add event listeners
      pannellumViewerRef.current.on("load", () => {
        console.log("[v0] Pannellum viewer loaded successfully")
        setViewerLoaded(true)

        addEnhancedWatermarkOverlay()

        startWatermarkRefresh()
      })

      pannellumViewerRef.current.on("error", (error: any) => {
        console.error("[v0] Pannellum viewer error:", error)
        setViewerLoaded(false)
      })

      console.log("[v0] Pannellum 360° viewer initialized successfully")
    } catch (error) {
      console.error("[v0] Error initializing Pannellum viewer:", error)
      setViewerLoaded(false)
      alert("Unable to load 360° viewer. Please try again or check your internet connection.")
    }
  }

  const addEnhancedWatermarkOverlay = () => {
    if (!viewerRef.current) return

    const canvas = viewerRef.current.querySelector("canvas")
    if (!canvas) return

    // Remove any existing watermark overlays
    const existingOverlays = viewerRef.current.querySelectorAll(".watermark-overlay")
    existingOverlays.forEach((overlay) => overlay.remove())

    const watermarkOverlay = document.createElement("div")
    watermarkOverlay.className = "watermark-overlay"
    watermarkOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 15;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 60px,
        rgba(255,255,255,0.08) 60px,
        rgba(255,255,255,0.08) 80px
      );
    `

    // Reduced from 60 watermarks to just 2 corner watermarks
    const watermarkStyles = `
      position: absolute;
      color: rgba(255,255,255,0.20);
      font-size: 16px;
      font-weight: 700;
      transform: rotate(-45deg);
      user-select: none;
      pointer-events: none;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      user-select: none;
      WebkitUserSelect: none;
      MozUserSelect: none;
    `

    const topLeftWatermark = document.createElement("div")
    topLeftWatermark.textContent = "n3urali.art"
    topLeftWatermark.style.cssText = `${watermarkStyles} left: 5%; top: 5%;`

    const bottomRightWatermark = document.createElement("div")
    bottomRightWatermark.textContent = "n3urali.art"
    bottomRightWatermark.style.cssText = `${watermarkStyles} right: 5%; bottom: 5%;`

    watermarkOverlay.appendChild(topLeftWatermark)
    watermarkOverlay.appendChild(bottomRightWatermark)

    const protectionOverlay = document.createElement("div")
    protectionOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 20;
      background: radial-gradient(circle at 50% 50%, transparent 40%, rgba(255,255,255,0.02) 100%);
    `

    watermarkOverlay.appendChild(protectionOverlay)
    viewerRef.current.appendChild(watermarkOverlay)

    const preventInteraction = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    canvas.addEventListener("contextmenu", preventInteraction)
    canvas.addEventListener("selectstart", preventInteraction)
    canvas.addEventListener("dragstart", preventInteraction)
  }

  const startWatermarkRefresh = () => {
    if (watermarkRefreshInterval.current) {
      clearInterval(watermarkRefreshInterval.current)
    }

    watermarkRefreshInterval.current = setInterval(() => {
      if (viewerRef.current && show360Viewer) {
        addEnhancedWatermarkOverlay()
      }
    }, 5000) // Refresh every 5 seconds
  }

  const stopWatermarkRefresh = () => {
    if (watermarkRefreshInterval.current) {
      clearInterval(watermarkRefreshInterval.current)
      watermarkRefreshInterval.current = null
    }
  }

  const toggle360Viewer = async () => {
    if (!show360Viewer) {
      setShow360Viewer(true)
      setViewerLoaded(false)
      setTimeout(() => {
        init360Viewer()
      }, 200)
    } else {
      stopWatermarkRefresh()

      if (pannellumViewerRef.current && viewerRef.current) {
        try {
          window.pannellum.destroy(viewerRef.current)
        } catch (e) {
          console.warn("[v0] Error destroying Pannellum viewer:", e)
        }
        pannellumViewerRef.current = null
      }
      setShow360Viewer(false)
      setViewerLoaded(false)
    }
  }

  useEffect(() => {
    return () => {
      stopWatermarkRefresh()

      if (pannellumViewerRef.current && viewerRef.current) {
        try {
          window.pannellum.destroy(viewerRef.current)
        } catch (e) {
          console.warn("[v0] Error destroying Pannellum viewer on unmount:", e)
        }
      }
    }
  }, [])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    return false
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault()
    return false
  }

  useEffect(() => {
    const viewParam = searchParams.get("view")
    if (viewParam === "360" && image && image.category_name !== "Fisheye") {
      console.log("[v0] Auto-activating 360° viewer from URL parameter")
      setShow360Viewer(true)
      setViewerLoaded(false)
      setTimeout(() => {
        init360Viewer()
      }, 500) // Small delay to ensure image is loaded
    }
  }, [image, searchParams])

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const result = await getImages()
        if (result.success) {
          const foundImage = result.data.find((img: any) => img.id === params.id)
          if (foundImage) {
            setImage(foundImage)
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching image:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchImage()
    }
  }, [params.id])

  const handlePurchase = async () => {
    if (!user) {
      router.push("/?auth=required")
      return
    }

    setPurchasing(true)
    try {
      const finalPrice = auctionPrice || image.price

      console.log("[v0] Processing purchase:", {
        imageId: image.id,
        regularPrice: image.price,
        auctionPrice,
        finalPrice,
      })

      const orderResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: `${image.id}-standard`,
              imageId: image.id,
              title: image.title,
              price: finalPrice, // Use final price (auction or regular)
              licenseType: "standard",
              previewUrl: image.thumbnail_url || image.image_url,
              category: image.category_name === "equirectangular" ? "equirectangular" : "fisheye",
              quantity: 1,
            },
          ],
          total: finalPrice, // Use final price
          customerInfo: {
            email: user.email,
            firstName: user.user_metadata?.full_name?.split(" ")[0] || "Customer",
            lastName: user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
          },
          paymentMethod: "demo",
        }),
      })

      const orderResult = await orderResponse.json()

      if (orderResult.success) {
        console.log("[v0] Purchase completed for image:", image?.id)
        console.log("[v0] Order created:", orderResult.data.orderNumber)

        alert(
          `Thank you! Your purchase of "${image.title}" is complete. Order #${orderResult.data.orderNumber} created. Check your account for download links.`,
        )
        router.push("/account/orders")
      } else {
        console.error("[v0] Order creation failed:", orderResult.error)
        alert(`Purchase failed: ${orderResult.error}. Please try again.`)
      }
    } catch (error) {
      console.error("[v0] Purchase error:", error)
      alert("There was an error processing your purchase. Please try again.")
    } finally {
      setPurchasing(false)
    }
  }

  const getRightsTypeDisplay = () => {
    const rightsType = image?.metadata?.rights_type
    if (rightsType === "exclusive")
      return { text: "Exclusive Rights", icon: Crown, color: "bg-primary text-primary-foreground" }
    if (rightsType === "non-exclusive")
      return { text: "Non-Exclusive Rights", icon: Eye, color: "bg-blue-600 text-white" }
    if (rightsType === "both") return { text: "Both Rights Available", icon: Crown, color: "bg-purple-600 text-white" }
    return { text: "Standard License", icon: Eye, color: "bg-gray-600 text-white" }
  }

  const handleQualityPreviewToggle = () => {
    setShowQualityPreview(!showQualityPreview)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showQualityPreview) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setPreviewPosition({ x, y })
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!showQualityPreview) return

    e.preventDefault()
    const delta = e.deltaY > 0 ? -1 : 1
    setZoomLevel((prev) => Math.max(2, Math.min(12, prev + delta)))
  }

  const handleMouseLeave = () => {
    setShowQualityPreview(false)
    setZoomLevel(6)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading image details...</p>
        </div>
      </div>
    )
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Image Not Found</h1>
          <p className="text-muted-foreground mb-6">The requested image could not be found.</p>
          <Button onClick={() => router.push("/gallery")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
      </div>
    )
  }

  const rightsDisplay = getRightsTypeDisplay()
  const RightsIcon = rightsDisplay.icon

  const displayPrice = auctionPrice || image.price
  const hasAuctionPrice = auctionPrice !== null && auctionTimeLeft > 0
  const discountPercentage = hasAuctionPrice ? Math.round(((image.price - auctionPrice) / image.price) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/gallery")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Image Preview */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex gap-2 p-4 bg-muted/5 border-b">
                  {image.category_name !== "Fisheye" && (
                    <Button
                      variant={show360Viewer ? "default" : "outline"}
                      size="sm"
                      onClick={toggle360Viewer}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {show360Viewer ? "Exit 360° View" : "360° Interactive View"}
                    </Button>
                  )}

                  {!show360Viewer && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleQualityPreviewToggle}
                      className={`flex items-center gap-2 transition-all ${
                        showQualityPreview
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-card text-card-foreground hover:bg-muted border border-border"
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-xs font-medium">HQ Preview</span>
                    </Button>
                  )}
                </div>

                {show360Viewer && image.category_name !== "Fisheye" ? (
                  <div className="relative">
                    <div ref={viewerRef} className="w-full h-[500px] bg-muted/10" style={{ minHeight: "500px" }} />
                    {!viewerLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Loading 360° viewer...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`relative aspect-square bg-muted/10 ${
                      showQualityPreview ? "cursor-crosshair" : "cursor-default"
                    }`}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onWheel={handleWheel}
                    onContextMenu={handleContextMenu}
                  >
                    <div
                      className="relative w-full h-full select-none"
                      onContextMenu={handleContextMenu}
                      onDragStart={handleDragStart}
                      style={{ userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none" }}
                    >
                      <img
                        src={image.image_url || "/placeholder.svg"}
                        alt={image.title}
                        className="w-full h-full object-contain select-none pointer-events-none"
                        draggable={false}
                        onContextMenu={handleContextMenu}
                        onDragStart={handleDragStart}
                        style={{
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          MozUserSelect: "none",
                          WebkitUserDrag: "none",
                          WebkitTouchCallout: "none",
                        }}
                      />

                      <div
                        className="absolute inset-0 pointer-events-none select-none flex items-center justify-center"
                        style={{ userSelect: "none" }}
                      >
                        <div className="relative max-w-full max-h-full" style={{ aspectRatio: "auto" }}>
                          <img
                            src={image.image_url || "/placeholder.svg"}
                            alt=""
                            className="w-full h-full object-contain opacity-0 pointer-events-none"
                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                          />
                          <div className="absolute inset-0 overflow-hidden">
                            <div
                              className="absolute text-white/20 font-bold text-sm transform -rotate-45 select-none pointer-events-none"
                              style={{
                                left: "5%",
                                top: "5%",
                                textStroke: "1px rgba(255,255,255,0.08)",
                                WebkitTextStroke: "1px rgba(255,255,255,0.08)",
                                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                                userSelect: "none",
                                WebkitUserSelect: "none",
                                MozUserSelect: "none",
                              }}
                            >
                              n3urali.art
                            </div>
                            <div
                              className="absolute text-white/20 font-bold text-sm transform -rotate-45 select-none pointer-events-none"
                              style={{
                                right: "5%",
                                bottom: "5%",
                                textStroke: "1px rgba(255,255,255,0.08)",
                                WebkitTextStroke: "1px rgba(255,255,255,0.08)",
                                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                                userSelect: "none",
                                WebkitUserSelect: "none",
                                MozUserSelect: "none",
                              }}
                            >
                              n3urali.art
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="absolute inset-0 z-10 bg-transparent"
                        onContextMenu={handleContextMenu}
                        onDragStart={handleDragStart}
                        style={{
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          MozUserSelect: "none",
                        }}
                      />
                    </div>

                    {/* Quality preview window showing cropped original image */}
                    {showQualityPreview && (
                      <div
                        className="absolute pointer-events-none z-30 border-2 border-primary shadow-2xl rounded-lg overflow-hidden bg-white"
                        style={{
                          left: Math.min(mousePosition.x + 20, 300),
                          top: Math.min(mousePosition.y - 150, 200),
                          width: "300px",
                          height: "300px",
                        }}
                      >
                        <div className="relative w-full h-full">
                          <img
                            src={image.image_url || "/placeholder.svg"}
                            alt="Quality Preview"
                            className="w-full h-full object-cover"
                            style={{
                              transform: `scale(${zoomLevel})`,
                              transformOrigin: `${previewPosition.x}% ${previewPosition.y}%`,
                            }}
                          />
                          <div className="absolute inset-0 border border-primary/20"></div>
                          <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 text-center font-medium">
                            Original Quality • {zoomLevel}x Zoom
                          </div>
                          <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {zoomLevel}x
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Crosshair indicator when quality preview is active */}
                    {showQualityPreview && (
                      <div
                        className="absolute pointer-events-none z-20"
                        style={{
                          left: mousePosition.x - 10,
                          top: mousePosition.y - 10,
                          width: "20px",
                          height: "20px",
                        }}
                      >
                        <div className="w-full h-full border-2 border-primary rounded-full bg-primary/20"></div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground">
              {show360Viewer && image.category_name !== "Fisheye" ? (
                <span className="text-primary font-medium">
                  Interactive 360° View • Original Resolution • Drag to look around • Scroll to zoom • Double-click to
                  zoom • Click fullscreen for immersive experience
                </span>
              ) : (
                <>
                  Original Resolution Preview • Watermarked • Full commercial license available after purchase
                  {showQualityPreview && (
                    <span className="block mt-1 text-primary font-medium">
                      Move mouse to explore • Scroll wheel to zoom (2x-12x) • This is the actual full-resolution image
                    </span>
                  )}
                  {!showQualityPreview && (
                    <span className="block mt-1">
                      {image.category_name === "Fisheye"
                        ? "Click HQ Preview to inspect details with enhanced zoom (scroll to zoom up to 12x)"
                        : "Click HQ Preview to inspect details with enhanced zoom or 360° Interactive View for immersive experience"}
                    </span>
                  )}
                </>
              )}
              <span className="block mt-1 text-xs text-red-600">
                ⚠️ Original images are protected with watermarks - Purchase required for clean, commercial-use files
              </span>
            </div>
          </div>

          {/* Image Details & Purchase */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-card text-card-foreground border-border">
                  {image.category_name === "Fisheye" ? "180° Fisheye" : "360° Equirectangular"}
                </Badge>
                <Badge variant="secondary" className="bg-primary text-primary-foreground">
                  <RightsIcon className="w-3 h-3 mr-1" />
                  {rightsDisplay.text}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold mb-4">{image.title}</h1>

              {image.description && (
                <p className="text-muted-foreground text-lg leading-relaxed">{image.description}</p>
              )}
            </div>

            {/* Specifications */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Specifications</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Resolution:</span>
                    <p className="font-medium">4K - 16K (Full HQ)</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format:</span>
                    <p className="font-medium">JPG, PNG</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">License:</span>
                    <p className="font-medium">{image.license_name || "Premium License"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Usage:</span>
                    <p className="font-medium">Commercial & Personal</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Purchase */}
            <Card className="border-primary/20">
              <CardContent className="p-6">
                {hasAuctionPrice && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-green-500 text-white">
                        <Zap className="w-3 h-3 mr-1" />
                        FLASH AUCTION PRICE
                      </Badge>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {discountPercentage}% OFF
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Price locked for: {formatTimeLeft(auctionTimeLeft)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    {hasAuctionPrice && <p className="text-lg text-muted-foreground line-through">${image.price}</p>}
                    <p className={`text-3xl font-bold ${hasAuctionPrice ? "text-green-500" : "text-primary"}`}>
                      ${displayPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Instant Download</p>
                    <p className="text-sm font-medium">Full Resolution</p>
                  </div>
                </div>

                <Button onClick={handlePurchase} disabled={purchasing} className="w-full h-12 text-lg" size="lg">
                  {purchasing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {hasAuctionPrice ? `Lock In Auction Price - $${displayPrice.toFixed(2)}` : "Buy & Download Now"}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    Instant Download
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Full Resolution
                  </div>
                </div>
              </CardContent>
            </Card>

            {!user && (
              <Card className="border-yellow-500 bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-600">
                <CardContent className="p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Sign in required:</strong> You'll be redirected to sign in before completing your purchase.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
