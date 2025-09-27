import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    console.log("[v0] Completing order:", orderId)

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Update order status to completed
    const { data: orderResult, error: orderError } = await supabase
      .from("orders")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .neq("status", "completed")
      .select()

    if (orderError || !orderResult || orderResult.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found or already completed" }, { status: 404 })
    }

    // Generate download tokens for the completed order
    console.log("[v0] Generating download tokens for completed order...")

    const { data: orderItems } = await supabase.from("order_items").select("id").eq("order_id", orderId)

    const downloadTokens = []

    if (orderItems) {
      for (const orderItem of orderItems) {
        const downloadToken = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const { data: downloadResult, error: downloadError } = await supabase
          .from("downloads")
          .insert({
            order_item_id: orderItem.id,
            download_token: downloadToken,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            download_count: 0,
          })
          .select()
          .single()

        if (!downloadError && downloadResult) {
          downloadTokens.push(downloadResult)
        }
      }
    }

    console.log("[v0] Order completed successfully with", downloadTokens.length, "download tokens generated")

    return NextResponse.json({
      success: true,
      data: {
        order: orderResult[0],
        downloadTokensGenerated: downloadTokens.length,
        downloadTokens: downloadTokens,
      },
    })
  } catch (error) {
    console.error("[v0] Order completion error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to complete order",
      },
      { status: 500 },
    )
  }
}
