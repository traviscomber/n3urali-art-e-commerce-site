import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const sql = createNeonClient()

    const userResult = await sql`
      SELECT up.*, u.email 
      FROM user_profiles up
      JOIN auth.users u ON up.id = u.id
      WHERE u.email = ${email}
      LIMIT 1
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = userResult[0]

    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await sql`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${user.id}, ${sessionToken}, NOW() + INTERVAL '7 days')
    `

    const cookieStore = cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
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
