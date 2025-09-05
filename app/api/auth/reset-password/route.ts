import { type NextRequest, NextResponse } from "next/server"
import { validatePasswordResetToken, resetPassword } from "@/lib/auth/password-reset"
import { validatePassword } from "@/lib/auth/password"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: "Password does not meet requirements",
          details: passwordValidation.errors,
        },
        { status: 400 },
      )
    }

    const result = await resetPassword(token, password)

    if (result.success) {
      return NextResponse.json({
        message: "Password reset successfully. Please log in with your new password.",
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 })
    }

    const validation = await validatePasswordResetToken(token)

    if (validation.valid) {
      return NextResponse.json({
        valid: true,
        email: validation.email,
      })
    } else {
      return NextResponse.json({ valid: false, error: validation.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
