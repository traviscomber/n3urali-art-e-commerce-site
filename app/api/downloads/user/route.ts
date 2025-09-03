import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("email") || "developer@n3urali.art" // Default for dev

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    const sql = createNeonClient()

    const downloads = await sql`
      SELECT * FROM get_user_downloads(${userEmail})
    `

    return NextResponse.json({
      downloads: downloads || [],
      total: downloads?.length || 0,
    })
  } catch (error) {
    console.error("User downloads error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
