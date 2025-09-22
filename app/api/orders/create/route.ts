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
  paymentMethod?: "crypto" | "stripe" | "demo" | "manual_receipt"
  paymentIntentId?: string
  cryptoDetails?: {
    currency: string
    amount: string
    transactionHash: string
    address: string
  }
  receiptDetails?: {
    currency: string
    amount: string
    receiptUrl: string
    address: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json()
    const { items, total, customerInfo, paymentMethod = "demo", paymentIntentId, cryptoDetails, receiptDetails } = body

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

    console.log("[v0] Cart items details:", JSON.stringify(items, null, 2))

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: "No items in cart" }, { status: 400 })
    }

    if (!customerInfo.email) {
      return NextResponse.json({ success: false, error: "Customer email is required" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    for (const item of items) {
      if (!item.licenseId || item.licenseId === "660e8400-e29b-41d4-a716-446655440000") {
        console.log("[v0] Invalid or missing licenseId for item, attempting to resolve:", item)

        // Map legacy/frontend license types to database license names
        let licenseTypeName: string
        const itemLicenseType = (item as any).licenseType

        if (itemLicenseType === "standard" || itemLicenseType === "NON_EXCLUSIVE" || !itemLicenseType) {
          licenseTypeName = "NON_EXCLUSIVE"
        } else if (itemLicenseType === "premium" || itemLicenseType === "EXCLUSIVE") {
          licenseTypeName = "EXCLUSIVE"
        } else {
          licenseTypeName = "NON_EXCLUSIVE" // Default fallback
        }

        console.log("[v0] Resolving license type:", itemLicenseType, "->", licenseTypeName)

        // Fetch available licenses to get the correct licenseId
        const { data: licenses, error: licenseError } = await supabase
          .from("licenses")
          .select("*")
          .eq("name", licenseTypeName)
          .limit(1)

        if (licenseError) {
          console.error("[v0] License query error:", licenseError)
          return NextResponse.json(
            {
              success: false,
              error: `Database error while resolving license: ${licenseError.message}`,
            },
            { status: 500 },
          )
        }

        if (!licenses || licenses.length === 0) {
          console.log("[v0] No specific license found, trying fallback...")

          // Try to get any available license as fallback
          const { data: fallbackLicenses, error: fallbackError } = await supabase.from("licenses").select("*").limit(1)

          if (fallbackError) {
            console.error("[v0] Fallback license query error:", fallbackError)
            return NextResponse.json(
              {
                success: false,
                error: `Database error: ${fallbackError.message}`,
              },
              { status: 500 },
            )
          }

          if (!fallbackLicenses || fallbackLicenses.length === 0) {
            console.error("[v0] No licenses found in database")
            return NextResponse.json(
              {
                success: false,
                error: "No valid licenses available. Please run the license setup script and try again.",
              },
              { status: 500 },
            )
          }

          // Use the first available license
          const license = fallbackLicenses[0]
          item.licenseId = license.id
          item.licenseName = license.name
          item.licenseType = license.name as "NON_EXCLUSIVE" | "EXCLUSIVE"

          console.log("[v0] Using fallback license:", license.name, "ID:", license.id)
        } else {
          // Use the found license
          const license = licenses[0]
          item.licenseId = license.id
          item.licenseName = license.name
          item.licenseType = license.name as "NON_EXCLUSIVE" | "EXCLUSIVE"

          console.log("[v0] Using resolved license:", license.name, "ID:", license.id)
        }

        console.log("[v0] Resolved license for item:", {
          imageId: item.imageId,
          licenseId: item.licenseId,
          licenseName: item.licenseName,
          licenseType: item.licenseType,
        })
      } else {
        const { data: licenseCheck, error: checkError } = await supabase
          .from("licenses")
          .select("id, name")
          .eq("id", item.licenseId)
          .limit(1)

        if (checkError) {
          console.error("[v0] License verification error:", checkError)
          return NextResponse.json(
            {
              success: false,
              error: `Database error while verifying license: ${checkError.message}`,
            },
            { status: 500 },
          )
        }

        if (!licenseCheck || licenseCheck.length === 0) {
          console.error("[v0] License ID does not exist in database:", item.licenseId)
          return NextResponse.json(
            {
              success: false,
              error: `Invalid license ID: ${item.licenseId}. Please refresh the page and try again.`,
            },
            { status: 400 },
          )
        }

        console.log("[v0] License ID verified:", item.licenseId, "Name:", licenseCheck[0].name)
      }
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const { data: orderResult, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_email: customerInfo.email,
        user_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        total_amount: total,
        status: paymentMethod === "manual_receipt" ? "pending" : "completed",
        payment_method:
          paymentMethod === "crypto"
            ? "cryptocurrency"
            : paymentMethod === "manual_receipt"
              ? "manual_receipt"
              : paymentMethod,
        payment_intent_id:
          paymentMethod === "crypto"
            ? cryptoDetails?.transactionHash
            : paymentMethod === "manual_receipt"
              ? receiptDetails?.receiptUrl
              : paymentIntentId || orderNumber,
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
      console.log("[v0] Creating order item:", {
        order_id: orderId,
        image_id: item.imageId,
        license_id: item.licenseId,
        price: item.price * item.quantity,
      })

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
    if (paymentMethod !== "manual_receipt") {
      for (let i = 0; i < orderItemIds.length; i++) {
        const orderItemId = orderItemIds[i]
        const item = items[i]
        const downloadToken = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const { data: downloadResult, error: downloadError } = await supabase
          .from("downloads")
          .insert({
            order_item_id: orderItemId,
            download_token: downloadToken,
            image_id: item.imageId, // Include image_id as required by existing schema
            user_email: customerInfo.email, // Include user_email as required by existing schema
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            download_count: 0, // Initialize download count
            created_at: new Date().toISOString(), // Set creation timestamp
          })
          .select()
          .single()

        if (downloadError) {
          console.error("[v0] Download token creation error:", downloadError)
          // Don't fail the order, just log the error
        } else if (downloadResult) {
          downloadTokens.push(downloadResult)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: orderId,
        orderNumber: orderNumber,
        paymentStatus: paymentMethod === "manual_receipt" ? "pending_verification" : "completed",
        total: total,
        paymentMethod: paymentMethod,
        downloadTokensGenerated: downloadTokens.length,
        message:
          paymentMethod === "manual_receipt"
            ? "Order submitted for manual verification. You will receive download links within 24 hours after payment confirmation."
            : undefined,
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
