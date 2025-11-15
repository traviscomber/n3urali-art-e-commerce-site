-- Clean up duplicate categories in the database
-- This script removes duplicate category entries

-- First, let's see what we have
SELECT id, name, created_at FROM categories ORDER BY name, created_at;

-- Delete the lowercase duplicates, keeping only the properly capitalized ones
DELETE FROM categories 
WHERE name IN ('equirectangular', 'fisheye') 
AND name != initcap(name);

-- Verify the cleanup
SELECT id, name, created_at FROM categories ORDER BY name;

-- Expected result: Only 4 categories should remain:
-- Equirectangular, Fisheye, Landscape, Portrait
