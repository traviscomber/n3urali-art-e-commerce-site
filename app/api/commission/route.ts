import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // Store commission in database
    const { data, error } = await supabase.from('commissions').insert([
      {
        organization: body.organization,
        contact_name: body.name,
        contact_email: body.email,
        contact_phone: body.phone,
        brief_description: body.briefDescription,
        venue_type: body.venue,
        target_audience: body.targetAudience,
        budget_range: body.budget,
        timeline: body.timeline,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    ])

    if (error) throw error

    // TODO: Send email notification to admin
    console.log('[v0] Commission submitted:', { organization: body.organization, email: body.email })

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('[v0] Commission submission error:', error)
    return NextResponse.json({ error: 'Failed to submit commission' }, { status: 500 })
  }
}
