-- Disable RLS on tables that should be publicly readable
-- This fixes the infinite recursion issue by removing RLS from tables
-- that don't need user-level access control

-- Drop all existing policies first
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
DROP POLICY IF EXISTS "Allow service role full access to categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access to licenses" ON licenses;
DROP POLICY IF EXISTS "Allow service role full access to licenses" ON licenses;
DROP POLICY IF EXISTS "Allow public read access to active images" ON images;
DROP POLICY IF EXISTS "Allow service role full access to images" ON images;
DROP POLICY IF EXISTS "Admins can manage images" ON images;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage licenses" ON licenses;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage all downloads" ON downloads;

-- Drop the problematic function
DROP FUNCTION IF EXISTS public.is_admin(UUID);

-- Disable RLS on public tables that should be readable by everyone
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE licenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE images DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled only on sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Create simple policies for sensitive tables without recursion
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can view their own downloads" ON downloads
  FOR SELECT USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Verify the changes
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
