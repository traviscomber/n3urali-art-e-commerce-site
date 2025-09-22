-- Fix infinite recursion in profiles RLS policies
-- Drop existing problematic RLS policies and create simpler ones

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create simple RLS policies that don't cause recursion
-- Allow users to view and update their own profile using auth.uid()
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow insert for new user profiles (needed for sign-up)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- For admin access, we'll handle this in the application layer instead of RLS
-- This prevents the infinite recursion issue

-- Ensure travis@nuanu.com is set as admin
INSERT INTO profiles (id, email, full_name, role, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'travis@nuanu.com',
    'Travis Admin',
    'admin',
    true,
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'travis@nuanu.com'
);
