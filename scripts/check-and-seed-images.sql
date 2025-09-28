-- First, let's check what's currently in the database
SELECT 'Current images count:' as info, COUNT(*) as count FROM images;
SELECT 'Current categories count:' as info, COUNT(*) as count FROM categories;
SELECT 'Current licenses count:' as info, COUNT(*) as count FROM licenses;

-- Show existing data
SELECT 'Existing images:' as info;
SELECT id, title, category_id, license_id, price, file_path, is_featured, active FROM images LIMIT 5;

SELECT 'Existing categories:' as info;
SELECT id, name, description FROM categories;

SELECT 'Existing licenses:' as info;
SELECT id, name, description FROM licenses;

-- Create sample categories if they don't exist
INSERT INTO categories (name, description) 
VALUES 
  ('equirectangular', '360-degree panoramic images')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, description) 
VALUES 
  ('fisheye', '180-degree fisheye lens images')
ON CONFLICT (name) DO NOTHING;

-- Create sample licenses if they don't exist
INSERT INTO licenses (name, description, active) 
VALUES 
  ('Standard', 'Standard commercial license', true),
  ('PRO', 'Professional commercial license with extended rights', true)
ON CONFLICT (name) DO NOTHING;

-- Add sample images if the table is empty
INSERT INTO images (
  title, 
  description, 
  category_id, 
  license_id, 
  price, 
  file_path,
  thumbnail_small_url,
  thumbnail_medium_url,
  thumbnail_large_url,
  original_url,
  is_featured, 
  active
)
SELECT 
  'Sample 360° Office Space',
  'High-resolution 360-degree view of a modern office environment',
  c.id,
  l.id,
  29.99,
  '/placeholder.svg?height=2048&width=4096&text=360+Office+Space',
  '/placeholder.svg?height=200&width=400&text=360+Office+Thumb',
  '/placeholder.svg?height=400&width=800&text=360+Office+Medium',
  '/placeholder.svg?height=600&width=1200&text=360+Office+Large',
  '/placeholder.svg?height=2048&width=4096&text=360+Office+Original',
  true,
  true
FROM categories c, licenses l 
WHERE c.name = 'equirectangular' AND l.name = 'Standard'
AND NOT EXISTS (SELECT 1 FROM images WHERE title = 'Sample 360° Office Space');

INSERT INTO images (
  title, 
  description, 
  category_id, 
  license_id, 
  price, 
  file_path,
  thumbnail_small_url,
  thumbnail_medium_url,
  thumbnail_large_url,
  original_url,
  is_featured, 
  active
)
SELECT 
  'Sample 360° Nature Scene',
  'Immersive 360-degree forest landscape',
  c.id,
  l.id,
  39.99,
  '/placeholder.svg?height=2048&width=4096&text=360+Nature+Scene',
  '/placeholder.svg?height=200&width=400&text=360+Nature+Thumb',
  '/placeholder.svg?height=400&width=800&text=360+Nature+Medium',
  '/placeholder.svg?height=600&width=1200&text=360+Nature+Large',
  '/placeholder.svg?height=2048&width=4096&text=360+Nature+Original',
  false,
  true
FROM categories c, licenses l 
WHERE c.name = 'equirectangular' AND l.name = 'PRO'
AND NOT EXISTS (SELECT 1 FROM images WHERE title = 'Sample 360° Nature Scene');

INSERT INTO images (
  title, 
  description, 
  category_id, 
  license_id, 
  price, 
  file_path,
  thumbnail_small_url,
  thumbnail_medium_url,
  thumbnail_large_url,
  original_url,
  is_featured, 
  active
)
SELECT 
  'Sample Fisheye Architecture',
  'Wide-angle fisheye view of modern architecture',
  c.id,
  l.id,
  24.99,
  '/placeholder.svg?height=2048&width=2048&text=Fisheye+Architecture',
  '/placeholder.svg?height=200&width=200&text=Fisheye+Arch+Thumb',
  '/placeholder.svg?height=400&width=400&text=Fisheye+Arch+Medium',
  '/placeholder.svg?height=600&width=600&text=Fisheye+Arch+Large',
  '/placeholder.svg?height=2048&width=2048&text=Fisheye+Arch+Original',
  false,
  true
FROM categories c, licenses l 
WHERE c.name = 'fisheye' AND l.name = 'Standard'
AND NOT EXISTS (SELECT 1 FROM images WHERE title = 'Sample Fisheye Architecture');

INSERT INTO images (
  title, 
  description, 
  category_id, 
  license_id, 
  price, 
  file_path,
  thumbnail_small_url,
  thumbnail_medium_url,
  thumbnail_large_url,
  original_url,
  is_featured, 
  active
)
SELECT 
  'Sample Fisheye Interior',
  'Fisheye lens capture of interior space',
  c.id,
  l.id,
  34.99,
  '/placeholder.svg?height=2048&width=2048&text=Fisheye+Interior',
  '/placeholder.svg?height=200&width=200&text=Fisheye+Int+Thumb',
  '/placeholder.svg?height=400&width=400&text=Fisheye+Int+Medium',
  '/placeholder.svg?height=600&width=600&text=Fisheye+Int+Large',
  '/placeholder.svg?height=2048&width=2048&text=Fisheye+Int+Original',
  true,
  true
FROM categories c, licenses l 
WHERE c.name = 'fisheye' AND l.name = 'PRO'
AND NOT EXISTS (SELECT 1 FROM images WHERE title = 'Sample Fisheye Interior');

-- Final count check
SELECT 'Final images count:' as info, COUNT(*) as count FROM images;
SELECT 'Final categories count:' as info, COUNT(*) as count FROM categories;
SELECT 'Final licenses count:' as info, COUNT(*) as count FROM licenses;

-- Show the inserted data
SELECT 'Sample images created:' as info;
SELECT i.id, i.title, c.name as category, l.name as license, i.price, i.is_featured, i.active
FROM images i
JOIN categories c ON i.category_id = c.id
JOIN licenses l ON i.license_id = l.id
ORDER BY i.created_at DESC;
