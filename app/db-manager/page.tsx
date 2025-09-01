"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DiagnosticResult {
  test: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: string | object
}

export default function DatabaseManagerPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setDiagnostics([])
    setLogs([])

    addLog("Starting comprehensive database diagnostics...")

    const results: DiagnosticResult[] = []

    try {
      // Test 1: Environment Variables
      addLog("Checking environment variables...")
      const envTest = await fetch("/api/db-manager/test-env")
      const envResult = await envTest.json()
      results.push({
        test: "Environment Variables",
        status: envResult.success ? "pass" : "fail",
        message: envResult.message,
        details: envResult.details,
      })

      // Test 2: Database Connection
      addLog("Testing database connection...")
      const connTest = await fetch("/api/db-manager/test-connection")
      const connResult = await connTest.json()
      results.push({
        test: "Database Connection",
        status: connResult.success ? "pass" : "fail",
        message: connResult.message,
        details: connResult.details,
      })

      // Test 3: Tables Existence
      addLog("Checking database tables...")
      const tablesTest = await fetch("/api/db-manager/test-tables")
      const tablesResult = await tablesTest.json()
      results.push({
        test: "Database Tables",
        status: tablesResult.success ? "pass" : "fail",
        message: tablesResult.message,
        details: tablesResult.details,
      })

      // Test 4: RLS Policies
      addLog("Checking RLS policies...")
      const rlsTest = await fetch("/api/db-manager/test-rls")
      const rlsResult = await rlsTest.json()
      results.push({
        test: "RLS Policies",
        status: rlsResult.success ? "pass" : "warning",
        message: rlsResult.message,
        details: rlsResult.details,
      })

      // Test 5: Admin Operations
      addLog("Testing admin operations...")
      const adminTest = await fetch("/api/db-manager/test-admin")
      const adminResult = await adminTest.json()
      results.push({
        test: "Admin Operations",
        status: adminResult.success ? "pass" : "fail",
        message: adminResult.message,
        details: adminResult.details,
      })

      setDiagnostics(results)
      addLog("Diagnostics completed!")
    } catch (error) {
      addLog(`Error during diagnostics: ${error}`)
      results.push({
        test: "Diagnostics",
        status: "fail",
        message: "Failed to complete diagnostics",
        details: String(error),
      })
      setDiagnostics(results)
    }

    setIsRunning(false)
  }

  const initializeDatabase = async () => {
    setIsRunning(true)
    addLog("Starting database initialization...")

    try {
      const response = await fetch("/api/db-manager/initialize", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        addLog("Database initialized successfully!")
      } else {
        addLog(`Database initialization failed: ${result.message}`)
      }
    } catch (error) {
      addLog(`Error during initialization: ${error}`)
    }

    setIsRunning(false)
  }

  const resetDatabase = async () => {
    setIsRunning(true)
    addLog("Starting database reset...")

    try {
      const response = await fetch("/api/db-manager/reset", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        addLog("Database reset successfully!")
      } else {
        addLog(`Database reset failed: ${result.message}`)
      }
    } catch (error) {
      addLog(`Error during reset: ${error}`)
    }

    setIsRunning(false)
  }

  const autoFix = async () => {
    setIsRunning(true)
    addLog("Starting auto-fix...")

    try {
      const response = await fetch("/api/db-manager/auto-fix", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        addLog("Auto-fix completed successfully!")
        addLog(`Applied fixes: ${result.fixes.join(", ")}`)
      } else {
        addLog(`Auto-fix failed: ${result.message}`)
      }
    } catch (error) {
      addLog(`Error during auto-fix: ${error}`)
    }

    setIsRunning(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "bg-green-500"
      case "fail":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Manager</h1>
          <p className="text-gray-600">Comprehensive database management, diagnostics, and auto-fix system</p>
        </div>

        <Tabs defaultValue="diagnostics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Diagnostics</CardTitle>
                <CardDescription>Run comprehensive tests to identify database issues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={runDiagnostics} disabled={isRunning} className="w-full">
                  {isRunning ? "Running Diagnostics..." : "Run Full Diagnostics"}
                </Button>

                {diagnostics.length > 0 && (
                  <div className="space-y-3">
                    {diagnostics.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{result.test}</h3>
                          <Badge className={getStatusColor(result.status)}>{result.status.toUpperCase()}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                        {result.details && (
                          <details className="text-xs text-gray-500">
                            <summary className="cursor-pointer">Details</summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded">
                              {typeof result.details === "string"
                                ? result.details
                                : JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Initialize Database</CardTitle>
                  <CardDescription>Set up all tables, policies, and sample data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={initializeDatabase} disabled={isRunning} className="w-full">
                    Initialize Database
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reset Database</CardTitle>
                  <CardDescription>Clear all data and reinitialize from scratch</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={resetDatabase} disabled={isRunning} variant="destructive" className="w-full">
                    Reset Database
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Auto-Fix Issues</CardTitle>
                  <CardDescription>Automatically detect and fix common database problems</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={autoFix} disabled={isRunning} className="w-full">
                    Run Auto-Fix
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Real-time logs from database operations</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={logs.join("\n")}
                  readOnly
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Logs will appear here..."
                />
                <Button onClick={() => setLogs([])} variant="outline" className="mt-2">
                  Clear Logs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Tests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full bg-transparent">
                    Test Connection
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Check Tables
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Verify RLS
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Test Admin Access
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Utilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full bg-transparent">
                    Export Schema
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Import Data
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Backup Database
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    View Raw Data
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertDescription>
                Use these tools carefully. Some operations may affect your production data.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
