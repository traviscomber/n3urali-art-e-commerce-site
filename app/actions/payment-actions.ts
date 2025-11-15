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
    console.log("[v0] approvePayment called for order:", orderId)
    
    const supabase = await createClient()

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single()

    console.log("[v0] Order fetch result:", { found: !!order, error: orderError?.message })

    if (orderError || !order) {
      return { success: false, error: "Order not found: " + (orderError?.message || "Unknown error") }
    }

    console.log("[v0] Updating order status to approved...")

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "approved",
        status: "completed",
        approved_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("[v0] Error updating order:", updateError)
      return { success: false, error: "Failed to approve payment: " + updateError.message }
    }

    console.log("[v0] Order approved, creating download tokens for", order.order_items.length, "items")

    // Create download tokens for each order item
    const downloadTokens: string[] = []
    for (const item of order.order_items) {
      const downloadToken = `${orderId}-${item.image_id}-${Date.now()}-${Math.random().toString(36).substring(7)}`

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
        downloadTokens.push(downloadToken)
        console.log("[v0] Created download token:", downloadToken)
      }
    }

    console.log("[v0] Payment approved successfully with", downloadTokens.length, "download tokens")

    revalidatePath("/admin/payments")
    revalidatePath("/simple-admin")
    revalidatePath("/payments")

    return {
      success: true,
      data: {
        orderId,
        downloadTokens,
        customerEmail: order.user_email,
      },
    }
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
    console.log("[v0] rejectPayment called for order:", orderId, "reason:", reason)
    
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
      return { success: false, error: "Failed to reject payment: " + error.message }
    }

    console.log("[v0] Payment rejected successfully")

    revalidatePath("/admin/payments")
    revalidatePath("/simple-admin")
    revalidatePath("/payments")

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
