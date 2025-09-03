import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"
import { v4 as uuidv4 } from "uuid"

interface CartItem {
  id: string
  imageId: string
  title: string
  price: number
  licenseType: "standard" | "extended" | "commercial"
  previewUrl: string
  category: "equirectangular" | "fisheye"
  quantity: number
}

interface OrderRequest {
  items: CartItem[]
  total: number
  customerInfo: {
    email: string
    firstName: string
    lastName: string
    billingAddress: string
    city: string
    zipCode: string
    country: string
  }
  paymentInfo: {
    cardNumber: string
    expiryDate: string
    cvv: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json()
    const { items, total, customerInfo, paymentInfo } = body

    console.log("[v0] Creating order for:", customerInfo.email, "Total:", total, "Items:", items.length)

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: "No items in cart" }, { status: 400 })
    }

    if (!customerInfo.email) {
      return NextResponse.json({ success: false, error: "Customer email is required" }, { status: 400 })
    }

    const sql = createNeonClient()

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // In a real implementation, you would process payment with Stripe here
    // For now, we'll simulate successful payment processing
    const paymentStatus = "completed" // This would come from Stripe
    const stripePaymentIntentId = `pi_${uuidv4().replace(/-/g, "")}` // This would come from Stripe

    console.log("[v0] Creating order with number:", orderNumber)

    const orderResult = await sql`
      INSERT INTO orders (
        order_number, 
        user_email, 
        total_amount, 
        payment_status, 
        payment_method,
        billing_email,
        stripe_payment_intent_id,
        billing_details
      )
      VALUES (
        ${orderNumber},
        ${customerInfo.email},
        ${total * 1.03}, -- Include processing fee
        ${paymentStatus},
        'credit_card',
        ${customerInfo.email},
        ${stripePaymentIntentId},
        ${JSON.stringify({
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          address: customerInfo.billingAddress,
          city: customerInfo.city,
          zipCode: customerInfo.zipCode,
          country: customerInfo.country,
        })}
      )
      RETURNING id, order_number
    `

    const orderId = orderResult[0].id
    console.log("[v0] Order created with ID:", orderId)

    for (const item of items) {
      console.log("[v0] Creating order item for image:", item.imageId, "License:", item.licenseType)

      // Get the default license ID (we'll use PRO license for all items)
      const licenseResult = await sql`
        SELECT id FROM licenses WHERE name = 'PRO' LIMIT 1
      `

      const licenseId = licenseResult.length > 0 ? licenseResult[0].id : null

      if (!licenseId) {
        console.error("[v0] No default license found")
        return NextResponse.json({ success: false, error: "License configuration error" }, { status: 500 })
      }

      await sql`
        INSERT INTO order_items (
          order_id,
          image_id,
          license_id,
          price,
          download_count,
          download_limit
        )
        VALUES (
          ${orderId},
          ${item.imageId},
          ${licenseId},
          ${item.price * item.quantity},
          0,
          5
        )
      `
    }

    console.log("[v0] Order created successfully:", orderNumber)

    return NextResponse.json({
      success: true,
      data: {
        orderId: orderId,
        orderNumber: orderNumber,
        paymentStatus: paymentStatus,
        total: total * 1.03,
      },
    })
  } catch (error) {
    console.error("[v0] Order creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 },
    )
  }
}
