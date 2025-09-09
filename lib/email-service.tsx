import { EmailProvider, getEmailConfig } from "./email-config"

interface EmailTemplate {
  to: string
  subject: string
  html: string
  text: string
}

interface DownloadNotification {
  customerEmail: string
  customerName: string
  orderNumber: string
  items: Array<{
    title: string
    licenseType: string
    downloadUrl: string
  }>
}

interface OrderConfirmation {
  customerEmail: string
  customerName: string
  orderNumber: string
  total: number
  paymentMethod: string
  items: Array<{
    title: string
    licenseType: string
    price: number
  }>
}

export class EmailService {
  private static instance: EmailService
  private provider: EmailProvider

  private constructor() {
    const config = getEmailConfig()
    this.provider = new EmailProvider(config)
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendDownloadNotification(notification: DownloadNotification): Promise<boolean> {
    try {
      const template = this.generateDownloadTemplate(notification)
      return await this.provider.sendEmail(template.to, template.subject, template.html, template.text)
    } catch (error) {
      console.error("Download notification failed:", error)
      return false
    }
  }

  async sendOrderConfirmation(confirmation: OrderConfirmation): Promise<boolean> {
    try {
      const template = this.generateOrderConfirmationTemplate(confirmation)
      return await this.provider.sendEmail(template.to, template.subject, template.html, template.text)
    } catch (error) {
      console.error("Order confirmation failed:", error)
      return false
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const template = this.generateWelcomeTemplate(email, name)
      return await this.provider.sendEmail(template.to, template.subject, template.html, template.text)
    } catch (error) {
      console.error("Welcome email failed:", error)
      return false
    }
  }

  private generateDownloadTemplate(notification: DownloadNotification): EmailTemplate {
    const itemsList = notification.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.title}</strong><br>
          <small style="color: #666;">${item.licenseType.toUpperCase()} License</small>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          <a href="${item.downloadUrl}" 
             style="background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Download
          </a>
        </td>
      </tr>
    `,
      )
      .join("")

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Your N3urali.art Downloads</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #007bff; margin: 0;">N3urali.art</h1>
              <p style="color: #666; margin: 5px 0;">Premium 360° Photography</p>
            </div>
            
            <h2 style="color: #333;">Your Downloads Are Ready!</h2>
            
            <p>Hi ${notification.customerName},</p>
            
            <p>Thank you for your purchase! Your high-quality 360° images are now available for download.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #007bff;">Order #${notification.orderNumber}</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #e9ecef;">
                    <th style="padding: 12px; text-align: left;">Image</th>
                    <th style="padding: 12px; text-align: center;">Download</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <strong>📋 Important Information:</strong>
              <ul style="margin: 10px 0;">
                <li>Download links expire in <strong>24 hours</strong></li>
                <li>Each purchase includes <strong>5 download attempts</strong></li>
                <li>Files are high-resolution and perfect for professional use</li>
                <li>Keep your download links secure and private</li>
              </ul>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <strong>💡 Usage Tips:</strong>
              <ul style="margin: 10px 0;">
                <li>Use 360° viewers like Pannellum or A-Frame for web display</li>
                <li>Compatible with VR headsets and immersive experiences</li>
                <li>Perfect for virtual tours, real estate, and marketing</li>
              </ul>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="text-align: center; color: #666;">
              Need help? Contact us at <a href="mailto:support@n3urali.art" style="color: #007bff;">support@n3urali.art</a><br>
              Visit our gallery: <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://n3urali.art"}" style="color: #007bff;">n3urali.art</a>
            </p>
            
            <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
              Best regards,<br>
              <strong>The N3urali.art Team</strong>
            </p>
          </div>
        </body>
      </html>
    `

    const text = `
      N3urali.art - Your Downloads Are Ready!
      
      Hi ${notification.customerName},
      
      Thank you for your purchase! Your high-quality 360° images are now available for download.
      
      Order #${notification.orderNumber}
      
      ${notification.items
        .map(
          (item) => `
      ${item.title} (${item.licenseType.toUpperCase()} License)
      Download: ${item.downloadUrl}
      `,
        )
        .join("\n")}
      
      Important Information:
      - Download links expire in 24 hours
      - Each purchase includes 5 download attempts
      - Files are high-resolution and perfect for professional use
      - Keep your download links secure and private
      
      Usage Tips:
      - Use 360° viewers like Pannellum or A-Frame for web display
      - Compatible with VR headsets and immersive experiences
      - Perfect for virtual tours, real estate, and marketing
      
      Need help? Contact us at support@n3urali.art
      Visit our gallery: ${process.env.NEXT_PUBLIC_APP_URL || "https://n3urali.art"}
      
      Best regards,
      The N3urali.art Team
    `

    return {
      to: notification.customerEmail,
      subject: `🎉 Your N3urali.art Downloads - Order #${notification.orderNumber}`,
      html,
      text,
    }
  }

  private generateOrderConfirmationTemplate(confirmation: OrderConfirmation): EmailTemplate {
    const itemsList = confirmation.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.title}</strong><br>
          <small style="color: #666;">${item.licenseType.toUpperCase()} License</small>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          $${item.price.toFixed(2)}
        </td>
      </tr>
    `,
      )
      .join("")

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation - N3urali.art</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #007bff; margin: 0;">N3urali.art</h1>
              <p style="color: #666; margin: 5px 0;">Premium 360° Photography</p>
            </div>
            
            <h2 style="color: #28a745;">✅ Order Confirmed!</h2>
            
            <p>Hi ${confirmation.customerName},</p>
            
            <p>Thank you for your order! We've received your payment and are processing your download links.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #007bff;">Order #${confirmation.orderNumber}</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #e9ecef;">
                    <th style="padding: 12px; text-align: left;">Item</th>
                    <th style="padding: 12px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
                <tfoot>
                  <tr style="background: #e9ecef; font-weight: bold;">
                    <td style="padding: 12px;">Total</td>
                    <td style="padding: 12px; text-align: right;">$${confirmation.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              
              <p style="margin-top: 15px; color: #666;">
                Payment Method: ${confirmation.paymentMethod === "crypto" ? "Cryptocurrency" : "Credit Card"}
              </p>
            </div>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <strong>📧 What's Next?</strong>
              <p style="margin: 10px 0;">You'll receive another email with your download links within the next few minutes. If you don't see it, please check your spam folder.</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="text-align: center; color: #666;">
              Questions about your order? Contact us at <a href="mailto:support@n3urali.art" style="color: #007bff;">support@n3urali.art</a>
            </p>
            
            <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
              Best regards,<br>
              <strong>The N3urali.art Team</strong>
            </p>
          </div>
        </body>
      </html>
    `

    const text = `
      N3urali.art - Order Confirmed!
      
      Hi ${confirmation.customerName},
      
      Thank you for your order! We've received your payment and are processing your download links.
      
      Order #${confirmation.orderNumber}
      
      ${confirmation.items.map((item) => `${item.title} (${item.licenseType.toUpperCase()}) - $${item.price.toFixed(2)}`).join("\n")}
      
      Total: $${confirmation.total.toFixed(2)}
      Payment Method: ${confirmation.paymentMethod === "crypto" ? "Cryptocurrency" : "Credit Card"}
      
      What's Next?
      You'll receive another email with your download links within the next few minutes. If you don't see it, please check your spam folder.
      
      Questions about your order? Contact us at support@n3urali.art
      
      Best regards,
      The N3urali.art Team
    `

    return {
      to: confirmation.customerEmail,
      subject: `✅ Order Confirmed #${confirmation.orderNumber} - N3urali.art`,
      html,
      text,
    }
  }

  private generateWelcomeTemplate(email: string, name: string): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to N3urali.art</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #007bff; margin: 0;">Welcome to N3urali.art!</h1>
              <p style="color: #666; margin: 5px 0;">Premium 360° Photography</p>
            </div>
            
            <h2 style="color: #333;">Hi ${name}! 👋</h2>
            
            <p>Welcome to N3urali.art, your destination for premium 360° photography and immersive visual experiences.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #007bff;">🌟 What You Can Expect:</h3>
              <ul style="margin: 10px 0;">
                <li><strong>High-Quality 360° Images:</strong> Professional-grade panoramic photography</li>
                <li><strong>Multiple License Options:</strong> Choose the right license for your project</li>
                <li><strong>Instant Downloads:</strong> Get your files immediately after purchase</li>
                <li><strong>VR-Ready Content:</strong> Perfect for virtual reality experiences</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://n3urali.art"}/gallery" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Explore Our Gallery
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="text-align: center; color: #666;">
              Have questions? We're here to help at <a href="mailto:support@n3urali.art" style="color: #007bff;">support@n3urali.art</a>
            </p>
            
            <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
              Best regards,<br>
              <strong>The N3urali.art Team</strong>
            </p>
          </div>
        </body>
      </html>
    `

    const text = `
      Welcome to N3urali.art!
      
      Hi ${name}!
      
      Welcome to N3urali.art, your destination for premium 360° photography and immersive visual experiences.
      
      What You Can Expect:
      - High-Quality 360° Images: Professional-grade panoramic photography
      - Multiple License Options: Choose the right license for your project
      - Instant Downloads: Get your files immediately after purchase
      - VR-Ready Content: Perfect for virtual reality experiences
      
      Explore our gallery: ${process.env.NEXT_PUBLIC_APP_URL || "https://n3urali.art"}/gallery
      
      Have questions? We're here to help at support@n3urali.art
      
      Best regards,
      The N3urali.art Team
    `

    return {
      to: email,
      subject: "🎉 Welcome to N3urali.art - Premium 360° Photography",
      html,
      text,
    }
  }
}
