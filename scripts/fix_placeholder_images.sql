-- Fix existing images that have placeholder URLs
-- Update them with working Unsplash image URLs

-- Update Ocean Sunset 360°
UPDATE images 
SET 
    original_url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
    thumbnail_small_url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
    thumbnail_medium_url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    thumbnail_large_url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop'
WHERE title = 'Ocean Sunset 360°';

-- Update Mountain Peak 360°
UPDATE images 
SET 
    original_url = 'https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=1200&h=600&fit=crop',
    thumbnail_small_url = 'https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=300&h=200&fit=crop',
    thumbnail_medium_url = 'https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=600&h=400&fit=crop',
    thumbnail_large_url = 'https://images.unsplash.com/photo-1464822759844-d150ad6d1dff?w=1200&h=800&fit=crop'
WHERE title = 'Mountain Peak 360°';

-- Update Forest Trail 360°
UPDATE images 
SET 
    original_url = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=600&fit=crop',
    thumbnail_small_url = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
    thumbnail_medium_url = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
    thumbnail_large_url = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop'
WHERE title = 'Forest Trail 360°';

-- Update Beach Paradise 360°
UPDATE images 
SET 
    original_url = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=600&fit=crop',
    thumbnail_small_url = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop',
    thumbnail_medium_url = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
    thumbnail_large_url = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop'
WHERE title = 'Beach Paradise 360°';

-- Update City Skyline 360°
UPDATE images 
SET 
    original_url = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=600&fit=crop',
    thumbnail_small_url = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop',
    thumbnail_medium_url = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop',
    thumbnail_large_url = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=800&fit=crop'
WHERE title = 'City Skyline 360°';

-- Update Architectural Fisheye
UPDATE images 
SET 
    original_url = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop',
    thumbnail_small_url = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=300&fit=crop',
    thumbnail_medium_url = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=600&fit=crop',
    thumbnail_large_url = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop'
WHERE title = 'Architectural Fisheye';

-- Update Nature Fisheye
UPDATE images 
SET 
    original_url = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop',
    thumbnail_small_url = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop',
    thumbnail_medium_url = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=600&fit=crop',
    thumbnail_large_url = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop'
WHERE title = 'Nature Fisheye';

-- Update Planet Earth View
UPDATE images 
SET 
    original_url = 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=800&fit=crop',
    thumbnail_small_url = 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300&h=300&fit=crop',
    thumbnail_medium_url = 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=600&h=600&fit=crop',
    thumbnail_large_url = 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=800&fit=crop'
WHERE title = 'Planet Earth View';

-- Verify the updates
SELECT 
    title,
    CASE 
        WHEN original_url LIKE '%placeholder.svg%' THEN 'STILL PLACEHOLDER'
        WHEN original_url LIKE '%unsplash.com%' THEN 'FIXED - UNSPLASH'
        ELSE 'OTHER URL'
    END as url_status,
    original_url
FROM images 
ORDER BY title;

-- Show count of fixed vs placeholder images
SELECT 
    CASE 
        WHEN original_url LIKE '%placeholder.svg%' THEN 'Placeholder'
        WHEN original_url LIKE '%unsplash.com%' THEN 'Real Image'
        ELSE 'Other'
    END as image_type,
    COUNT(*) as count
FROM images 
GROUP BY 
    CASE 
        WHEN original_url LIKE '%placeholder.svg%' THEN 'Placeholder'
        WHEN original_url LIKE '%unsplash.com%' THEN 'Real Image'
        ELSE 'Other'
    END;
