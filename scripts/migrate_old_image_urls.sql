-- Migration: Update old image URLs to new organized folder structure
-- This script updates URLs from /uploads/ to /full-images/category/ and /thumbnails/category/

BEGIN;

-- Create a backup table first
CREATE TABLE IF NOT EXISTS images_backup_url_migration AS 
SELECT * FROM images WHERE image_url LIKE '%/uploads/%';

-- Update image URLs that use the old /uploads/ folder structure
UPDATE images 
SET 
  image_url = CASE 
    -- Convert old uploads URLs to new full-images/category structure
    WHEN image_url LIKE '%/uploads/%' AND image_url NOT LIKE '%_thumb_%'
    THEN REPLACE(
      image_url, 
      '/uploads/', 
      '/full-images/' || COALESCE(LOWER(REPLACE((SELECT name FROM categories WHERE id = images.category_id), ' ', '-')), 'uncategorized') || '/'
    )
    ELSE image_url
  END,
  thumbnail_url = CASE 
    -- Convert old uploads thumbnail URLs to new thumbnails/category structure
    WHEN thumbnail_url LIKE '%/uploads/%'
    THEN REPLACE(
      thumbnail_url, 
      '/uploads/', 
      '/thumbnails/' || COALESCE(LOWER(REPLACE((SELECT name FROM categories WHERE id = images.category_id), ' ', '-')), 'uncategorized') || '/'
    )
    ELSE thumbnail_url
  END,
  -- Update metadata to track the migration
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'url_migration', jsonb_build_object(
      'migrated_at', NOW()::text,
      'from_structure', 'uploads',
      'to_structure', 'organized_folders',
      'category_folder', COALESCE(LOWER(REPLACE((SELECT name FROM categories WHERE id = images.category_id), ' ', '-')), 'uncategorized')
    )
  )
WHERE 
  -- Only update records that use the old /uploads/ structure
  (image_url LIKE '%/uploads/%' OR thumbnail_url LIKE '%/uploads/%')
  AND (metadata->>'url_migration') IS NULL;

-- Update Backblaze URLs that use the old structure
UPDATE images 
SET 
  image_url = CASE 
    -- Convert Backblaze uploads URLs to new structure
    WHEN image_url LIKE '%backblazeb2.com/file/Neuraliart/uploads/%' AND image_url NOT LIKE '%_thumb_%'
    THEN REPLACE(
      image_url, 
      '/file/Neuraliart/uploads/', 
      '/file/Neuraliart/full-images/' || COALESCE(LOWER(REPLACE((SELECT name FROM categories WHERE id = images.category_id), ' ', '-')), 'uncategorized') || '/'
    )
    ELSE image_url
  END,
  thumbnail_url = CASE 
    -- Convert Backblaze thumbnail URLs to new structure
    WHEN thumbnail_url LIKE '%backblazeb2.com/file/Neuraliart/uploads/%'
    THEN REPLACE(
      thumbnail_url, 
      '/file/Neuraliart/uploads/', 
      '/file/Neuraliart/thumbnails/' || COALESCE(LOWER(REPLACE((SELECT name FROM categories WHERE id = images.category_id), ' ', '-')), 'uncategorized') || '/'
    )
    ELSE thumbnail_url
  END,
  -- Update metadata to track the migration
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'backblaze_url_migration', jsonb_build_object(
      'migrated_at', NOW()::text,
      'from_structure', 'uploads',
      'to_structure', 'organized_folders',
      'category_folder', COALESCE(LOWER(REPLACE((SELECT name FROM categories WHERE id = images.category_id), ' ', '-')), 'uncategorized')
    )
  )
WHERE 
  -- Only update Backblaze records that use the old /uploads/ structure
  (image_url LIKE '%backblazeb2.com/file/Neuraliart/uploads/%' OR thumbnail_url LIKE '%backblazeb2.com/file/Neuraliart/uploads/%')
  AND (metadata->>'backblaze_url_migration') IS NULL;

COMMIT;

-- Verification query to check the migration results
SELECT 
  COUNT(*) as total_images,
  COUNT(CASE WHEN image_url LIKE '%/full-images/%' THEN 1 END) as updated_full_image_urls,
  COUNT(CASE WHEN thumbnail_url LIKE '%/thumbnails/%' THEN 1 END) as updated_thumbnail_urls,
  COUNT(CASE WHEN image_url LIKE '%/uploads/%' THEN 1 END) as remaining_old_urls,
  COUNT(CASE WHEN (metadata->>'url_migration') IS NOT NULL THEN 1 END) as local_migrated_records,
  COUNT(CASE WHEN (metadata->>'backblaze_url_migration') IS NOT NULL THEN 1 END) as backblaze_migrated_records
FROM images;
