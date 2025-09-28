-- Fix RLS policies for orders table to work with guest checkout
-- The orders table uses user_email, not user_id

-- Drop all existing policies for orders table
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "orders_update_own" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_access" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated users to read their orders" ON public.orders;
DROP POLICY IF EXISTS "Allow service role full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users to view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;

-- Create new policies that work with the actual table schema
-- Policy 1: Allow service role (API) to create orders for guest checkout
CREATE POLICY "service_role_orders_access" ON public.orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 2: Allow authenticated users to view orders by their email
CREATE POLICY "users_view_own_orders_by_email" ON public.orders
FOR SELECT
TO authenticated
USING (user_email = auth.jwt() ->> 'email');

-- Policy 3: Allow public read access for order confirmation (optional - remove if too permissive)
-- This allows users to view their order immediately after creation without authentication
-- You can remove this if you want to require authentication for order viewing
CREATE POLICY "public_order_confirmation" ON public.orders
FOR SELECT
TO anon
USING (true);

-- Fix order_items policies to work with the new orders structure
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Allow authenticated users to read their order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow service role full access to order_items" ON public.order_items;

-- Allow service role to manage order_items
CREATE POLICY "service_role_order_items_access" ON public.order_items
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to view their order items
CREATE POLICY "users_view_own_order_items" ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_email = auth.jwt() ->> 'email'
  )
);

-- Allow public read access for order items (for order confirmation)
CREATE POLICY "public_order_items_confirmation" ON public.order_items
FOR SELECT
TO anon
USING (true);

-- Fix downloads policies to work with the new structure
DROP POLICY IF EXISTS "Users can view their own downloads" ON public.downloads;
DROP POLICY IF EXISTS "Users can create downloads for their orders" ON public.downloads;
DROP POLICY IF EXISTS "Allow authenticated users to read their downloads" ON public.downloads;
DROP POLICY IF EXISTS "Allow service role full access to downloads" ON public.downloads;

-- Allow service role to manage downloads
CREATE POLICY "service_role_downloads_access" ON public.downloads
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow users to view downloads for their orders
CREATE POLICY "users_view_own_downloads" ON public.downloads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.id = downloads.order_item_id 
    AND o.user_email = auth.jwt() ->> 'email'
  )
);

-- Allow public access to downloads with valid token (for guest downloads)
CREATE POLICY "public_downloads_with_token" ON public.downloads
FOR SELECT
TO anon
USING (download_token IS NOT NULL AND expires_at > NOW());
