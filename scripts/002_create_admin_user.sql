-- Create Admin User with CRUD Permissions
-- This script creates a proper admin user in Supabase and sets up RLS policies

-- First, create RLS policies that allow admin users to perform CRUD operations
-- These policies check for is_admin = true in user_metadata

-- Categories table policies
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
CREATE POLICY "Admin can manage categories" ON categories
FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
);

-- Licenses table policies  
DROP POLICY IF EXISTS "Admin can manage licenses" ON licenses;
CREATE POLICY "Admin can manage licenses" ON licenses
FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
);

-- Images table policies
DROP POLICY IF EXISTS "Admin can manage images" ON images;
CREATE POLICY "Admin can manage images" ON images
FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
);

-- Allow public read access to active images
DROP POLICY IF EXISTS "Public can view active images" ON images;
CREATE POLICY "Public can view active images" ON images
FOR SELECT USING (active = true);

-- User profiles table policies
DROP POLICY IF EXISTS "Admin can manage user profiles" ON user_profiles;
CREATE POLICY "Admin can manage user profiles" ON user_profiles
FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
);

-- Orders table policies
DROP POLICY IF EXISTS "Admin can manage orders" ON orders;
CREATE POLICY "Admin can manage orders" ON orders
FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
);

-- Order items table policies
DROP POLICY IF EXISTS "Admin can manage order items" ON order_items;
CREATE POLICY "Admin can manage order items" ON order_items
FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
);

-- Downloads table policies
DROP POLICY IF EXISTS "Admin can manage downloads" ON downloads;
CREATE POLICY "Admin can manage downloads" ON downloads
FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
);

-- Download logs table policies
DROP POLICY IF EXISTS "Admin can manage download logs" ON download_logs;
CREATE POLICY "Admin can manage download logs" ON download_logs
FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
);

-- Create a function to create admin user (this needs to be run with service role)
-- Note: This creates a user that can be authenticated via email/password
-- Email: admin@n3urali.art
-- Password: C4rlit0s (same as the simple admin password)

-- Insert admin user directly into auth.users (requires service role)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440000',
  'authenticated',
  'authenticated',
  'admin@n3urali.art',
  crypt('C4rlit0s', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "N3urali Admin", "is_admin": true}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = NOW();

-- Create corresponding user profile
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@n3urali.art',
  'N3urali Admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
