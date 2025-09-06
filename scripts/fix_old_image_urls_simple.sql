-- Check current URLs to understand the problem
SELECT 
    id, 
    title,
    image_url,
    thumbnail_url,
    CASE 
        WHEN image_url LIKE '%/uploads/%' THEN 'OLD FORMAT'
        ELSE 'NEW FORMAT'
    END as url_status
FROM images 
WHERE image_url LIKE '%/uploads/%' OR thumbnail_url LIKE '%/uploads/%'
LIMIT 10;

-- Fixed JSON syntax error by using jsonb_build_object instead of string concatenation
UPDATE images 
SET 
    image_url = CASE 
        WHEN image_url LIKE '%/uploads/%' THEN '/placeholder.svg?height=800&width=800'
        ELSE image_url
    END,
    thumbnail_url = CASE 
        WHEN thumbnail_url LIKE '%/uploads/%' THEN '/placeholder.svg?height=200&width=200'
        ELSE thumbnail_url
    END,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'migration_status', 'placeholder_urls_set',
        'migration_date', NOW()::text
    )
WHERE image_url LIKE '%/uploads/%' OR thumbnail_url LIKE '%/uploads/%';

-- Show results
SELECT 
    COUNT(*) as updated_images,
    COUNT(CASE WHEN image_url LIKE '%placeholder%' THEN 1 END) as placeholder_images
FROM images;
