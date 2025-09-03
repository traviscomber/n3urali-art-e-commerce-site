import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"

export async function POST(request: NextRequest) {
  try {
    const { orderItemId } = await request.json()

    if (!orderItemId) {
      return NextResponse.json({ error: "Order item ID is required" }, { status: 400 })
    }

    const sql = createNeonClient()

    const result = await sql`
      SELECT generate_download_token(${orderItemId}) as token
    `

    if (!result[0]?.token) {
      return NextResponse.json({ error: "Failed to generate download token" }, { status: 500 })
    }

    const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/download/${result[0].token}`

    return NextResponse.json({
      downloadUrl,
      token: result[0].token,
      expiresIn: "24 hours",
    })
  } catch (error) {
    console.error("Download generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
