import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          images (title),
          licenses (name)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Transform the data to include item details
    const transformedOrders =
      orders?.map((order) => ({
        ...order,
        items:
          order.order_items?.map((item: any) => ({
            image_id: item.image_id,
            title: item.images?.title || "Unknown Image",
            price: item.price,
            license_name: item.licenses?.name || "Unknown License",
          })) || [],
      })) || []

    return NextResponse.json({ success: true, orders: transformedOrders })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
