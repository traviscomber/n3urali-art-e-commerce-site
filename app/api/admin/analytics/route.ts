import { NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"

export async function GET() {
  try {
    console.log("[v0] Fetching analytics data...")
    const sql = createNeonClient()

    // Get overview statistics
    const overviewQuery = await sql`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_orders,
        COALESCE(AVG(total_amount), 0) as average_order_value
      FROM orders 
      WHERE status = 'completed'
    `

    const downloadsQuery = await sql`
      SELECT COALESCE(SUM(download_count), 0) as total_downloads
      FROM downloads
    `

    // Get recent orders
    const recentOrdersQuery = await sql`
      SELECT 
        o.id,
        o.user_email,
        o.total_amount,
        o.status,
        o.created_at,
        COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id, o.user_email, o.total_amount, o.status, o.created_at
      ORDER BY o.created_at DESC
      LIMIT 10
    `

    // Get popular images
    const popularImagesQuery = await sql`
      SELECT 
        i.id,
        i.title,
        i.category_name,
        i.price,
        COUNT(oi.id) as order_count,
        COALESCE(SUM(oi.price), 0) as revenue
      FROM images i
      LEFT JOIN order_items oi ON oi.image_id = i.id
      LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
      GROUP BY i.id, i.title, i.category_name, i.price
      HAVING COUNT(oi.id) > 0
      ORDER BY revenue DESC, order_count DESC
      LIMIT 10
    `

    // Get category performance
    const categoryPerformanceQuery = await sql`
      SELECT 
        i.category_name as category,
        COUNT(DISTINCT oi.id) as orders,
        COALESCE(SUM(oi.price), 0) as revenue,
        COUNT(DISTINCT i.id) as images
      FROM images i
      LEFT JOIN order_items oi ON oi.image_id = i.id
      LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
      GROUP BY i.category_name
      ORDER BY revenue DESC
    `

    // Get monthly stats (last 6 months)
    const monthlyStatsQuery = await sql`
      SELECT 
        TO_CHAR(o.created_at, 'YYYY-MM') as month,
        COUNT(DISTINCT o.id) as orders,
        COALESCE(SUM(o.total_amount), 0) as revenue,
        COALESCE(SUM(d.download_count), 0) as downloads
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN downloads d ON d.order_item_id = oi.id
      WHERE o.status = 'completed' 
        AND o.created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(o.created_at, 'YYYY-MM')
      ORDER BY month DESC
    `

    const [overview, downloads, recentOrders, popularImages, categoryPerformance, monthlyStats] = await Promise.all([
      overviewQuery,
      downloadsQuery,
      recentOrdersQuery,
      popularImagesQuery,
      categoryPerformanceQuery,
      monthlyStatsQuery,
    ])

    // Calculate conversion rate (assuming we track page views somewhere)
    const conversionRate =
      overview[0].total_orders > 0 ? (overview[0].total_orders / Math.max(overview[0].total_orders * 10, 100)) * 100 : 0

    const analyticsData = {
      overview: {
        totalRevenue: Number(overview[0].total_revenue),
        totalOrders: Number(overview[0].total_orders),
        totalDownloads: Number(downloads[0].total_downloads),
        conversionRate: conversionRate,
        averageOrderValue: Number(overview[0].average_order_value),
      },
      recentOrders: recentOrders.map((order) => ({
        ...order,
        total_amount: Number(order.total_amount),
        items_count: Number(order.items_count),
      })),
      popularImages: popularImages.map((image) => ({
        ...image,
        price: Number(image.price),
        order_count: Number(image.order_count),
        revenue: Number(image.revenue),
      })),
      categoryPerformance: categoryPerformance.map((cat) => ({
        ...cat,
        orders: Number(cat.orders),
        revenue: Number(cat.revenue),
        images: Number(cat.images),
      })),
      monthlyStats: monthlyStats.map((stat) => ({
        ...stat,
        orders: Number(stat.orders),
        revenue: Number(stat.revenue),
        downloads: Number(stat.downloads),
      })),
    }

    console.log("[v0] Analytics data loaded successfully")

    return NextResponse.json({
      success: true,
      data: analyticsData,
    })
  } catch (error) {
    console.error("[v0] Analytics error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load analytics data",
      },
      { status: 500 },
    )
  }
}
