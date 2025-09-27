-- Add thumbnail columns to images table
ALTER TABLE images 
ADD COLUMN IF NOT EXISTS thumbnail_small_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_medium_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_large_url TEXT,
ADD COLUMN IF NOT EXISTS original_url TEXT;

-- Update existing records to have original_url based on file_path
UPDATE images 
SET original_url = CASE 
  WHEN file_path IS NOT NULL THEN 
    'https://f005.backblazeb2.com/file/' || 
    (SELECT value FROM (VALUES ('${BACKBLAZE_BUCKET_NAME}')) AS t(value)) || 
    '/' || file_path
  ELSE NULL 
END
WHERE original_url IS NULL;
