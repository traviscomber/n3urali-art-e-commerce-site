import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const sql = createNeonClient()

    const sessionResult = await sql`
      SELECT us.user_id, up.full_name, up.is_admin, u.email
      FROM user_sessions us
      JOIN user_profiles up ON us.user_id = up.id
      JOIN auth.users u ON up.id = u.id
      WHERE us.session_token = ${sessionToken}
      AND us.expires_at > NOW()
      LIMIT 1
    `

    if (sessionResult.length === 0) {
      cookieStore.delete("session_token")
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const session = sessionResult[0]

    return NextResponse.json({
      user: {
        id: session.user_id,
        email: session.email,
        user_metadata: {
          full_name: session.full_name,
          is_admin: session.is_admin,
        },
      },
    })
  } catch (error) {
    console.error("Session validation error:", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (sessionToken) {
      const sql = createNeonClient()

      await sql`
        DELETE FROM user_sessions WHERE session_token = ${sessionToken}
      `
    }

    cookieStore.delete("session_token")

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
