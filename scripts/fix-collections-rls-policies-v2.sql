-- Fix RLS policies for collections and collection_images tables
-- This allows authenticated users (admins) to create and manage collections

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert collections" ON public.collections;
DROP POLICY IF EXISTS "Allow authenticated users to update collections" ON public.collections;
DROP POLICY IF EXISTS "Allow authenticated users to delete collections" ON public.collections;

DROP POLICY IF EXISTS "Allow everyone to view collection images" ON public.collection_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert collection images" ON public.collection_images;
DROP POLICY IF EXISTS "Allow authenticated users to update collection images" ON public.collection_images;
DROP POLICY IF EXISTS "Allow authenticated users to delete collection images" ON public.collection_images;

-- Create policies for the collections table
CREATE POLICY "Allow authenticated users to insert collections"
ON public.collections
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update collections"
ON public.collections
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete collections"
ON public.collections
FOR DELETE
TO authenticated
USING (true);

-- Create policies for the collection_images table
CREATE POLICY "Allow everyone to view collection images"
ON public.collection_images
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to insert collection images"
ON public.collection_images
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update collection images"
ON public.collection_images
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete collection images"
ON public.collection_images
FOR DELETE
TO authenticated
USING (true);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('collections', 'collection_images')
ORDER BY tablename, policyname;
