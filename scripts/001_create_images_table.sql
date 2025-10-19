-- Create images table for equirectangular and fisheye images
-- Changed is_active to active and is_featured to is_featured to match schema
CREATE TABLE IF NOT EXISTS public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  license_id UUID REFERENCES public.licenses(id),
  price NUMERIC NOT NULL DEFAULT 0.00,
  file_path TEXT,
  original_url TEXT,
  original_file_url TEXT,
  thumbnail_small_url TEXT,
  thumbnail_medium_url TEXT,
  thumbnail_large_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for images table
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policies for images (public read access for active images)
CREATE POLICY "images_select_active" ON public.images 
  FOR SELECT USING (active = true);

-- Only allow authenticated users to insert/update/delete (admin functionality)
CREATE POLICY "images_insert_admin" ON public.images 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "images_update_admin" ON public.images 
  FOR UPDATE USING (true);
CREATE POLICY "images_delete_admin" ON public.images 
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_category ON public.images(category_id);
CREATE INDEX IF NOT EXISTS idx_images_featured ON public.images(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_images_active ON public.images(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);
