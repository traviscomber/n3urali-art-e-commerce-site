-- COMPREHENSIVE FIX FOR CATEGORIES AND IMAGES

-- Step 1: Verify Ice & Snow images exist and are properly configured
SELECT COUNT(*) as ice_snow_count, 
  COUNT(*) FILTER (WHERE active = true) as ice_snow_active,
  COUNT(*) FILTER (WHERE image_format IS NOT NULL) as with_format
FROM images i
JOIN categories c ON i.category_id = c.id
WHERE c.name = 'Ice & Snow';

-- Step 2: Ensure Ice & Snow images have proper image_format set
UPDATE images
SET image_format = 'equirectangular'
WHERE category_id IN (SELECT id FROM categories WHERE name = 'Ice & Snow')
  AND image_format IS NULL;

-- Step 3: Merge Underwater images into Ocean category
-- First, get the Ocean category ID
WITH ocean_cat AS (
  SELECT id FROM categories WHERE name = 'Ocean' LIMIT 1
),
underwater_cat AS (
  SELECT id FROM categories WHERE name = 'Underwater' LIMIT 1
)
UPDATE images
SET category_id = (SELECT id FROM ocean_cat)
WHERE category_id = (SELECT id FROM underwater_cat);

-- Step 4: Delete Underwater category
DELETE FROM categories WHERE name = 'Underwater';

-- Step 5: Create or rename to Forest category (delete if exists, then create fresh)
DELETE FROM categories WHERE name = 'Forest';

INSERT INTO categories (id, name, description, created_at)
VALUES (
  gen_random_uuid(),
  'Forest',
  'Ultra high-resolution 360° panoramic imagery of forests, woodlands, and dense vegetation environments',
  NOW()
);

-- Step 6: Verify all changes
SELECT 
  c.name,
  COUNT(i.id) as total_images,
  COUNT(i.id) FILTER (WHERE i.active = true) as active_images,
  COUNT(i.id) FILTER (WHERE i.image_format = 'equirectangular') as equirectangular,
  COUNT(i.id) FILTER (WHERE i.image_format = 'fisheye') as fisheye
FROM categories c
LEFT JOIN images i ON c.id = i.category_id
WHERE c.name IN ('Ice & Snow', 'Ocean', 'Forest', 'Equirectangular', 'Fisheye')
GROUP BY c.id, c.name
ORDER BY c.name;
