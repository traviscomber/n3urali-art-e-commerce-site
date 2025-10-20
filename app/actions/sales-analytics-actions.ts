"use server"

import { createClient } from "@/lib/supabase/server"

export interface ImageSalesData {
  image_id: string
  image_title: string
  image_thumbnail: string
  total_sales: number
  total_revenue: number
  pending_orders: number
  rejected_orders: number
  completed_orders: number
  last_sale_date: string | null
}

export interface OrderWithItems {
  id: string
  user_email: string
  user_name: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  items: {
    id: string
    image_id: string
    image_title: string
    image_thumbnail: string
    price: number
  }[]
}

export async function getImageSalesAnalytics() {
  try {
    const supabase = await createClient()

    // Get all images with their sales data
    const { data: salesData, error: salesError } = await supabase.rpc("get_image_sales_analytics")

    if (salesError) {
      console.error("[v0] Error fetching sales analytics:", salesError)

      // Fallback: manual query if RPC doesn't exist
      const { data: images, error: imagesError } = await supabase
        .from("images")
        .select(`
          id,
          title,
          thumbnail_small_url,
          order_items (
            id,
            price,
            order:orders (
              id,
              status,
              payment_status,
              created_at
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (imagesError) throw imagesError

      // Process the data manually
      const analytics: ImageSalesData[] = images.map((image: any) => {
        const items = image.order_items || []
        const completedItems = items.filter((item: any) => item.order?.status === "completed")
        const pendingItems = items.filter((item: any) => item.order?.status === "pending")
        const rejectedItems = items.filter((item: any) => item.order?.status === "rejected")

        const totalRevenue = completedItems.reduce((sum: number, item: any) => sum + (item.price || 0), 0)
        const lastSale =
          completedItems.length > 0
            ? completedItems.sort(
                (a: any, b: any) => new Date(b.order.created_at).getTime() - new Date(a.order.created_at).getTime(),
              )[0].order.created_at
            : null

        return {
          image_id: image.id,
          image_title: image.title,
          image_thumbnail: image.thumbnail_small_url,
          total_sales: completedItems.length,
          total_revenue: totalRevenue,
          pending_orders: pendingItems.length,
          rejected_orders: rejectedItems.length,
          completed_orders: completedItems.length,
          last_sale_date: lastSale,
        }
      })

      return {
        success: true,
        data: analytics.filter((item) => item.total_sales > 0 || item.pending_orders > 0 || item.rejected_orders > 0),
      }
    }

    return {
      success: true,
      data: salesData || [],
    }
  } catch (error) {
    console.error("[v0] Error in getImageSalesAnalytics:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch sales analytics",
      data: [],
    }
  }
}

export async function getOrdersByStatus(status: "completed" | "pending" | "rejected") {
  try {
    const supabase = await createClient()

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        user_email,
        user_name,
        total_amount,
        status,
        payment_status,
        created_at,
        order_items (
          id,
          image_id,
          price,
          image:images (
            id,
            title,
            thumbnail_small_url
          )
        )
      `)
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (error) throw error

    const formattedOrders: OrderWithItems[] = orders.map((order: any) => ({
      id: order.id,
      user_email: order.user_email,
      user_name: order.user_name,
      total_amount: order.total_amount,
      status: order.status,
      payment_status: order.payment_status,
      created_at: order.created_at,
      items: order.order_items.map((item: any) => ({
        id: item.id,
        image_id: item.image_id,
        image_title: item.image?.title || "Unknown",
        image_thumbnail: item.image?.thumbnail_small_url || "",
        price: item.price,
      })),
    }))

    return {
      success: true,
      data: formattedOrders,
    }
  } catch (error) {
    console.error("[v0] Error in getOrdersByStatus:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
      data: [],
    }
  }
}

export async function getSalesOverview() {
  try {
    const supabase = await createClient()

    const { data: stats, error } = await supabase.rpc("get_sales_overview")

    if (error) {
      // Fallback: manual calculation
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("status, total_amount, order_items(id)")

      if (ordersError) throw ordersError

      const completed = orders.filter((o) => o.status === "completed")
      const pending = orders.filter((o) => o.status === "pending")
      const rejected = orders.filter((o) => o.status === "rejected")

      const totalRevenue = completed.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      const totalImages = new Set(completed.flatMap((o) => o.order_items.map((i: any) => i.id))).size

      return {
        success: true,
        data: {
          total_revenue: totalRevenue,
          total_sales: completed.length,
          pending_orders: pending.length,
          rejected_orders: rejected.length,
          total_images_sold: totalImages,
        },
      }
    }

    return {
      success: true,
      data: stats,
    }
  } catch (error) {
    console.error("[v0] Error in getSalesOverview:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch sales overview",
      data: null,
    }
  }
}
