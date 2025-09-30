-- Fix RLS policies for categories table to allow uploads (Version 2)
-- This script ensures that categories can be selected by anyone (needed for uploads)
-- while still protecting write operations

-- First, disable RLS temporarily to clean up
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on categories table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'categories') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON categories';
    END LOOP;
END $$;

-- Re-enable RLS on categories table
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
  cmd
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
