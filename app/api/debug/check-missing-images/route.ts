import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Find the Oceans and Ice & Snow category IDs
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .in('name', ['Oceans', 'Ice & Snow', 'Ice', 'Snow'])

    if (catError) throw catError

    const categoryIds = categories?.map(c => c.id) || []
    const categoryNames = categories?.map(c => c.name) || []

    console.log('[v0] Found categories:', categoryNames, categoryIds)

    // Get image stats for these categories
    const { data: imageStats } = await supabase
      .from('images')
      .select('id, active, thumbnail_medium_url, category_id, title')
      .in('category_id', categoryIds)

    const totalInCategory = imageStats?.length || 0
    const activeImages = imageStats?.filter(i => i.active && i.thumbnail_medium_url)?.length || 0
    const inactiveImages = imageStats?.filter(i => !i.active)?.length || 0
    const missingThumbnails = imageStats?.filter(i => !i.thumbnail_medium_url)?.length || 0

    console.log('[v0] Image stats for Oceans/Ice categories:', {
      total: totalInCategory,
      active: activeImages,
      inactive: inactiveImages,
      missingThumbnails: missingThumbnails,
    })

    return NextResponse.json({
      status: 'ok',
      categories: categoryNames,
      stats: {
        total: totalInCategory,
        active: activeImages,
        inactive: inactiveImages,
        missingThumbnails: missingThumbnails,
      },
      sampleImages: imageStats?.slice(0, 5),
      recommendation: inactiveImages > 0 || missingThumbnails > 0 ? 
        'Run restore-missing-images.sql script to reactivate images' : 
        'Images appear to be properly configured',
    })
  } catch (error) {
    console.error('[v0] Debug error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
