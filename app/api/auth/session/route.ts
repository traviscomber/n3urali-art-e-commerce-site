import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // In a proper Supabase setup, you'd use supabase.auth.getUser() with the session token
    // For this migration, we'll just return null to indicate no session
    return NextResponse.json({ user: null }, { status: 200 })
  } catch (error) {
    console.error("Session validation error:", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("session_token")

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
