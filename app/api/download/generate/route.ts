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

    console.log("[v0] Generating download token:", downloadToken)

    // Insert the download record
    const { data: downloadResult, error } = await supabase
      .from("downloads")
      .insert({
        order_item_id: orderItemId,
        download_token: downloadToken,
        expires_at: expiresAt.toISOString(),
        download_count: 0,
      })
      .select("download_token")
      .single()

    if (error || !downloadResult) {
      console.log("[v0] Failed to create download record:", error)
      return NextResponse.json({ error: "Failed to generate download token" }, { status: 500 })
    }

    const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/download/by-token/${downloadResult.download_token}`
    console.log("[v0] Generated download URL:", downloadUrl)

    return NextResponse.json({
      downloadUrl,
      token: downloadResult.download_token,
      expiresIn: "24 hours",
    })
  } catch (error) {
    console.error("[v0] Download generation error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
