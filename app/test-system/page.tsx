"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SystemStatus {
  success: boolean
  status: string
  checks: {
    database: boolean
    licenses: boolean
    orders: boolean
    downloads: boolean
    schema: boolean
  }
  errors: string[]
  timestamp: string
  message: string
}

export default function SystemTestPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkSystemStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/system/status")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("System status check failed:", error)
      setStatus({
        success: false,
        status: "error",
        checks: {
          database: false,
          licenses: false,
          orders: false,
          downloads: false,
          schema: false,
        },
        errors: [error instanceof Error ? error.message : "Unknown error"],
        timestamp: new Date().toISOString(),
        message: "System status check failed",
      })
    } finally {
      setLoading(false)
    }
  }

  const testOrderCreation = async () => {
    try {
      const testOrder = {
        items: [
          {
            id: "test-item-1",
            imageId: "3ff3165f-3d93-4cd2-8831-187d86975595", // Use existing image ID
            title: "Test Image",
            price: 29.99,
            licenseId: "", // Will be resolved by API
            licenseName: "NON_EXCLUSIVE",
            licensePrice: 0,
            previewUrl: "",
            category: "equirectangular" as const,
            quantity: 1,
            licenseType: "NON_EXCLUSIVE" as const,
          },
        ],
        total: 29.99,
        customerInfo: {
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
        },
        paymentMethod: "demo" as const,
      }

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testOrder),
      })

      const result = await response.json()
      console.log("Test order result:", result)
      alert(result.success ? "Test order created successfully!" : `Error: ${result.error}`)
    } catch (error) {
      console.error("Test order error:", error)
      alert(`Test order failed: ${error}`)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">System Status & Testing</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Status Check</CardTitle>
              <CardDescription>Check database connectivity and system health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={checkSystemStatus} disabled={loading}>
                {loading ? "Checking..." : "Check System Status"}
              </Button>

              {status && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span>Overall Status:</span>
                    <Badge variant={status.success ? "default" : "destructive"}>{status.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <Badge variant={status.checks.database ? "default" : "destructive"} className="mb-2">
                        {status.checks.database ? "✓" : "✗"}
                      </Badge>
                      <div className="text-sm">Database</div>
                    </div>
                    <div className="text-center">
                      <Badge variant={status.checks.licenses ? "default" : "destructive"} className="mb-2">
                        {status.checks.licenses ? "✓" : "✗"}
                      </Badge>
                      <div className="text-sm">Licenses</div>
                    </div>
                    <div className="text-center">
                      <Badge variant={status.checks.orders ? "default" : "destructive"} className="mb-2">
                        {status.checks.orders ? "✓" : "✗"}
                      </Badge>
                      <div className="text-sm">Orders</div>
                    </div>
                    <div className="text-center">
                      <Badge variant={status.checks.downloads ? "default" : "destructive"} className="mb-2">
                        {status.checks.downloads ? "✓" : "✗"}
                      </Badge>
                      <div className="text-sm">Downloads</div>
                    </div>
                    <div className="text-center">
                      <Badge variant={status.checks.schema ? "default" : "destructive"} className="mb-2">
                        {status.checks.schema ? "✓" : "✗"}
                      </Badge>
                      <div className="text-sm">Schema</div>
                    </div>
                  </div>

                  {status.errors.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <h4 className="font-semibold text-red-800 mb-2">Errors:</h4>
                      <ul className="text-red-700 text-sm space-y-1">
                        {status.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    Last checked: {new Date(status.timestamp).toLocaleString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Creation Test</CardTitle>
              <CardDescription>Test the complete order creation and download system</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testOrderCreation}>Create Test Order</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Current system configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Database Schema:</strong> Working with existing schema (preserving user_email and image_id
                  columns)
                </div>
                <div>
                  <strong>Download Limits:</strong> 5 downloads per item (configurable per license)
                </div>
                <div>
                  <strong>Token Expiry:</strong> 30 days from generation
                </div>
                <div>
                  <strong>License Resolution:</strong> Automatic fallback for missing license IDs
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
