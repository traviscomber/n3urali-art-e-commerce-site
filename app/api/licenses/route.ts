import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"

export async function GET() {
  try {
    console.log("[v0] Fetching licenses...")
    const supabase = createSupabaseServerClient()

    const { data: licenses, error } = await supabase
      .from("licenses")
      .select("id, name, description, price, active, created_at, updated_at")
      .eq("active", true)
      .order("price", { ascending: true })

    if (error) {
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

    console.log("[v0] Found", licenses?.length || 0, "active licenses")

    return NextResponse.json({
      success: true,
      licenses: licenses || [],
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

    const supabase = createSupabaseServerClient()

    const { data: result, error } = await supabase
      .from("licenses")
      .insert({
        name,
        description,
        price,
        active,
      })
      .select()
      .single()

    if (error || !result) {
      console.error("[v0] License creation error:", error)
      return NextResponse.json({ success: false, error: "Failed to create license" }, { status: 500 })
    }

    console.log("[v0] License created successfully:", result)

    return NextResponse.json({
      success: true,
      license: result,
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

    const supabase = createSupabaseServerClient()

    const updateData: any = { updated_at: new Date().toISOString() }
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = price
    if (active !== undefined) updateData.active = active

    const { data: result, error } = await supabase.from("licenses").update(updateData).eq("id", id).select().single()

    if (error || !result) {
      return NextResponse.json({ success: false, error: "License not found" }, { status: 404 })
    }

    console.log("[v0] License updated successfully:", result)

    return NextResponse.json({
      success: true,
      license: result,
    })
  } catch (error) {
    console.error("[v0] Error updating license:", error)
    return NextResponse.json({ success: false, error: "Failed to update license" }, { status: 500 })
  }
}
