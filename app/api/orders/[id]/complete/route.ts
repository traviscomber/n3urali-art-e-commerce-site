import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    console.log("[v0] Completing order:", orderId)

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    const sql = createNeonClient()

    // Update order status to completed
    const orderResult = await sql`
      UPDATE orders 
      SET status = 'completed', updated_at = NOW()
      WHERE id = ${orderId} AND status != 'completed'
      RETURNING *
    `

    if (orderResult.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found or already completed" }, { status: 404 })
    }

    // Generate download tokens for the completed order
    console.log("[v0] Generating download tokens for completed order...")
    const downloadTokens = await sql`
      SELECT * FROM create_download_tokens_for_order(${orderId}::uuid)
    `

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
