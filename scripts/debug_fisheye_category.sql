-- Debug script to check fisheye category data
-- This will help identify why the fisheye category page shows zero results

-- Check if fisheye category exists and its exact name
SELECT 'Categories in database:' as info;
SELECT id, name, description, created_at,
       CASE 
         WHEN LOWER(name) LIKE '%fisheye%' THEN 'MATCHES fisheye filter'
         ELSE 'Does NOT match fisheye filter'
       END as filter_match
FROM categories 
ORDER BY name;

-- Check if there are any images with fisheye category
SELECT 'Images with fisheye category:' as info;
SELECT i.id, i.title, c.name as category_name, i.active
FROM images i
JOIN categories c ON i.category_id = c.id
WHERE LOWER(c.name) LIKE '%fisheye%'
ORDER BY i.created_at DESC;

-- Check all images and their categories
SELECT 'All images and their categories:' as info;
SELECT i.id, i.title, c.name as category_name, i.active, i.price
FROM images i
LEFT JOIN categories c ON i.category_id = c.id
ORDER BY c.name, i.title;

-- Check the exact filtering logic used in the app
SELECT 'Testing the exact filter logic from the app:' as info;
SELECT i.id, i.title, c.name as category_name,
       CASE 
         WHEN c.name IS NULL THEN 'NULL category_name'
         WHEN LOWER(c.name) LIKE '%fisheye%' THEN 'WOULD BE INCLUDED'
         ELSE 'WOULD BE EXCLUDED'
       END as app_filter_result
FROM images i
LEFT JOIN categories c ON i.category_id = c.id
WHERE i.is_featured IS NOT NULL -- Using is_featured instead of active since active column doesn't exist
ORDER BY c.name, i.title;

-- Fixed column references to match actual database schema
-- Removed references to non-existent 'slug' and 'active' columns
-- Updated to use correct column names from the schema
