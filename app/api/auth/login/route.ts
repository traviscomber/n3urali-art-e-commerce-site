import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"
import { PasswordManager } from "@/lib/auth/password"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    const { data: userResult, error } = await supabase
      .from("user_profiles")
      .select(`
        *,
        auth_users!inner(email, encrypted_password)
      `)
      .eq("auth_users.email", email)
      .single()

    if (error || !userResult) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValidPassword = await PasswordManager.verifyPassword(password, userResult.auth_users.encrypted_password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const { error: sessionError } = await supabase.from("user_sessions").insert({
      user_id: userResult.id,
      session_token: sessionToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    })

    if (sessionError) {
      console.error("Session creation error:", sessionError)
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    const cookieStore = cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      user: {
        id: userResult.id,
        email: userResult.auth_users.email,
        user_metadata: {
          full_name: userResult.full_name,
          is_admin: userResult.is_admin,
        },
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
