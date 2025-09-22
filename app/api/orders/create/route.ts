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

    if (paymentMethod === "crypto" && (!cryptoDetails || !cryptoDetails.transactionHash)) {
      return NextResponse.json(
        { success: false, error: "Transaction hash is required for crypto payments" },
        { status: 400 },
      )
    }

    const supabase = createSupabaseServerClient()
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const { data: orderResult, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_email: customerInfo.email,
        user_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
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
    const orderItemIds: string[] = []

    for (const item of items) {
      const { data: orderItemResult, error: orderItemError } = await supabase
        .from("order_items")
        .insert({
          order_id: orderId,
          image_id: item.imageId,
          license_id: item.licenseId,
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

    const downloadTokens = []
    for (const orderItemId of orderItemIds) {
      const downloadToken = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const { data: downloadResult } = await supabase
        .from("downloads")
        .insert({
          order_item_id: orderItemId,
          image_id: items.find((item) => orderItemIds.includes(orderItemId))?.imageId,
          download_token: downloadToken,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          download_count: 0,
        })
        .select()
        .single()

      if (downloadResult) {
        downloadTokens.push(downloadResult)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: orderId,
        orderNumber: orderNumber,
        paymentStatus: "completed",
        total: total,
        paymentMethod: paymentMethod,
        downloadTokensGenerated: downloadTokens.length,
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
