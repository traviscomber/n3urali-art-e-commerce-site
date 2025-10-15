-- Remove sample/placeholder images that have placeholder.svg URLs
-- These are test records that should not be displayed in the gallery

DELETE FROM images 
WHERE file_path LIKE '%placeholder.svg%'
   OR file_path LIKE '/placeholder%';

-- Also remove any images with empty or null file_path
DELETE FROM images 
WHERE file_path IS NULL 
   OR file_path = ''
   OR TRIM(file_path) = '';

-- Log the cleanup
SELECT 'Placeholder images removed successfully' AS status;
