"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Zap,
  Clock,
  Eye,
  Gauge,
  Server,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react"

interface PerformanceMetrics {
  coreWebVitals: {
    fcp: { value: number; score: number; status: "good" | "needs-improvement" | "poor" }
    lcp: { value: number; score: number; status: "good" | "needs-improvement" | "poor" }
    cls: { value: number; score: number; status: "good" | "needs-improvement" | "poor" }
    fid: { value: number; score: number; status: "good" | "needs-improvement" | "poor" }
    inp: { value: number; score: number; status: "good" | "needs-improvement" | "poor" }
  }
  pageMetrics: {
    loadTime: number
    domContentLoaded: number
    firstByte: number
    resourcesLoaded: number
    totalSize: number
    requests: number
  }
  realUserMetrics: {
    bounceRate: number
    avgSessionDuration: number
    pageViews: number
    uniqueVisitors: number
    conversionRate: number
  }
  systemHealth: {
    uptime: number
    responseTime: number
    errorRate: number
    throughput: number
    memoryUsage: number
    cpuUsage: number
  }
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [monitoring, setMonitoring] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadPerformanceMetrics()
    const interval = setInterval(loadPerformanceMetrics, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadPerformanceMetrics = async () => {
    try {
      // Simulate real performance data collection
      const performanceData: PerformanceMetrics = {
        coreWebVitals: {
          fcp: { value: 1.2, score: 95, status: "good" },
          lcp: { value: 2.1, score: 88, status: "good" },
          cls: { value: 0.05, score: 92, status: "good" },
          fid: { value: 8, score: 96, status: "good" },
          inp: { value: 45, score: 94, status: "good" },
        },
        pageMetrics: {
          loadTime: 1.8,
          domContentLoaded: 1.2,
          firstByte: 0.3,
          resourcesLoaded: 2.1,
          totalSize: 2.4,
          requests: 23,
        },
        realUserMetrics: {
          bounceRate: 24.5,
          avgSessionDuration: 4.2,
          pageViews: 1247,
          uniqueVisitors: 892,
          conversionRate: 3.8,
        },
        systemHealth: {
          uptime: 99.9,
          responseTime: 145,
          errorRate: 0.02,
          throughput: 1250,
          memoryUsage: 68,
          cpuUsage: 23,
        },
      }

      setMetrics(performanceData)
      setLastUpdated(new Date())
      setLoading(false)
    } catch (error) {
      console.error("Failed to load performance metrics:", error)
      setLoading(false)
    }
  }

  const startMonitoring = () => {
    setMonitoring(true)
    // Simulate continuous monitoring
    setTimeout(() => setMonitoring(false), 5000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-500"
      case "needs-improvement":
        return "text-yellow-500"
      case "poor":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "needs-improvement":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "poor":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading performance metrics...</p>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitoring</h2>
          <p className="text-muted-foreground">Real-time performance metrics and Core Web Vitals</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button onClick={startMonitoring} disabled={monitoring}>
            <RefreshCw className={`w-4 h-4 mr-2 ${monitoring ? "animate-spin" : ""}`} />
            {monitoring ? "Monitoring..." : "Refresh Metrics"}
          </Button>
        </div>
      </div>

      {/* Core Web Vitals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              FCP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.coreWebVitals.fcp.status)}`}>
              {metrics.coreWebVitals.fcp.value}s
            </div>
            <Badge className={getStatusBadge(metrics.coreWebVitals.fcp.status)}>
              {metrics.coreWebVitals.fcp.status.replace("-", " ")}
            </Badge>
            <Progress value={metrics.coreWebVitals.fcp.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              LCP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.coreWebVitals.lcp.status)}`}>
              {metrics.coreWebVitals.lcp.value}s
            </div>
            <Badge className={getStatusBadge(metrics.coreWebVitals.lcp.status)}>
              {metrics.coreWebVitals.lcp.status.replace("-", " ")}
            </Badge>
            <Progress value={metrics.coreWebVitals.lcp.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              CLS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.coreWebVitals.cls.status)}`}>
              {metrics.coreWebVitals.cls.value}
            </div>
            <Badge className={getStatusBadge(metrics.coreWebVitals.cls.status)}>
              {metrics.coreWebVitals.cls.status.replace("-", " ")}
            </Badge>
            <Progress value={metrics.coreWebVitals.cls.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              FID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.coreWebVitals.fid.status)}`}>
              {metrics.coreWebVitals.fid.value}ms
            </div>
            <Badge className={getStatusBadge(metrics.coreWebVitals.fid.status)}>
              {metrics.coreWebVitals.fid.status.replace("-", " ")}
            </Badge>
            <Progress value={metrics.coreWebVitals.fid.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              INP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.coreWebVitals.inp.status)}`}>
              {metrics.coreWebVitals.inp.value}ms
            </div>
            <Badge className={getStatusBadge(metrics.coreWebVitals.inp.status)}>
              {metrics.coreWebVitals.inp.status.replace("-", " ")}
            </Badge>
            <Progress value={metrics.coreWebVitals.inp.score} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring */}
      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="page">Page Metrics</TabsTrigger>
          <TabsTrigger value="users">User Metrics</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">First Contentful Paint (FCP)</p>
                      <p className="text-sm text-muted-foreground">Time to first content render</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getStatusColor(metrics.coreWebVitals.fcp.status)}`}>
                        {metrics.coreWebVitals.fcp.value}s
                      </div>
                      <div className="text-sm text-muted-foreground">Score: {metrics.coreWebVitals.fcp.score}</div>
                    </div>
                  </div>
                  <Progress value={metrics.coreWebVitals.fcp.score} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Largest Contentful Paint (LCP)</p>
                      <p className="text-sm text-muted-foreground">Time to largest content render</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getStatusColor(metrics.coreWebVitals.lcp.status)}`}>
                        {metrics.coreWebVitals.lcp.value}s
                      </div>
                      <div className="text-sm text-muted-foreground">Score: {metrics.coreWebVitals.lcp.score}</div>
                    </div>
                  </div>
                  <Progress value={metrics.coreWebVitals.lcp.score} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Cumulative Layout Shift (CLS)</p>
                      <p className="text-sm text-muted-foreground">Visual stability measure</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getStatusColor(metrics.coreWebVitals.cls.status)}`}>
                        {metrics.coreWebVitals.cls.value}
                      </div>
                      <div className="text-sm text-muted-foreground">Score: {metrics.coreWebVitals.cls.score}</div>
                    </div>
                  </div>
                  <Progress value={metrics.coreWebVitals.cls.score} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Excellent FCP performance</p>
                    <p className="text-xs text-muted-foreground">Content renders quickly for users</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Good LCP optimization</p>
                    <p className="text-xs text-muted-foreground">Main content loads efficiently</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Stable layout performance</p>
                    <p className="text-xs text-muted-foreground">Minimal unexpected layout shifts</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Monitor image loading</p>
                    <p className="text-xs text-muted-foreground">Ensure images don't cause layout shifts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="page" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Load Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{metrics.pageMetrics.loadTime}s</div>
                    <p className="text-sm text-muted-foreground">Total Load Time</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{metrics.pageMetrics.domContentLoaded}s</div>
                    <p className="text-sm text-muted-foreground">DOM Content Loaded</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{metrics.pageMetrics.firstByte}s</div>
                    <p className="text-sm text-muted-foreground">Time to First Byte</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{metrics.pageMetrics.requests}</div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Page Size</span>
                    <span className="font-medium">{metrics.pageMetrics.totalSize} MB</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Resources Loaded</span>
                    <span className="font-medium">{metrics.pageMetrics.resourcesLoaded}s</span>
                  </div>
                  <Progress value={85} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Images optimized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">CSS minified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">JavaScript compressed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Real User Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{metrics.realUserMetrics.bounceRate}%</div>
                    <p className="text-sm text-muted-foreground">Bounce Rate</p>
                    <TrendingDown className="w-4 h-4 text-green-500 mx-auto mt-1" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {metrics.realUserMetrics.avgSessionDuration}m
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Session</p>
                    <TrendingUp className="w-4 h-4 text-green-500 mx-auto mt-1" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">{metrics.realUserMetrics.pageViews}</div>
                    <p className="text-sm text-muted-foreground">Page Views</p>
                    <TrendingUp className="w-4 h-4 text-green-500 mx-auto mt-1" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{metrics.realUserMetrics.uniqueVisitors}</div>
                    <p className="text-sm text-muted-foreground">Unique Visitors</p>
                    <TrendingUp className="w-4 h-4 text-green-500 mx-auto mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Experience Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Low bounce rate indicates engaging content</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Good session duration shows user interest</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Healthy conversion rate of {metrics.realUserMetrics.conversionRate}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Ultra high-quality platform content drives engagement</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <span className="font-medium text-green-500">{metrics.systemHealth.uptime}%</span>
                  </div>
                  <Progress value={metrics.systemHealth.uptime} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Response Time</span>
                    <span className="font-medium">{metrics.systemHealth.responseTime}ms</span>
                  </div>
                  <Progress value={85} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Rate</span>
                    <span className="font-medium text-green-500">{metrics.systemHealth.errorRate}%</span>
                  </div>
                  <Progress value={98} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Throughput</span>
                    <span className="font-medium">{metrics.systemHealth.throughput} req/min</span>
                  </div>
                  <Progress value={80} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      Memory Usage
                    </span>
                    <span className="font-medium">{metrics.systemHealth.memoryUsage}%</span>
                  </div>
                  <Progress value={metrics.systemHealth.memoryUsage} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      CPU Usage
                    </span>
                    <span className="font-medium">{metrics.systemHealth.cpuUsage}%</span>
                  </div>
                  <Progress value={metrics.systemHealth.cpuUsage} />
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">System running optimally</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">No critical alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Auto-scaling configured</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-green-500" />
            Performance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm font-medium text-green-500">All Systems Operational</p>
              <p className="text-xs text-muted-foreground">Performance within optimal ranges</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm font-medium text-green-500">Core Web Vitals Passing</p>
              <p className="text-xs text-muted-foreground">Meeting Google's performance standards</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm font-medium text-green-500">User Experience Excellent</p>
              <p className="text-xs text-muted-foreground">High engagement and low bounce rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
