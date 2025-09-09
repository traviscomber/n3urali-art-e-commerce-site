import { type NextRequest, NextResponse } from "next/server"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message } = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields: to, subject, message" }, { status: 400 })
    }

    const emailService = new EmailService()

    const success = await emailService.sendDownloadEmail(
      to,
      "Demo Download Link",
      "https://demo-download-link.com/token123",
      "Demo Image",
      "exclusive",
    )

    return NextResponse.json({
      success,
      message: success ? `Demo email sent to ${to} from hello@n3uralia360.com` : "Failed to send demo email",
      demoMode: true,
      fromEmail: "hello@n3uralia360.com",
    })
  } catch (error) {
    console.error("Demo email error:", error)
    return NextResponse.json({ error: "Failed to send demo email" }, { status: 500 })
  }
}
