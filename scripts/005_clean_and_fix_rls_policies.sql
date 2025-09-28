-- Clean up and fix RLS policies to prevent infinite recursion
-- This script drops existing policies and recreates them properly

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Public can view images" ON images;
DROP POLICY IF EXISTS "Admins can manage images" ON images;
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Public can view licenses" ON licenses;
DROP POLICY IF EXISTS "Admins can manage licenses" ON licenses;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own downloads" ON downloads;
DROP POLICY IF EXISTS "Admins can view all downloads" ON downloads;

-- Drop the is_admin function if it exists
DROP FUNCTION IF EXISTS is_admin();

-- Disable RLS on public tables that should be readable by everyone
ALTER TABLE images DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE licenses DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled only on sensitive user data tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for profiles
-- Users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for orders (users can only see their own orders)
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for downloads (users can only see their own downloads)
CREATE POLICY "Users can view their own downloads" ON downloads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads" ON downloads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions for public tables
GRANT SELECT ON images TO anon, authenticated;
GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON licenses TO anon, authenticated;

-- Grant permissions for user data tables
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT ON orders TO authenticated;
GRANT SELECT, INSERT ON downloads TO authenticated;

-- Note: Admin functionality will be handled through service role key in server actions
-- This eliminates the need for complex RLS policies that cause recursion
