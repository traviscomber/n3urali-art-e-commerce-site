import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"

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

    const supabase = createSupabaseServerClient()

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    console.log("[v0] Creating order with number:", orderNumber)

    const { data: orderResult, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_email: customerInfo.email,
        user_name: customerInfo.firstName + " " + customerInfo.lastName,
        total_amount: total,
        status: "completed",
        payment_method: paymentMethod === "crypto" ? "cryptocurrency" : paymentMethod,
        payment_intent_id: paymentMethod === "crypto" ? cryptoDetails?.transactionHash : paymentIntentId || orderNumber,
      })
      .select()
      .single()

    if (orderError || !orderResult) {
      console.error("[v0] Order creation error:", orderError)
      return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
    }

    const orderId = orderResult.id
    console.log("[v0] Order created with ID:", orderId)

    const orderItemIds: string[] = []

    for (const item of items) {
      console.log("[v0] Creating order item for image:", item.imageId, "License:", item.licenseId)

      // Use the license ID from the cart item instead of finding a default
      let licenseId = item.licenseId

      // Fallback to finding a license if not provided
      if (!licenseId) {
        const { data: licenseResult } = await supabase
          .from("licenses")
          .select("id")
          .eq("active", true)
          .order("price", { ascending: true })
          .limit(1)
          .single()

        licenseId = licenseResult?.id || null
      }

      if (!licenseId) {
        console.error("[v0] No license found for item:", item.imageId)
        return NextResponse.json({ success: false, error: "License configuration error" }, { status: 500 })
      }

      const { data: orderItemResult, error: orderItemError } = await supabase
        .from("order_items")
        .insert({
          order_id: orderId,
          image_id: item.imageId,
          license_id: licenseId,
          price: item.price * item.quantity,
        })
        .select()
        .single()

      if (orderItemError || !orderItemResult) {
        console.error("[v0] Order item creation error:", orderItemError)
        return NextResponse.json({ success: false, error: "Failed to create order item" }, { status: 500 })
      }

      orderItemIds.push(orderItemResult.id)
    }

    console.log("[v0] Generating download tokens for order items...")
    const downloadTokens = []

    try {
      for (const orderItemId of orderItemIds) {
        const downloadToken = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const { data: downloadResult, error: downloadError } = await supabase
          .from("downloads")
          .insert({
            order_item_id: orderItemId,
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
