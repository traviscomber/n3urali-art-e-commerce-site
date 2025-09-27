-- Admin-only RLS policies for images table
-- Since only dev/admin will upload images, we keep it simple

-- First, ensure RLS is enabled on images table
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Allow service role full access" ON images;
DROP POLICY IF EXISTS "Allow public read access to active images" ON images;
DROP POLICY IF EXISTS "Allow admin full access" ON images;
DROP POLICY IF EXISTS "Public can view active images" ON images;

-- Create simple admin-only policies
-- 1. Service role (admin operations) gets full access
CREATE POLICY "Admin full access via service role" ON images
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 2. Public users can only read active images
CREATE POLICY "Public read active images only" ON images
    FOR SELECT 
    TO public
    USING (active = true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'images'
ORDER BY policyname;
