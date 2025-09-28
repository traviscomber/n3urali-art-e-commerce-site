-- Complete RLS reset - drop all policies and start fresh
-- This will eliminate the infinite recursion issue

-- First, drop ALL existing policies on ALL tables
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Disable RLS on all public tables (these should be readable by everyone)
ALTER TABLE public.images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled only on sensitive user data tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Check if order_items table exists and handle it
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create simple, non-recursive policies for user data tables

-- Profiles: users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Orders: users can view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.email() = user_email);

-- Downloads: users can view their own downloads
CREATE POLICY "Users can view their own downloads" ON public.downloads
    FOR SELECT USING (auth.email() = user_email);

-- Order items: users can view their own order items (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
        CREATE POLICY "Users can view their own order items" ON public.order_items
            FOR SELECT USING (auth.email() = (SELECT user_email FROM orders WHERE orders.id = order_items.order_id));
    END IF;
END $$;

-- Grant public access to read public tables
GRANT SELECT ON public.images TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.licenses TO anon, authenticated;

-- Grant authenticated users access to their own data
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.downloads TO authenticated;

-- Grant access to order_items if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
        GRANT SELECT ON public.order_items TO authenticated;
    END IF;
END $$;
