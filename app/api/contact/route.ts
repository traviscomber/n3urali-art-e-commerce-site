import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, interests } = await request.json()

    if (!email || !interests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await resend.emails.send({
      from: 'N3uralia360 <info@n3uralia360.art>',
      to: 'info@n3uralia360.art',
      subject: 'New Contact Form Submission from N3uralia360',
      html: `
        <h2 style="color: #06b6d4;">New Contact Form Submission</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Interests:</strong></p>
        <p>${interests}</p>
        <p><strong>Submitted at:</strong> ${new Date().toISOString()}</p>
      `,
    })

    if (result.error) {
      console.error('[v0] Resend error:', result.error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (error) {
    console.error('[v0] Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
