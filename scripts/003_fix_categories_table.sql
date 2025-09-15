-- Fix categories table to ensure slug column exists
-- This script safely adds missing columns and data

-- Add slug column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'slug') THEN
        ALTER TABLE categories ADD COLUMN slug TEXT;
    END IF;
END $$;

-- Add unique constraint on slug if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'categories_slug_key' AND table_name = 'categories') THEN
        -- First, update any existing rows without slugs
        UPDATE categories SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
        
        -- Then add the unique constraint
        ALTER TABLE categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
        
        -- Make slug NOT NULL
        ALTER TABLE categories ALTER COLUMN slug SET NOT NULL;
    END IF;
END $$;

-- Insert default categories only if they don't exist
INSERT INTO categories (name, description, slug) VALUES
  ('Equirectangular', 'Full 360° panoramic images perfect for VR and immersive experiences', 'equirectangular'),
  ('Fisheye', 'Ultra-wide angle images with distinctive curved perspective', 'fisheye'),
  ('Architectural', 'Interior and exterior architectural photography', 'architectural'),
  ('Nature', 'Natural landscapes and outdoor environments', 'nature'),
  ('Abstract', 'Artistic and abstract compositions', 'abstract')
ON CONFLICT (name) DO NOTHING
ON CONFLICT (slug) DO NOTHING;

-- Ensure RLS is enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Categories are viewable by everyone' AND tablename = 'categories') THEN
        CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
    END IF;
END $$;
