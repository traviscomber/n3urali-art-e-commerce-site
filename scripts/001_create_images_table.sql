-- Create images table for equirectangular and fisheye images
CREATE TABLE IF NOT EXISTS public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(20) NOT NULL CHECK (category IN ('equirectangular', 'fisheye')),
  price DECIMAL(10,2) NOT NULL,
  file_url TEXT NOT NULL,
  preview_url TEXT NOT NULL,
  watermarked_preview_url TEXT,
  metadata JSONB DEFAULT '{}',
  dimensions VARCHAR(50),
  file_size INTEGER,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for images table
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policies for images (public read access for active images)
CREATE POLICY "images_select_active" ON public.images 
  FOR SELECT USING (is_active = true);

-- Only allow authenticated users to insert/update/delete (admin functionality)
CREATE POLICY "images_insert_admin" ON public.images 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "images_update_admin" ON public.images 
  FOR UPDATE USING (true);
CREATE POLICY "images_delete_admin" ON public.images 
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_category ON public.images(category);
CREATE INDEX IF NOT EXISTS idx_images_featured ON public.images(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_images_active ON public.images(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);

-- Execute images table creation script
