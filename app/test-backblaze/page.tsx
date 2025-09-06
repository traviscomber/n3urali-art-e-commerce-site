"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Upload, Settings } from "lucide-react"

interface TestResult {
  name: string
  status: "success" | "error" | "pending"
  message: string
}

export default function TestBackblazePage() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [uploadTest, setUploadTest] = useState<{ status: "idle" | "uploading" | "success" | "error"; message: string }>(
    {
      status: "idle",
      message: "",
    },
  )

  const runCredentialTests = async () => {
    setIsRunning(true)
    setTests([])

    const testResults: TestResult[] = []

    // Test 1: Environment Variables
    testResults.push({
      name: "Environment Variables",
      status: "pending",
      message: "Checking required environment variables...",
    })
    setTests([...testResults])

    try {
      const envResponse = await fetch("/api/test-backblaze/env")
      const envData = await envResponse.json()

      testResults[0] = {
        name: "Environment Variables",
        status: envData.success ? "success" : "error",
        message: envData.message,
      }
      setTests([...testResults])
    } catch (error) {
      testResults[0] = {
        name: "Environment Variables",
        status: "error",
        message: "Failed to check environment variables",
      }
      setTests([...testResults])
    }

    // Test 2: Presigned URL Generation
    testResults.push({
      name: "Presigned URL Generation",
      status: "pending",
      message: "Testing presigned URL generation...",
    })
    setTests([...testResults])

    try {
      const urlResponse = await fetch("/api/test-backblaze/presigned")
      const urlData = await urlResponse.json()

      testResults[1] = {
        name: "Presigned URL Generation",
        status: urlData.success ? "success" : "error",
        message: urlData.message,
      }
      setTests([...testResults])
    } catch (error) {
      testResults[1] = {
        name: "Presigned URL Generation",
        status: "error",
        message: "Failed to generate presigned URL",
      }
      setTests([...testResults])
    }

    // Test 3: Bucket Access
    testResults.push({
      name: "Bucket Access",
      status: "pending",
      message: "Testing bucket access...",
    })
    setTests([...testResults])

    try {
      const bucketResponse = await fetch("/api/test-backblaze/bucket")
      const bucketData = await bucketResponse.json()

      testResults[2] = {
        name: "Bucket Access",
        status: bucketData.success ? "success" : "error",
        message: bucketData.message,
      }
      setTests([...testResults])
    } catch (error) {
      testResults[2] = {
        name: "Bucket Access",
        status: "error",
        message: "Failed to test bucket access",
      }
      setTests([...testResults])
    }

    setIsRunning(false)
  }

  const testFileUpload = async () => {
    setUploadTest({ status: "uploading", message: "Creating test file and uploading..." })

    try {
      // Create a small test file
      const testContent = `Test file created at ${new Date().toISOString()}`
      const testFile = new File([testContent], "backblaze-test.txt", { type: "text/plain" })

      // Get presigned URL
      const response = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: testFile.name,
          contentType: testFile.type,
          size: testFile.size,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get presigned URL: ${response.statusText}`)
      }

      const { presignedUrl } = await response.json()

      // Upload file using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: testFile,
        headers: {
          "Content-Type": testFile.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`)
      }

      setUploadTest({
        status: "success",
        message: `Successfully uploaded test file: ${testFile.name}`,
      })
    } catch (error) {
      setUploadTest({
        status: "error",
        message: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300 animate-spin border-t-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Success
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Running...</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Backblaze B2 Integration Test</h1>
          <p className="text-gray-600">Test your Backblaze B2 credentials and S3-compatible API integration</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Credential Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Credential Tests
              </CardTitle>
              <CardDescription>Validate environment variables, presigned URLs, and bucket access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runCredentialTests} disabled={isRunning} className="w-full">
                {isRunning ? "Running Tests..." : "Run Credential Tests"}
              </Button>

              {tests.length > 0 && (
                <div className="space-y-3">
                  {tests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <p className="font-medium">{test.name}</p>
                          <p className="text-sm text-gray-600">{test.message}</p>
                        </div>
                      </div>
                      {getStatusBadge(test.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Test
              </CardTitle>
              <CardDescription>Test actual file upload using presigned URLs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={testFileUpload}
                disabled={uploadTest.status === "uploading"}
                className="w-full"
                variant={uploadTest.status === "success" ? "default" : "outline"}
              >
                {uploadTest.status === "uploading" ? "Uploading..." : "Test File Upload"}
              </Button>

              {uploadTest.message && (
                <Alert
                  className={
                    uploadTest.status === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
                  }
                >
                  <AlertDescription className={uploadTest.status === "error" ? "text-red-700" : "text-green-700"}>
                    {uploadTest.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Environment Variables Info */}
        <Card>
          <CardHeader>
            <CardTitle>Required Environment Variables</CardTitle>
            <CardDescription>Make sure these environment variables are set in your Vercel project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 font-mono text-sm">
              <div className="p-2 bg-gray-800 text-white rounded">BACKBLAZE_KEY_ID=your_key_id</div>
              <div className="p-2 bg-gray-800 text-white rounded">BACKBLAZE_APPLICATION_KEY=your_application_key</div>
              <div className="p-2 bg-gray-800 text-white rounded">BACKBLAZE_BUCKET_NAME=your_bucket_name</div>
              <div className="p-2 bg-gray-800 text-white rounded">B2_REGION=us-east-005</div>
              <div className="p-2 bg-gray-800 text-white rounded">
                B2_ENDPOINT=https://s3.us-east-005.backblazeb2.com
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
