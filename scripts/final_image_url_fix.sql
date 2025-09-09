-- Comprehensive fix for all broken image URLs in the database
-- This script identifies and fixes all problematic URLs while preserving working ones

-- Step 1: Backup current URLs before making changes
CREATE TABLE IF NOT EXISTS image_url_backup AS 
SELECT id, title, image_url, thumbnail_url, created_at 
FROM images;

-- Step 2: Identify and categorize all URL types
WITH url_analysis AS (
  SELECT 
    id,
    title,
    image_url,
    thumbnail_url,
    CASE 
      WHEN image_url LIKE '%/uploads/%' THEN 'BROKEN_UPLOADS'
      WHEN image_url LIKE '%f005.backblazeb2.com%' AND image_url NOT LIKE '%/uploads/%' THEN 'BACKBLAZE_VALID'
      WHEN image_url LIKE '%vercel-storage.com%' THEN 'VERCEL_BLOB'
      WHEN image_url LIKE 'data:image/%' THEN 'DATA_URL'
      WHEN image_url LIKE '/placeholder.svg%' THEN 'PLACEHOLDER'
      WHEN image_url IS NULL OR image_url = '' THEN 'MISSING'
      ELSE 'OTHER'
    END as image_url_type,
    CASE 
      WHEN thumbnail_url LIKE '%/uploads/%' THEN 'BROKEN_UPLOADS'
      WHEN thumbnail_url LIKE '%f005.backblazeb2.com%' AND thumbnail_url NOT LIKE '%/uploads/%' THEN 'BACKBLAZE_VALID'
      WHEN thumbnail_url LIKE '%vercel-storage.com%' THEN 'VERCEL_BLOB'
      WHEN thumbnail_url LIKE 'data:image/%' THEN 'DATA_URL'
      WHEN thumbnail_url LIKE '/placeholder.svg%' THEN 'PLACEHOLDER'
      WHEN thumbnail_url IS NULL OR thumbnail_url = '' THEN 'MISSING'
      ELSE 'OTHER'
    END as thumbnail_url_type
  FROM images
)
SELECT 
  image_url_type,
  thumbnail_url_type,
  COUNT(*) as count
FROM url_analysis
GROUP BY image_url_type, thumbnail_url_type
ORDER BY count DESC;

-- Step 3: Fix broken URLs with appropriate placeholders based on category
UPDATE images 
SET 
  image_url = CASE 
    WHEN image_url LIKE '%/uploads/%' OR image_url IS NULL OR image_url = '' THEN
      CASE 
        WHEN EXISTS (SELECT 1 FROM categories c WHERE c.id = images.category_id AND LOWER(c.name) LIKE '%fisheye%') 
        THEN '/placeholder.svg?height=800&width=800&text=Fisheye+Image'
        WHEN EXISTS (SELECT 1 FROM categories c WHERE c.id = images.category_id AND LOWER(c.name) LIKE '%360%') 
        THEN '/placeholder.svg?height=800&width=800&text=360+Image'
        ELSE '/placeholder.svg?height=800&width=800&text=Premium+Image'
      END
    ELSE image_url
  END,
  thumbnail_url = CASE 
    WHEN thumbnail_url LIKE '%/uploads/%' OR thumbnail_url IS NULL OR thumbnail_url = '' THEN
      CASE 
        WHEN EXISTS (SELECT 1 FROM categories c WHERE c.id = images.category_id AND LOWER(c.name) LIKE '%fisheye%') 
        THEN '/placeholder.svg?height=200&width=200&text=Fisheye'
        WHEN EXISTS (SELECT 1 FROM categories c WHERE c.id = images.category_id AND LOWER(c.name) LIKE '%360%') 
        THEN '/placeholder.svg?height=200&width=200&text=360'
        ELSE '/placeholder.svg?height=200&width=200&text=Preview'
      END
    ELSE thumbnail_url
  END,
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'url_migration', 'final_fix_applied',
    'migration_date', NOW()::text,
    'original_image_url', CASE WHEN image_url LIKE '%/uploads/%' THEN image_url ELSE NULL END,
    'original_thumbnail_url', CASE WHEN thumbnail_url LIKE '%/uploads/%' THEN thumbnail_url ELSE NULL END
  ),
  updated_at = NOW()
WHERE 
  image_url LIKE '%/uploads/%' 
  OR thumbnail_url LIKE '%/uploads/%'
  OR image_url IS NULL 
  OR thumbnail_url IS NULL
  OR image_url = ''
  OR thumbnail_url = '';

-- Step 4: Show final results
SELECT 
  'SUMMARY' as section,
  COUNT(*) as total_images,
  COUNT(CASE WHEN image_url LIKE '/placeholder.svg%' THEN 1 END) as placeholder_images,
  COUNT(CASE WHEN image_url LIKE '%backblazeb2.com%' THEN 1 END) as backblaze_images,
  COUNT(CASE WHEN image_url LIKE '%vercel-storage.com%' THEN 1 END) as vercel_blob_images,
  COUNT(CASE WHEN image_url LIKE 'data:image/%' THEN 1 END) as data_url_images
FROM images

UNION ALL

SELECT 
  'CATEGORIES' as section,
  NULL as total_images,
  NULL as placeholder_images,
  NULL as backblaze_images,
  NULL as vercel_blob_images,
  NULL as data_url_images
FROM images LIMIT 0;

-- Show category breakdown
SELECT 
  c.name as category,
  COUNT(*) as total_images,
  COUNT(CASE WHEN i.image_url LIKE '/placeholder.svg%' THEN 1 END) as placeholder_count,
  COUNT(CASE WHEN i.image_url LIKE '%backblazeb2.com%' THEN 1 END) as backblaze_count
FROM images i
LEFT JOIN categories c ON i.category_id = c.id
GROUP BY c.name
ORDER BY total_images DESC;
