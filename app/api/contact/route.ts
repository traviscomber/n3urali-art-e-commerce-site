import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  console.log('[v0] API route hit: /api/contact')
  console.log('[v0] RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
  
  if (!process.env.RESEND_API_KEY) {
    console.error('[v0] RESEND_API_KEY not set in environment variables')
    return NextResponse.json(
      { error: 'Email service not configured. Please contact the administrator.' },
      { status: 500 }
    )
  }
  
  try {
    const body = await request.json()
    console.log('[v0] Request body received:', body)
    
    const { email, interests, message } = body

    if (!email || !interests) {
      console.log('[v0] Missing fields - email:', email, 'interests:', interests)
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('[v0] Sending confirmation email to customer:', email)
    console.log('[v0] Resend instance created:', !!resend)
    
    // Send confirmation email to customer with copy of their submission
    const result = await resend.emails.send({
      from: 'N3uralia360 <info@n3uralia360.art>',
      to: email,
      replyTo: 'info@n3uralia360.art',
      subject: 'We Received Your Inquiry - N3uralia360',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">✨ Your Vision is on its Way!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Thank you for connecting with us</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px; background-color: #ffffff;">
              <!-- Welcome Message -->
              <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for reaching out to <strong>N3uralia360</strong>. We're thrilled to learn more about your vision for immersive experiences.
              </p>

              <!-- Submission Summary Box -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #06b6d4; border-radius: 8px; padding: 25px; margin: 30px 0;">
                <h3 style="color: #0369a1; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Your Submission Summary</h3>
                
                <div style="margin-bottom: 16px;">
                  <p style="color: #475569; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Email Address</p>
                  <p style="color: #0369a1; margin: 0; font-size: 15px; word-break: break-all;">
                    <a href="mailto:${email}" style="color: #0369a1; text-decoration: none; font-weight: 500;">${email}</a>
                  </p>
                </div>

                <div style="margin-bottom: 16px;">
                  <p style="color: #475569; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Interests</p>
                  <p style="color: #1e293b; margin: 0; font-size: 15px;">${interests}</p>
                </div>

                ${message ? `
                <div style="margin-bottom: 0;">
                  <p style="color: #475569; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Your Message</p>
                  <p style="color: #1e293b; margin: 0; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                </div>
                ` : ''}
              </div>

              <!-- Next Steps -->
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h4 style="color: #1e293b; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">What's Next?</h4>
                <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.6;">Our team will carefully review your inquiry and reach out within 24-48 hours to discuss how we can bring your immersive vision to life. We'll provide tailored solutions and next steps based on your specific needs.</p>
              </div>

              <!-- Contact Info -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; margin: 0 0 12px 0; font-size: 14px; line-height: 1.6;">
                  <strong>Questions or want to reach out?</strong>
                </p>
                <p style="color: #0369a1; margin: 8px 0 0 0; font-size: 15px;">
                  <strong style="color: #1e293b;">Email:</strong> <a href="mailto:info@n3uralia360.art" style="color: #0369a1; text-decoration: none;">info@n3uralia360.art</a>
                </p>
                <p style="color: #0369a1; margin: 8px 0 0 0; font-size: 15px;">
                  <strong style="color: #1e293b;">WhatsApp:</strong> <a href="https://wa.me/6282340137013" style="color: #0369a1; text-decoration: none;">+62 823 4013 7013</a>
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #0f172a; padding: 30px; text-align: center; border-top: 4px solid #06b6d4;">
              <h4 style="color: #06b6d4; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;">N3URALIA360</h4>
              <p style="color: #94a3b8; margin: 0 0 15px 0; font-size: 13px;">Immersive Experiences • 360° Creative Solutions</p>
              
              <p style="color: #64748b; margin: 0 0 20px 0; font-size: 12px; line-height: 1.6;">
                We create dreamlike immersive experiences that bridge technology, art, and creativity. Explore real-world environments reimagined through innovative 360° visualization.
              </p>
              
              <p style="color: #475569; margin: 0; font-size: 11px;">
                © 2026 N3uralia360. All rights reserved.<br>
                <a href="https://www.n3uralia360.art" style="color: #06b6d4; text-decoration: none;">Visit our website</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    console.log('[v0] Email response:', result)

    if (result.error) {
      console.error('[v0] Email error:', result.error)
      const errorMessage = typeof result.error === 'string' 
        ? result.error 
        : (result.error as any).message || 'Failed to send email'
      console.error('[v0] Error message:', errorMessage)
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    console.log('[v0] Email sent successfully, ID:', result.data?.id)
    
    // Send a copy to admin at info@n3uralia360.art (with same beautiful format)
    const adminResult = await resend.emails.send({
      from: 'N3uralia360 <info@n3uralia360.art>',
      to: 'info@n3uralia360.art',
      replyTo: 'info@n3uralia360.art',
      subject: `New Lead - ${email}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🌟 New Lead Inquiry</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Incoming Opportunity</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px; background-color: #ffffff;">
              <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                A new inquiry has been received from a potential client interested in N3uralia360's immersive experiences.
              </p>

              <!-- Lead Details Box -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #06b6d4; border-radius: 8px; padding: 25px; margin: 30px 0;">
                <h3 style="color: #0369a1; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Lead Details</h3>
                
                <div style="margin-bottom: 16px;">
                  <p style="color: #475569; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Client Email</p>
                  <p style="color: #0369a1; margin: 0; font-size: 15px; word-break: break-all;">
                    <a href="mailto:${email}" style="color: #0369a1; text-decoration: none; font-weight: 500;">${email}</a>
                  </p>
                </div>

                <div style="margin-bottom: 16px;">
                  <p style="color: #475569; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Interests</p>
                  <p style="color: #1e293b; margin: 0; font-size: 15px;">${interests}</p>
                </div>

                ${message ? `
                <div style="margin-bottom: 0;">
                  <p style="color: #475569; margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Client Message</p>
                  <p style="color: #1e293b; margin: 0; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                </div>
                ` : ''}
              </div>

              <!-- Submission Time -->
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 30px 0;">
                <p style="color: #64748b; margin: 0; font-size: 13px;">
                  <strong style="color: #1e293b;">Received:</strong> ${new Date().toLocaleString()}
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #0f172a; padding: 30px; text-align: center; border-top: 4px solid #06b6d4;">
              <h4 style="color: #06b6d4; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;">N3URALIA360</h4>
              <p style="color: #94a3b8; margin: 0 0 15px 0; font-size: 13px;">Immersive Experiences • 360° Creative Solutions</p>
              <p style="color: #64748b; margin: 0; font-size: 12px;">© 2026 N3uralia360. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    console.log('[v0] Admin copy sent, ID:', adminResult.data?.id)

    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (error) {
    console.error('[v0] Contact form error:', error)
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string'
      ? error
      : 'An unexpected error occurred'
    console.error('[v0] Error message:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
