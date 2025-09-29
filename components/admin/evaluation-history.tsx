"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Calendar, TrendingUp, Download, RefreshCw } from "lucide-react"

interface HistoryData {
  date: string
  seoScore: number
  performanceScore: number
  accessibilityScore: number
  securityScore: number
  qualityScore: number
}

export function EvaluationHistory() {
  const [history, setHistory] = useState<HistoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  useEffect(() => {
    fetchHistory()
  }, [timeRange])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "history", timeRange }),
      })
      const result = await response.json()
      if (result.success) {
        setHistory(result.data.slice(0, timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90))
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    const csvContent = [
      "Date,SEO Score,Performance Score,Accessibility Score,Security Score,Quality Score",
      ...history.map(
        (row) =>
          `${row.date},${row.seoScore},${row.performanceScore},${row.accessibilityScore},${row.securityScore},${row.qualityScore}`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `site-evaluation-history-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading evaluation history...</p>
        </CardContent>
      </Card>
    )
  }

  const latestData = history[0]
  const previousData = history[1]

  const getTrend = (current: number, previous: number) => {
    if (!previous) return 0
    return ((current - previous) / previous) * 100
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Evaluation History</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-none"
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchHistory}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Trend Summary */}
      {latestData && previousData && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: "SEO", current: latestData.seoScore, previous: previousData.seoScore },
            { label: "Performance", current: latestData.performanceScore, previous: previousData.performanceScore },
            {
              label: "Accessibility",
              current: latestData.accessibilityScore,
              previous: previousData.accessibilityScore,
            },
            { label: "Security", current: latestData.securityScore, previous: previousData.securityScore },
            { label: "Quality", current: latestData.qualityScore, previous: previousData.qualityScore },
          ].map((metric) => {
            const trend = getTrend(metric.current, metric.previous)
            const isPositive = trend > 0
            const isNeutral = Math.abs(trend) < 1

            return (
              <Card key={metric.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp
                        className={`w-3 h-3 ${
                          isNeutral ? "text-muted-foreground" : isPositive ? "text-green-500" : "text-red-500"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          isNeutral ? "text-muted-foreground" : isPositive ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {isNeutral ? "0%" : `${isPositive ? "+" : ""}${trend.toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{metric.current}%</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Score Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.slice().reverse()}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                />
                <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="seoScore"
                  stroke="#d946ef"
                  strokeWidth={2}
                  name="SEO"
                  dot={{ fill: "#d946ef", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="performanceScore"
                  stroke="#6366f1"
                  strokeWidth={2}
                  name="Performance"
                  dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="accessibilityScore"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Accessibility"
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="securityScore"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Security"
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="qualityScore"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Quality"
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
