import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PasswordManager } from "@/lib/auth/password"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: userResult, error } = await supabase
      .from("user_profiles")
      .select(`
        *,
        users!inner(email, encrypted_password)
      `)
      .eq("users.email", email)
      .limit(1)
      .single()

    if (error || !userResult) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = userResult
    const userData = user.users as any

    const isValidPassword = await PasswordManager.verifyPassword(password, userData.encrypted_password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await supabase.from("user_sessions").insert({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })

    const cookieStore = await cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: userData.email,
        user_metadata: {
          full_name: user.full_name,
          is_admin: user.is_admin,
        },
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
