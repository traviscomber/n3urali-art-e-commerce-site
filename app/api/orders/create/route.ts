import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface CartItem {
  id: string
  title: string
  price: number
  preview_image_url: string
  license_id: string
  license_name: string
  quantity: number
  isBundle?: boolean
  bundleType?: "featured-collection"
  bundleImageIds?: string[]
  bundleImageCount?: number
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

      console.log(
        "[v0] Processing crypto payment:",
        cryptoDetails.currency,
        cryptoDetails.amount,
        cryptoDetails.transactionHash,
      )
    }

    const supabase = await createClient()

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
      .select("id")
      .single()

    if (orderError || !orderResult) {
      console.error("[v0] Order creation error:", orderError)
      return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
    }

    const orderId = orderResult.id
    console.log("[v0] Order created with ID:", orderId)

    console.log("[v0] Looking up active licenses...")
    const { data: licenseResult, error: licenseError } = await supabase
      .from("licenses")
      .select("id, name, active")
      .eq("active", true)
      .order("created_at")
      .limit(1)
      .single()

    console.log("[v0] License lookup result:", { licenseResult, licenseError })

    let licenseId: string
    if (licenseError || !licenseResult) {
      console.error("[v0] No active license found, checking all licenses...")

      const { data: fallbackLicense, error: fallbackError } = await supabase
        .from("licenses")
        .select("id, name, active")
        .order("created_at")
        .limit(1)
        .single()

      console.log("[v0] Fallback license result:", { fallbackLicense, fallbackError })

      if (fallbackError || !fallbackLicense) {
        console.error("[v0] No licenses found at all:", fallbackError)
        return NextResponse.json({ success: false, error: "No licenses configured in system" }, { status: 500 })
      }

      licenseId = fallbackLicense.id
    } else {
      licenseId = licenseResult.id
    }

    const orderItems = []
    for (const item of items) {
      if (item.isBundle && item.bundleImageIds && item.bundleImageIds.length > 0) {
        console.log("[v0] Processing bundle with", item.bundleImageIds.length, "images")

        // Create an order item for each image in the bundle
        const bundlePricePerImage = item.price / item.bundleImageIds.length

        for (const imageId of item.bundleImageIds) {
          orderItems.push({
            order_id: orderId,
            image_id: imageId,
            license_id: licenseId,
            price: bundlePricePerImage,
          })
        }
      } else {
        // Regular item
        orderItems.push({
          order_id: orderId,
          image_id: item.id,
          license_id: licenseId,
          price: item.price * item.quantity,
        })
      }
    }

    console.log("[v0] Creating", orderItems.length, "order items")

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("[v0] Order items creation error:", itemsError)
      return NextResponse.json({ success: false, error: "Failed to create order items" }, { status: 500 })
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
