"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SetupBackblazeCorsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [corsRules, setCorsRules] = useState<any[]>([])

  const setupCors = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/setup-backblaze-cors", {
        method: "POST",
      })
      const data = await response.json()
      setResult(data)
      if (data.success) {
        setCorsRules(data.corsRules || [])
      }
    } catch (error) {
      setResult({ success: false, error: "Network error" })
    } finally {
      setLoading(false)
    }
  }

  const checkCors = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/setup-backblaze-cors")
      const data = await response.json()
      setResult(data)
      if (data.success) {
        setCorsRules(data.corsRules || [])
      }
    } catch (error) {
      setResult({ success: false, error: "Network error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Backblaze CORS Configuration</CardTitle>
          <CardDescription>
            Configure Cross-Origin Resource Sharing (CORS) for your Backblaze bucket to allow browser access to images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={setupCors} disabled={loading}>
              {loading ? "Setting up..." : "Setup CORS"}
            </Button>
            <Button variant="outline" onClick={checkCors} disabled={loading}>
              {loading ? "Checking..." : "Check Current CORS"}
            </Button>
          </div>

          {result && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Success" : "Error"}
                </Badge>
                <span className="text-sm text-muted-foreground">{result.message || result.error}</span>
              </div>

              {result.success && result.bucketName && (
                <div className="mb-4">
                  <h3 className="font-semibold">Bucket: {result.bucketName}</h3>
                </div>
              )}

              {corsRules.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Current CORS Rules:</h3>
                  <div className="space-y-2">
                    {corsRules.map((rule, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <div className="font-medium">{rule.corsRuleName}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>Origins: {rule.allowedOrigins?.join(", ")}</div>
                          <div>Operations: {rule.allowedOperations?.join(", ")}</div>
                          <div>Max Age: {rule.maxAgeSeconds}s</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {corsRules.length === 0 && result.success && (
                <div className="text-sm text-muted-foreground">
                  No CORS rules configured. Click "Setup CORS" to configure image access.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
