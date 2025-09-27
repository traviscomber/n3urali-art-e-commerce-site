import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"

interface CartItem {
  id: string
  imageId: string
  title: string
  price: number
  licenseId: string
  licenseName: string
  licensePrice: number
  previewUrl: string
  category: "equirectangular" | "fisheye"
  quantity: number
  licenseType: "NON_EXCLUSIVE" | "EXCLUSIVE"
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
  paymentMethod?: "crypto" | "stripe" | "demo"
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
    const { items, total, customerInfo, paymentMethod = "demo", paymentIntentId, cryptoDetails } = body

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
        user_email, 
        user_name,
        total_amount, 
        status, 
        payment_method,
        payment_intent_id
      )
      VALUES (
        ${customerInfo.email},
        ${customerInfo.firstName + " " + customerInfo.lastName},
        ${total},
        'completed',
        ${paymentMethod === "crypto" ? "cryptocurrency" : paymentMethod},
        ${paymentMethod === "crypto" ? cryptoDetails?.transactionHash : paymentIntentId || orderNumber}
      )
      RETURNING id
    `

    const orderId = orderResult[0].id
    console.log("[v0] Order created with ID:", orderId)

    const orderItemIds: string[] = []

    for (const item of items) {
      console.log("[v0] Creating order item for image:", item.imageId, "License:", item.licenseId)

      // Use the license ID from the cart item instead of finding a default
      let licenseId = item.licenseId

      // Fallback to finding a license if not provided
      if (!licenseId) {
        const licenseResult = await sql`
          SELECT id FROM licenses WHERE active = true ORDER BY price ASC LIMIT 1
        `
        licenseId = licenseResult.length > 0 ? licenseResult[0].id : null
      }

      if (!licenseId) {
        console.error("[v0] No license found for item:", item.imageId)
        return NextResponse.json({ success: false, error: "License configuration error" }, { status: 500 })
      }

      const orderItemResult = await sql`
        INSERT INTO order_items (
          order_id,
          image_id,
          license_id,
          price
        )
        VALUES (
          ${orderId},
          ${item.imageId},
          ${licenseId},
          ${item.price * item.quantity}
        )
        RETURNING id
      `

      orderItemIds.push(orderItemResult[0].id)
    }

    console.log("[v0] Generating download tokens for order items...")
    const downloadTokens = []

    try {
      const tokenResult = await sql`
        SELECT * FROM create_download_tokens_for_order(${orderId}::uuid)
      `

      downloadTokens.push(...tokenResult)
      console.log("[v0] Generated", downloadTokens.length, "download tokens")
    } catch (tokenError) {
      console.error("[v0] Error generating download tokens:", tokenError)
      // Don't fail the order creation, but log the error
    }

    console.log("[v0] Order created successfully:", orderNumber)

    return NextResponse.json({
      success: true,
      data: {
        orderId: orderId,
        orderNumber: orderNumber,
        paymentStatus: "completed",
        total: total,
        paymentMethod: paymentMethod,
        downloadTokensGenerated: downloadTokens.length,
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
