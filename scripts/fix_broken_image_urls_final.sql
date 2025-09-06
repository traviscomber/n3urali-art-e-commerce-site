-- Check current broken URLs
SELECT 
    id, 
    title, 
    image_url, 
    thumbnail_url,
    CASE 
        WHEN image_url LIKE '%/uploads/%' THEN 'BROKEN'
        ELSE 'OK'
    END as image_status,
    CASE 
        WHEN thumbnail_url LIKE '%/uploads/%' THEN 'BROKEN'
        ELSE 'OK'
    END as thumb_status
FROM images 
WHERE image_url LIKE '%/uploads/%' OR thumbnail_url LIKE '%/uploads/%'
ORDER BY created_at DESC;

-- Update broken URLs to use placeholder images temporarily
UPDATE images 
SET 
    image_url = '/placeholder.svg?height=800&width=800',
    thumbnail_url = '/placeholder.svg?height=200&width=200',
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'migration_status', 'placeholder_urls_set',
        'migration_date', NOW()::text,
        'original_broken_url', image_url
    )
WHERE image_url LIKE '%/uploads/%' OR thumbnail_url LIKE '%/uploads/%';

-- Show results
SELECT 
    COUNT(*) as total_images,
    COUNT(CASE WHEN image_url LIKE '/placeholder.svg%' THEN 1 END) as placeholder_images,
    COUNT(CASE WHEN image_url LIKE '%backblazeb2.com%' THEN 1 END) as backblaze_images
FROM images;
