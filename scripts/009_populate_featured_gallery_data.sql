-- Populate image_format based on existing categories
-- Map "Equirectangular" category to "equirectangular" format
-- Map "Fisheye" category to "dome" format (fisheye is typically dome projection)

-- Update image_format for Equirectangular images
UPDATE images
SET image_format = 'equirectangular'
FROM categories
WHERE images.category_id = categories.id
  AND LOWER(categories.name) = 'equirectangular'
  AND images.image_format IS NULL;

-- Update image_format for Fisheye/Dome images
UPDATE images
SET image_format = 'dome'
FROM categories
WHERE images.category_id = categories.id
  AND LOWER(categories.name) = 'fisheye'
  AND images.image_format IS NULL;

-- Mark the first 20 active images as featured for the Collection tab
-- Prioritize featured images first, then by creation date
UPDATE images
SET featured_collection = true
WHERE id IN (
  SELECT id
  FROM images
  WHERE active = true
  ORDER BY 
    is_featured DESC,
    created_at DESC
  LIMIT 20
);

-- Verify the updates
SELECT 
  image_format,
  COUNT(*) as count
FROM images
WHERE image_format IS NOT NULL
GROUP BY image_format
ORDER BY image_format;

SELECT 
  COUNT(*) as featured_collection_count
FROM images
WHERE featured_collection = true;
