import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"

export async function GET() {
  try {
    console.log("[v0] Fetching all licenses for admin...")
    const supabase = createSupabaseServerClient()

    const { data: licenses, error } = await supabase
      .from("licenses")
      .select(`
        id, 
        name, 
        description, 
        price, 
        active, 
        created_at, 
        updated_at,
        order_items(count)
      `)
      .order("created_at", { ascending: false })

    if (error) {
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

    // Transform the data to include usage_count
    const transformedLicenses =
      licenses?.map((license) => ({
        ...license,
        usage_count: license.order_items?.length || 0,
        order_items: undefined, // Remove the nested data
      })) || []

    console.log("[v0] Found", transformedLicenses.length, "total licenses")

    return NextResponse.json({
      success: true,
      licenses: transformedLicenses,
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

    const supabase = createSupabaseServerClient()

    // Check if license is being used in any orders
    const { count: usageCount, error: countError } = await supabase
      .from("order_items")
      .select("*", { count: "exact", head: true })
      .eq("license_id", licenseId)

    if (countError) {
      console.error("[v0] Error checking license usage:", countError)
      return NextResponse.json({ success: false, error: "Failed to check license usage" }, { status: 500 })
    }

    if ((usageCount || 0) > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete license that has been used in orders. Consider deactivating instead.",
        },
        { status: 400 },
      )
    }

    const { data: result, error } = await supabase.from("licenses").delete().eq("id", licenseId).select().single()

    if (error || !result) {
      return NextResponse.json({ success: false, error: "License not found" }, { status: 404 })
    }

    console.log("[v0] License deleted successfully:", result)

    return NextResponse.json({
      success: true,
      message: "License deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Error deleting license:", error)
    return NextResponse.json({ success: false, error: "Failed to delete license" }, { status: 500 })
  }
}
