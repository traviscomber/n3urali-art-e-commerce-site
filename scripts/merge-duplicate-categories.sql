-- Merge duplicate categories into 2 main categories
-- This script consolidates "Equirectangular" and "Equirectangular or 360°" into one
-- and "Fisheye" and "Fisheye or 180°" into one

-- Step 1: Find the IDs of categories to keep and merge
-- We'll keep the ones with more descriptive names: "Equirectangular or 360°" and "Fisheye or 180°"

-- First, let's get the UUIDs of the categories (we'll use the ones we want to keep)
DO $$
DECLARE
    equirect_keep_id UUID;
    equirect_delete_id UUID;
    fisheye_keep_id UUID;
    fisheye_delete_id UUID;
BEGIN
    -- Get IDs for Equirectangular categories
    SELECT id INTO equirect_keep_id FROM categories WHERE name = 'Equirectangular or 360°' LIMIT 1;
    SELECT id INTO equirect_delete_id FROM categories WHERE name = 'Equirectangular' LIMIT 1;
    
    -- Get IDs for Fisheye categories
    SELECT id INTO fisheye_keep_id FROM categories WHERE name = 'Fisheye or 180°' LIMIT 1;
    SELECT id INTO fisheye_delete_id FROM categories WHERE name = 'Fisheye' LIMIT 1;
    
    -- Step 2: Update images to use the consolidated categories
    -- Move all "Equirectangular" images to "Equirectangular or 360°"
    IF equirect_delete_id IS NOT NULL AND equirect_keep_id IS NOT NULL THEN
        UPDATE images 
        SET category_id = equirect_keep_id 
        WHERE category_id = equirect_delete_id;
        
        RAISE NOTICE 'Merged Equirectangular images into Equirectangular or 360°';
    END IF;
    
    -- Move all "Fisheye" images to "Fisheye or 180°"
    IF fisheye_delete_id IS NOT NULL AND fisheye_keep_id IS NOT NULL THEN
        UPDATE images 
        SET category_id = fisheye_keep_id 
        WHERE category_id = fisheye_delete_id;
        
        RAISE NOTICE 'Merged Fisheye images into Fisheye or 180°';
    END IF;
    
    -- Step 3: Delete the duplicate categories
    IF equirect_delete_id IS NOT NULL THEN
        DELETE FROM categories WHERE id = equirect_delete_id;
        RAISE NOTICE 'Deleted duplicate Equirectangular category';
    END IF;
    
    IF fisheye_delete_id IS NOT NULL THEN
        DELETE FROM categories WHERE id = fisheye_delete_id;
        RAISE NOTICE 'Deleted duplicate Fisheye category';
    END IF;
    
    RAISE NOTICE 'Category merge completed successfully';
END $$;

-- Verify the results
SELECT 
    c.name,
    c.id,
    COUNT(i.id) as image_count
FROM categories c
LEFT JOIN images i ON c.id = i.category_id
GROUP BY c.id, c.name
ORDER BY c.name;
