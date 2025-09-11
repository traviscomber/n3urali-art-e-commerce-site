import { type NextRequest, NextResponse } from "next/server"
import { WorkingBackblazeStorage } from "@/lib/backblaze-working"

export async function POST(request: NextRequest) {
  try {
    const { allowedDomains } = await request.json()

    const storage = new WorkingBackblazeStorage()

    await storage.configureBucketCORS()

    return NextResponse.json({
      success: true,
      message: "CORS configuration updated successfully for thumbnail access",
    })
  } catch (error) {
    console.error("[v0] CORS setup API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const storage = new WorkingBackblazeStorage()
    const corsRules = await storage.getBucketCORS()

    return NextResponse.json({
      success: true,
      corsRules: corsRules,
    })
  } catch (error) {
    console.error("[v0] CORS check API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
