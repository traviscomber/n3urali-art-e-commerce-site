-- Add tags column to images table
ALTER TABLE images ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add some sample tags to existing images
UPDATE images SET tags = ARRAY['nature', 'landscape', 'outdoor'] WHERE title ILIKE '%nature%' OR title ILIKE '%landscape%' OR title ILIKE '%outdoor%';
UPDATE images SET tags = ARRAY['architecture', 'building', 'urban'] WHERE title ILIKE '%building%' OR title ILIKE '%architecture%' OR title ILIKE '%urban%';
UPDATE images SET tags = ARRAY['interior', 'room', 'indoor'] WHERE title ILIKE '%interior%' OR title ILIKE '%room%' OR title ILIKE '%indoor%';
UPDATE images SET tags = ARRAY['abstract', 'artistic', 'creative'] WHERE title ILIKE '%abstract%' OR title ILIKE '%artistic%' OR title ILIKE '%creative%';
UPDATE images SET tags = ARRAY['sky', 'clouds', 'atmosphere'] WHERE title ILIKE '%sky%' OR title ILIKE '%cloud%' OR title ILIKE '%atmosphere%';
UPDATE images SET tags = ARRAY['water', 'ocean', 'sea'] WHERE title ILIKE '%water%' OR title ILIKE '%ocean%' OR title ILIKE '%sea%';
UPDATE images SET tags = ARRAY['forest', 'trees', 'nature'] WHERE title ILIKE '%forest%' OR title ILIKE '%tree%';
UPDATE images SET tags = ARRAY['city', 'urban', 'street'] WHERE title ILIKE '%city%' OR title ILIKE '%street%';
UPDATE images SET tags = ARRAY['sunset', 'sunrise', 'golden hour'] WHERE title ILIKE '%sunset%' OR title ILIKE '%sunrise%';
UPDATE images SET tags = ARRAY['night', 'dark', 'evening'] WHERE title ILIKE '%night%' OR title ILIKE '%dark%' OR title ILIKE '%evening%';

-- Add default tags for images that don't have any specific matches
UPDATE images SET tags = ARRAY['360', 'panoramic', 'immersive'] WHERE tags = '{}' OR tags IS NULL;

-- Create an index on tags for better performance
CREATE INDEX IF NOT EXISTS idx_images_tags ON images USING GIN (tags);
