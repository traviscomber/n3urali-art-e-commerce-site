-- Clean up categories to only have the 2 required categories
-- This script will:
-- 1. Create the 2 required categories if they don't exist
-- 2. Update all images to use the correct categories
-- 3. Remove unwanted categories

-- First, let's see what categories we currently have
DO $$
DECLARE
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count FROM categories;
    RAISE NOTICE 'Current category count: %', category_count;
END $$;

-- Create the 2 required categories if they don't exist
INSERT INTO categories (id, name, description, created_at)
VALUES 
    (gen_random_uuid(), 'equirectangular', 'Equirectangular or 360° images - Full spherical panoramic images', NOW()),
    (gen_random_uuid(), 'fisheye', 'Fisheye or 180° images - Hemispherical wide-angle images', NOW())
ON CONFLICT (name) DO NOTHING;

-- Get the IDs of our target categories
DO $$
DECLARE
    equirectangular_id UUID;
    fisheye_id UUID;
    old_category_record RECORD;
BEGIN
    -- Get the target category IDs
    SELECT id INTO equirectangular_id FROM categories WHERE name = 'equirectangular' LIMIT 1;
    SELECT id INTO fisheye_id FROM categories WHERE name = 'fisheye' LIMIT 1;
    
    RAISE NOTICE 'Target equirectangular category ID: %', equirectangular_id;
    RAISE NOTICE 'Target fisheye category ID: %', fisheye_id;
    
    -- Update images that are using old/duplicate category names
    -- Map "Equirectangular" (capitalized) to "equirectangular"
    FOR old_category_record IN 
        SELECT id, name FROM categories WHERE name IN ('Equirectangular', 'Stereographic', 'Fisheye')
    LOOP
        RAISE NOTICE 'Processing old category: % (ID: %)', old_category_record.name, old_category_record.id;
        
        IF old_category_record.name = 'Equirectangular' THEN
            -- Update images from "Equirectangular" to "equirectangular"
            UPDATE images SET category_id = equirectangular_id WHERE category_id = old_category_record.id;
            RAISE NOTICE 'Updated images from "Equirectangular" to "equirectangular"';
        ELSIF old_category_record.name = 'Fisheye' THEN
            -- Update images from "Fisheye" to "fisheye"
            UPDATE images SET category_id = fisheye_id WHERE category_id = old_category_record.id;
            RAISE NOTICE 'Updated images from "Fisheye" to "fisheye"';
        ELSIF old_category_record.name = 'Stereographic' THEN
            -- Map Stereographic to fisheye (since it's a type of wide-angle projection)
            UPDATE images SET category_id = fisheye_id WHERE category_id = old_category_record.id;
            RAISE NOTICE 'Updated images from "Stereographic" to "fisheye"';
        END IF;
    END LOOP;
    
    -- Delete the old/duplicate categories
    DELETE FROM categories WHERE name IN ('Equirectangular', 'Stereographic', 'Fisheye');
    RAISE NOTICE 'Deleted old/duplicate categories';
    
END $$;

-- Verify the final state
DO $$
DECLARE
    category_record RECORD;
    image_count INTEGER;
BEGIN
    RAISE NOTICE '=== FINAL CATEGORY STATE ===';
    
    FOR category_record IN 
        SELECT c.id, c.name, c.description, COUNT(i.id) as image_count
        FROM categories c
        LEFT JOIN images i ON c.id = i.category_id
        GROUP BY c.id, c.name, c.description
        ORDER BY c.name
    LOOP
        RAISE NOTICE 'Category: % (%) - % images', category_record.name, category_record.description, category_record.image_count;
    END LOOP;
    
    SELECT COUNT(*) INTO image_count FROM categories;
    RAISE NOTICE 'Total categories: %', image_count;
    
    -- Ensure we have exactly 2 categories
    IF image_count != 2 THEN
        RAISE EXCEPTION 'Expected exactly 2 categories, but found %', image_count;
    END IF;
    
    RAISE NOTICE 'Category cleanup completed successfully!';
END $$;
