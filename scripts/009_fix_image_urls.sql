-- Script to ensure all images have proper URLs in the correct columns
-- Fix any images that might have URLs in wrong columns

-- Update images to ensure file_path is populated from original_url if missing
UPDATE images 
SET file_path = original_url 
WHERE file_path IS NULL AND original_url IS NOT NULL;

-- Update images to ensure thumbnail URLs are populated from file_path if missing
UPDATE images 
SET 
  thumbnail_small_url = file_path,
  thumbnail_medium_url = file_path,
  thumbnail_large_url = file_path
WHERE 
  (thumbnail_small_url IS NULL OR thumbnail_medium_url IS NULL OR thumbnail_large_url IS NULL)
  AND file_path IS NOT NULL;

-- Ensure all images are active by default
UPDATE images SET active = true WHERE active IS NULL;

-- Add some sample categories if none exist
INSERT INTO categories (name, description) 
SELECT 'equirectangular', '360-degree panoramic images'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'equirectangular');

INSERT INTO categories (name, description) 
SELECT 'fisheye', '180-degree fisheye lens images'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'fisheye');

-- Ensure all images have a category assigned
UPDATE images 
SET category_id = (SELECT id FROM categories WHERE name = 'equirectangular' LIMIT 1)
WHERE category_id IS NULL;
