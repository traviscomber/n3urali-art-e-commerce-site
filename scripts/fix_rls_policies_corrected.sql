-- Fix RLS policies with correct column names based on actual database schema
-- This script addresses the "column user_id does not exist" error

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
DROP POLICY IF EXISTS "Allow service role full access to categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access to licenses" ON licenses;
DROP POLICY IF EXISTS "Allow service role full access to licenses" ON licenses;
DROP POLICY IF EXISTS "Allow public read access to active images" ON images;
DROP POLICY IF EXISTS "Allow service role full access to images" ON images;
DROP POLICY IF EXISTS "Allow users to view their own orders" ON orders;
DROP POLICY IF EXISTS "Allow service role full access to orders" ON orders;
DROP POLICY IF EXISTS "Allow users to view their own order items" ON order_items;
DROP POLICY IF EXISTS "Allow service role full access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow users to view their own downloads" ON downloads;
DROP POLICY IF EXISTS "Allow service role full access to downloads" ON downloads;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow service role full access to profiles" ON profiles;

-- Categories table policies (no user-specific data)
CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Allow service role full access to categories" ON categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Licenses table policies (no user-specific data)
CREATE POLICY "Allow public read access to licenses" ON licenses
    FOR SELECT USING (active = true);

CREATE POLICY "Allow service role full access to licenses" ON licenses
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Images table policies (public can read active images)
CREATE POLICY "Allow public read access to active images" ON images
    FOR SELECT USING (active = true);

CREATE POLICY "Allow service role full access to images" ON images
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Orders table policies (uses user_email, not user_id)
CREATE POLICY "Allow users to view their own orders" ON orders
    FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Allow service role full access to orders" ON orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Order items table policies (linked through orders)
CREATE POLICY "Allow users to view their own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Allow service role full access to order_items" ON order_items
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Downloads table policies (uses user_email, not user_id)
CREATE POLICY "Allow users to view their own downloads" ON downloads
    FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Allow service role full access to downloads" ON downloads
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Profiles table policies (uses email for identification)
CREATE POLICY "Allow users to view their own profile" ON profiles
    FOR SELECT USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Allow service role full access to profiles" ON profiles
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Verify all policies were created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
