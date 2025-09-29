"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Activity,
  Globe,
  Database,
  Server,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Settings,
  Eye,
} from "lucide-react"

interface HealthCheck {
  id: string
  name: string
  category: "security" | "performance" | "availability" | "database" | "api" | "content"
  status: "passing" | "warning" | "failing" | "unknown"
  lastRun: Date
  nextRun: Date
  interval: number
  enabled: boolean
  description: string
  details?: string
  responseTime?: number
  errorCount?: number
}

interface HealthCheckSummary {
  total: number
  passing: number
  warning: number
  failing: number
  uptime: number
  lastIncident: Date | null
}

export function AutomatedHealthChecks() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [summary, setSummary] = useState<HealthCheckSummary | null>(null)
  const [monitoring, setMonitoring] = useState(true)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    loadHealthChecks()
    const interval = setInterval(loadHealthChecks, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const loadHealthChecks = async () => {
    try {
      // Simulate comprehensive health check data
      const checks: HealthCheck[] = [
        {
          id: "ssl-cert",
          name: "SSL Certificate",
          category: "security",
          status: "passing",
          lastRun: new Date(Date.now() - 300000),
          nextRun: new Date(Date.now() + 3300000),
          interval: 3600000,
          enabled: true,
          description: "Validates SSL certificate expiry and configuration",
          details: "Certificate valid until 2025-12-31",
          responseTime: 45,
        },
        {
          id: "security-headers",
          name: "Security Headers",
          category: "security",
          status: "passing",
          lastRun: new Date(Date.now() - 180000),
          nextRun: new Date(Date.now() + 1620000),
          interval: 1800000,
          enabled: true,
          description: "Checks for proper security headers (CSP, HSTS, etc.)",
          details: "All security headers properly configured",
          responseTime: 32,
        },
        {
          id: "page-speed",
          name: "Page Speed",
          category: "performance",
          status: "passing",
          lastRun: new Date(Date.now() - 600000),
          nextRun: new Date(Date.now() + 300000),
          interval: 900000,
          enabled: true,
          description: "Monitors Core Web Vitals and page load times",
          details: "All metrics within optimal ranges",
          responseTime: 1200,
        },
        {
          id: "uptime",
          name: "Site Availability",
          category: "availability",
          status: "passing",
          lastRun: new Date(Date.now() - 60000),
          nextRun: new Date(Date.now() + 240000),
          interval: 300000,
          enabled: true,
          description: "Monitors site availability and response times",
          details: "Site responding normally",
          responseTime: 145,
        },
        {
          id: "database",
          name: "Database Health",
          category: "database",
          status: "passing",
          lastRun: new Date(Date.now() - 420000),
          nextRun: new Date(Date.now() + 480000),
          interval: 900000,
          enabled: true,
          description: "Checks database connectivity and performance",
          details: "Database responding within normal parameters",
          responseTime: 23,
        },
        {
          id: "api-endpoints",
          name: "API Endpoints",
          category: "api",
          status: "passing",
          lastRun: new Date(Date.now() - 240000),
          nextRun: new Date(Date.now() + 360000),
          interval: 600000,
          enabled: true,
          description: "Tests critical API endpoints functionality",
          details: "All endpoints responding correctly",
          responseTime: 89,
        },
        {
          id: "content-quality",
          name: "Content Quality",
          category: "content",
          status: "passing",
          lastRun: new Date(Date.now() - 1800000),
          nextRun: new Date(Date.now() + 1200000),
          interval: 3600000,
          enabled: true,
          description: "Validates ultra high-quality platform content integrity",
          details: "All content meets quality standards",
          responseTime: 156,
        },
        {
          id: "broken-links",
          name: "Broken Links",
          category: "content",
          status: "warning",
          lastRun: new Date(Date.now() - 900000),
          nextRun: new Date(Date.now() + 2700000),
          interval: 3600000,
          enabled: true,
          description: "Scans for broken internal and external links",
          details: "2 external links need attention",
          responseTime: 2340,
          errorCount: 2,
        },
        {
          id: "seo-meta",
          name: "SEO Metadata",
          category: "content",
          status: "passing",
          lastRun: new Date(Date.now() - 1200000),
          nextRun: new Date(Date.now() + 1800000),
          interval: 3600000,
          enabled: true,
          description: "Validates SEO metadata completeness and quality",
          details: "All pages have proper meta tags",
          responseTime: 234,
        },
      ]

      setHealthChecks(checks)

      const summaryData: HealthCheckSummary = {
        total: checks.length,
        passing: checks.filter((c) => c.status === "passing").length,
        warning: checks.filter((c) => c.status === "warning").length,
        failing: checks.filter((c) => c.status === "failing").length,
        uptime: 99.94,
        lastIncident: new Date(Date.now() - 86400000 * 3), // 3 days ago
      }

      setSummary(summaryData)
      setLastUpdate(new Date())
      setLoading(false)
    } catch (error) {
      console.error("Failed to load health checks:", error)
      setLoading(false)
    }
  }

  const toggleCheck = (checkId: string) => {
    setHealthChecks((prev) =>
      prev.map((check) => (check.id === checkId ? { ...check, enabled: !check.enabled } : check)),
    )
  }

  const runCheck = async (checkId: string) => {
    setHealthChecks((prev) =>
      prev.map((check) =>
        check.id === checkId
          ? {
              ...check,
              lastRun: new Date(),
              nextRun: new Date(Date.now() + check.interval),
            }
          : check,
      ),
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passing":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "failing":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passing":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "failing":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "security":
        return <Shield className="w-4 h-4" />
      case "performance":
        return <Zap className="w-4 h-4" />
      case "availability":
        return <Globe className="w-4 h-4" />
      case "database":
        return <Database className="w-4 h-4" />
      case "api":
        return <Server className="w-4 h-4" />
      case "content":
        return <Eye className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading health checks...</p>
        </CardContent>
      </Card>
    )
  }

  if (!summary) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Automated Health Checks</h2>
          <p className="text-muted-foreground">Continuous monitoring and automated site health validation</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Monitoring</span>
            <Switch checked={monitoring} onCheckedChange={setMonitoring} />
          </div>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Total Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-sm text-muted-foreground">Active health checks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Passing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{summary.passing}</div>
            <p className="text-sm text-muted-foreground">Healthy systems</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{summary.warning}</div>
            <p className="text-sm text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{summary.uptime}%</div>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Check Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            System Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm font-medium text-green-500">All Critical Systems Operational</p>
              <p className="text-xs text-muted-foreground">No critical issues detected</p>
            </div>
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-sm font-medium text-yellow-500">Minor Issues Detected</p>
              <p className="text-xs text-muted-foreground">2 non-critical warnings</p>
            </div>
            <div className="text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-medium text-blue-500">Monitoring Active</p>
              <p className="text-xs text-muted-foreground">Continuous health validation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Health Checks */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All Checks</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {healthChecks.map((check) => (
              <Card key={check.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(check.category)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{check.name}</h4>
                          {getStatusIcon(check.status)}
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              check.status === "passing"
                                ? "border-green-500/20 text-green-500"
                                : check.status === "warning"
                                  ? "border-yellow-500/20 text-yellow-500"
                                  : "border-red-500/20 text-red-500"
                            }`}
                          >
                            {check.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{check.description}</p>
                        {check.details && <p className="text-xs text-muted-foreground mt-1">{check.details}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">Last run</p>
                        <p>{check.lastRun.toLocaleTimeString()}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">Next run</p>
                        <p>{check.nextRun.toLocaleTimeString()}</p>
                      </div>
                      {check.responseTime && (
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">Response</p>
                          <p>{check.responseTime}ms</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Switch checked={check.enabled} onCheckedChange={() => toggleCheck(check.id)} />
                        <Button variant="outline" size="sm" onClick={() => runCheck(check.id)}>
                          <Play className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {["security", "performance", "availability", "database", "api", "content"].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {healthChecks
                .filter((check) => check.category === category)
                .map((check) => (
                  <Card key={check.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(check.category)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{check.name}</h4>
                              {getStatusIcon(check.status)}
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  check.status === "passing"
                                    ? "border-green-500/20 text-green-500"
                                    : check.status === "warning"
                                      ? "border-yellow-500/20 text-yellow-500"
                                      : "border-red-500/20 text-red-500"
                                }`}
                              >
                                {check.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{check.description}</p>
                            {check.details && <p className="text-xs text-muted-foreground mt-1">{check.details}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="text-muted-foreground">Last run</p>
                            <p>{check.lastRun.toLocaleTimeString()}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-muted-foreground">Next run</p>
                            <p>{check.nextRun.toLocaleTimeString()}</p>
                          </div>
                          {check.responseTime && (
                            <div className="text-right text-sm">
                              <p className="text-muted-foreground">Response</p>
                              <p>{check.responseTime}ms</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Switch checked={check.enabled} onCheckedChange={() => toggleCheck(check.id)} />
                            <Button variant="outline" size="sm" onClick={() => runCheck(check.id)}>
                              <Play className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Health Check Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground">2 minutes ago</span>
              <span>Site Availability check passed - Response time: 145ms</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground">5 minutes ago</span>
              <span>SSL Certificate validation completed successfully</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-muted-foreground">15 minutes ago</span>
              <span>Broken Links check found 2 external links needing attention</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground">20 minutes ago</span>
              <span>Content Quality validation passed - Ultra high-quality platform standards maintained</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground">25 minutes ago</span>
              <span>Database Health check completed - All connections healthy</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
