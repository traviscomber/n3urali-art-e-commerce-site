import { NextResponse, type NextRequest } from "next/server"
import { createNeonClient } from "@/lib/neon/client"

export async function GET() {
  try {
    console.log("[v0] Fetching licenses...")
    const sql = createNeonClient()

    const licenses = await sql`
      SELECT id, name, description, price, active, created_at, updated_at
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

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Creating new license...")
    const { name, description, price, active = true } = await request.json()

    if (!name || !description || price === undefined) {
      return NextResponse.json({ success: false, error: "Name, description, and price are required" }, { status: 400 })
    }

    const sql = createNeonClient()

    const result = await sql`
      INSERT INTO licenses (name, description, price, active)
      VALUES (${name}, ${description}, ${price}, ${active})
      RETURNING *
    `

    console.log("[v0] License created successfully:", result[0])

    return NextResponse.json({
      success: true,
      license: result[0],
    })
  } catch (error) {
    console.error("[v0] Error creating license:", error)
    return NextResponse.json({ success: false, error: "Failed to create license" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("[v0] Updating license...")
    const { id, name, description, price, active } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "License ID is required" }, { status: 400 })
    }

    const sql = createNeonClient()

    const result = await sql`
      UPDATE licenses 
      SET 
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        price = COALESCE(${price}, price),
        active = COALESCE(${active}, active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "License not found" }, { status: 404 })
    }

    console.log("[v0] License updated successfully:", result[0])

    return NextResponse.json({
      success: true,
      license: result[0],
    })
  } catch (error) {
    console.error("[v0] Error updating license:", error)
    return NextResponse.json({ success: false, error: "Failed to update license" }, { status: 500 })
  }
}
