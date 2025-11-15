import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()
    
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get order items with images
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        images (
          id,
          title,
          original_file_url
        )
      `)
      .eq('order_id', orderId)

    if (itemsError) throw itemsError

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ success: false, error: 'No items in order' }, { status: 404 })
    }

    // Generate download tokens
    const downloadLinks = []
    
    for (const item of orderItems) {
      const token = nanoid(32)
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 year

      // Create download record (simulation - would actually insert to DB)
      const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://n3uralia360.art'}/api/download/by-token/${token}`
      
      downloadLinks.push({
        token,
        url: downloadUrl,
        imageTitle: item.images?.title || 'Untitled',
        originalFileUrl: item.images?.original_file_url || '',
        expiresAt: expiresAt.toISOString()
      })
    }

    return NextResponse.json({ 
      success: true, 
      downloadLinks,
      message: 'Tokens generated successfully (simulation - not saved to DB)'
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
