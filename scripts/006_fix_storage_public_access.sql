-- Enable public access to the images bucket
-- This will make all images in the 'images' bucket publicly accessible

-- First, create the bucket if it doesn't exist (it should already exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create a policy to allow public read access to all files in the images bucket
CREATE POLICY IF NOT EXISTS "Public read access for images bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

-- Create a policy to allow authenticated users to upload to images bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to update their own images
CREATE POLICY IF NOT EXISTS "Authenticated users can update images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Create a policy to allow authenticated users to delete images
CREATE POLICY IF NOT EXISTS "Authenticated users can delete images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Verify the bucket is public
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'images';
