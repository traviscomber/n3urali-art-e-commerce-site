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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✨ Your Vision is on its Way!</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #334155; margin-bottom: 20px;">Thank you for reaching out to N3uralia360.</p>
            
            <div style="background: white; border-left: 4px solid #06b6d4; padding: 15px; margin: 20px 0;">
              <h3 style="color: #06b6d4; margin-top: 0;">Your Submission Summary</h3>
              <p style="color: #475569; margin: 8px 0;"><strong>Email:</strong> ${email}</p>
              <p style="color: #475569; margin: 8px 0;"><strong>Interests:</strong> ${interests}</p>
              ${message ? `<p style="color: #475569; margin: 8px 0;"><strong>Your Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>` : ''}
            </div>
            
            <p style="color: #64748b; line-height: 1.6;">We're excited to explore what's possible for your immersive experience. Our team will review your inquiry and connect with you shortly to discuss how we can bring your ideas to life.</p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            
            <p style="color: #94a3b8; font-size: 12px;">N3uralia360 | Immersive Experiences</p>
            <p style="color: #94a3b8; font-size: 12px;">If you have any questions, reply to this email and we'll get back to you soon.</p>
          </div>
        </div>
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
