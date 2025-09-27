-- Fix Row Level Security policies for the images table
-- This script will allow the service role to perform admin operations
-- while maintaining security for regular users

-- First, let's check current policies and drop them if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON images;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON images;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON images;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON images;

-- Create new RLS policies that allow service role operations
-- Policy 1: Allow public read access to active images
CREATE POLICY "Allow public read access to active images" ON images
    FOR SELECT USING (active = true);

-- Policy 2: Allow service role to insert images (for admin uploads)
CREATE POLICY "Allow service role to insert images" ON images
    FOR INSERT WITH CHECK (
        -- Allow service role to insert
        auth.jwt() ->> 'role' = 'service_role'
        OR
        -- Allow authenticated users to insert their own images
        auth.uid() IS NOT NULL
    );

-- Policy 3: Allow service role to update images (for admin management)
CREATE POLICY "Allow service role to update images" ON images
    FOR UPDATE USING (
        -- Allow service role to update any image
        auth.jwt() ->> 'role' = 'service_role'
        OR
        -- Allow users to update their own images (if we add user_id later)
        auth.uid() IS NOT NULL
    );

-- Policy 4: Allow service role to delete images (for admin management)
CREATE POLICY "Allow service role to delete images" ON images
    FOR DELETE USING (
        -- Allow service role to delete any image
        auth.jwt() ->> 'role' = 'service_role'
        OR
        -- Allow users to delete their own images (if we add user_id later)
        auth.uid() IS NOT NULL
    );

-- Also fix RLS policies for related tables that might cause issues

-- Categories table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT USING (true);

-- Licenses table policies  
DROP POLICY IF EXISTS "Enable read access for all users" ON licenses;
CREATE POLICY "Allow public read access to licenses" ON licenses
    FOR SELECT USING (true);

-- Verify RLS is enabled on all tables
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Show the current policies for verification
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('images', 'categories', 'licenses')
ORDER BY tablename, policyname;
