import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: queryLogs, error: queryError } = await supabase
      .from("query_performance_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100)

    if (queryError) {
      console.error("Failed to fetch query logs:", queryError)
      return NextResponse.json({ error: "Failed to fetch performance data" }, { status: 500 })
    }

    // Calculate metrics
    const queryCount = queryLogs.length
    const avgQueryTime = queryLogs.reduce((sum, log) => sum + Number(log.execution_time_ms), 0) / queryCount || 0
    const slowQueries = queryLogs
      .filter((log) => Number(log.execution_time_ms) > 1000)
      .slice(0, 10)
      .map((log) => ({
        query: log.query_text || "Unknown query",
        duration: Number(log.execution_time_ms),
        timestamp: new Date(log.timestamp).getTime(),
      }))

    // Mock cache hit rate (would need Redis integration for real data)
    const cacheHitRate = 85.5

    return NextResponse.json({
      queryCount,
      avgQueryTime,
      slowQueries,
      cacheHitRate,
    })
  } catch (error) {
    console.error("Performance metrics error:", error)
    return NextResponse.json({ error: "Failed to fetch performance metrics" }, { status: 500 })
  }
}
