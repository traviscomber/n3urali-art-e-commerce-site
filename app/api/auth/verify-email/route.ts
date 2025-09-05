import { type NextRequest, NextResponse } from "next/server"
import { verifyEmailToken } from "@/lib/auth/email-verification"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    const result = await verifyEmailToken(token)

    if (result.success) {
      return NextResponse.json({
        message: "Email verified successfully",
        userId: result.userId,
        email: result.email,
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    const result = await verifyEmailToken(token)

    if (result.success) {
      // Redirect to success page
      return NextResponse.redirect(new URL("/auth/email-verified", request.url))
    } else {
      // Redirect to error page with error message
      return NextResponse.redirect(
        new URL(
          `/auth/email-verification-failed?error=${encodeURIComponent(result.error || "Unknown error")}`,
          request.url,
        ),
      )
    }
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(
      new URL("/auth/email-verification-failed?error=Internal%20server%20error", request.url),
    )
  }
}
