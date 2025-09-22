import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabaseServerClient()
    const orderId = params.id

    // First, get the order details
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "pending") {
      return NextResponse.json({ success: false, error: "Order is not pending verification" }, { status: 400 })
    }

    // Update order status to rejected
    const { error: updateError } = await supabase.from("orders").update({ status: "rejected" }).eq("id", orderId)

    if (updateError) {
      console.error("Failed to update order status:", updateError)
      return NextResponse.json({ success: false, error: "Failed to reject order" }, { status: 500 })
    }

    console.log(`[v0] Order ${orderId} rejected`)

    return NextResponse.json({
      success: true,
      message: "Order rejected successfully",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
