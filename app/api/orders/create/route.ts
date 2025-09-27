import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
        payment_id: paymentMethod === "crypto" ? cryptoDetails?.transactionHash : paymentIntentId || orderNumber,
      })
      .select("id")
      .single()

    if (orderError || !orderResult) {
      throw orderError || new Error("Failed to create order")
    }

    const orderId = orderResult.id
    console.log("[v0] Order created with ID:", orderId)

    for (const item of items) {
      console.log("[v0] Creating order item for image:", item.imageId, "License:", item.licenseType)

      const { data: licenseResult } = await supabase
        .from("licenses")
        .select("id")
        .eq("active", true)
        .order("name", { ascending: true })
        .limit(1)
        .single()

      const licenseId = licenseResult?.id

      if (!licenseId) {
        console.error("[v0] No default license found")
        return NextResponse.json({ success: false, error: "License configuration error" }, { status: 500 })
      }

      await supabase.from("order_items").insert({
        order_id: orderId,
        image_id: item.imageId,
        license_id: licenseId,
        price: item.price * item.quantity,
      })
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
