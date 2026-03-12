import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all equirectangular images that have a content_category set
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('id, title, original_url, image_format, description, tags, thumbnail_medium_url, upscaled_url, content_category, file_path, active, created_at')
      .eq('image_format', 'equirectangular')
      .eq('active', true)
      .not('content_category', 'is', null)
      .order('content_category', { ascending: true })
      .order('created_at', { ascending: false })

    if (imagesError) {
      console.error('[v0] Error fetching theatre images:', imagesError)
      return NextResponse.json(
        { error: 'Failed to fetch theatre images', details: imagesError.message },
        { status: 500 }
      )
    }

    // Fetch collections
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (collectionsError) {
      console.error('[v0] Error fetching collections:', collectionsError)
    }

    console.log(`[v0] Fetched ${images?.length || 0} theatre images and ${collections?.length || 0} collections`)

    return NextResponse.json({
      images: images || [],
      collections: collections || [],
      count: images?.length || 0,
    })
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
