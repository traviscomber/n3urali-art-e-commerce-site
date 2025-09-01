import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        message: "Missing Supabase credentials",
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Test basic CRUD operations
    const tests = []

    // Test 1: Read images
    try {
      const { data, error } = await supabase.from("images").select("*").limit(1)

      tests.push({
        operation: "READ",
        success: !error,
        error: error?.message,
      })
    } catch (error) {
      tests.push({
        operation: "READ",
        success: false,
        error: String(error),
      })
    }

    // Test 2: Create test record
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({ name: "test-category", description: "Test category" })
        .select()

      tests.push({
        operation: "CREATE",
        success: !error,
        error: error?.message,
      })

      // Clean up test record
      if (!error && data?.[0]) {
        await supabase.from("categories").delete().eq("id", data[0].id)
      }
    } catch (error) {
      tests.push({
        operation: "CREATE",
        success: false,
        error: String(error),
      })
    }

    const allPassed = tests.every((test) => test.success)

    return NextResponse.json({
      success: allPassed,
      message: allPassed ? "All admin operations working" : "Some admin operations failed",
      details: tests,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to test admin operations",
      details: String(error),
    })
  }
}
