export async function sendPasswordResetEmail(email: string, token: string, userName: string): Promise<boolean> {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`

    console.log(`[PASSWORD RESET] Send to: ${email}`)
    console.log(`[PASSWORD RESET] Reset URL: ${resetUrl}`)

    // TODO: Implement actual email sending
    // For now, we'll log the reset link

    return true
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return false
  }
}

export function generatePasswordResetEmailHTML(userName: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Reset Your Password - N3urali.art</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset Request</h1>
            </div>
            <div class="content">
                <h2>Hi ${userName},</h2>
                <p>We received a request to reset your password for your N3urali.art account.</p>
                
                <p>Click the button below to reset your password:</p>
                
                <a href="${resetUrl}" class="button">Reset Password</a>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${resetUrl}</p>
                
                <div class="warning">
                    <strong>Security Notice:</strong>
                    <ul>
                        <li>This reset link will expire in 1 hour</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Your password will remain unchanged until you click the link above</li>
                    </ul>
                </div>
                
                <p>If you continue to have problems, please contact our support team.</p>
                
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
