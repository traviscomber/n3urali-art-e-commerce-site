"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface PendingPayment {
  id: string
  user_email: string
  user_name: string
  total_amount: number
  payment_method: string
  payment_status: string
  transaction_hash: string | null
  created_at: string
  items: Array<{
    id: string
    image_id: string
    image_title: string
    price: number
  }>
}

/**
 * Get all pending payments that need admin approval
 */
export async function getPendingPayments() {
  try {
    const supabase = await createClient()

    // Get all orders with pending payment status
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        user_email,
        user_name,
        total_amount,
        payment_method,
        payment_status,
        transaction_hash,
        created_at
      `,
      )
      .eq("payment_status", "pending")
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("[v0] Error fetching pending payments:", ordersError)
      return { success: false, error: ordersError.message, data: [] }
    }

    if (!orders || orders.length === 0) {
      return { success: true, data: [] }
    }

    // Get order items for each order
    const paymentsWithItems: PendingPayment[] = await Promise.all(
      orders.map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select(
            `
            id,
            image_id,
            price,
            images (
              title
            )
          `,
          )
          .eq("order_id", order.id)

        if (itemsError) {
          console.error("[v0] Error fetching order items:", itemsError)
          return {
            ...order,
            items: [],
          }
        }

        return {
          ...order,
          items: items.map((item: any) => ({
            id: item.id,
            image_id: item.image_id,
            image_title: item.images?.title || "Unknown Image",
            price: item.price,
          })),
        }
      }),
    )

    return { success: true, data: paymentsWithItems }
  } catch (error) {
    console.error("[v0] Error in getPendingPayments:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch pending payments",
      data: [],
    }
  }
}

/**
 * Approve a pending payment and create download tokens
 */
export async function approvePayment(orderId: string, adminNote?: string) {
  try {
    console.log("[v0] Starting payment approval for order:", orderId)
    const supabase = await createClient()

    // Get the current user (admin)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      console.log("[v0] User not authenticated")
      return { success: false, error: "Not authenticated" }
    }
    console.log("[v0] Admin user:", user.email)

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("[v0] Order not found:", orderError)
      return { success: false, error: "Order not found" }
    }
    console.log("[v0] Order found:", { id: order.id, itemsCount: order.order_items.length })

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "approved",
        status: "completed",
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("[v0] Error updating order:", updateError)
      return { success: false, error: "Failed to approve payment" }
    }
    console.log("[v0] Order status updated to approved")

    const imageDetails = await Promise.all(
      order.order_items.map(async (item: any) => {
        const { data: image } = await supabase
          .from("images")
          .select("title, original_file_url, file_path")
          .eq("id", item.image_id)
          .single()
        
        console.log("[v0] Image details fetched:", { 
          id: item.image_id, 
          title: image?.title,
          hasOriginalUrl: !!image?.original_file_url,
          hasFilePath: !!image?.file_path,
          originalUrl: image?.original_file_url?.substring(0, 50) + "..."
        })
        
        return { 
          imageId: item.image_id, 
          title: image?.title || "Image",
          originalFileUrl: image?.original_file_url || image?.file_path
        }
      })
    )

    // Create download tokens for each order item
    const downloadTokens: Array<{ token: string; imageTitle: string; downloadUrl: string }> = []
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://n3uralia360.art"
    
    console.log("[v0] Creating download tokens with base URL:", baseUrl)
    
    for (let i = 0; i < order.order_items.length; i++) {
      const item = order.order_items[i]
      const imageDetail = imageDetails[i]
      const downloadToken = `${orderId}-${item.image_id}-${Date.now()}-${Math.random().toString(36).substring(7)}`

      console.log("[v0] Creating download token for image:", {
        imageId: item.image_id,
        title: imageDetail.title,
        token: downloadToken.substring(0, 30) + "..."
      })

      const { error: downloadError } = await supabase.from("downloads").insert({
        download_token: downloadToken,
        image_id: item.image_id,
        order_item_id: item.id,
        user_email: order.user_email,
        download_count: 0,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiry
      })

      if (downloadError) {
        console.error("[v0] Error creating download token:", downloadError)
      } else {
        const downloadUrl = `${baseUrl}/api/download/by-token/${downloadToken}`
        downloadTokens.push({ 
          token: downloadToken, 
          imageTitle: imageDetail.title,
          downloadUrl: downloadUrl
        })
        console.log("[v0] Download token created with URL:", downloadUrl.substring(0, 80) + "...")
      }
    }

    console.log("[v0] Total download tokens created:", downloadTokens.length)
    console.log("[v0] Sample download URLs:", downloadTokens.slice(0, 2).map(dt => dt.downloadUrl))

    revalidatePath("/admin/payments")
    revalidatePath("/simple-admin")
    revalidatePath("/payments")

    const result = {
      success: true,
      data: {
        orderId,
        downloadTokens: downloadTokens.map(dt => dt.token),
        downloadLinks: downloadTokens.map(dt => ({
          token: dt.token,
          imageTitle: dt.imageTitle,
          url: dt.downloadUrl
        })),
        customerEmail: order.user_email,
        customerName: order.user_name,
        totalAmount: order.total_amount,
      },
    }
    
    console.log("[v0] Returning approval result with", result.data.downloadLinks.length, "download links")
    return result
  } catch (error) {
    console.error("[v0] Error in approvePayment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve payment",
    }
  }
}

/**
 * Reject a pending payment
 */
export async function rejectPayment(orderId: string, reason: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "rejected",
        status: "cancelled",
      })
      .eq("id", orderId)

    if (error) {
      console.error("[v0] Error rejecting payment:", error)
      return { success: false, error: "Failed to reject payment" }
    }

    revalidatePath("/admin/payments")
    revalidatePath("/simple-admin")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in rejectPayment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject payment",
    }
  }
}

/**
 * Create a new order from checkout
 */
export async function createOrder(orderData: {
  userEmail: string
  userName: string
  items: Array<{ imageId: string; price: number }>
  totalAmount: number
  paymentMethod: string
}) {
  try {
    const supabase = await createClient()

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_email: orderData.userEmail,
        user_name: orderData.userName,
        total_amount: orderData.totalAmount,
        payment_method: orderData.paymentMethod,
        payment_status: "pending",
        status: "pending",
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error("[v0] Error creating order:", orderError)
      return { success: false, error: "Failed to create order" }
    }

    // Create order items
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      image_id: item.imageId,
      price: item.price,
      download_limit: 10, // Default download limit
      download_count: 0,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("[v0] Error creating order items:", itemsError)
      // Rollback order creation
      await supabase.from("orders").delete().eq("id", order.id)
      return { success: false, error: "Failed to create order items" }
    }

    return { success: true, data: order }
  } catch (error) {
    console.error("[v0] Error in createOrder:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    }
  }
}
