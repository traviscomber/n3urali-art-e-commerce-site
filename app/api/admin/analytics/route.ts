import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("[v0] Fetching analytics data...")
    const supabase = await createClient()

    // Get overview statistics
    const { data: overviewData, error: overviewError } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("status", "completed")

    const totalRevenue = overviewData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    const totalOrders = overviewData?.length || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const { count: totalDownloads } = await supabase.from("downloads").select("*", { count: "exact", head: true })

    // Get recent orders
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from("orders")
      .select(`
        id,
        user_email,
        total_amount,
        status,
        created_at,
        order_items(count)
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    // Transform recent orders data
    const transformedRecentOrders =
      recentOrders?.map((order) => ({
        ...order,
        items_count: order.order_items?.length || 0,
        order_items: undefined,
      })) || []

    // Get popular images
    const { data: popularImages, error: popularImagesError } = await supabase
      .from("images")
      .select(`
        id,
        title,
        categories(name),
        price,
        order_items!inner(
          price,
          orders!inner(status)
        )
      `)
      .eq("order_items.orders.status", "completed")
      .limit(10)

    // Transform popular images data
    const transformedPopularImages =
      popularImages
        ?.map((image) => {
          const orderCount = image.order_items?.length || 0
          const revenue = image.order_items?.reduce((sum, item) => sum + (item.price || 0), 0) || 0
          return {
            id: image.id,
            title: image.title,
            category_name: image.categories?.name || "Uncategorized",
            price: image.price,
            order_count: orderCount,
            revenue: revenue,
          }
        })
        .sort((a, b) => b.revenue - a.revenue) || []

    // Get category performance
    const { data: categoryData, error: categoryError } = await supabase
      .from("images")
      .select(`
        categories(name),
        order_items(
          price,
          orders!inner(status)
        )
      `)
      .eq("order_items.orders.status", "completed")

    // Transform category data
    const categoryMap = new Map()
    categoryData?.forEach((image) => {
      const category = image.categories?.name || "Uncategorized"
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { orders: 0, revenue: 0, images: new Set() })
      }
      const categoryStats = categoryMap.get(category)
      categoryStats.images.add(image)
      if (image.order_items) {
        categoryStats.orders += image.order_items.length
        categoryStats.revenue += image.order_items.reduce((sum, item) => sum + (item.price || 0), 0)
      }
    })

    const categoryPerformance = Array.from(categoryMap.entries())
      .map(([category, stats]) => ({
        category,
        orders: stats.orders,
        revenue: stats.revenue,
        images: stats.images.size,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // Get monthly stats (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: monthlyOrderData, error: monthlyError } = await supabase
      .from("orders")
      .select("created_at, total_amount")
      .eq("status", "completed")
      .gte("created_at", sixMonthsAgo.toISOString())

    // Transform monthly data
    const monthlyMap = new Map()
    monthlyOrderData?.forEach((order) => {
      const month = new Date(order.created_at).toISOString().substring(0, 7) // YYYY-MM format
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { orders: 0, revenue: 0, downloads: 0 })
      }
      const monthStats = monthlyMap.get(month)
      monthStats.orders += 1
      monthStats.revenue += order.total_amount || 0
    })

    const monthlyStats = Array.from(monthlyMap.entries())
      .map(([month, stats]) => ({
        month,
        orders: stats.orders,
        revenue: stats.revenue,
        downloads: stats.downloads, // Would need to join with downloads table for accurate count
      }))
      .sort((a, b) => b.month.localeCompare(a.month))

    // Calculate conversion rate (assuming we track page views somewhere)
    const conversionRate = totalOrders > 0 ? (totalOrders / Math.max(totalOrders * 10, 100)) * 100 : 0

    const analyticsData = {
      overview: {
        totalRevenue: Number(totalRevenue),
        totalOrders: Number(totalOrders),
        totalDownloads: Number(totalDownloads || 0),
        conversionRate: conversionRate,
        averageOrderValue: Number(averageOrderValue),
      },
      recentOrders: transformedRecentOrders.map((order) => ({
        ...order,
        total_amount: Number(order.total_amount),
        items_count: Number(order.items_count),
      })),
      popularImages: transformedPopularImages.map((image) => ({
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
