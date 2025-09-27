-- Fix RLS policies for N3urali.art e-commerce site
-- This script safely handles existing policies by dropping them first

-- Drop existing policies if they exist (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
DROP POLICY IF EXISTS "Allow service role full access to categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access to licenses" ON licenses;
DROP POLICY IF EXISTS "Allow service role full access to licenses" ON licenses;
DROP POLICY IF EXISTS "Allow public read access to active images" ON images;
DROP POLICY IF EXISTS "Allow service role full access to images" ON images;
DROP POLICY IF EXISTS "Allow authenticated users to read their orders" ON orders;
DROP POLICY IF EXISTS "Allow service role full access to orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to read their order items" ON order_items;
DROP POLICY IF EXISTS "Allow service role full access to order items" ON order_items;

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Allow service role full access to categories" ON categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Licenses policies
CREATE POLICY "Allow public read access to licenses" ON licenses
    FOR SELECT USING (active = true);

CREATE POLICY "Allow service role full access to licenses" ON licenses
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Images policies (key fix for the upload issue)
CREATE POLICY "Allow public read access to active images" ON images
    FOR SELECT USING (active = true);

CREATE POLICY "Allow service role full access to images" ON images
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Orders policies
CREATE POLICY "Allow authenticated users to read their orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow service role full access to orders" ON orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Order items policies
CREATE POLICY "Allow authenticated users to read their order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow service role full access to order items" ON order_items
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
