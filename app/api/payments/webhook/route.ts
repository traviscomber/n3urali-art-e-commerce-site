import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"

// Webhook handler for payment processing services (Stripe, crypto payment processors, etc.)
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Payment webhook received")

    const body = await request.json()
    const { orderId, paymentStatus, paymentMethod, transactionId, amount } = body

    if (!orderId || !paymentStatus) {
      return NextResponse.json({ success: false, error: "Missing required webhook data" }, { status: 400 })
    }

    const sql = createNeonClient()

    console.log("[v0] Processing payment webhook for order:", orderId, "Status:", paymentStatus)

    if (paymentStatus === "completed" || paymentStatus === "succeeded") {
      // Update order status
      const orderResult = await sql`
        UPDATE orders 
        SET 
          status = 'completed',
          payment_intent_id = COALESCE(${transactionId}, payment_intent_id),
          updated_at = NOW()
        WHERE id = ${orderId}
        RETURNING *
      `

      if (orderResult.length === 0) {
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
      }

      // Generate download tokens
      const downloadTokens = await sql`
        SELECT * FROM create_download_tokens_for_order(${orderId}::uuid)
      `

      console.log("[v0] Payment completed, generated", downloadTokens.length, "download tokens")

      // Here you could also send confirmation email to customer
      // await sendOrderConfirmationEmail(orderResult[0], downloadTokens)

      return NextResponse.json({
        success: true,
        message: "Payment processed successfully",
        downloadTokensGenerated: downloadTokens.length,
      })
    } else if (paymentStatus === "failed" || paymentStatus === "cancelled") {
      // Update order status to failed
      await sql`
        UPDATE orders 
        SET status = 'failed', updated_at = NOW()
        WHERE id = ${orderId}
      `

      console.log("[v0] Payment failed for order:", orderId)

      return NextResponse.json({
        success: true,
        message: "Payment failure processed",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
    })
  } catch (error) {
    console.error("[v0] Payment webhook error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 },
    )
  }
}
