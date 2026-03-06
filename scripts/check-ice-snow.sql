-- SIMPLE DIAGNOSTIC - Check what's in Ice & Snow
SELECT 
  i.id, 
  i.title, 
  i.active, 
  i.image_format,
  i.thumbnail_medium_url,
  c.name as category
FROM images i
JOIN categories c ON i.category_id = c.id
WHERE c.name = 'Ice & Snow'
ORDER BY i.created_at DESC;
