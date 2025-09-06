"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Upload, Loader2 } from "lucide-react"

export default function TestBackblazeFinal() {
  const [testResults, setTestResults] = useState<{
    envCheck: boolean | null
    uploadTest: boolean | null
    error: string | null
  }>({
    envCheck: null,
    uploadTest: null,
    error: null,
  })
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    console.log("[v0] Starting Backblaze integration tests...")
    setIsLoading(true)
    setTestResults({ envCheck: null, uploadTest: null, error: null })

    try {
      // Test 1: Environment variables check
      console.log("[v0] Testing environment variables...")
      const envResponse = await fetch("/api/test-backblaze-final/env")
      console.log("[v0] Environment check response status:", envResponse.status)

      const envData = await envResponse.json()
      console.log("[v0] Environment check data:", envData)

      if (!envData.success) {
        console.log("[v0] Environment check failed:", envData.error)
        setTestResults((prev) => ({ ...prev, envCheck: false, error: envData.error }))
        return
      }

      console.log("[v0] Environment check passed")
      setTestResults((prev) => ({ ...prev, envCheck: true }))

      // Test 2: Upload test with small file
      console.log("[v0] Testing file upload...")
      const testFile = new File(["Hello Backblaze!"], "test.txt", { type: "text/plain" })
      const formData = new FormData()
      formData.append("file", testFile)

      console.log("[v0] Sending upload request...")
      const uploadResponse = await fetch("/api/test-backblaze-final/upload", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Upload response status:", uploadResponse.status)
      const uploadData = await uploadResponse.json()
      console.log("[v0] Upload response data:", uploadData)

      if (!uploadData.success) {
        console.log("[v0] Upload test failed:", uploadData.error)
        setTestResults((prev) => ({ ...prev, uploadTest: false, error: uploadData.error }))
        return
      }

      console.log("[v0] Upload test passed:", uploadData.data.url)
      setTestResults((prev) => ({ ...prev, uploadTest: true }))
    } catch (error: any) {
      console.error("[v0] Test execution error:", error)
      setTestResults((prev) => ({ ...prev, error: error.message }))
    } finally {
      setIsLoading(false)
      console.log("[v0] Tests completed")
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Final Backblaze Integration Test</h1>
        <p className="text-muted-foreground">Test the completely rebuilt Backblaze integration using AWS SDK</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Backblaze Integration Test
          </CardTitle>
          <CardDescription>This will test the new AWS SDK-based Backblaze integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTests} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              "Run Integration Tests"
            )}
          </Button>

          {/* Test Results */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {testResults.envCheck === null ? (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              ) : testResults.envCheck ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">Environment Variables Check</span>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {testResults.uploadTest === null ? (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              ) : testResults.uploadTest ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">File Upload Test</span>
            </div>
          </div>

          {testResults.error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {testResults.error}
              </AlertDescription>
            </Alert>
          )}

          {testResults.envCheck && testResults.uploadTest && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Success!</strong> Backblaze integration is working properly. You can now upload files through
                the admin panel.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
