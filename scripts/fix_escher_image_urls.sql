-- Fix specific broken escher image URLs that are failing to load
-- These URLs point to files that don't exist in Backblaze

-- First, let's see what we're dealing with
SELECT 
    id, 
    title, 
    image_url, 
    thumbnail_url,
    CASE 
        WHEN image_url LIKE '%escher%' OR thumbnail_url LIKE '%escher%' THEN 'ESCHER_IMAGE'
        ELSE 'OTHER'
    END as image_type
FROM images 
WHERE (image_url LIKE '%escher%' OR thumbnail_url LIKE '%escher%' OR title ILIKE '%escher%')
ORDER BY created_at DESC;

-- Update the broken escher URLs to use working placeholder images
UPDATE images 
SET 
    image_url = '/placeholder.svg?height=800&width=800&text=Escher+Style+Image',
    thumbnail_url = '/placeholder.svg?height=400&width=400&text=Escher+Preview',
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'original_broken_image_url', image_url,
        'original_broken_thumbnail_url', thumbnail_url,
        'fix_applied', 'escher_urls_fixed',
        'fix_date', NOW()::text
    )
WHERE (
    image_url LIKE '%f005.backblazeb2.com%' AND image_url LIKE '%escher%'
) OR (
    thumbnail_url LIKE '%f005.backblazeb2.com%' AND thumbnail_url LIKE '%escher%'
);

-- Show the results
SELECT 
    id, 
    title, 
    image_url, 
    thumbnail_url,
    metadata->'fix_applied' as fix_status
FROM images 
WHERE metadata->>'fix_applied' = 'escher_urls_fixed'
ORDER BY created_at DESC;
