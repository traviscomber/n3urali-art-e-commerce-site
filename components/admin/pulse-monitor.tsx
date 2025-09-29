"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Activity, Clock, Zap, AlertCircle, CheckCircle } from "lucide-react"

interface PulseStatus {
  isActive: boolean
  lastCheck: string
  nextCheck: string
  interval: number // minutes
  status: "healthy" | "warning" | "error"
  uptime: number // percentage
  responseTime: number // ms
  issues: string[]
}

export function PulseMonitor() {
  const [pulseStatus, setPulseStatus] = useState<PulseStatus>({
    isActive: true,
    lastCheck: new Date().toISOString(),
    nextCheck: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    interval: 15,
    status: "healthy",
    uptime: 99.8,
    responseTime: 245,
    issues: [],
  })

  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 0,
    pageViews: 0,
    errorRate: 0,
    avgLoadTime: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      if (pulseStatus.isActive) {
        setRealTimeMetrics((prev) => ({
          activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 6) - 2),
          pageViews: prev.pageViews + Math.floor(Math.random() * 3),
          errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.1)),
          avgLoadTime: Math.max(100, Math.min(3000, prev.avgLoadTime + (Math.random() - 0.5) * 50)),
        }))

        // Update pulse status occasionally
        if (Math.random() < 0.1) {
          setPulseStatus((prev) => ({
            ...prev,
            lastCheck: new Date().toISOString(),
            nextCheck: new Date(Date.now() + prev.interval * 60 * 1000).toISOString(),
            responseTime: Math.floor(Math.random() * 200) + 150,
            uptime: Math.max(95, Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.1)),
          }))
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [pulseStatus.isActive])

  const togglePulseMonitoring = () => {
    setPulseStatus((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "error":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "warning":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "error":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* Pulse Control */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity
                className={`w-5 h-5 ${pulseStatus.isActive ? "text-green-500 animate-pulse" : "text-muted-foreground"}`}
              />
              Pulse Monitoring
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{pulseStatus.isActive ? "Active" : "Paused"}</span>
              <Switch checked={pulseStatus.isActive} onCheckedChange={togglePulseMonitoring} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${pulseStatus.status === "healthy" ? "bg-green-500" : pulseStatus.status === "warning" ? "bg-yellow-500" : "bg-red-500"}`}
                />
                <span className="text-sm font-medium">Status</span>
              </div>
              <Badge className={getStatusBadge(pulseStatus.status)}>
                {pulseStatus.status.charAt(0).toUpperCase() + pulseStatus.status.slice(1)}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Uptime</span>
              </div>
              <div className="text-2xl font-bold text-green-500">{pulseStatus.uptime.toFixed(1)}%</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Response Time</span>
              </div>
              <div className="text-2xl font-bold">{pulseStatus.responseTime}ms</div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Next Check</span>
              <div className="text-sm text-muted-foreground">
                {new Date(pulseStatus.nextCheck).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{realTimeMetrics.activeUsers}</p>
              </div>
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">{realTimeMetrics.pageViews}</p>
              </div>
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{realTimeMetrics.errorRate.toFixed(2)}%</p>
              </div>
              <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Load Time</p>
                <p className="text-2xl font-bold">{Math.round(realTimeMetrics.avgLoadTime)}ms</p>
              </div>
              <div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-500">Healthy Services</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Database Connection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">CDN Performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">API Endpoints</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">SSL Certificate</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-yellow-500">Monitoring</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Performance Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Error Logging</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">User Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">SEO Monitoring</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-muted-foreground">Scheduled Tasks</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Daily SEO Scan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Weekly Performance Audit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Monthly Security Scan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Backup Verification</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
