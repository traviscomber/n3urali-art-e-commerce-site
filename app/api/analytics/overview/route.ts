import { type NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/lib/analytics-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const analyticsService = AnalyticsService.getInstance()
    const metrics = await analyticsService.getOverallMetrics(startDate || undefined, endDate || undefined)

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Analytics overview error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics overview" }, { status: 500 })
  }
}
