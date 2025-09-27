-- Debug script to check database content
SELECT 'Images table content:' as debug_info;
SELECT id, title, file_path, category_id, is_featured, created_at 
FROM images 
ORDER BY created_at DESC 
LIMIT 10;

SELECT 'Categories table content:' as debug_info;
SELECT id, name, description, active 
FROM categories 
ORDER BY name;

SELECT 'Total counts:' as debug_info;
SELECT 
  (SELECT COUNT(*) FROM images) as total_images,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM images WHERE category_id IS NOT NULL) as images_with_category;
