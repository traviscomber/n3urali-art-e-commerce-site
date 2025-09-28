-- Drop all existing RLS policies to start clean
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own downloads" ON downloads;
DROP POLICY IF EXISTS "Admin can view all downloads" ON downloads;
DROP POLICY IF EXISTS "Public can view active images" ON images;
DROP POLICY IF EXISTS "Admin can manage images" ON images;
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
DROP POLICY IF EXISTS "Public can view licenses" ON licenses;
DROP POLICY IF EXISTS "Admin can manage licenses" ON licenses;

-- Disable RLS on public tables that should be readable by everyone
ALTER TABLE images DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE licenses DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on sensitive tables but with simple policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Simple profiles policies (no recursion)
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Simple orders policies using user_email
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- Simple downloads policies using user_email
CREATE POLICY "Users can view their own downloads" ON downloads
    FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- Order items policy - users can view items from their own orders
CREATE POLICY "Users can view their own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_email = auth.jwt() ->> 'email'
        )
    );

-- Grant public access to the tables that disabled RLS
GRANT SELECT ON images TO anon, authenticated;
GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON licenses TO anon, authenticated;

-- Ensure authenticated users can access their own data
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON orders TO authenticated;
GRANT SELECT ON downloads TO authenticated;
GRANT SELECT ON order_items TO authenticated;
