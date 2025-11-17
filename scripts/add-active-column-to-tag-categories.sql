-- Add active column to existing tag_categories table
ALTER TABLE tag_categories 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Add active column to existing tags table if it doesn't exist
ALTER TABLE tags 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Update any NULL values to true (should not be any, but just in case)
UPDATE tag_categories SET active = true WHERE active IS NULL;
UPDATE tags SET active = true WHERE active IS NULL;
