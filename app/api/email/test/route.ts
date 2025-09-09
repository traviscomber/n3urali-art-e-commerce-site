import { type NextRequest, NextResponse } from "next/server"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { type, email, data } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    const emailService = EmailService.getInstance()
    let success = false

    switch (type) {
      case "welcome":
        success = await emailService.sendWelcomeEmail(email, data?.name || "Test User")
        break

      case "order-confirmation":
        success = await emailService.sendOrderConfirmation({
          customerEmail: email,
          customerName: data?.name || "Test User",
          orderNumber: "TEST-" + Date.now(),
          total: 99.99,
          paymentMethod: "crypto",
          items: [
            {
              title: "Test 360° Image",
              licenseType: "standard",
              price: 99.99,
            },
          ],
        })
        break

      case "download-notification":
        success = await emailService.sendDownloadNotification({
          customerEmail: email,
          customerName: data?.name || "Test User",
          orderNumber: "TEST-" + Date.now(),
          items: [
            {
              title: "Test 360° Image",
              licenseType: "standard",
              downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/download/test-token`,
            },
          ],
        })
        break

      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
    }

    return NextResponse.json({
      success,
      message: success ? "Email sent successfully" : "Email sending failed",
    })
  } catch (error) {
    console.error("Email test error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
