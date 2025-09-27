import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PasswordManager } from "@/lib/auth/password"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
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

    const supabase = await createClient()

    const { data: userResult, error } = await supabase
      .from("user_sessions")
      .select(`
        user_id,
        users!inner(encrypted_password)
      `)
      .eq("session_token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .single()

    if (error || !userResult) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const user = userResult
    const userData = user.users as any

    // Verify current password
    const isValidPassword = await PasswordManager.verifyPassword(currentPassword, userData.encrypted_password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await PasswordManager.hashPassword(newPassword)

    await supabase
      .from("users")
      .update({
        encrypted_password: hashedNewPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.user_id)

    await supabase.from("user_sessions").delete().eq("user_id", user.user_id)

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
