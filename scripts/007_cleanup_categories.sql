-- Clean up categories to only have the 2 required categories
-- This script will:
-- 1. Create the 2 required categories if they don't exist
-- 2. Update all images to use the correct categories
-- 3. Remove unwanted categories

-- Verify current state
DO $$
DECLARE
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count FROM categories;
    RAISE NOTICE 'Current category count: %', category_count;
    
    -- If we already have exactly 2 categories, we're done
    IF category_count = 2 THEN
        RAISE NOTICE 'Already have exactly 2 categories. No cleanup needed.';
        RETURN;
    END IF;
END $$;

-- Create the 2 required categories if they don't exist
INSERT INTO categories (name, description)
VALUES 
    ('Equirectangular', 'Equirectangular or 360° images - Full spherical panoramic images'),
    ('Fisheye', 'Fisheye or 180° images - Hemispherical wide-angle images')
ON CONFLICT (name) DO NOTHING;

-- Get the IDs of our target categories
DO $$
DECLARE
    equirectangular_id UUID;
    fisheye_id UUID;
    category_count INTEGER;
BEGIN
    -- Get the target category IDs
    SELECT id INTO equirectangular_id FROM categories WHERE name = 'Equirectangular' LIMIT 1;
    SELECT id INTO fisheye_id FROM categories WHERE name = 'Fisheye' LIMIT 1;
    
    -- Update images that might be using old category names
    UPDATE images SET category_id = equirectangular_id 
    WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%equirect%' AND id != equirectangular_id);
    
    UPDATE images SET category_id = fisheye_id 
    WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%fisheye%' AND id != fisheye_id);
    
    -- Delete duplicate/old categories
    DELETE FROM categories WHERE name NOT IN ('Equirectangular', 'Fisheye');
    
    -- Verify final count
    SELECT COUNT(*) INTO category_count FROM categories;
    RAISE NOTICE 'Final category count: %', category_count;
    
    IF category_count = 2 THEN
        RAISE NOTICE 'Category cleanup completed successfully!';
    ELSE
        RAISE WARNING 'Expected 2 categories but found %. Manual review may be needed.', category_count;
    END IF;
END $$;
