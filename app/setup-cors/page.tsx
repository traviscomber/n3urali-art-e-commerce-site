"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SetupCORSPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const setupCORS = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/setup-cors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origins: [
            "https://n3uralia360.art",
            "https://*.n3uralia360.art",
            "http://localhost:3000",
            "https://*.vercel.app",
          ],
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || "Failed to setup CORS")
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const checkCORS = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/setup-cors")
      const data = await response.json()

      if (data.success) {
        setResult({ corsRules: data.corsRules, checking: true })
      } else {
        setError(data.error || "Failed to check CORS")
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Backblaze CORS Configuration</CardTitle>
          <CardDescription>
            Configure Cross-Origin Resource Sharing (CORS) for your Backblaze bucket to allow browser access to uploaded
            images.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={setupCORS} disabled={loading}>
              {loading ? "Configuring..." : "Setup CORS"}
            </Button>
            <Button variant="outline" onClick={checkCORS} disabled={loading}>
              {loading ? "Checking..." : "Check Current CORS"}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <AlertDescription>
                {result.checking ? (
                  <div>
                    <strong>Current CORS Rules:</strong>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                      {JSON.stringify(result.corsRules, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <strong>CORS Setup Successful!</strong>
                    <p className="mt-2">Configured origins: {result.origins?.join(", ")}</p>
                    <p className="mt-2 text-sm text-green-600">
                      Your uploaded images should now be accessible from the browser.
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-600">
            <p>
              <strong>What this does:</strong>
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Allows browsers to load images from your Backblaze bucket</li>
              <li>Configures proper CORS headers for cross-origin requests</li>
              <li>Enables image display in your web application</li>
              <li>Fixes "broken file" issues with uploaded images</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
