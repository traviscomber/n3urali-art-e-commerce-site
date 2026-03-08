"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

// Mark this page as dynamic since it uses client-side hooks
export const dynamic = 'force-dynamic'

export default function FixCorsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [corsStatus, setCorsStatus] = useState<any>(null)

  const setupCors = async () => {
    setLoading(true)
    setResult(null)
    try {
      console.log("[v0] Setting up CORS configuration...")

      const response = await fetch("/api/setup-cors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowedDomains: [
            "https://n3uralia360.art",
            "https://*.n3uralia360.art",
            "https://*.vercel.app",
            "http://localhost:3000",
          ],
        }),
      })

      const data = await response.json()
      console.log("[v0] CORS setup response:", data)
      setResult(data)

      if (data.success) {
        // Check CORS status after setup
        await checkCorsStatus()
      }
    } catch (error) {
      console.error("[v0] CORS setup error:", error)
      setResult({ success: false, error: "Failed to setup CORS" })
    } finally {
      setLoading(false)
    }
  }

  const checkCorsStatus = async () => {
    try {
      console.log("[v0] Checking CORS status...")

      const response = await fetch("/api/setup-cors")
      const data = await response.json()
      console.log("[v0] CORS status response:", data)
      setCorsStatus(data)
    } catch (error) {
      console.error("[v0] Failed to check CORS:", error)
      setCorsStatus({ success: false, error: "Failed to check CORS status" })
    }
  }

  const testImageAccess = async () => {
    const testUrl =
      "https://f005.backblazeb2.com/file/Neuraliart/thumbnails/360--images/5dbbaa2e-d4ec-43dc-9034-805a62432937-1757392375077_thumb_1000805179.jpg"

    try {
      console.log("[v0] Testing image access:", testUrl)

      const img = new Image()
      img.crossOrigin = "anonymous"

      return new Promise((resolve) => {
        img.onload = () => {
          console.log("[v0] Image loaded successfully")
          resolve({ success: true, message: "Image accessible" })
        }
        img.onerror = (error) => {
          console.log("[v0] Image failed to load:", error)
          resolve({ success: false, message: "Image not accessible - CORS or file missing" })
        }
        img.src = testUrl
      })
    } catch (error) {
      console.error("[v0] Image test error:", error)
      return { success: false, message: "Test failed" }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Fix Image Loading Issues
          </CardTitle>
          <CardDescription>
            Your images are showing "Image Unavailable" because CORS (Cross-Origin Resource Sharing) is not configured
            on your Backblaze bucket. This prevents browsers from accessing images directly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Issue:</strong> Backblaze bucket returns 404 when checking CORS configuration.
              <br />
              <strong>Solution:</strong> Configure CORS rules to allow browser access from your domain.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button onClick={setupCors} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up CORS...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Fix CORS Now
                </>
              )}
            </Button>

            <Button variant="outline" onClick={checkCorsStatus}>
              Check CORS Status
            </Button>
          </div>

          {result && (
            <Alert className={result.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
              <AlertDescription>
                {result.success ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-green-700">✅ CORS configured successfully!</p>
                      <p className="text-sm mt-1 text-green-600">
                        Your website can now access Backblaze images directly. Refresh your gallery page to see the
                        images.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="font-medium text-red-700">❌ CORS setup failed</p>
                      <p className="text-sm mt-1 text-red-600">{result.error}</p>
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {corsStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {corsStatus.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  CORS Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {corsStatus.success ? (
                  <div className="space-y-3">
                    <p className="text-green-600 font-medium">✅ CORS is properly configured</p>
                    {corsStatus.corsRules && corsStatus.corsRules.length > 0 ? (
                      <div>
                        <p className="font-medium mb-2">Active CORS Rules:</p>
                        <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                          {JSON.stringify(corsStatus.corsRules, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-orange-600">⚠️ CORS rules found but empty</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-red-600 font-medium">❌ CORS not configured</p>
                    <p className="text-sm mt-1 text-red-600">{corsStatus.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
              <ol className="list-decimal list-inside space-y-2">
                <li>Click "Fix CORS Now" to configure CORS for your Backblaze bucket</li>
                <li>Wait for the success message</li>
                <li>Go back to your gallery page and refresh</li>
                <li>Images should now load properly instead of showing "Image Unavailable"</li>
              </ol>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
