-- Comprehensive admin user setup script
-- This script ensures the admin user and all required tables exist

-- First, ensure the user_profiles table exists with the correct structure
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_admin_access" ON public.user_profiles;

-- Create comprehensive RLS policies
CREATE POLICY "profiles_select_own" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to access all profiles
CREATE POLICY "profiles_admin_select" ON public.user_profiles 
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "profiles_admin_update" ON public.user_profiles 
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE WHEN NEW.email = 'admin@n3urali.art' THEN true ELSE false END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create or update admin user profile (only if the user exists in auth.users)
DO $$
BEGIN
  -- Check if admin user exists in auth.users and create/update profile
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@n3urali.art') THEN
    INSERT INTO public.user_profiles (id, email, full_name, is_admin)
    SELECT 
      id,
      email,
      'Administrator',
      true
    FROM auth.users 
    WHERE email = 'admin@n3urali.art'
    ON CONFLICT (email) DO UPDATE SET 
      is_admin = true,
      full_name = 'Administrator',
      updated_at = NOW();
    
    RAISE NOTICE 'Admin user profile created/updated successfully';
  ELSE
    RAISE NOTICE 'Admin user not found in auth.users. Please create the user admin@n3urali.art in Supabase Auth first.';
  END IF;
END $$;

-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Admin can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete images" ON storage.objects;

-- Set up RLS policies for the storage bucket
CREATE POLICY "Admin can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.email() = 'admin@n3urali.art'
);

CREATE POLICY "Anyone can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Admin can update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.email() = 'admin@n3urali.art'
);

CREATE POLICY "Admin can delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.email() = 'admin@n3urali.art'
);
