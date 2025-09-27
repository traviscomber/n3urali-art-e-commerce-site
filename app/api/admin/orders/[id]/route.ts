import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabaseServerClient()
    const orderId = params.id

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          images (title, preview_url),
          licenses (name)
        )
      `)
      .eq("id", orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    // Transform the data to include item details
    const transformedOrder = {
      ...order,
      items:
        order.order_items?.map((item: any) => ({
          id: item.id,
          image_id: item.image_id,
          title: item.images?.title || "Unknown Image",
          price: item.price,
          license_name: item.licenses?.name || "Unknown License",
          preview_url: item.images?.preview_url,
        })) || [],
    }

    return NextResponse.json({ success: true, order: transformedOrder })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
