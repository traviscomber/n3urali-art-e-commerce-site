-- Clean up duplicate categories and standardize to capitalized versions
-- First, update any images that reference the lowercase categories to use the capitalized ones

-- Update images using lowercase 'equirectangular' to use 'Equirectangular'
UPDATE images 
SET category_id = (SELECT id FROM categories WHERE name = 'Equirectangular' LIMIT 1)
WHERE category_id = (SELECT id FROM categories WHERE name = 'equirectangular' LIMIT 1);

-- Update images using lowercase 'fisheye' to use 'Fisheye'  
UPDATE images 
SET category_id = (SELECT id FROM categories WHERE name = 'Fisheye' LIMIT 1)
WHERE category_id = (SELECT id FROM categories WHERE name = 'fisheye' LIMIT 1);

-- Update images using lowercase 'stereographic' to use 'Stereographic'
UPDATE images 
SET category_id = (SELECT id FROM categories WHERE name = 'Stereographic' LIMIT 1)
WHERE category_id = (SELECT id FROM categories WHERE name = 'stereographic' LIMIT 1);

-- Now delete the lowercase duplicate categories
DELETE FROM categories WHERE name = 'equirectangular';
DELETE FROM categories WHERE name = 'fisheye';  
DELETE FROM categories WHERE name = 'stereographic';

-- Verify we have the correct categories remaining
SELECT * FROM categories ORDER BY name;
