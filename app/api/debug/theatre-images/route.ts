import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Get all equirectangular images
  const { data: allImages, error: allError } = await supabase
    .from('images')
    .select('id, title, image_format, content_category, file_path, active, created_at')
    .eq('image_format', 'equirectangular')

  if (allError) {
    return NextResponse.json({ error: allError.message }, { status: 500 })
  }

  // Group by content_category
  const grouped: Record<string, any[]> = {}
  allImages?.forEach(img => {
    const category = img.content_category || 'no-category'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(img)
  })

  return NextResponse.json({
    total: allImages?.length || 0,
    active: allImages?.filter(img => img.active).length || 0,
    byCategory: grouped,
    allImages
  })
}
