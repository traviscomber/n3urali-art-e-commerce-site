"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TestCredentialsPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [authTest, setAuthTest] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(false)

  const checkCredentials = async () => {
    console.log("[v0] Starting credential check...")
    setLoading(true)
    try {
      console.log("[v0] Fetching from /api/test-credentials...")
      const response = await fetch("/api/test-credentials")
      console.log("[v0] Response status:", response.status)

      const data = await response.json()
      console.log("[v0] Response data:", data)

      setResult(data)
    } catch (error) {
      console.error("[v0] Error checking credentials:", error)
      setResult({ error: "Failed to check credentials" })
    } finally {
      setLoading(false)
    }
  }

  const testAuthentication = async () => {
    console.log("[v0] Starting B2 authentication test...")
    setAuthLoading(true)
    try {
      const response = await fetch("/api/test-backblaze-final/env")
      const data = await response.json()
      setAuthTest(data)
    } catch (error) {
      console.error("[v0] Error testing authentication:", error)
      setAuthTest({ error: "Failed to test authentication" })
    } finally {
      setAuthLoading(false)
    }
  }

  console.log("[v0] TestCredentialsPage component rendered")

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Backblaze Credential Verification</CardTitle>
          <CardDescription>Check what Backblaze credentials are currently configured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={checkCredentials} disabled={loading}>
              {loading ? "Checking..." : "Check Current Credentials"}
            </Button>
            <Button onClick={testAuthentication} disabled={authLoading} variant="outline">
              {authLoading ? "Testing..." : "Test B2 Authentication"}
            </Button>
          </div>

          {result && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Current Configuration:</strong>
                </AlertDescription>
              </Alert>

              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                <div>
                  <strong>BACKBLAZE_API_KEY:</strong> {result.keyId || "Not set"}
                </div>
                <div>
                  <strong>BACKBLAZE_APPLICATION_KEY:</strong>{" "}
                  {result.applicationKey ? `${result.applicationKey.substring(0, 10)}...` : "Not set"}
                </div>
                <div>
                  <strong>BACKBLAZE_BUCKET_NAME:</strong> {result.bucketName || "Not set"}
                </div>
                {result.analysis && (
                  <div className="mt-4 pt-4 border-t">
                    <div>
                      <strong>Key ID Format:</strong> {result.analysis.keyIdFormat}
                    </div>
                    <div>
                      <strong>Application Key Format:</strong> {result.analysis.applicationKeyFormat}
                    </div>
                  </div>
                )}
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Expected Format:</strong>
                  <br />• BACKBLAZE_API_KEY should be a short Key ID (like "8f27927f71c6")
                  <br />• BACKBLAZE_APPLICATION_KEY should be a long Application Key (like "0056b342aae9b682...")
                  <br />• Both starting with "K005" indicates they're both Application Keys (wrong!)
                </AlertDescription>
              </Alert>

              {result.error && (
                <Alert variant="destructive">
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {authTest && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>B2 Authentication Test Results:</strong>
                </AlertDescription>
              </Alert>

              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                <pre>{JSON.stringify(authTest, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
