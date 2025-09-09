"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { getImagesPaginated } from "@/app/actions/admin-actions"

interface ImageDiagnostic {
  id: string
  title: string
  thumbnail_url: string | null
  image_url: string | null
  category_name: string
  price: string
  thumbnail_status: "loading" | "success" | "error" | "invalid"
  image_status: "loading" | "success" | "error" | "invalid"
  thumbnail_error?: string
  image_error?: string
}

export default function ImageDiagnosticsPage() {
  const [images, setImages] = useState<ImageDiagnostic[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)

  const fetchImages = async () => {
    setLoading(true)
    try {
      const result = await getImagesPaginated(1, 100) // Get first 100 images
      const fetchedData = result.success ? result.data : { images: [] }

      const diagnostics: ImageDiagnostic[] = fetchedData.images.map((img: any) => ({
        id: img.id,
        title: img.title,
        thumbnail_url: img.thumbnail_url,
        image_url: img.image_url,
        category_name: img.category_name || "Unknown",
        price: img.price || "0",
        thumbnail_status: "loading",
        image_status: "loading",
      }))

      setImages(diagnostics)
    } catch (error) {
      console.error("Error fetching images:", error)
    } finally {
      setLoading(false)
    }
  }

  const testImageUrl = async (
    url: string | null,
  ): Promise<{ status: "success" | "error" | "invalid"; error?: string }> => {
    if (!url) {
      return { status: "invalid", error: "No URL provided" }
    }

    // Check for obviously broken URLs
    if (url.includes("/uploads/")) {
      return { status: "error", error: "Contains broken /uploads/ path" }
    }

    try {
      // Test if image can be loaded
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = "anonymous"

        img.onload = () => {
          resolve({ status: "success" })
        }

        img.onerror = () => {
          resolve({ status: "error", error: "Failed to load image" })
        }

        // Set timeout for slow loading images
        setTimeout(() => {
          resolve({ status: "error", error: "Timeout loading image" })
        }, 10000)

        img.src = url
      })
    } catch (error) {
      return { status: "error", error: `Exception: ${error}` }
    }
  }

  const runDiagnostics = async () => {
    setTesting(true)

    for (let i = 0; i < images.length; i++) {
      const image = images[i]

      // Test thumbnail URL
      const thumbnailResult = await testImageUrl(image.thumbnail_url)

      // Test main image URL
      const imageResult = await testImageUrl(image.image_url)

      setImages((prev) =>
        prev.map((img, index) =>
          index === i
            ? {
                ...img,
                thumbnail_status: thumbnailResult.status,
                thumbnail_error: thumbnailResult.error,
                image_status: imageResult.status,
                image_error: imageResult.error,
              }
            : img,
        ),
      )

      // Small delay to prevent overwhelming the browser
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setTesting(false)
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "invalid":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "invalid":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const errorCount = images.filter(
    (img) =>
      img.thumbnail_status === "error" ||
      img.image_status === "error" ||
      img.thumbnail_status === "invalid" ||
      img.image_status === "invalid",
  ).length

  const successCount = images.filter(
    (img) => img.thumbnail_status === "success" && img.image_status === "success",
  ).length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading images...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Image Diagnostics</h1>
            <p className="text-muted-foreground">Test image URLs and identify loading issues</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchImages} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={runDiagnostics} disabled={testing}>
              {testing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Run Diagnostics"
              )}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{images.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Working Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Broken Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {images.length > 0 ? Math.round((successCount / images.length) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image List */}
        <Card>
          <CardHeader>
            <CardTitle>Image Status Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{image.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{image.category_name}</Badge>
                        <span>${image.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(image.thumbnail_status)}
                        <span className="font-medium">Thumbnail:</span>
                        <Badge className={getStatusColor(image.thumbnail_status)}>{image.thumbnail_status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground break-all">
                        {image.thumbnail_url || "No thumbnail URL"}
                      </div>
                      {image.thumbnail_error && <div className="text-xs text-red-600">{image.thumbnail_error}</div>}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(image.image_status)}
                        <span className="font-medium">Main Image:</span>
                        <Badge className={getStatusColor(image.image_status)}>{image.image_status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground break-all">{image.image_url || "No image URL"}</div>
                      {image.image_error && <div className="text-xs text-red-600">{image.image_error}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
