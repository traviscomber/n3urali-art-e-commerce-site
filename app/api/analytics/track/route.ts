import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()
    const supabase = await createClient()

    // Get client IP and user agent
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Note: Analytics tables would need to be created in Supabase
    // For now, we'll skip analytics tracking since the tables don't exist in the current schema
    console.log("[v0] Analytics tracking:", type, data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics tracking error:", error)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}
