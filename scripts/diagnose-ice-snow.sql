-- Diagnostic script to check Ice & Snow images

-- Check if category exists
SELECT id, name, description FROM categories WHERE name = 'Ice & Snow';

-- Check all images in Ice & Snow category
SELECT 
  i.id, i.title, i.active, i.thumbnail_medium_url, 
  i.image_format, c.name as category_name
FROM images i
LEFT JOIN categories c ON i.category_id = c.id
WHERE c.name = 'Ice & Snow'
ORDER BY i.created_at DESC;

-- Count images by status
SELECT 
  COUNT(*) as total_images,
  SUM(CASE WHEN i.active = true THEN 1 ELSE 0 END) as active_images,
  SUM(CASE WHEN i.thumbnail_medium_url IS NOT NULL THEN 1 ELSE 0 END) as with_thumbnails
FROM images i
LEFT JOIN categories c ON i.category_id = c.id
WHERE c.name = 'Ice & Snow';
