import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"

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
    const supabase = createSupabaseServerClient()
    console.log("[v0] Supabase client created successfully")

    console.log("[v0] Generating download token...")
    try {
      const { data: orderItem, error: orderItemError } = await supabase
        .from("order_items")
        .select(`
          *,
          orders!inner(status)
        `)
        .eq("id", orderItemId)
        .single()

      if (orderItemError || !orderItem) {
        console.log("[v0] Order item not found")
        return NextResponse.json({ error: "Order item not found" }, { status: 404 })
      }

      if (orderItem.orders.status !== "completed") {
        console.log("[v0] Order not completed")
        return NextResponse.json({ error: "Order not completed" }, { status: 403 })
      }

      const downloadToken = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const { data: downloadResult, error: downloadError } = await supabase
        .from("downloads")
        .insert({
          order_item_id: orderItemId,
          image_id: orderItem.image_id, // Added missing image_id
          download_token: downloadToken,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          download_count: 0,
        })
        .select()
        .single()

      if (downloadError || !downloadResult) {
        console.log("[v0] Failed to create download record:", downloadError)
        return NextResponse.json({ error: "Failed to generate download token" }, { status: 500 })
      }

      const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/download/by-token/${downloadResult.download_token}`
      console.log("[v0] Generated download URL:", downloadUrl)

      return NextResponse.json({
        downloadUrl,
        token: downloadResult.download_token,
        expiresIn: "24 hours",
      })
    } catch (dbError: any) {
      console.error("[v0] Database function error:", dbError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Download generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
