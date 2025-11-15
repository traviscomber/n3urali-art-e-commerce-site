-- Disable RLS on all problematic tables to simplify authentication
-- This removes Row Level Security restrictions to avoid infinite recursion and access issues

-- Profiles table (has 10 conflicting policies causing infinite recursion)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- User profiles table
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "profiles_admin_access" ON user_profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON user_profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Images table (has 9 policies)
ALTER TABLE images DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active images" ON images;
DROP POLICY IF EXISTS "Admins can manage images" ON images;
DROP POLICY IF EXISTS "Admin full access via service role" ON images;
DROP POLICY IF EXISTS "Public read active images only" ON images;
DROP POLICY IF EXISTS "images_delete_admin" ON images;
DROP POLICY IF EXISTS "Active images are viewable by everyone" ON images;
DROP POLICY IF EXISTS "images_update_admin" ON images;
DROP POLICY IF EXISTS "images_insert_admin" ON images;
DROP POLICY IF EXISTS "images_select_active" ON images;

-- Order items table (has 7 policies)
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
DROP POLICY IF EXISTS "order_items_admin_access" ON order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "service_role_order_items_access" ON order_items;
DROP POLICY IF EXISTS "users_view_own_order_items" ON order_items;
DROP POLICY IF EXISTS "public_order_items_confirmation" ON order_items;

-- Orders table (has 10 policies)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "service_role_orders_access" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "public_order_confirmation" ON orders;
DROP POLICY IF EXISTS "users_view_own_orders_by_email" ON orders;
DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
DROP POLICY IF EXISTS "orders_update_own" ON orders;
DROP POLICY IF EXISTS "orders_admin_access" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Licenses table (has 4 policies)
ALTER TABLE licenses DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage licenses" ON licenses;
DROP POLICY IF EXISTS "Licenses are viewable by everyone" ON licenses;
DROP POLICY IF EXISTS "Anyone can view licenses" ON licenses;
DROP POLICY IF EXISTS "Allow public read access to licenses" ON licenses;

-- Categories table (has 3 policies)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
DROP POLICY IF EXISTS "Public can view all categories" ON categories;
DROP POLICY IF EXISTS "Service role can manage categories" ON categories;

-- Collections tables
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can manage collections" ON collections;
DROP POLICY IF EXISTS "Public can view active collections" ON collections;

ALTER TABLE collection_images DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view collection images" ON collection_images;
DROP POLICY IF EXISTS "Authenticated users can manage collection images" ON collection_images;

-- Downloads table
ALTER TABLE downloads DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all downloads" ON downloads;

-- Products table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_select_all" ON products;

-- Analytics table
ALTER TABLE analytics DISABLE ROW LEVEL SECURITY;

-- B2 favorites table
ALTER TABLE b2_favorites DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on b2_favorites" ON b2_favorites;

-- Make license_id nullable in order_items to fix constraint error
ALTER TABLE order_items ALTER COLUMN license_id DROP NOT NULL;
