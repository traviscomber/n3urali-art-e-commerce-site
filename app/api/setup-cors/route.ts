import { type NextRequest, NextResponse } from "next/server"
import { WorkingBackblazeStorage } from "@/lib/backblaze-working"

export async function POST(request: NextRequest) {
  try {
    const { origins } = await request.json()

    const storage = new WorkingBackblazeStorage()

    // Default origins if none provided
    const allowedOrigins = origins || [
      "https://n3uralia360.art",
      "https://*.n3uralia360.art",
      "http://localhost:3000",
      "https://*.vercel.app",
    ]

    await storage.configureBucketCORS(allowedOrigins)

    return NextResponse.json({
      success: true,
      message: "CORS configured successfully",
      origins: allowedOrigins,
    })
  } catch (error: any) {
    console.error("[v0] CORS setup failed:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const storage = new WorkingBackblazeStorage()
    const corsRules = await storage.getBucketCORS()

    return NextResponse.json({
      success: true,
      corsRules,
    })
  } catch (error: any) {
    console.error("[v0] Failed to get CORS config:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
