import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createSupabaseServerClient()
    const orderId = params.id

    // First, get the order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "pending") {
      return NextResponse.json({ success: false, error: "Order is not pending verification" }, { status: 400 })
    }

    // Update order status to completed
    const { error: updateError } = await supabase.from("orders").update({ status: "completed" }).eq("id", orderId)

    if (updateError) {
      console.error("Failed to update order status:", updateError)
      return NextResponse.json({ success: false, error: "Failed to approve order" }, { status: 500 })
    }

    // Generate download tokens for all order items
    const downloadTokens = []
    for (const orderItem of order.order_items) {
      const downloadToken = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const { data: downloadResult, error: downloadError } = await supabase
        .from("downloads")
        .insert({
          order_item_id: orderItem.id,
          image_id: orderItem.image_id,
          user_email: order.user_email, // Include user_email as required by schema
          download_token: downloadToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Changed to 30 days for consistency
          download_count: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (downloadError) {
        console.error("Failed to create download token:", downloadError)
        // Continue with other tokens but log the error
      } else if (downloadResult) {
        downloadTokens.push(downloadResult)
      }
    }

    console.log(`[v0] Order ${orderId} approved, generated ${downloadTokens.length} download tokens`)

    return NextResponse.json({
      success: true,
      message: "Order approved successfully",
      downloadTokensGenerated: downloadTokens.length,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
