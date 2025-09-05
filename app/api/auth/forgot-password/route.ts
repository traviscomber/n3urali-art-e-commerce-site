import { type NextRequest, NextResponse } from "next/server"
import { createPasswordResetToken } from "@/lib/auth/password-reset"
import { sendPasswordResetEmail } from "@/lib/email/password-reset-email"
import { createNeonClient } from "@/lib/neon/client"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Get client IP and user agent for security logging
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const result = await createPasswordResetToken(email, ipAddress, userAgent)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // If we have a token, send the email
    if (result.token) {
      try {
        // Get user name for personalized email
        const sql = createNeonClient()
        const userResult = await sql`
          SELECT up.full_name
          FROM user_profiles up
          JOIN auth.users u ON up.id = u.id
          WHERE u.email = ${email}
          LIMIT 1
        `

        const userName = userResult.length > 0 ? userResult[0].full_name : "User"

        await sendPasswordResetEmail(email, result.token, userName)
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError)
        // Don't fail the request if email sending fails
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: "If an account with that email exists, we've sent a password reset link.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
