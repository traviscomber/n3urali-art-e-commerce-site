import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return NextResponse.json({
        success: false,
        message: "Missing Supabase credentials",
      })
    }

    // Test RLS with service role (should bypass RLS)
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Test RLS with anon key (should respect RLS)
    const anonClient = createClient(supabaseUrl, anonKey)

    const tests = []

    // Test 1: Admin client should bypass RLS
    try {
      const { data, error } = await adminClient.from("images").select("id").limit(1)
      tests.push({
        test: "Admin client (service role)",
        success: !error,
        message: error ? `RLS blocking admin: ${error.message}` : "Admin client bypasses RLS correctly",
      })
    } catch (error) {
      tests.push({
        test: "Admin client (service role)",
        success: false,
        message: `Admin client failed: ${error}`,
      })
    }

    // Test 2: Anon client should be blocked by RLS
    try {
      const { data, error } = await anonClient.from("images").select("id").limit(1)
      tests.push({
        test: "Anonymous client",
        success: error !== null, // We expect an error due to RLS
        message: error ? `RLS working correctly: ${error.message}` : "Warning: RLS may be disabled",
      })
    } catch (error) {
      tests.push({
        test: "Anonymous client",
        success: true,
        message: `RLS blocking anonymous access: ${error}`,
      })
    }

    const allPassed = tests.every((test) => test.success)

    return NextResponse.json({
      success: allPassed,
      message: allPassed ? "RLS policies working correctly" : "RLS configuration issues detected",
      details: tests,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to test RLS policies",
      details: String(error),
    })
  }
}
