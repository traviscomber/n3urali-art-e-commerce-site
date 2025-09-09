"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface ImageData {
  id: string
  title: string
  image_url: string
  thumbnail_url: string
  category_name: string
}

interface URLTestResult {
  url: string
  status: "loading" | "success" | "error" | "cors-error"
  error?: string
}

export default function DebugURLsPage() {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<Record<string, URLTestResult>>({})
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/debug-urls")
      const data = await response.json()
      if (data.success) {
        setImages(data.images)
      }
    } catch (error) {
      console.error("Failed to fetch images:", error)
    } finally {
      setLoading(false)
    }
  }

  const testURL = async (url: string): Promise<URLTestResult> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      const timeout = setTimeout(() => {
        resolve({
          url,
          status: "error",
          error: "Timeout",
        })
      }, 10000)

      img.onload = () => {
        clearTimeout(timeout)
        resolve({
          url,
          status: "success",
        })
      }

      img.onerror = () => {
        clearTimeout(timeout)
        resolve({
          url,
          status: "cors-error",
          error: "CORS or network error",
        })
      }

      img.src = url
    })
  }

  const testAllURLs = async () => {
    setTesting(true)
    const results: Record<string, URLTestResult> = {}

    for (const image of images) {
      if (image.thumbnail_url) {
        setTestResults((prev) => ({
          ...prev,
          [image.thumbnail_url]: { url: image.thumbnail_url, status: "loading" },
        }))

        const result = await testURL(image.thumbnail_url)
        results[image.thumbnail_url] = result

        setTestResults((prev) => ({
          ...prev,
          [image.thumbnail_url]: result,
        }))
      }

      if (image.image_url && image.image_url !== image.thumbnail_url) {
        setTestResults((prev) => ({
          ...prev,
          [image.image_url]: { url: image.image_url, status: "loading" },
        }))

        const result = await testURL(image.image_url)
        results[image.image_url] = result

        setTestResults((prev) => ({
          ...prev,
          [image.image_url]: result,
        }))
      }
    }

    setTesting(false)
  }

  const getStatusIcon = (status: URLTestResult["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
      case "cors-error":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: URLTestResult["status"]) => {
    switch (status) {
      case "loading":
        return <Badge variant="secondary">Testing...</Badge>
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            ✓ Working
          </Badge>
        )
      case "cors-error":
        return <Badge variant="destructive">CORS Error</Badge>
      case "error":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Not Tested</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading image URLs...</span>
        </div>
      </div>
    )
  }

  const successCount = Object.values(testResults).filter((r) => r.status === "success").length
  const errorCount = Object.values(testResults).filter((r) => r.status === "error" || r.status === "cors-error").length
  const totalTested = Object.keys(testResults).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Image URL Diagnostics</h1>
          <p className="text-muted-foreground mt-2">Check which image URLs are working and which have CORS issues</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{images.length}</div>
                <div className="text-sm text-muted-foreground">Total Images</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{successCount}</div>
                <div className="text-sm text-muted-foreground">Working URLs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{errorCount}</div>
                <div className="text-sm text-muted-foreground">Failed URLs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalTested}</div>
                <div className="text-sm text-muted-foreground">URLs Tested</div>
              </div>
            </div>

            <Button onClick={testAllURLs} disabled={testing} className="w-full">
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing URLs...
                </>
              ) : (
                "Test All Image URLs"
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {images.map((image) => (
            <Card key={image.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{image.title}</CardTitle>
                  <Badge variant="outline">{image.category_name}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {image.thumbnail_url && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">Thumbnail URL</div>
                      <div className="text-xs text-muted-foreground truncate">{image.thumbnail_url}</div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {testResults[image.thumbnail_url] && getStatusIcon(testResults[image.thumbnail_url].status)}
                      {testResults[image.thumbnail_url] && getStatusBadge(testResults[image.thumbnail_url].status)}
                    </div>
                  </div>
                )}

                {image.image_url && image.image_url !== image.thumbnail_url && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">Full Image URL</div>
                      <div className="text-xs text-muted-foreground truncate">{image.image_url}</div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {testResults[image.image_url] && getStatusIcon(testResults[image.image_url].status)}
                      {testResults[image.image_url] && getStatusBadge(testResults[image.image_url].status)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {errorCount > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">CORS Configuration Needed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {errorCount} URLs are failing due to CORS restrictions. You need to configure CORS on your Backblaze B2
                bucket.
              </p>
              <Button asChild variant="outline">
                <a href="/setup-cors">Configure CORS</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
