-- Script to help identify images missing Backblaze high-resolution URLs
-- and provide a template to update them

-- First, check how many images are missing original_file_url
SELECT 
  COUNT(*) as missing_count,
  'Images without high-res Backblaze URLs' as description
FROM images 
WHERE original_file_url IS NULL OR original_file_url = '';

-- List all images that are missing original_file_url with their details
SELECT 
  id,
  title,
  file_path,
  price,
  created_at
FROM images 
WHERE original_file_url IS NULL OR original_file_url = ''
ORDER BY created_at DESC;

-- Template to update a specific image with its Backblaze URL
-- Replace the values below with actual data:
-- 
-- UPDATE images 
-- SET original_file_url = 'https://your-backblaze-bucket.s3.region.backblazeb2.com/path/to/high-res-image.jpg'
-- WHERE id = 'image-uuid-here';
--
-- Example:
-- UPDATE images 
-- SET original_file_url = 'https://n3urali-art-originals.s3.us-west-004.backblazeb2.com/2024/11/astral-radiance-4k.jpg'
-- WHERE title = 'Vault of the Astral Radiance';

-- Batch update template for multiple images:
-- Copy this block for each image you need to update
/*
UPDATE images SET original_file_url = 'https://your-bucket.s3.region.backblazeb2.com/image1.jpg' WHERE id = 'uuid-1';
UPDATE images SET original_file_url = 'https://your-bucket.s3.region.backblazeb2.com/image2.jpg' WHERE id = 'uuid-2';
UPDATE images SET original_file_url = 'https://your-bucket.s3.region.backblazeb2.com/image3.jpg' WHERE id = 'uuid-3';
*/

-- Verify the updates
-- SELECT id, title, original_file_url FROM images WHERE original_file_url IS NOT NULL;
