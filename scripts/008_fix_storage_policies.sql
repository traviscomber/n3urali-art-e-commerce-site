-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Ensure the images bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  104857600, -- 100MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp'];

-- Create comprehensive RLS policies for storage
CREATE POLICY "Allow public read access to images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Allow authenticated users to upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Also ensure public access to the bucket itself
CREATE POLICY IF NOT EXISTS "Allow public bucket access" 
ON storage.buckets FOR SELECT 
USING (id = 'images');

SELECT 'Storage bucket and policies fixed for production deployment' as status;
