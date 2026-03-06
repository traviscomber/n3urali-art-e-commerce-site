import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  console.log('[v0] API route hit: /api/contact')
  console.log('[v0] RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
  
  // Check if RESEND_API_KEY is set
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
    
    const { email, interests } = body

    if (!email || !interests) {
      console.log('[v0] Missing fields - email:', email, 'interests:', interests)
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('[v0] Sending email via Resend to:', 'info@n3uralia360.art')
    console.log('[v0] Resend instance created:', !!resend)
    
    const result = await resend.emails.send({
      from: 'N3uralia360 <info@n3uralia360.art>',
      to: 'info@n3uralia360.art',
      replyTo: 'info@n3uralia360.art',
      subject: 'New Contact Form Submission from N3uralia360',
      html: `
        <h2 style="color: #06b6d4;">New Contact Form Submission</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Interests:</strong></p>
        <p>${interests}</p>
        <p><strong>Submitted at:</strong> ${new Date().toISOString()}</p>
      `,
    })

    console.log('[v0] Resend response:', result)

    if (result.error) {
      console.error('[v0] Resend error object:', result.error)
      const errorMessage = typeof result.error === 'string' 
        ? result.error 
        : (result.error as any).message || 'Failed to send email'
      console.error('[v0] Extracted error message:', errorMessage)
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
    console.error('[v0] Extracted error message:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
