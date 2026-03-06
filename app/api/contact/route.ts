export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, interests } = body

    // Here you would integrate with your email service (e.g., Resend, SendGrid, etc.)
    // For now, this is a placeholder that would connect to info@n3uralia360.art

    console.log('Contact form submission:', { email, interests })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
