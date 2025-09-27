"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  Eye,
  Download,
  DollarSign,
  Clock,
  Search,
  AlertTriangle,
  Activity,
  Globe,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface AnalyticsData {
  overview: {
    totalViews: number
    totalSales: number
    totalRevenue: number
    conversionRate: number
    avgOrderValue: number
    activeUsers: number
  }
  salesTrends: Array<{
    date: string
    sales: number
    revenue: number
    views: number
  }>
  popularImages: Array<{
    id: string
    title: string
    views: number
    sales: number
    revenue: number
    category: string
  }>
  categoryPerformance: Array<{
    category: string
    sales: number
    revenue: number
    views: number
  }>
  searchAnalytics: Array<{
    query: string
    count: number
    results: number
    conversionRate: number
  }>
  performanceMetrics: {
    avgPageLoadTime: number
    avgImageLoadTime: number
    errorRate: number
    uptime: number
  }
  userBehavior: {
    bounceRate: number
    avgSessionDuration: number
    pagesPerSession: number
    topPages: Array<{
      page: string
      views: number
      avgTime: number
    }>
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analytics Unavailable</h3>
          <p className="text-muted-foreground">Unable to load analytics data</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Monitor your e-commerce performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <Activity className="w-4 h-4 mr-2" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{data.overview.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{data.overview.totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">${data.overview.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Conversion</p>
                <p className="text-2xl font-bold">{data.overview.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Order</p>
                <p className="text-2xl font-bold">${data.overview.avgOrderValue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{data.overview.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales & Revenue Trends</CardTitle>
          <CardDescription>Track your sales performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.salesTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Images */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Images</CardTitle>
            <CardDescription>Most viewed and purchased images</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.popularImages.slice(0, 5).map((image, index) => (
                <div key={image.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{image.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{image.views} views</span>
                      <span>{image.sales} sales</span>
                      <Badge variant="outline">{image.category}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${image.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Revenue breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.categoryPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {data.categoryPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Search Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Search Analytics</CardTitle>
          <CardDescription>Most popular search queries and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.searchAnalytics.slice(0, 8).map((search, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">"{search.query}"</p>
                    <p className="text-sm text-muted-foreground">
                      {search.count} searches • {search.results} results
                    </p>
                  </div>
                </div>
                <Badge variant={search.conversionRate > 5 ? "default" : "secondary"}>
                  {search.conversionRate.toFixed(1)}% conversion
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Page Load Time</p>
                <p className="text-xl font-bold">{data.performanceMetrics.avgPageLoadTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Image Load Time</p>
                <p className="text-xl font-bold">{data.performanceMetrics.avgImageLoadTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-xl font-bold">{data.performanceMetrics.errorRate.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-xl font-bold">{data.performanceMetrics.uptime.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Behavior */}
      <Card>
        <CardHeader>
          <CardTitle>User Behavior</CardTitle>
          <CardDescription>How users interact with your site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{data.userBehavior.bounceRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Bounce Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{Math.round(data.userBehavior.avgSessionDuration)}s</p>
              <p className="text-sm text-muted-foreground">Avg Session Duration</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{data.userBehavior.pagesPerSession.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Pages per Session</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-3">Top Pages</h4>
            <div className="space-y-2">
              {data.userBehavior.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/20">
                  <span className="font-medium">{page.page}</span>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{page.views} views</span>
                    <span>{Math.round(page.avgTime)}s avg time</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
