import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"
import { PasswordManager } from "@/lib/auth/password"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new passwords are required" }, { status: 400 })
    }

    // Validate new password strength
    const passwordValidation = PasswordManager.isStrongPassword(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: "New password does not meet requirements",
          details: passwordValidation.errors,
        },
        { status: 400 },
      )
    }

    const sql = createNeonClient()

    // Get current user and password
    const userResult = await sql`
      SELECT us.user_id, u.encrypted_password
      FROM user_sessions us
      JOIN auth.users u ON us.user_id = u.id
      WHERE us.session_token = ${sessionToken}
      AND us.expires_at > NOW()
      LIMIT 1
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const user = userResult[0]

    // Verify current password
    const isValidPassword = await PasswordManager.verifyPassword(currentPassword, user.encrypted_password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await PasswordManager.hashPassword(newPassword)

    // Update password
    await sql`
      UPDATE auth.users 
      SET encrypted_password = ${hashedNewPassword}, updated_at = NOW()
      WHERE id = ${user.user_id}
    `

    // Invalidate all existing sessions for security
    await sql`
      DELETE FROM user_sessions WHERE user_id = ${user.user_id}
    `

    // Clear current session cookie
    cookieStore.delete("session_token")

    return NextResponse.json({
      message: "Password changed successfully. Please sign in again.",
    })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
