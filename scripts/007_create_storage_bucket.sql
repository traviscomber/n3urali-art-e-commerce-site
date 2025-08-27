-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

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
