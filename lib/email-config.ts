export interface EmailConfig {
  provider: "resend" | "sendgrid" | "ses" | "console"
  apiKey?: string
  fromEmail: string
  fromName: string
  replyTo?: string
}

export const getEmailConfig = (): EmailConfig => {
  return {
    provider: (process.env.EMAIL_PROVIDER as any) || "console",
    apiKey: process.env.EMAIL_API_KEY,
    fromEmail: process.env.EMAIL_FROM || "hello@n3uralia360.com",
    fromName: process.env.EMAIL_FROM_NAME || "N3urali.art",
    replyTo: process.env.EMAIL_REPLY_TO || "hello@n3uralia360.com",
  }
}

export class EmailProvider {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  async sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case "resend":
          return await this.sendWithResend(to, subject, html, text)
        case "sendgrid":
          return await this.sendWithSendGrid(to, subject, html, text)
        case "ses":
          return await this.sendWithSES(to, subject, html, text)
        default:
          return await this.sendWithConsole(to, subject, html, text)
      }
    } catch (error) {
      console.error("Email sending failed:", error)
      return false
    }
  }

  private async sendWithResend(to: string, subject: string, html: string, text: string): Promise<boolean> {
    if (!this.config.apiKey) {
      console.error("Resend API key not configured")
      return false
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: [to],
        subject,
        html,
        text,
        reply_to: this.config.replyTo,
      }),
    })

    return response.ok
  }

  private async sendWithSendGrid(to: string, subject: string, html: string, text: string): Promise<boolean> {
    if (!this.config.apiKey) {
      console.error("SendGrid API key not configured")
      return false
    }

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject,
          },
        ],
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        reply_to: {
          email: this.config.replyTo,
        },
        content: [
          { type: "text/plain", value: text },
          { type: "text/html", value: html },
        ],
      }),
    })

    return response.ok
  }

  private async sendWithSES(to: string, subject: string, html: string, text: string): Promise<boolean> {
    // AWS SES integration would go here
    console.log("[v0] AWS SES integration not implemented yet")
    return this.sendWithConsole(to, subject, html, text)
  }

  private async sendWithConsole(to: string, subject: string, html: string, text: string): Promise<boolean> {
    console.log(`\n[v0] 📧 EMAIL DEMO - Would send via Vercel:`)
    console.log(`📤 To: ${to}`)
    console.log(`📋 Subject: ${subject}`)
    console.log(`👤 From: ${this.config.fromName} <${this.config.fromEmail}>`)
    console.log(`↩️  Reply-To: ${this.config.replyTo}`)
    console.log(`📝 Content Preview: ${text.substring(0, 150)}${text.length > 150 ? "..." : ""}`)
    console.log(`🚀 Ready for Vercel deployment with real email provider\n`)
    return true
  }
}
