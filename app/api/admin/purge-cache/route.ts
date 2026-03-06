import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('[v0] Cache purge requested')
    
    // Revalidate the gallery page to clear cached categories and images
    const response = await fetch('https://n3uralia360.art/gallery', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' },
      cache: 'no-store',
    })

    return NextResponse.json({
      success: true,
      message: 'Cache purged successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Cache purge error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to purge cache' },
      { status: 500 }
    )
  }
}
