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

    console.log("[v0] Validating order item and checking download eligibility...")
    try {
      const { data: orderItem, error: orderItemError } = await supabase
        .from("order_items")
        .select(`
          *,
          orders!inner(status, user_email),
          images!inner(title)
        `)
        .eq("id", orderItemId)
        .single()

      if (orderItemError || !orderItem) {
        console.log("[v0] Order item not found:", orderItemError)
        return NextResponse.json({ error: "Order item not found" }, { status: 404 })
      }

      if (orderItem.orders.status !== "completed") {
        console.log("[v0] Order not completed, status:", orderItem.orders.status)
        return NextResponse.json({ error: "Order not completed" }, { status: 403 })
      }

      const downloadCount = orderItem.download_count || 0
      const downloadLimit = orderItem.download_limit || 5

      if (downloadCount >= downloadLimit) {
        console.log("[v0] Download limit exceeded:", downloadCount, ">=", downloadLimit)
        return NextResponse.json(
          {
            error: `Download limit exceeded. You have used all ${downloadLimit} downloads for this item.`,
          },
          { status: 429 },
        )
      }

      const { data: existingDownload, error: existingError } = await supabase
        .from("downloads")
        .select("*")
        .eq("order_item_id", orderItemId)
        .gt("expires_at", new Date().toISOString())
        .limit(1)

      if (existingError) {
        console.error("[v0] Error checking existing downloads:", existingError)
      }

      // If there's an active download, return it instead of creating a new one
      if (existingDownload && existingDownload.length > 0) {
        const existing = existingDownload[0]
        const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/downloads/${existing.download_token}`

        console.log("[v0] Returning existing download token:", existing.download_token)
        return NextResponse.json({
          downloadUrl,
          token: existing.download_token,
          expiresAt: existing.expires_at,
          expiresIn: "30 days",
          remainingDownloads: downloadLimit - downloadCount,
        })
      }

      const downloadToken = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const { data: downloadResult, error: downloadError } = await supabase
        .from("downloads")
        .insert({
          order_item_id: orderItemId,
          download_token: downloadToken,
          image_id: orderItem.image_id, // Include image_id as required by existing schema
          user_email: orderItem.orders.user_email, // Include user_email as required by existing schema
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          download_count: 0,
          created_at: new Date().toISOString(), // Set creation timestamp
        })
        .select()
        .single()

      if (downloadError || !downloadResult) {
        console.error("[v0] Failed to create download record:", downloadError)
        return NextResponse.json({ error: "Failed to generate download token" }, { status: 500 })
      }

      const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/downloads/${downloadResult.download_token}`
      console.log("[v0] Generated download URL:", downloadUrl)

      return NextResponse.json({
        downloadUrl,
        token: downloadResult.download_token,
        expiresAt: downloadResult.expires_at,
        expiresIn: "30 days",
        remainingDownloads: downloadLimit - downloadCount,
        imageTitle: orderItem.images.title,
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
