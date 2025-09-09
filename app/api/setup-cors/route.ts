import { type NextRequest, NextResponse } from "next/server"
import { BackblazeCorsManager } from "@/lib/backblaze-cors-setup"

export async function POST(request: NextRequest) {
  try {
    const { allowedDomains } = await request.json()

    const corsManager = new BackblazeCorsManager()

    const domains = allowedDomains || ["https://*", "http://localhost:*"]
    const result = await corsManager.setupCorsForImageAccess(domains)

    return NextResponse.json(result)
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
    const corsManager = new BackblazeCorsManager()
    const result = await corsManager.getCurrentCorsRules()

    return NextResponse.json(result)
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
