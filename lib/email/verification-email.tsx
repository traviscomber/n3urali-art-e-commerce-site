// Email service for sending verification emails
// This is a basic implementation - in production, you'd use a service like SendGrid, Mailgun, etc.

export interface EmailConfig {
  from: string
  to: string
  subject: string
  html: string
}

export async function sendVerificationEmail(email: string, token: string, userName: string): Promise<boolean> {
  try {
    // In production, replace this with your email service
    // For now, we'll log the verification link
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`

    console.log(`[EMAIL VERIFICATION] Send to: ${email}`)
    console.log(`[EMAIL VERIFICATION] Verification URL: ${verificationUrl}`)

    // TODO: Implement actual email sending
    // Example with a hypothetical email service:
    /*
    const emailConfig: EmailConfig = {
      from: process.env.FROM_EMAIL || 'noreply@n3urali.art',
      to: email,
      subject: 'Verify your email address - N3urali.art',
      html: generateVerificationEmailHTML(userName, verificationUrl)
    }
    
    await emailService.send(emailConfig)
    */

    return true
  } catch (error) {
    console.error("Error sending verification email:", error)
    return false
  }
}

function generateVerificationEmailHTML(userName: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Verify Your Email - N3urali.art</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to N3urali.art!</h1>
            </div>
            <div class="content">
                <h2>Hi ${userName},</h2>
                <p>Thank you for signing up for N3urali.art! To complete your registration and start exploring our collection of AI-generated neural art, please verify your email address.</p>
                
                <p>Click the button below to verify your email:</p>
                
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
                
                <p><strong>This verification link will expire in 24 hours.</strong></p>
                
                <p>If you didn't create an account with us, please ignore this email.</p>
                
                <p>Best regards,<br>The N3urali.art Team</p>
            </div>
            <div class="footer">
                <p>© 2024 N3urali.art. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

export { generateVerificationEmailHTML }
