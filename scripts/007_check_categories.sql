-- Check what categories exist in the database
SELECT 
  c.id,
  c.name,
  c.description,
  COUNT(i.id) as image_count
FROM categories c
LEFT JOIN images i ON c.id = i.category_id
GROUP BY c.id, c.name, c.description
ORDER BY c.name;

-- Also check a few sample images with their category names
SELECT 
  i.id,
  i.title,
  c.name as category_name,
  i.active
FROM images i
JOIN categories c ON i.category_id = c.id
WHERE i.active = true
LIMIT 10;
