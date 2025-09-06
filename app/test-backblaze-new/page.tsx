"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestBackblazeNew() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploadTest, setUploadTest] = useState<any>(null)

  const runTests = async () => {
    setLoading(true)
    try {
      // Test new authentication system
      const response = await fetch("/api/backblaze/test")
      const results = await response.json()
      setTestResults(results)
    } catch (error) {
      setTestResults({ success: false, error: error.message })
    }
    setLoading(false)
  }

  const testUpload = async () => {
    setLoading(true)
    try {
      // Create a test file
      const testContent = `Test upload at ${new Date().toISOString()}`
      const testFile = new File([testContent], "test.txt", { type: "text/plain" })

      // Get presigned URL
      const urlResponse = await fetch("/api/backblaze/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: testFile.name,
          contentType: testFile.type,
        }),
      })

      const urlResult = await urlResponse.json()

      if (!urlResult.success) {
        throw new Error(urlResult.error)
      }

      // Upload file
      const uploadResponse = await fetch(urlResult.presignedUrl, {
        method: "PUT",
        body: testFile,
        headers: {
          "Content-Type": testFile.type,
        },
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`)
      }

      setUploadTest({
        success: true,
        key: urlResult.key,
        presignedUrl: urlResult.presignedUrl.substring(0, 100) + "...",
      })
    } catch (error) {
      setUploadTest({ success: false, error: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">New Backblaze Authentication Test</h1>

        <div className="grid gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Authentication Test</CardTitle>
              <CardDescription className="text-gray-300">Test the new Backblaze authentication system</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={runTests} disabled={loading} className="mb-4">
                {loading ? "Testing..." : "Run Authentication Test"}
              </Button>

              {testResults && (
                <div className="mt-4 p-4 bg-slate-700 rounded">
                  <pre className="text-sm text-white overflow-auto">{JSON.stringify(testResults, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Upload Test</CardTitle>
              <CardDescription className="text-gray-300">Test actual file upload to Backblaze</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testUpload} disabled={loading} className="mb-4">
                {loading ? "Uploading..." : "Test File Upload"}
              </Button>

              {uploadTest && (
                <div className="mt-4 p-4 bg-slate-700 rounded">
                  <pre className="text-sm text-white overflow-auto">{JSON.stringify(uploadTest, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
