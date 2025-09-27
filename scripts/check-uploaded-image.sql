-- Check the uploaded image data
SELECT 
  id,
  title,
  original_url,
  thumbnail_small_url,
  thumbnail_medium_url,
  thumbnail_large_url,
  file_path,
  created_at
FROM images 
WHERE id = 'c907a40a-777d-4bbb-8c61-0fde20cf61ce';

-- Also check all images to see what we have
SELECT 
  id,
  title,
  original_url,
  CASE 
    WHEN original_url IS NULL OR original_url = '' THEN 'MISSING'
    ELSE 'PRESENT'
  END as url_status
FROM images 
ORDER BY created_at DESC;
