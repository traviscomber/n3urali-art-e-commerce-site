import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Get total revenue
    const { data: revenueData } = await supabase.from("orders").select("total_amount").eq("status", "completed")

    const totalRevenue = revenueData?.reduce((sum, order) => sum + Number.parseFloat(order.total_amount), 0) || 0

    // Get total orders
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")

    // Get total downloads
    const { count: totalDownloads } = await supabase.from("downloads").select("*", { count: "exact", head: true })

    // Get total images
    const { count: totalImages } = await supabase.from("images").select("*", { count: "exact", head: true })

    // Get revenue by month (last 6 months)
    const { data: monthlyRevenue } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .eq("status", "completed")
      .gte("created_at", new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true })

    // Process monthly revenue data
    const revenueByMonth =
      monthlyRevenue?.reduce((acc: any[], order) => {
        const month = new Date(order.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        const existing = acc.find((item) => item.month === month)
        if (existing) {
          existing.revenue += Number.parseFloat(order.total_amount)
        } else {
          acc.push({ month, revenue: Number.parseFloat(order.total_amount) })
        }
        return acc
      }, []) || []

    // Get popular images
    const { data: popularImages } = await supabase
      .from("order_items")
      .select(`
        image_id,
        images (
          title,
          price
        )
      `)
      .limit(5)

    // Process popular images data
    const imageStats =
      popularImages?.reduce((acc: any[], item) => {
        const existing = acc.find((img) => img.image_id === item.image_id)
        if (existing) {
          existing.sales += 1
        } else {
          acc.push({
            image_id: item.image_id,
            title: item.images?.title || "Unknown",
            price: item.images?.price || 0,
            sales: 1,
          })
        }
        return acc
      }, []) || []

    const topImages = imageStats.sort((a, b) => b.sales - a.sales).slice(0, 5)

    // Get category performance
    const { data: categoryData } = await supabase.from("order_items").select(`
        images (
          category_id,
          categories (
            name
          )
        )
      `)

    const categoryStats =
      categoryData?.reduce((acc: any[], item) => {
        const categoryName = item.images?.categories?.name || "Unknown"
        const existing = acc.find((cat) => cat.name === categoryName)
        if (existing) {
          existing.sales += 1
        } else {
          acc.push({ name: categoryName, sales: 1 })
        }
        return acc
      }, []) || []

    // Get recent orders
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)

    return NextResponse.json({
      overview: {
        totalRevenue,
        totalOrders: totalOrders || 0,
        totalDownloads: totalDownloads || 0,
        totalImages: totalImages || 0,
      },
      revenueByMonth,
      topImages,
      categoryPerformance: categoryStats,
      recentOrders: recentOrders || [],
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
