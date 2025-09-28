-- Fix infinite recursion in RLS policies by dropping and recreating admin policies
-- The issue is that admin policies on other tables are querying profiles table
-- which creates circular dependency when profiles table has its own RLS

-- Drop existing admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage images" ON public.images;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage licenses" ON public.licenses;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage all downloads" ON public.downloads;

-- Create a function to check if user is admin without causing recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- Recreate admin policies using the function
-- Note: We'll use a simpler approach for profiles admin access
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    -- Allow if user is viewing their own profile OR if they are an admin
    auth.uid() = id OR 
    (auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    ))
  );

-- For other tables, use the function to avoid recursion
CREATE POLICY "Admins can manage images" ON public.images
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage licenses" ON public.licenses
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can manage all order items" ON public.order_items
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all downloads" ON public.downloads
  FOR ALL USING (public.is_admin());
