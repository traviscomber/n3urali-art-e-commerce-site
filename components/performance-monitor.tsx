"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, Zap, AlertTriangle, CheckCircle, Clock, Database } from "lucide-react"

interface PerformanceMetrics {
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
  memoryUsage: number
  connectionType: string
  isOnline: boolean
}

interface DatabasePerformance {
  queryCount: number
  avgQueryTime: number
  slowQueries: Array<{
    query: string
    duration: number
    timestamp: number
  }>
  cacheHitRate: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [dbMetrics, setDbMetrics] = useState<DatabasePerformance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    collectPerformanceMetrics()
    fetchDatabaseMetrics()

    // Set up periodic monitoring
    const interval = setInterval(() => {
      collectPerformanceMetrics()
      fetchDatabaseMetrics()
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const collectPerformanceMetrics = () => {
    if (typeof window === "undefined") return

    try {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType("paint")

      const fcp = paint.find((entry) => entry.name === "first-contentful-paint")?.startTime || 0
      const lcp = performance.getEntriesByType("largest-contentful-paint")[0]?.startTime || 0

      // Get memory usage if available
      const memory = (performance as any).memory
      const memoryUsage = memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : 0

      // Get connection info
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      const connectionType = connection?.effectiveType || "unknown"

      setMetrics({
        pageLoadTime: navigation.loadEventEnd - navigation.navigationStart,
        firstContentfulPaint: fcp,
        largestContentfulPaint: lcp,
        cumulativeLayoutShift: 0, // Would need to implement CLS measurement
        firstInputDelay: 0, // Would need to implement FID measurement
        timeToInteractive: navigation.domInteractive - navigation.navigationStart,
        memoryUsage,
        connectionType,
        isOnline: navigator.onLine,
      })
    } catch (error) {
      console.error("Failed to collect performance metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDatabaseMetrics = async () => {
    try {
      const response = await fetch("/api/analytics/performance")
      if (response.ok) {
        const data = await response.json()
        setDbMetrics(data)
      }
    } catch (error) {
      console.error("Failed to fetch database metrics:", error)
    }
  }

  const getPerformanceScore = (value: number, thresholds: { good: number; needs_improvement: number }) => {
    if (value <= thresholds.good) return { score: "good", color: "text-green-600" }
    if (value <= thresholds.needs_improvement) return { score: "needs improvement", color: "text-yellow-600" }
    return { score: "poor", color: "text-red-600" }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Activity className="h-6 w-6 animate-pulse mr-2" />
            <span>Collecting performance metrics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Performance monitoring is not available in this environment.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {metrics.isOnline ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span>{metrics.isOnline ? "Online" : "Offline"}</span>
            </div>
            <Badge variant="outline">Connection: {metrics.connectionType}</Badge>
            <Badge variant="outline">Memory: {metrics.memoryUsage.toFixed(1)}%</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Core Web Vitals
          </CardTitle>
          <CardDescription>Key performance metrics that affect user experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">First Contentful Paint</span>
                <span
                  className={`text-sm font-bold ${getPerformanceScore(metrics.firstContentfulPaint, { good: 1800, needs_improvement: 3000 }).color}`}
                >
                  {metrics.firstContentfulPaint.toFixed(0)}ms
                </span>
              </div>
              <Progress value={Math.min((metrics.firstContentfulPaint / 3000) * 100, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Largest Contentful Paint</span>
                <span
                  className={`text-sm font-bold ${getPerformanceScore(metrics.largestContentfulPaint, { good: 2500, needs_improvement: 4000 }).color}`}
                >
                  {metrics.largestContentfulPaint.toFixed(0)}ms
                </span>
              </div>
              <Progress value={Math.min((metrics.largestContentfulPaint / 4000) * 100, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Time to Interactive</span>
                <span
                  className={`text-sm font-bold ${getPerformanceScore(metrics.timeToInteractive, { good: 3800, needs_improvement: 7300 }).color}`}
                >
                  {metrics.timeToInteractive.toFixed(0)}ms
                </span>
              </div>
              <Progress value={Math.min((metrics.timeToInteractive / 7300) * 100, 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Performance */}
      {dbMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Performance
            </CardTitle>
            <CardDescription>Backend query performance and optimization metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{dbMetrics.queryCount}</p>
                <p className="text-sm text-muted-foreground">Total Queries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{dbMetrics.avgQueryTime.toFixed(1)}ms</p>
                <p className="text-sm text-muted-foreground">Avg Query Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{dbMetrics.cacheHitRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{dbMetrics.slowQueries.length}</p>
                <p className="text-sm text-muted-foreground">Slow Queries</p>
              </div>
            </div>

            {dbMetrics.slowQueries.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Slow Queries
                </h4>
                <div className="space-y-2">
                  {dbMetrics.slowQueries.slice(0, 5).map((query, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/20 border-l-4 border-red-500">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-red-600">{query.duration.toFixed(1)}ms</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(query.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <code className="text-xs text-muted-foreground block truncate">{query.query}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
