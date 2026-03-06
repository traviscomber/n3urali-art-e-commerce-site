-- Diagnostic script for missing images in Oceans and Ice & Snow categories

-- Step 1: Check categories
SELECT id, name, description FROM categories WHERE name IN ('Oceans', 'Ice & Snow', 'Ice', 'Snow');

-- Step 2: Count images in these categories
SELECT c.name as category, COUNT(i.id) as total_images, 
  SUM(CASE WHEN i.active = true THEN 1 ELSE 0 END) as active_images,
  SUM(CASE WHEN i.thumbnail_medium_url IS NOT NULL THEN 1 ELSE 0 END) as with_thumbnails
FROM categories c
LEFT JOIN images i ON c.id = i.category_id
WHERE c.name IN ('Oceans', 'Ice & Snow', 'Ice', 'Snow')
GROUP BY c.id, c.name;

-- Step 3: List inactive images in these categories that could be restored
SELECT i.id, i.title, i.active, i.thumbnail_medium_url, i.file_path, c.name as category
FROM images i
LEFT JOIN categories c ON i.category_id = c.id
WHERE c.name IN ('Oceans', 'Ice & Snow', 'Ice', 'Snow')
  AND (i.active = false OR i.thumbnail_medium_url IS NULL)
ORDER BY c.name, i.created_at DESC;

-- Step 4: Restore inactive images (if they have proper URLs)
UPDATE images i
SET active = true
WHERE i.category_id IN (SELECT id FROM categories WHERE name IN ('Oceans', 'Ice & Snow', 'Ice', 'Snow'))
  AND i.active = false
  AND i.thumbnail_medium_url IS NOT NULL
  AND (i.original_url IS NOT NULL OR i.file_path IS NOT NULL);

-- Step 5: Generate missing thumbnails by using original_url as thumbnail if needed
UPDATE images i
SET thumbnail_medium_url = COALESCE(i.original_url, i.file_path, i.original_file_url)
WHERE i.category_id IN (SELECT id FROM categories WHERE name IN ('Oceans', 'Ice & Snow', 'Ice', 'Snow'))
  AND i.thumbnail_medium_url IS NULL
  AND (i.original_url IS NOT NULL OR i.file_path IS NOT NULL);

-- Step 6: Final verification - show restored images
SELECT c.name as category, COUNT(i.id) as restored_active_images
FROM categories c
LEFT JOIN images i ON c.id = i.category_id AND i.active = true AND i.thumbnail_medium_url IS NOT NULL
WHERE c.name IN ('Oceans', 'Ice & Snow', 'Ice', 'Snow')
GROUP BY c.id, c.name;
