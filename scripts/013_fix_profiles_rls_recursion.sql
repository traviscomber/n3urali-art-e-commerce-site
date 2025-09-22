-- Fix infinite recursion in profiles RLS policies
-- The issue is caused by admin policies that query the same profiles table they're protecting

-- Drop all existing problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create simple RLS policies that don't cause recursion
-- These policies only use auth.uid() and don't reference the profiles table
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- For admin access, we'll handle this in the application layer
-- This prevents infinite recursion while maintaining security

-- Ensure the admin user exists in profiles table
-- First, let's check if travis@nuanu.com exists in auth.users
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Try to find existing user
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'travis@nuanu.com';
    
    -- If user exists, ensure profile exists
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, is_active, created_at, updated_at)
        VALUES (
            admin_user_id,
            'travis@nuanu.com',
            'Travis Admin',
            'developer',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'developer',
            is_active = true,
            updated_at = NOW();
    END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
