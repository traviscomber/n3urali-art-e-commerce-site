"use client"

import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon"

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()
    const sql = createNeonClient()

    // Get client IP and user agent
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    if (type === "page_view") {
      await sql`
        INSERT INTO analytics_page_views (
          page, title, referrer, user_agent, ip_address, timestamp
        ) VALUES (
          ${data.page}, ${data.title}, ${data.referrer}, ${userAgent}, ${ip}, ${new Date(data.timestamp)}
        )
      `
    } else if (type === "event") {
      await sql`
        INSERT INTO analytics_events (
          event_name, properties, page, user_agent, ip_address, timestamp
        ) VALUES (
          ${data.event}, ${JSON.stringify(data.properties)}, ${data.page}, ${userAgent}, ${ip}, ${new Date(data.timestamp)}
        )
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics tracking error:", error)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}
