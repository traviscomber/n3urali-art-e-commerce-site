import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all categories from the database
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, description')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching categories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: error.message },
        { status: 500 }
      )
    }

    console.log('[v0] Fetched', categories?.length || 0, 'categories from database')

    return NextResponse.json({
      success: true,
      categories: categories || [],
      total: categories?.length || 0,
    })
  } catch (error) {
    console.error('[v0] Unexpected error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
