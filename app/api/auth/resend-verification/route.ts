import { type NextRequest, NextResponse } from "next/server"
import { resendVerificationEmail } from "@/lib/auth/email-verification"
import { sendVerificationEmail } from "@/lib/email/verification-email"

export async function POST(request: NextRequest) {
  try {
    const { userId, email, userName } = await request.json()

    if (!userId || !email || !userName) {
      return NextResponse.json({ error: "User ID, email, and name are required" }, { status: 400 })
    }

    const token = await resendVerificationEmail(userId, email)
    const emailSent = await sendVerificationEmail(email, token, userName)

    if (emailSent) {
      return NextResponse.json({
        message: "Verification email sent successfully",
      })
    } else {
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Resend verification email error:", error)

    if (error instanceof Error && error.message.includes("wait 5 minutes")) {
      return NextResponse.json({ error: error.message }, { status: 429 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
