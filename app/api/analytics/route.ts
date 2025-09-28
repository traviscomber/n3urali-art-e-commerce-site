import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "7d"

    const supabase = await createClient()

    // Calculate date range
    const now = new Date()
    const daysBack = range === "24h" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Fetch page views
    const { data: pageViews } = await supabase
      .from("analytics_page_views")
      .select("*")
      .gte("timestamp", startDate.toISOString())

    // Fetch events
    const { data: events } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("timestamp", startDate.toISOString())

    // Mock data for now (would calculate from real data)
    const analyticsData = {
      overview: {
        totalViews: pageViews?.length || 1250,
        totalSales: events?.filter((e) => e.event_name === "image_purchase").length || 45,
        totalRevenue: 2850,
        conversionRate: 3.6,
        avgOrderValue: 63.33,
        activeUsers: 892,
      },
      salesTrends: generateMockTrends(daysBack),
      popularImages: generateMockPopularImages(),
      categoryPerformance: generateMockCategoryData(),
      searchAnalytics: generateMockSearchData(),
      performanceMetrics: {
        avgPageLoadTime: 1250,
        avgImageLoadTime: 850,
        errorRate: 0.12,
        uptime: 99.8,
      },
      userBehavior: {
        bounceRate: 32.5,
        avgSessionDuration: 245,
        pagesPerSession: 3.2,
        topPages: [
          { page: "/gallery", views: 450, avgTime: 180 },
          { page: "/", views: 380, avgTime: 120 },
          { page: "/about", views: 220, avgTime: 95 },
        ],
      },
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Analytics data error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

function generateMockTrends(days: number) {
  return Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return {
      date: date.toISOString().split("T")[0],
      sales: Math.floor(Math.random() * 10) + 1,
      revenue: Math.floor(Math.random() * 500) + 100,
      views: Math.floor(Math.random() * 100) + 50,
    }
  }).reverse()
}

function generateMockPopularImages() {
  return [
    { id: "1", title: "Cyberpunk Cityscape 360°", views: 1250, sales: 15, revenue: 750, category: "Urban" },
    { id: "2", title: "Serene Forest Panorama", views: 980, sales: 12, revenue: 600, category: "Nature" },
    { id: "3", title: "Abstract Digital Realm", views: 850, sales: 10, revenue: 500, category: "Abstract" },
    { id: "4", title: "Futuristic Interior", views: 720, sales: 8, revenue: 400, category: "Interior" },
    { id: "5", title: "Ocean Sunset 360°", views: 650, sales: 7, revenue: 350, category: "Nature" },
  ]
}

function generateMockCategoryData() {
  return [
    { category: "Urban", sales: 25, revenue: 1250, views: 2500 },
    { category: "Nature", sales: 20, revenue: 1000, views: 2000 },
    { category: "Abstract", sales: 15, revenue: 750, views: 1500 },
    { category: "Interior", sales: 10, revenue: 500, views: 1000 },
    { category: "Sci-Fi", sales: 8, revenue: 400, views: 800 },
  ]
}

function generateMockSearchData() {
  return [
    { query: "cyberpunk 360", count: 125, results: 15, conversionRate: 8.5 },
    { query: "nature panorama", count: 98, results: 22, conversionRate: 6.2 },
    { query: "abstract vr", count: 87, results: 18, conversionRate: 4.8 },
    { query: "urban cityscape", count: 76, results: 12, conversionRate: 7.1 },
    { query: "forest 360", count: 65, results: 8, conversionRate: 5.3 },
  ]
}
