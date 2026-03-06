import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Check all categories and image counts
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, description')
      .order('name')

    if (catError) throw catError

    // Get image counts by category
    const { data: imageCounts, error: imgError } = await supabase
      .from('images')
      .select('category_id')

    if (imgError) throw imgError

    // Count images per category
    const countsByCategory: Record<string, number> = {}
    imageCounts.forEach((img: any) => {
      const catId = img.category_id
      countsByCategory[catId] = (countsByCategory[catId] || 0) + 1
    })

    // Detailed info for key categories
    const { data: iceSnow, error: iceSnowError } = await supabase
      .from('images')
      .select('id, title, active, image_format, thumbnail_medium_url')
      .eq('category_id', categories?.find((c: any) => c.name === 'Ice & Snow')?.id || '')
      .limit(10)

    const { data: oceanCount, error: oceanError } = await supabase
      .from('images')
      .select('category_id', { count: 'exact' })
      .eq('category_id', categories?.find((c: any) => c.name === 'Ocean')?.id || '')

    return NextResponse.json({
      status: 'success',
      message: 'Database sync verification',
      categories: categories?.map((c: any) => ({
        name: c.name,
        id: c.id,
        imageCount: countsByCategory[c.id] || 0,
      })),
      iceSnowDetails: {
        count: iceSnow?.length || 0,
        images: iceSnow,
      },
      oceanImageCount: oceanCount?.length || 0,
      hasUnderwaterCategory: categories?.some((c: any) => c.name === 'Underwater') || false,
      hasForestCategory: categories?.some((c: any) => c.name === 'Forest') || false,
    })
  } catch (error) {
    console.error('[v0] Sync verification error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to verify sync',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
