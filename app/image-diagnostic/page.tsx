"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react"

export default function ImageDiagnosticPage() {
  const [imageData, setImageData] = useState<any>(null)
  const [corsTest, setCorsTest] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const imageId = "c907a40a-777d-4bbb-8c61-0fde20cf61ce"

  useEffect(() => {
    fetchImageData()
  }, [])

  const fetchImageData = async () => {
    try {
      const response = await fetch("/api/images/" + imageId)
      if (response.ok) {
        const data = await response.json()
        setImageData(data)
      }
    } catch (error) {
      console.error("Failed to fetch image data:", error)
    }
  }

  const testImageAccess = async () => {
    if (!imageData?.original_url) return

    setLoading(true)
    try {
      const img = new Image()
      img.crossOrigin = "anonymous"

      const result = await new Promise((resolve) => {
        img.onload = () => {
          resolve({ success: true, message: "Image loads successfully" })
        }
        img.onerror = () => {
          resolve({ success: false, message: "CORS blocked or image not found" })
        }
        setTimeout(() => {
          resolve({ success: false, message: "Timeout - image took too long to load" })
        }, 10000)
      })

      setCorsTest(result)
    } catch (error) {
      setCorsTest({ success: false, message: "Test failed: " + error.message })
    } finally {
      setLoading(false)
    }
  }

  const setupCors = async () => {
    try {
      const response = await fetch("/api/setup-cors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowedDomains: [window.location.origin, "https://*.vercel.app", "http://localhost:3000"],
        }),
      })

      const result = await response.json()
      if (result.success) {
        alert("CORS configured successfully! Try testing the image again.")
      } else {
        alert("CORS setup failed: " + result.error)
      }
    } catch (error) {
      alert("CORS setup error: " + error.message)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Image Diagnostic - Photo ID: {imageId}</CardTitle>
          <CardDescription>Diagnosing why your uploaded image isn't showing on the photo page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Data */}
          <div>
            <h3 className="font-semibold mb-3">Database Information</h3>
            {imageData ? (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p>
                  <strong>Title:</strong> {imageData.title}
                </p>
                <p>
                  <strong>Original URL:</strong>
                  <a
                    href={imageData.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-2"
                  >
                    {imageData.original_url}
                    <ExternalLink className="w-4 h-4 inline ml-1" />
                  </a>
                </p>
                <p>
                  <strong>Thumbnail URL:</strong> {imageData.thumbnail_small_url || "None"}
                </p>
                <p>
                  <strong>Status:</strong> {imageData.original_url ? "✅ URL exists" : "❌ No URL"}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Loading image data...</p>
            )}
          </div>

          {/* CORS Test */}
          <div>
            <h3 className="font-semibold mb-3">Image Access Test</h3>
            <div className="flex gap-4 mb-4">
              <Button onClick={testImageAccess} disabled={loading || !imageData?.original_url}>
                {loading ? "Testing..." : "Test Image Access"}
              </Button>
              <Button variant="outline" onClick={setupCors}>
                Setup CORS
              </Button>
            </div>

            {corsTest && (
              <Alert className={corsTest.success ? "border-green-500" : "border-red-500"}>
                <AlertDescription className="flex items-center gap-2">
                  {corsTest.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  {corsTest.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Image Preview */}
          {imageData?.original_url && (
            <div>
              <h3 className="font-semibold mb-3">Image Preview</h3>
              <div className="border rounded-lg p-4">
                <img
                  src={imageData.original_url || "/placeholder.svg"}
                  alt={imageData.title}
                  className="max-w-full h-auto max-h-96 object-contain"
                  onLoad={() => console.log("Image loaded successfully")}
                  onError={() => console.log("Image failed to load")}
                />
              </div>
            </div>
          )}

          {/* Instructions */}
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>If the image doesn't load:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Click "Setup CORS" to configure your Backblaze bucket</li>
                <li>Wait for the success message</li>
                <li>Click "Test Image Access" to verify it works</li>
                <li>
                  Visit{" "}
                  <a href={`/photo/${imageId}`} className="text-blue-600 hover:underline">
                    /photo/{imageId}
                  </a>{" "}
                  to see your photo
                </li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
