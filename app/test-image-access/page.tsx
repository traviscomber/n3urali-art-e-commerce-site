export const dynamic = 'force-dynamic'

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TestImageAccessPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testImageUrls = [
    "https://f005.backblazeb2.com/file/Neuraliart/full-images/fisheye/40efc84a-f9d9-4f7f-87f5-c3eb394ca270-1757176847781_flowsketch-escher-lego-replicate-flux-1.1-pro-ultra-sunset-2025-08-31T08-50-39.png",
    "https://f005.backblazeb2.com/file/Neuraliart/thumbnails/fisheye/4e0ee193-079f-4005-aca6-4bbf6468ec82-1757176852200_thumb_flowsketch-escher-lego-replicate-flux-1.1-pro-ultra-sunset-2025-08-31T08-50-39.png",
  ]

  const testImageAccess = async () => {
    setLoading(true)
    const results = []

    for (const url of testImageUrls) {
      try {
        console.log(`[v0] Testing image access: ${url}`)

        // Test if image loads
        const img = new Image()
        img.crossOrigin = "anonymous"

        const loadPromise = new Promise((resolve, reject) => {
          img.onload = () => resolve({ success: true, width: img.width, height: img.height })
          img.onerror = () => reject(new Error("Failed to load image"))
          setTimeout(() => reject(new Error("Timeout")), 10000)
        })

        img.src = url
        const result = await loadPromise

        results.push({
          url,
          status: "✅ SUCCESS",
          details: `Loaded ${result.width}x${result.height}`,
          success: true,
        })

        console.log(`[v0] Image loaded successfully: ${url}`)
      } catch (error) {
        results.push({
          url,
          status: "❌ FAILED",
          details: error.message,
          success: false,
        })

        console.log(`[v0] Image failed to load: ${url} - ${error.message}`)
      }
    }

    setTestResults(results)
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Backblaze Image Access</CardTitle>
          <CardDescription>Test if your website can access Backblaze images directly from the browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={testImageAccess} disabled={loading}>
            {loading ? "Testing Image Access..." : "Test Image Access"}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results:</h3>
              {testResults.map((result, index) => (
                <Alert key={index} className={result.success ? "border-green-500" : "border-red-500"}>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">{result.status}</p>
                      <p className="text-sm break-all">{result.url}</p>
                      <p className="text-sm">{result.details}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}

              {testResults.some((r) => !r.success) && (
                <Alert className="border-yellow-500">
                  <AlertDescription>
                    <p className="font-medium">⚠️ CORS Configuration Needed</p>
                    <p className="text-sm mt-1">
                      Some images failed to load. You need to configure CORS on your Backblaze bucket. Visit{" "}
                      <a href="/setup-cors" className="underline text-blue-600">
                        /setup-cors
                      </a>{" "}
                      to fix this.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
