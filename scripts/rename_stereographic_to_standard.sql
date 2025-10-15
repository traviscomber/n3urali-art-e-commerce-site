-- Rename Stereographic category to Standard
-- This updates the category name in the database

UPDATE categories
SET 
  name = 'Standard',
  description = 'Standard projection images with traditional perspective'
WHERE name ILIKE 'stereographic';

-- Verify the update
SELECT id, name, description FROM categories WHERE name = 'Standard';
