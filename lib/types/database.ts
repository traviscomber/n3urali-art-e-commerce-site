export interface Image {
  id: string
  title: string
  description: string | null
  price: number
  original_url: string | null
  thumbnail_small_url: string | null
  thumbnail_medium_url: string | null
  thumbnail_large_url: string | null
  file_path: string | null
  category_id: string | null
  license_id: string | null
  is_featured: boolean | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface License {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Order {
  id: string
  user_email: string
  total_amount: number
  status: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  image_id: string
  license_id: string | null
  price: number
  created_at: string
}

export interface Download {
  id: string
  order_item_id: string
  user_email: string
  image_id: string
  downloaded_at: string
}

export interface CartItem {
  image: Image
  license: License
  quantity: number
}
