-- Create script to fix the last 2 problematic images by updating their URLs to working placeholders
-- First, let's identify images with broken URLs
SELECT 
    id,
    title,
    thumbnail_url,
    image_url,
    category_id,
    CASE 
        WHEN thumbnail_url LIKE '%/uploads/%' THEN 'BROKEN_THUMBNAIL'
        WHEN image_url LIKE '%/uploads/%' THEN 'BROKEN_IMAGE'
        WHEN thumbnail_url IS NULL AND image_url IS NULL THEN 'NO_URLS'
        ELSE 'POTENTIALLY_OK'
    END as status
FROM images 
WHERE 
    thumbnail_url LIKE '%/uploads/%' 
    OR image_url LIKE '%/uploads/%'
    OR (thumbnail_url IS NULL AND image_url IS NULL)
ORDER BY created_at DESC;

-- Update broken thumbnail URLs to use category-appropriate placeholders
UPDATE images 
SET 
    thumbnail_url = CASE 
        WHEN EXISTS (SELECT 1 FROM categories c WHERE c.id = images.category_id AND LOWER(c.name) = 'fisheye') 
        THEN '/placeholder.svg?height=400&width=400&text=Fisheye+Image'
        ELSE '/placeholder.svg?height=400&width=400&text=360+Image'
    END,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'original_thumbnail_url', thumbnail_url,
        'fixed_date', NOW()::text,
        'fix_reason', 'broken_uploads_url'
    )
WHERE thumbnail_url LIKE '%/uploads/%';

-- Update broken main image URLs to use category-appropriate placeholders  
UPDATE images 
SET 
    image_url = CASE 
        WHEN EXISTS (SELECT 1 FROM categories c WHERE c.id = images.category_id AND LOWER(c.name) = 'fisheye') 
        THEN '/placeholder.svg?height=800&width=800&text=Fisheye+Image'
        ELSE '/placeholder.svg?height=800&width=800&text=360+Image'
    END,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'original_image_url', image_url,
        'fixed_date', NOW()::text,
        'fix_reason', 'broken_uploads_url'
    )
WHERE image_url LIKE '%/uploads/%';

-- Handle images with no URLs at all
UPDATE images 
SET 
    thumbnail_url = CASE 
        WHEN EXISTS (SELECT 1 FROM categories c WHERE c.id = images.category_id AND LOWER(c.name) = 'fisheye') 
        THEN '/placeholder.svg?height=400&width=400&text=Fisheye+Image'
        ELSE '/placeholder.svg?height=400&width=400&text=360+Image'
    END,
    image_url = CASE 
        WHEN EXISTS (SELECT 1 FROM categories c WHERE c.id = images.category_id AND LOWER(c.name) = 'fisheye') 
        THEN '/placeholder.svg?height=800&width=800&text=Fisheye+Image'
        ELSE '/placeholder.svg?height=800&width=800&text=360+Image'
    END,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'fixed_date', NOW()::text,
        'fix_reason', 'missing_urls'
    )
WHERE thumbnail_url IS NULL AND image_url IS NULL;

-- Show results
SELECT 
    COUNT(*) as total_images,
    COUNT(CASE WHEN thumbnail_url LIKE '%placeholder.svg%' THEN 1 END) as placeholder_thumbnails,
    COUNT(CASE WHEN image_url LIKE '%placeholder.svg%' THEN 1 END) as placeholder_images,
    COUNT(CASE WHEN thumbnail_url LIKE '%f005.backblazeb2.com%' THEN 1 END) as backblaze_thumbnails,
    COUNT(CASE WHEN image_url LIKE '%f005.backblazeb2.com%' THEN 1 END) as backblaze_images
FROM images;
