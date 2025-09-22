"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"

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

export function SystemStatusChecker() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkSystemStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/system/status")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Failed to check system status:", error)
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
        errors: ["Failed to connect to system status API"],
        timestamp: new Date().toISOString(),
        message: "System status check failed",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      case "unhealthy":
        return <Badge className="bg-red-100 text-red-800">Unhealthy</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              System Status
              {status && getStatusBadge(status.status)}
            </CardTitle>
            <CardDescription>Download and licensing system health check</CardDescription>
          </div>
          <Button onClick={checkSystemStatus} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.checks.database)}
                <span className="text-sm">Database</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.checks.licenses)}
                <span className="text-sm">Licenses</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.checks.orders)}
                <span className="text-sm">Orders</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.checks.downloads)}
                <span className="text-sm">Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.checks.schema)}
                <span className="text-sm">Schema</span>
              </div>
            </div>

            {status.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">System Issues Detected:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {status.errors.map((error, index) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground">
              <p>{status.message}</p>
              <p>Last checked: {new Date(status.timestamp).toLocaleString()}</p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Checking system status...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
