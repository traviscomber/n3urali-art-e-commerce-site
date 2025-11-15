import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    const { data: items, error } = await supabase
      .from('order_items')
      .select(`
        *,
        images (
          id,
          title,
          original_file_url,
          file_path
        )
      `)
      .eq('order_id', orderId)

    if (error) throw error

    const flattenedItems = items?.map(item => ({
      ...item,
      title: item.images?.title,
      original_file_url: item.images?.original_file_url,
      file_path: item.images?.file_path
    }))

    return NextResponse.json({ success: true, items: flattenedItems || [] })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
