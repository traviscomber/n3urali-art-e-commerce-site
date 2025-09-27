-- Add additional thumbnail size columns to images table
ALTER TABLE images 
ADD COLUMN IF NOT EXISTS thumbnail_small_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_medium_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_large_url TEXT,
ADD COLUMN IF NOT EXISTS original_file_url TEXT;

-- Update existing records to use file_path as original_file_url if not set
UPDATE images 
SET original_file_url = file_path 
WHERE original_file_url IS NULL AND file_path IS NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_images_thumbnails ON images(thumbnail_url, thumbnail_small_url, thumbnail_medium_url);

COMMENT ON COLUMN images.thumbnail_small_url IS 'Small thumbnail (150x150) for grid views';
COMMENT ON COLUMN images.thumbnail_medium_url IS 'Medium thumbnail (300x300) for card views';  
COMMENT ON COLUMN images.thumbnail_large_url IS 'Large thumbnail (600x400) for preview';
COMMENT ON COLUMN images.original_file_url IS 'Original full-size image URL';
