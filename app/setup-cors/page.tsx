"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mark this page as dynamic since it uses client-side hooks
export const dynamic = 'force-dynamic'

export default function SetupCorsPage() {
  const [domains, setDomains] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [currentCors, setCurrentCors] = useState<any>(null)

  const setupCors = async () => {
    setLoading(true)
    try {
      const allowedDomains = domains
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d)

      const response = await fetch("/api/setup-cors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowedDomains }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        checkCurrentCors()
      }
    } catch (error) {
      setResult({ success: false, error: "Failed to setup CORS" })
    } finally {
      setLoading(false)
    }
  }

  const checkCurrentCors = async () => {
    try {
      const response = await fetch("/api/setup-cors")
      const data = await response.json()
      setCurrentCors(data)
    } catch (error) {
      console.error("Failed to check CORS:", error)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Backblaze CORS Configuration</CardTitle>
          <CardDescription>
            Configure Cross-Origin Resource Sharing (CORS) for your Backblaze bucket to allow your website to access
            images directly from the browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="domains">Allowed Domains (comma-separated)</Label>
            <Input
              id="domains"
              placeholder="https://yoursite.com, https://*.vercel.app"
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to allow all HTTPS domains and localhost. Use * for wildcards.
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={setupCors} disabled={loading}>
              {loading ? "Setting up CORS..." : "Setup CORS"}
            </Button>
            <Button variant="outline" onClick={checkCurrentCors}>
              Check Current CORS
            </Button>
          </div>

          {result && (
            <Alert className={result.success ? "border-green-500" : "border-red-500"}>
              <AlertDescription>
                {result.success ? (
                  <div>
                    <p className="font-medium text-green-700">✅ CORS configured successfully!</p>
                    <p className="text-sm mt-1">Your website can now access Backblaze images directly.</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-red-700">❌ CORS setup failed</p>
                    <p className="text-sm mt-1">{result.error}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {currentCors && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current CORS Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                {currentCors.success ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Bucket Type:</strong> {currentCors.bucketType}
                    </p>
                    <p>
                      <strong>CORS Rules:</strong>
                    </p>
                    <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(currentCors.corsRules, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-red-600">Failed to load CORS configuration: {currentCors.error}</p>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
