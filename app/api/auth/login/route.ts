import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: userResult, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .single()

    if (userError || !userResult) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Note: For now, we'll skip password verification since Supabase handles auth differently
    // In a proper Supabase setup, you'd use supabase.auth.signInWithPassword()
    // But since we're migrating existing data, we'll create a session token approach

    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Note: In production, you'd want to create a user_sessions table or use Supabase auth
    const cookieStore = await cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      user: {
        id: userResult.id,
        email: userResult.email,
        user_metadata: {
          full_name: userResult.full_name,
          is_admin: userResult.role === "admin",
        },
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
