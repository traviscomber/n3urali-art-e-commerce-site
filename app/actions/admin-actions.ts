"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createImageWithCategory(imageData: {
  title: string
  description: string
  category: string
  price: number
  file_url: string
  preview_url: string
  thumbnail_url: string
}) {
  try {
    console.log("[v0] Starting image creation with data:", imageData)
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Authentication required")
    }

    console.log("[v0] Looking up category:", imageData.category)
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", imageData.category)
      .single()

    let categoryId: string

    if (categoryError || !categoryData) {
      console.log("[v0] Category not found, creating new category:", imageData.category)
      // Create new category if it doesn't exist
      const { data: newCategory, error: createError } = await supabase
        .from("categories")
        .insert([
          {
            name: imageData.category,
            description: `Auto-created category for ${imageData.category}`,
            active: true,
            sort_order: 0,
          },
        ])
        .select("id")
        .single()

      if (createError) {
        console.error("[v0] Category creation error:", createError)
        throw new Error(`Failed to create category: ${createError.message}`)
      }

      categoryId = newCategory.id
      console.log("[v0] Created new category with ID:", categoryId)
    } else {
      categoryId = categoryData.id
      console.log("[v0] Found existing category with ID:", categoryId)
    }

    console.log("[v0] Inserting image with category_id:", categoryId)
    const { data, error } = await supabase
      .from("images")
      .insert([
        {
          title: imageData.title,
          description: imageData.description,
          category_id: categoryId,
          price: imageData.price,
          file_url: imageData.file_url,
          preview_url: imageData.preview_url,
          thumbnail_url: imageData.thumbnail_url,
          active: true,
          featured: false,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Image insertion error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("[v0] Image created successfully:", data)
    revalidatePath("/simple-admin")
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Server action error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getImages() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Authentication required")
    }

    const { data, error } = await supabase
      .from("images")
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching images:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error("[v0] Get images error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function toggleImageStatus(imageId: string, currentStatus: boolean) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Authentication required")
    }

    const { data, error } = await supabase
      .from("images")
      .update({
        active: !currentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", imageId)
      .select()

    if (error) {
      console.error("[v0] Error updating image status:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    revalidatePath("/simple-admin")
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Toggle image status error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function toggleImageFeatured(imageId: string, currentFeatured: boolean) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Authentication required")
    }

    const { data, error } = await supabase
      .from("images")
      .update({
        featured: !currentFeatured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", imageId)
      .select()

    if (error) {
      console.error("[v0] Error updating image featured status:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    revalidatePath("/simple-admin")
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Toggle image featured error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getDashboardStats() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Authentication required")
    }

    // Get total images
    const { count: totalImages } = await supabase.from("images").select("*", { count: "exact", head: true })

    // Get total orders
    const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

    // Get total revenue
    const { data: revenueData } = await supabase.from("orders").select("total_amount").eq("payment_status", "completed")

    const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

    // Get total users
    const { count: totalUsers } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })

    return {
      success: true,
      data: {
        totalImages: totalImages || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        totalUsers: totalUsers || 0,
        recentActivity: [], // Can be populated later
      },
    }
  } catch (error) {
    console.error("[v0] Get dashboard stats error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getOrders() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Authentication required")
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          images (
            title,
            thumbnail_url
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching orders:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error("[v0] Get orders error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getUsers() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error("Authentication required")
    }

    const { data, error } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching users:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error("[v0] Get users error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
