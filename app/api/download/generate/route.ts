import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { orderItemId } = await request.json()

    if (!orderItemId) {
      return NextResponse.json({ error: "Order item ID is required" }, { status: 400 })
    }

    return NextResponse.json({ error: "Download functionality is being updated" }, { status: 503 })
  } catch (error) {
    console.error("Download generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
