import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Webhook handler for payment processing services (Stripe, crypto payment processors, etc.)
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Payment webhook received")

    const body = await request.json()
    const { orderId, paymentStatus, paymentMethod, transactionId, amount, type } = body

    if (!orderId || !paymentStatus) {
      return NextResponse.json({ success: false, error: "Missing required webhook data" }, { status: 400 })
    }

    const supabase = await createClient()

    console.log("[v0] Processing payment webhook for order:", orderId, "Status:", paymentStatus)

    if (paymentStatus === "completed" || paymentStatus === "succeeded") {
      // Update order status
      const { data: orderResult, error: orderError } = await supabase
        .from("orders")
        .update({
          status: "completed",
          payment_intent_id: transactionId || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()

      if (orderError || !orderResult || orderResult.length === 0) {
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
      }

      // Generate download tokens
      const { data: orderItems } = await supabase.from("order_items").select("id, image_id").eq("order_id", orderId)

      const downloadTokens = []

      if (orderItems) {
        for (const orderItem of orderItems) {
          const downloadToken = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

          const { data: downloadResult, error: downloadError } = await supabase
            .from("downloads")
            .insert({
              order_item_id: orderItem.id,
              image_id: orderItem.image_id,
              download_token: downloadToken,
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
              download_count: 0,
              max_downloads: 5,
            })
            .select()
            .single()

          if (!downloadError && downloadResult) {
            downloadTokens.push(downloadResult)
          }
        }
      }

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
      await supabase
        .from("orders")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

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
