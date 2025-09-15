import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Download generation started")

    const { orderItemId } = await request.json()
    console.log("[v0] Received orderItemId:", orderItemId)

    if (!orderItemId) {
      console.log("[v0] Missing orderItemId")
      return NextResponse.json({ error: "Order item ID is required" }, { status: 400 })
    }

    console.log("[v0] Creating Neon client...")
    const sql = createNeonClient()
    console.log("[v0] Neon client created successfully")

    console.log("[v0] Calling generate_download_token function...")
    try {
      const result = await sql`
        SELECT generate_download_token(${orderItemId}::uuid) as token
      `
      console.log("[v0] Database result:", result)

      if (!result[0]?.token) {
        console.log("[v0] No token returned from database")
        return NextResponse.json({ error: "Failed to generate download token" }, { status: 500 })
      }

      const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/download/by-token/${result[0].token}`
      console.log("[v0] Generated download URL:", downloadUrl)

      return NextResponse.json({
        downloadUrl,
        token: result[0].token,
        expiresIn: "24 hours",
      })
    } catch (dbError: any) {
      console.error("[v0] Database function error:", dbError)

      if (dbError.message?.includes("Order item not found")) {
        return NextResponse.json({ error: "Order item not found" }, { status: 404 })
      }

      if (dbError.message?.includes("Order not completed")) {
        return NextResponse.json({ error: "Order not completed" }, { status: 403 })
      }

      throw dbError
    }
  } catch (error) {
    console.error("[v0] Download generation error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
