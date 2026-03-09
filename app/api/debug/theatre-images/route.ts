import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Get all equirectangular images to see what's actually saved
  const { data: allImages, error: allError } = await supabase
    .from('images')
    .select('id, title, image_format, content_category, file_path, active, original_url, created_at')
    .eq('image_format', 'equirectangular')
    .order('created_at', { ascending: false })

  if (allError) {
    return NextResponse.json({ error: allError.message }, { status: 500 })
  }

  // Count images by content_category
  const withCategory = allImages?.filter(img => img.content_category) || []
  const withoutCategory = allImages?.filter(img => !img.content_category) || []
  
  // Check which ones are from THEATRE folder in Backblaze
  const theatreImages = allImages?.filter(img => img.file_path?.includes('THEATRE/Categories/')) || []

  // Group by content_category
  const grouped: Record<string, any[]> = {}
  allImages?.forEach(img => {
    const category = img.content_category || 'no-category'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push({
      title: img.title,
      file_path: img.file_path,
      active: img.active,
      created_at: img.created_at
    })
  })

  return NextResponse.json({
    summary: {
      total: allImages?.length || 0,
      withContentCategory: withCategory.length,
      withoutContentCategory: withoutCategory.length,
      inTheatreFolder: theatreImages.length
    },
    byCategory: grouped,
    theatreDetails: theatreImages.map(img => ({
      title: img.title,
      content_category: img.content_category,
      file_path: img.file_path,
      active: img.active,
      url: img.original_url
    }))
  })
}
