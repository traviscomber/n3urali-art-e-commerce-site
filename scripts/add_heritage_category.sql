-- Add Heritage category to the database
-- This is the first promoted big category for cultural and historical 360° images

-- Insert Heritage category if it doesn't exist
INSERT INTO categories (name, description)
VALUES (
  'Heritage',
  'Cultural and historical landmarks, monuments, and architectural heritage sites captured in immersive 360° format'
)
ON CONFLICT (name) DO NOTHING;

-- Tag relevant existing images with heritage tag
UPDATE images 
SET tags = array_append(tags, 'heritage')
WHERE (
  title ILIKE '%temple%' 
  OR title ILIKE '%monument%' 
  OR title ILIKE '%palace%'
  OR title ILIKE '%cathedral%'
  OR title ILIKE '%mosque%'
  OR title ILIKE '%shrine%'
  OR title ILIKE '%ruins%'
  OR title ILIKE '%heritage%'
  OR title ILIKE '%historical%'
  OR title ILIKE '%ancient%'
  OR description ILIKE '%heritage%'
  OR description ILIKE '%historical%'
  OR description ILIKE '%cultural%'
)
AND NOT ('heritage' = ANY(tags));
