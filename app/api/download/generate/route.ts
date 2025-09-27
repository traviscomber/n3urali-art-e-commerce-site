import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

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

    console.log("[v0] Verifying order item and generating token...")

    // First verify the order item exists and is valid
    const { data: orderItem, error: orderError } = await supabase
      .from("order_items")
      .select(`
        *,
        orders!inner(id, status, user_email),
        images!inner(id, title)
      `)
      .eq("id", orderItemId)
      .eq("orders.status", "completed")
      .single()

    if (orderError || !orderItem) {
      console.log("[v0] Invalid order item or order not completed")
      return NextResponse.json({ error: "Invalid order item or order not completed" }, { status: 400 })
    }

    // Generate download token
    const downloadToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours from now

    // Create download record
    const { data: downloadRecord, error: downloadError } = await supabase
      .from("downloads")
      .insert({
        order_id: orderItem.orders.id,
        image_id: orderItem.images.id,
        user_email: orderItem.orders.user_email,
        download_token: downloadToken,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (downloadError) {
      console.error("[v0] Failed to create download record:", downloadError)
      return NextResponse.json({ error: "Failed to generate download token" }, { status: 500 })
    }

    const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/download/by-token/${downloadToken}`
    console.log("[v0] Generated download URL:", downloadUrl)

    return NextResponse.json({
      downloadUrl,
      token: downloadToken,
      expiresIn: "24 hours",
    })
  } catch (error) {
    console.error("[v0] Download generation error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
