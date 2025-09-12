-- Add original_file_url column to images table for manual high-res file URLs
ALTER TABLE images 
ADD COLUMN IF NOT EXISTS original_file_url TEXT;

-- Add comment to explain the column purpose
COMMENT ON COLUMN images.original_file_url IS 'URL to the original high-resolution file for download after purchase. Used when file is too large for web upload (>15MB).';

-- Update existing records to use image_url as original_file_url if not set
UPDATE images 
SET original_file_url = image_url 
WHERE original_file_url IS NULL;
