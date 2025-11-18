-- Add music_url field to collections table
ALTER TABLE collections
ADD COLUMN IF NOT EXISTS music_url TEXT;

-- Update existing collections with placeholder comment
COMMENT ON COLUMN collections.music_url IS 'URL to ambient music file (MP3/WAV) for immersive collection viewing';

-- Show updated table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'collections'
AND column_name = 'music_url';
