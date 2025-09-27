import { NextResponse, type NextRequest } from "next/server"
import { createNeonClient } from "@/lib/neon/client"

export async function GET() {
  try {
    console.log("[v0] Fetching all licenses for admin...")
    const sql = createNeonClient()

    const licenses = await sql`
      SELECT 
        l.id, 
        l.name, 
        l.description, 
        l.price, 
        l.active, 
        l.created_at, 
        l.updated_at,
        COUNT(oi.id) as usage_count
      FROM licenses l
      LEFT JOIN order_items oi ON oi.license_id = l.id
      GROUP BY l.id, l.name, l.description, l.price, l.active, l.created_at, l.updated_at
      ORDER BY l.created_at DESC
    `

    console.log("[v0] Found", licenses.length, "total licenses")

    return NextResponse.json({
      success: true,
      licenses: licenses,
    })
  } catch (error) {
    console.error("[v0] Error fetching admin licenses:", error)
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

export async function DELETE(request: NextRequest) {
  try {
    console.log("[v0] Deleting license...")
    const { searchParams } = new URL(request.url)
    const licenseId = searchParams.get("id")

    if (!licenseId) {
      return NextResponse.json({ success: false, error: "License ID is required" }, { status: 400 })
    }

    const sql = createNeonClient()

    // Check if license is being used in any orders
    const usageCheck = await sql`
      SELECT COUNT(*) as count FROM order_items WHERE license_id = ${licenseId}
    `

    if (Number.parseInt(usageCheck[0].count) > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete license that has been used in orders. Consider deactivating instead.",
        },
        { status: 400 },
      )
    }

    const result = await sql`
      DELETE FROM licenses WHERE id = ${licenseId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "License not found" }, { status: 404 })
    }

    console.log("[v0] License deleted successfully:", result[0])

    return NextResponse.json({
      success: true,
      message: "License deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Error deleting license:", error)
    return NextResponse.json({ success: false, error: "Failed to delete license" }, { status: 500 })
  }
}
