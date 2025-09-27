import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()
    const supabase = await createClient()

    // Get client IP and user agent
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    if (type === "page_view") {
      const { error } = await supabase.from("analytics_page_views").insert({
        page: data.page,
        title: data.title,
        referrer: data.referrer,
        user_agent: userAgent,
        ip_address: ip,
        timestamp: new Date(data.timestamp).toISOString(),
      })

      if (error) {
        console.error("Page view tracking error:", error)
        return NextResponse.json({ error: "Failed to track page view" }, { status: 500 })
      }
    } else if (type === "event") {
      const { error } = await supabase.from("analytics_events").insert({
        event_name: data.event,
        properties: JSON.stringify(data.properties),
        page: data.page,
        user_agent: userAgent,
        ip_address: ip,
        timestamp: new Date(data.timestamp).toISOString(),
      })

      if (error) {
        console.error("Event tracking error:", error)
        return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics tracking error:", error)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}
