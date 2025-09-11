"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface ImageTest {
  url: string
  status: "testing" | "success" | "failed" | "cors-error"
  error?: string
  loadTime?: number
}

export default function DebugImagesPage() {
  const [imageTests, setImageTests] = useState<ImageTest[]>([])
  const [loading, setLoading] = useState(false)
  const [corsStatus, setCorsStatus] = useState<any>(null)

  // The specific failing URL from debug logs
  const failingUrl =
    "https://f005.backblazeb2.com/file/Neuraliart/thumbnails/360--images/5dbbaa2e-d4ec-43dc-9034-805a62432937-1757392375077_thumb_1000805179.jpg"

  const testImageUrl = async (url: string): Promise<ImageTest> => {
    const startTime = Date.now()

    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        resolve({
          url,
          status: "success",
          loadTime: Date.now() - startTime,
        })
      }

      img.onerror = (error) => {
        resolve({
          url,
          status: "failed",
          error: "Image failed to load - likely CORS or file not found",
          loadTime: Date.now() - startTime,
        })
      }

      // Set a timeout for CORS errors
      setTimeout(() => {
        resolve({
          url,
          status: "cors-error",
          error: "Timeout - likely CORS restriction",
          loadTime: Date.now() - startTime,
        })
      }, 10000)

      img.src = url
    })
  }

  const runImageTests = async () => {
    setLoading(true)

    // Test the specific failing URL
    const tests = [failingUrl]

    // Add some sample URLs to test different patterns
    const sampleUrls = [
      "https://f005.backblazeb2.com/file/Neuraliart/test-image.jpg",
      "https://f005.backblazeb2.com/file/Neuraliart/thumbnails/test-thumb.jpg",
    ]

    const allTests = [...tests, ...sampleUrls]

    setImageTests(allTests.map((url) => ({ url, status: "testing" })))

    // Test each URL
    for (let i = 0; i < allTests.length; i++) {
      const result = await testImageUrl(allTests[i])
      setImageTests((prev) => prev.map((test, index) => (index === i ? result : test)))
    }

    setLoading(false)
  }

  const checkCorsStatus = async () => {
    try {
      const response = await fetch("/api/setup-cors")
      const data = await response.json()
      setCorsStatus(data)
    } catch (error) {
      setCorsStatus({ success: false, error: "Failed to check CORS status" })
    }
  }

  const setupCors = async () => {
    try {
      const response = await fetch("/api/setup-cors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowedDomains: ["https://n3uralia360.art", "https://*.vercel.app", "http://localhost:3000"],
        }),
      })
      const data = await response.json()
      setCorsStatus(data)

      if (data.success) {
        // Re-test images after CORS setup
        setTimeout(() => runImageTests(), 2000)
      }
    } catch (error) {
      setCorsStatus({ success: false, error: "Failed to setup CORS" })
    }
  }

  useEffect(() => {
    checkCorsStatus()
  }, [])

  const getStatusBadge = (status: ImageTest["status"]) => {
    switch (status) {
      case "testing":
        return <Badge variant="secondary">Testing...</Badge>
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            ✅ Success
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">❌ Failed</Badge>
      case "cors-error":
        return <Badge variant="destructive">🚫 CORS Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Image URL Diagnostic Tool</CardTitle>
          <CardDescription>
            Test specific Backblaze image URLs to diagnose CORS and accessibility issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runImageTests} disabled={loading}>
              {loading ? "Testing Images..." : "Test Image URLs"}
            </Button>
            <Button variant="outline" onClick={checkCorsStatus}>
              Check CORS Status
            </Button>
            <Button variant="secondary" onClick={setupCors}>
              Setup CORS
            </Button>
          </div>

          {corsStatus && (
            <Alert className={corsStatus.success ? "border-green-500" : "border-red-500"}>
              <AlertDescription>
                {corsStatus.success ? (
                  <div>
                    <p className="font-medium text-green-700">✅ CORS Status: {corsStatus.bucketType}</p>
                    <p className="text-sm mt-1">CORS rules are configured</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-red-700">❌ CORS Issue</p>
                    <p className="text-sm mt-1">{corsStatus.error}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {imageTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Image Test Results</CardTitle>
            <CardDescription>Results for specific URLs that are failing to load</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {imageTests.map((test, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(test.status)}
                      {test.loadTime && <Badge variant="outline">{test.loadTime}ms</Badge>}
                    </div>
                  </div>

                  <p className="text-sm font-mono bg-muted p-2 rounded break-all">{test.url}</p>

                  {test.error && <p className="text-sm text-red-600 mt-2">Error: {test.error}</p>}

                  {test.status === "success" && (
                    <div className="mt-2">
                      <img
                        src={test.url || "/placeholder.svg"}
                        alt="Test image"
                        className="max-w-xs max-h-32 object-cover rounded"
                        crossOrigin="anonymous"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium">1.</span>
              <span>First, setup CORS using the button above to allow browser access to Backblaze files</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">2.</span>
              <span>Test the specific failing URL to see if it exists and is accessible</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">3.</span>
              <span>If files don't exist, the database URLs need to be updated to point to valid files</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">4.</span>
              <span>Consider using placeholder images for missing thumbnails as a fallback</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
