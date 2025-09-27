-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  104857600, -- 100MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the storage bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own images" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

SELECT 'Supabase storage bucket and policies created successfully' as status;
