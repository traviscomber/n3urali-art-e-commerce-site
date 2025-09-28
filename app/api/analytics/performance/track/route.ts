import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const supabase = await createClient()

    const { error } = await supabase.from("analytics_performance").insert({
      metric_name: data.metric_name,
      metric_value: data.metric_value,
      page: data.page,
      user_agent: data.user_agent,
      connection_type: data.connection_type,
    })

    if (error) {
      console.error("Failed to insert performance metric:", error)
      return NextResponse.json({ error: "Failed to track metric" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Performance tracking error:", error)
    return NextResponse.json({ error: "Failed to track performance" }, { status: 500 })
  }
}
