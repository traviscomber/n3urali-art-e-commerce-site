import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface PaymentIntentRequest {
  items: Array<{
    id: string
    imageId: string
    title: string
    price: number
    licenseId: string
    licenseName: string
    quantity: number
  }>
  total: number
  customerInfo: {
    email: string
    firstName: string
    lastName: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentIntentRequest = await request.json()
    const { items, total, customerInfo } = body

    console.log("[v0] Creating payment intent for:", customerInfo.email, "Total:", total)

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: "No items provided" }, { status: 400 })
    }

    if (!customerInfo.email) {
      return NextResponse.json({ success: false, error: "Customer email is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Create a pending order first
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const { data: orderResult, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_email: customerInfo.email,
        user_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        total_amount: total,
        status: "pending",
        payment_method: "stripe",
      })
      .select()
      .single()

    if (orderError || !orderResult) {
      console.error("[v0] Order creation error:", orderError)
      return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
    }

    // Create order items
    for (const item of items) {
      const { error: orderItemError } = await supabase.from("order_items").insert({
        order_id: orderResult.id,
        image_id: item.imageId,
        license_id: item.licenseId,
        price: item.price * item.quantity,
      })

      if (orderItemError) {
        console.error("[v0] Order item creation error:", orderItemError)
        return NextResponse.json({ success: false, error: "Failed to create order items" }, { status: 500 })
      }
    }

    // For demo purposes, we'll simulate a payment intent
    // In production, you would integrate with Stripe here:
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe expects cents
      currency: 'usd',
      metadata: {
        orderId: orderResult.id,
        orderNumber: orderNumber,
      },
    })
    */

    const mockPaymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(total * 100),
      currency: "usd",
      status: "requires_payment_method",
    }

    // Update order with payment intent ID
    await supabase
      .from("orders")
      .update({
        payment_intent_id: mockPaymentIntent.id,
      })
      .eq("id", orderResult.id)

    console.log("[v0] Payment intent created:", mockPaymentIntent.id)

    return NextResponse.json({
      success: true,
      data: {
        orderId: orderResult.id,
        orderNumber: orderNumber,
        paymentIntent: mockPaymentIntent,
        clientSecret: mockPaymentIntent.client_secret,
      },
    })
  } catch (error) {
    console.error("[v0] Payment intent creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create payment intent",
      },
      { status: 500 },
    )
  }
}
