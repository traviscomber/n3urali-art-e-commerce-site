import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createNeonClient } from "@/lib/neon/client"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const sql = createNeonClient()

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        console.log("Payment succeeded:", paymentIntent.id)

        // Find the order by payment intent ID
        const orderResult = await sql`
          SELECT * FROM orders 
          WHERE payment_intent_id = ${paymentIntent.id}
        `

        if (orderResult.length > 0) {
          const orderId = orderResult[0].id

          // Update order status to completed
          await sql`
            UPDATE orders 
            SET status = 'completed', updated_at = NOW()
            WHERE id = ${orderId}
          `

          // Generate download tokens
          const downloadTokens = await sql`
            SELECT * FROM create_download_tokens_for_order(${orderId}::uuid)
          `

          console.log("Order completed via Stripe webhook, generated", downloadTokens.length, "download tokens")
        }
        break

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent

        console.log("Payment failed:", failedPayment.id)

        // Update order status to failed
        await sql`
          UPDATE orders 
          SET status = 'failed', updated_at = NOW()
          WHERE payment_intent_id = ${failedPayment.id}
        `
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
