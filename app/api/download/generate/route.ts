import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Download generation started")

    const { orderItemId } = await request.json()
    console.log("[v0] Received orderItemId:", orderItemId)

    if (!orderItemId) {
      console.log("[v0] Missing orderItemId")
      return NextResponse.json({ error: "Order item ID is required" }, { status: 400 })
    }

    console.log("[v0] Creating Supabase client...")
    const supabase = await createClient()
    console.log("[v0] Supabase client created successfully")

    const downloadToken = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    // First, get the order item details
    const { data: orderItem, error: orderItemError } = await supabase
      .from("order_items")
      .select("*, orders(user_email), images(id)")
      .eq("id", orderItemId)
      .single()

    if (orderItemError || !orderItem) {
      console.log("[v0] Order item not found:", orderItemError)
      return NextResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    // Create download record
    const { data: downloadRecord, error: downloadError } = await supabase
      .from("downloads")
      .insert({
        order_item_id: orderItemId,
        image_id: orderItem.images.id,
        user_email: orderItem.orders.user_email,
        download_token: downloadToken,
        expires_at: expiresAt.toISOString(),
        download_count: 0,
      })
      .select("download_token")
      .single()

    if (downloadError || !downloadRecord) {
      console.log("[v0] Failed to create download record:", downloadError)
      return NextResponse.json({ error: "Failed to generate download token" }, { status: 500 })
    }

    const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/download/by-token/${downloadRecord.download_token}`
    console.log("[v0] Generated download URL:", downloadUrl)

    return NextResponse.json({
      downloadUrl,
      token: downloadRecord.download_token,
      expiresIn: "24 hours",
    })
  } catch (error) {
    console.error("[v0] Download generation error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
