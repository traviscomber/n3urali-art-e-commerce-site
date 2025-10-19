-- Fix categories table to ensure it matches the actual schema
-- This script safely adds missing columns and data

-- Ensure categories table exists with correct structure
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories only if they don't exist
INSERT INTO categories (name, description) VALUES
  ('Equirectangular', 'Full 360° panoramic images perfect for VR and immersive experiences'),
  ('Fisheye', 'Ultra-wide angle images with distinctive curved perspective')
ON CONFLICT (name) DO NOTHING;

-- Ensure RLS is enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Categories are viewable by everyone' AND tablename = 'categories') THEN
        CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
    END IF;
END $$;
