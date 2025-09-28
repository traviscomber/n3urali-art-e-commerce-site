-- Disable RLS for testing purposes
-- This script temporarily disables Row Level Security on key tables
-- to allow testing of core functionality without authentication restrictions

-- Disable RLS on orders table
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Disable RLS on order_items table  
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Disable RLS on downloads table
ALTER TABLE downloads DISABLE ROW LEVEL SECURITY;

-- Disable RLS on images table (in case it has RLS enabled)
ALTER TABLE images DISABLE ROW LEVEL SECURITY;

-- Disable RLS on licenses table (in case it has RLS enabled)
ALTER TABLE licenses DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies to clean up
DROP POLICY IF EXISTS "orders_insert_policy" ON orders;
DROP POLICY IF EXISTS "orders_select_policy" ON orders;
DROP POLICY IF EXISTS "orders_update_policy" ON orders;
DROP POLICY IF EXISTS "orders_delete_policy" ON orders;

DROP POLICY IF EXISTS "order_items_insert_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_select_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_update_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_delete_policy" ON order_items;

DROP POLICY IF EXISTS "downloads_insert_policy" ON downloads;
DROP POLICY IF EXISTS "downloads_select_policy" ON downloads;
DROP POLICY IF EXISTS "downloads_update_policy" ON downloads;
DROP POLICY IF EXISTS "downloads_delete_policy" ON downloads;

-- Note: RLS can be re-enabled later with:
-- ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
-- And then recreate appropriate policies

SELECT 'RLS disabled for testing on orders, order_items, downloads, images, and licenses tables' as status;
