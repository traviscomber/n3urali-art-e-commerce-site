import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"

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
    billingAddress?: string
    city?: string
    zipCode?: string
    country?: string
  }
  paymentMethod?: "crypto" | "stripe"
  paymentIntentId?: string
  cryptoDetails?: {
    currency: string
    amount: string
    transactionHash: string
    address: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json()
    const { items, total, customerInfo, paymentMethod = "crypto", paymentIntentId, cryptoDetails } = body

    console.log(
      "[v0] Creating order for:",
      customerInfo.email,
      "Total:",
      total,
      "Items:",
      items.length,
      "Payment method:",
      paymentMethod,
    )

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: "No items in cart" }, { status: 400 })
    }

    if (!customerInfo.email) {
      return NextResponse.json({ success: false, error: "Customer email is required" }, { status: 400 })
    }

    if (paymentMethod === "crypto") {
      if (!cryptoDetails || !cryptoDetails.transactionHash) {
        return NextResponse.json(
          { success: false, error: "Transaction hash is required for crypto payments" },
          { status: 400 },
        )
      }

      // In a real implementation, you would verify the transaction on the blockchain
      console.log(
        "[v0] Processing crypto payment:",
        cryptoDetails.currency,
        cryptoDetails.amount,
        cryptoDetails.transactionHash,
      )
    }

    const sql = createNeonClient()

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

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
        ${total * 1.03},
        'completed',
        ${paymentMethod === "crypto" ? "cryptocurrency" : "credit_card"},
        ${customerInfo.email},
        ${paymentMethod === "crypto" ? cryptoDetails?.transactionHash : paymentIntentId},
        ${JSON.stringify({
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          address: customerInfo.billingAddress || "",
          city: customerInfo.city || "",
          zipCode: customerInfo.zipCode || "",
          country: customerInfo.country || "",
          ...(paymentMethod === "crypto" && cryptoDetails
            ? {
                cryptoCurrency: cryptoDetails.currency,
                cryptoAmount: cryptoDetails.amount,
                cryptoAddress: cryptoDetails.address,
                transactionHash: cryptoDetails.transactionHash,
              }
            : {}),
        })}
      )
      RETURNING id, order_number
    `

    const orderId = orderResult[0].id
    console.log("[v0] Order created with ID:", orderId)

    for (const item of items) {
      console.log("[v0] Creating order item for image:", item.imageId, "License:", item.licenseType)

      const licenseResult = await sql`
        SELECT id FROM licenses WHERE name = 'NON_EXCLUSIVE' LIMIT 1
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
        paymentStatus: "completed",
        total: total * 1.03,
        paymentMethod: paymentMethod,
        ...(paymentMethod === "crypto" && cryptoDetails
          ? {
              cryptoDetails: {
                currency: cryptoDetails.currency,
                amount: cryptoDetails.amount,
                transactionHash: cryptoDetails.transactionHash,
              },
            }
          : {}),
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
