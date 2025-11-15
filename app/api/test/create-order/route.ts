import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get first image to use for test order
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('id, title, price, license_id')
      .limit(1)
      .single()

    if (imagesError || !images) {
      return NextResponse.json({ success: false, error: 'No images found in database' }, { status: 404 })
    }

    // Create test order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_email: 'test@example.com',
        user_name: 'Test User',
        total_amount: images.price || 75,
        status: 'pending',
        payment_method: 'crypto',
        payment_status: 'pending'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order item
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        image_id: images.id,
        license_id: images.license_id,
        price: images.price || 75,
        download_limit: 10,
        download_count: 0
      })

    if (itemError) throw itemError

    return NextResponse.json({ success: true, orderId: order.id, orderDetails: order })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
