-- Restore missing categories for n3urali.art
-- This script ensures the three main categories exist: equirectangular, fisheye, and stereographic

-- First, check if categories exist and insert if missing
INSERT INTO categories (id, name, description, created_at)
SELECT 
  gen_random_uuid(),
  'equirectangular',
  '360-degree panoramic images that provide a full spherical view',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE name = 'equirectangular'
);

INSERT INTO categories (id, name, description, created_at)
SELECT 
  gen_random_uuid(),
  'fisheye',
  '180-degree wide-angle images with distinctive curved perspective',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE name = 'fisheye'
);

INSERT INTO categories (id, name, description, created_at)
SELECT 
  gen_random_uuid(),
  'stereographic',
  'Stereographic projection images with unique geometric transformation',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE name = 'stereographic'
);

-- Verify the categories were created
SELECT name, description, created_at FROM categories ORDER BY name;
