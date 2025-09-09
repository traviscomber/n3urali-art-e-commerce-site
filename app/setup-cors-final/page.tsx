"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Settings, ImageIcon } from "lucide-react"

export default function SetupCorsFinalPage() {
  const [corsStatus, setCorsStatus] = useState<"idle" | "checking" | "setting" | "success" | "error">("idle")
  const [corsResult, setCorsResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkCorsStatus = async () => {
    setCorsStatus("checking")
    setError(null)

    try {
      const response = await fetch("/api/setup-backblaze-cors")
      const result = await response.json()

      if (result.success) {
        setCorsResult(result)
        setCorsStatus("success")
      } else {
        setError(result.error)
        setCorsStatus("error")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setCorsStatus("error")
    }
  }

  const setupCors = async () => {
    setCorsStatus("setting")
    setError(null)

    try {
      const response = await fetch("/api/setup-backblaze-cors", {
        method: "POST",
      })
      const result = await response.json()

      if (result.success) {
        setCorsResult(result)
        setCorsStatus("success")
      } else {
        setError(result.error)
        setCorsStatus("error")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setCorsStatus("error")
    }
  }

  const getStatusIcon = () => {
    switch (corsStatus) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case "error":
        return <XCircle className="w-6 h-6 text-red-500" />
      case "checking":
      case "setting":
        return <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
      default:
        return <Settings className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (corsStatus) {
      case "success":
        return "text-green-600"
      case "error":
        return "text-red-600"
      case "checking":
      case "setting":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Final Image Display Setup</h1>
          <p className="text-muted-foreground">Configure Backblaze CORS and complete the image display system</p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon()}
              <span>Backblaze CORS Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Status</p>
                <p className={`text-sm ${getStatusColor()}`}>
                  {corsStatus === "idle" && "Not configured"}
                  {corsStatus === "checking" && "Checking current configuration..."}
                  {corsStatus === "setting" && "Setting up CORS rules..."}
                  {corsStatus === "success" && "CORS configured successfully"}
                  {corsStatus === "error" && "Configuration failed"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={checkCorsStatus}
                  variant="outline"
                  disabled={corsStatus === "checking" || corsStatus === "setting"}
                >
                  {corsStatus === "checking" ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Check Status
                    </>
                  )}
                </Button>
                <Button onClick={setupCors} disabled={corsStatus === "checking" || corsStatus === "setting"}>
                  {corsStatus === "setting" ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Setup CORS
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle className="w-4 h-4" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            )}

            {corsResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Configuration Details</span>
                </div>
                <div className="space-y-2 text-sm">
                  {corsResult.bucketName && (
                    <p>
                      <span className="font-medium">Bucket:</span> {corsResult.bucketName}
                    </p>
                  )}
                  {corsResult.corsRules && corsResult.corsRules.length > 0 && (
                    <div>
                      <span className="font-medium">CORS Rules:</span>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {corsResult.corsRules.map((rule: any, index: number) => (
                          <li key={index}>
                            {rule.corsRuleName}: {rule.allowedOperations?.join(", ")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  1
                </Badge>
                <div>
                  <p className="font-medium">Run the SQL script</p>
                  <p className="text-sm text-muted-foreground">
                    Execute the final_image_url_fix.sql script to fix all broken URLs in the database
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  2
                </Badge>
                <div>
                  <p className="font-medium">Setup CORS configuration</p>
                  <p className="text-sm text-muted-foreground">
                    Click "Setup CORS" above to configure Backblaze for browser access
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  3
                </Badge>
                <div>
                  <p className="font-medium">Test image loading</p>
                  <p className="text-sm text-muted-foreground">
                    Visit the gallery page to verify that images are now displaying properly
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  4
                </Badge>
                <div>
                  <p className="font-medium">Upload new images</p>
                  <p className="text-sm text-muted-foreground">
                    New uploads will automatically use the correct Backblaze folder structure
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Important</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                After completing these steps, all images should display properly. Placeholders will only show for images
                that genuinely don't have valid URLs, which is the expected behavior.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => window.open("/gallery", "_blank")}>
            <ImageIcon className="w-4 h-4 mr-2" />
            View Gallery
          </Button>
          <Button variant="outline" onClick={() => window.open("/simple-admin", "_blank")}>
            <Settings className="w-4 h-4 mr-2" />
            Admin Panel
          </Button>
        </div>
      </div>
    </div>
  )
}
