-- Remove '360' tag from fisheye and panoramic images
-- Keep '360' tags only for equirectangular images which are true 360-degree spherical images

-- Updated to use proper table joins with categories table instead of non-existent category column
-- Remove '360' from fisheye images
UPDATE images 
SET tags = array_remove(tags, '360')
FROM categories 
WHERE images.category_id = categories.id 
AND categories.name = 'fisheye' 
AND '360' = ANY(images.tags);

-- Remove '360' from panoramic images  
UPDATE images 
SET tags = array_remove(tags, '360')
FROM categories 
WHERE images.category_id = categories.id 
AND categories.name = 'panoramic' 
AND '360' = ANY(images.tags);

-- Also remove '360°' (with degree symbol) from fisheye images
UPDATE images 
SET tags = array_remove(tags, '360°')
FROM categories 
WHERE images.category_id = categories.id 
AND categories.name = 'fisheye' 
AND '360°' = ANY(images.tags);

-- Also remove '360°' (with degree symbol) from panoramic images
UPDATE images 
SET tags = array_remove(tags, '360°')
FROM categories 
WHERE images.category_id = categories.id 
AND categories.name = 'panoramic' 
AND '360°' = ANY(images.tags);

-- Updated logging to use proper joins and show actual affected rows
-- Log the changes
DO $$
DECLARE
    fisheye_updated INTEGER;
    panoramic_updated INTEGER;
    fisheye_total INTEGER;
    panoramic_total INTEGER;
BEGIN
    -- Count total fisheye images
    SELECT COUNT(*) INTO fisheye_total
    FROM images i
    JOIN categories c ON i.category_id = c.id 
    WHERE c.name = 'fisheye';
    
    -- Count total panoramic images  
    SELECT COUNT(*) INTO panoramic_total
    FROM images i
    JOIN categories c ON i.category_id = c.id 
    WHERE c.name = 'panoramic';
    
    -- Count fisheye images that had 360 tags (approximation)
    SELECT COUNT(*) INTO fisheye_updated
    FROM images i
    JOIN categories c ON i.category_id = c.id 
    WHERE c.name = 'fisheye'
    AND (tags @> ARRAY['360'] OR tags @> ARRAY['360°']);
    
    -- Count panoramic images that had 360 tags (approximation)
    SELECT COUNT(*) INTO panoramic_updated
    FROM images i
    JOIN categories c ON i.category_id = c.id 
    WHERE c.name = 'panoramic'
    AND (tags @> ARRAY['360'] OR tags @> ARRAY['360°']);
    
    RAISE NOTICE 'Found % total fisheye images and % total panoramic images', 
                 fisheye_total, panoramic_total;
    RAISE NOTICE 'Approximately % fisheye and % panoramic images may have had 360 tags removed', 
                 fisheye_updated, panoramic_updated;
END $$;
