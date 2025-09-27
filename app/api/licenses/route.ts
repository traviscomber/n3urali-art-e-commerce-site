import { NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"

export async function GET() {
  try {
    console.log("[v0] Fetching licenses...")
    const sql = createNeonClient()

    const licenses = await sql`
      SELECT id, name, description, price, active
      FROM licenses 
      WHERE active = true
      ORDER BY price ASC
    `

    console.log("[v0] Found", licenses.length, "active licenses")

    return NextResponse.json({
      success: true,
      licenses: licenses,
    })
  } catch (error) {
    console.error("[v0] Error fetching licenses:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch licenses",
        licenses: [],
      },
      { status: 500 },
    )
  }
}
