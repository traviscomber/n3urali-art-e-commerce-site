export interface Database {
  public: {
    Tables: {
      images: {
        Row: {
          id: string
          title: string
          description: string | null
          category: "equirectangular" | "fisheye"
          price: number
          file_url: string
          preview_url: string
          watermarked_preview_url: string
          metadata: Record<string, any>
          dimensions: string | null
          file_size: number | null
          tags: string[]
          is_featured: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: "equirectangular" | "fisheye"
          price: number
          file_url: string
          preview_url: string
          watermarked_preview_url: string
          metadata?: Record<string, any>
          dimensions?: string | null
          file_size?: number | null
          tags?: string[]
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: "equirectangular" | "fisheye"
          price?: number
          file_url?: string
          preview_url?: string
          watermarked_preview_url?: string
          metadata?: Record<string, any>
          dimensions?: string | null
          file_size?: number | null
          tags?: string[]
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_email: string
          stripe_payment_intent_id: string | null
          total_amount: number
          status: "pending" | "completed" | "failed" | "refunded"
          customer_name: string | null
          billing_address: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_email: string
          stripe_payment_intent_id?: string | null
          total_amount: number
          status?: "pending" | "completed" | "failed" | "refunded"
          customer_name?: string | null
          billing_address?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_email?: string
          stripe_payment_intent_id?: string | null
          total_amount?: number
          status?: "pending" | "completed" | "failed" | "refunded"
          customer_name?: string | null
          billing_address?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          image_id: string
          license_type: "NON_EXCLUSIVE" | "EXCLUSIVE"
          price: number
          download_count: number
          download_expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          image_id: string
          license_type?: "NON_EXCLUSIVE" | "EXCLUSIVE"
          price: number
          download_count?: number
          download_expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          image_id?: string
          license_type?: "NON_EXCLUSIVE" | "EXCLUSIVE"
          price?: number
          download_count?: number
          download_expires_at?: string | null
          created_at?: string
        }
      }
      download_logs: {
        Row: {
          id: string
          order_item_id: string
          user_email: string
          ip_address: string | null
          user_agent: string | null
          downloaded_at: string
        }
        Insert: {
          id?: string
          order_item_id: string
          user_email: string
          ip_address?: string | null
          user_agent?: string | null
          downloaded_at?: string
        }
        Update: {
          id?: string
          order_item_id?: string
          user_email?: string
          ip_address?: string | null
          user_agent?: string | null
          downloaded_at?: string
        }
      }
    }
  }
}
