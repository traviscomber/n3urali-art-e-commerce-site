-- Temporarily disable RLS on profiles table to fix infinite recursion
-- Disable RLS entirely on profiles table as a temporary fix

-- Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Ensure travis@nuanu.com exists as admin
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

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;
