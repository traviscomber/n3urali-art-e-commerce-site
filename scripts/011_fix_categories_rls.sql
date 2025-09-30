-- Fix RLS policies for categories table to allow uploads
-- This script ensures that categories can be selected by anyone (needed for uploads)
-- while still protecting write operations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Public can view all categories" ON categories;
DROP POLICY IF EXISTS "Service role can manage categories" ON categories;

-- Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including unauthenticated users) to SELECT all categories
-- This is necessary for the upload form to work
CREATE POLICY "Public can view all categories" 
ON categories 
FOR SELECT 
USING (true);

-- Allow service role to do everything (for admin operations)
CREATE POLICY "Service role can manage categories" 
ON categories 
FOR ALL 
USING (
  auth.jwt() ->> 'role' = 'service_role'
);

-- Allow authenticated users to INSERT/UPDATE/DELETE categories
-- (You can make this more restrictive by checking for admin role)
CREATE POLICY "Authenticated users can manage categories" 
ON categories 
FOR ALL 
USING (
  auth.role() = 'authenticated'
);

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'categories'
ORDER BY policyname;

-- Show current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'categories';
