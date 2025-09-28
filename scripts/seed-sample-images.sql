-- First, let's check if we have categories and licenses
INSERT INTO categories (id, name, description, created_at) VALUES 
  (gen_random_uuid(), 'equirectangular', '360-degree panoramic images', NOW()),
  (gen_random_uuid(), 'fisheye', '180-degree fisheye lens images', NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO licenses (id, name, description, active, created_at) VALUES 
  (gen_random_uuid(), 'PRO', 'Professional license for commercial use', true, NOW()),
  (gen_random_uuid(), 'Standard', 'Standard license for personal use', true, NOW())
ON CONFLICT (name) DO NOTHING;

-- Now let's add some sample images
WITH category_ids AS (
  SELECT id as equirectangular_id FROM categories WHERE name = 'equirectangular' LIMIT 1
), license_ids AS (
  SELECT id as pro_id FROM licenses WHERE name = 'PRO' LIMIT 1
)
INSERT INTO images (
  id, title, description, category_id, license_id, price, 
  file_path, is_featured, active, created_at, updated_at
) 
SELECT 
  gen_random_uuid(),
  'Sample 360° Mountain Vista',
  'Stunning 360-degree panoramic view of mountain landscape with crystal clear skies',
  category_ids.equirectangular_id,
  license_ids.pro_id,
  29.99,
  '/placeholder.svg?height=400&width=800&text=360°+Mountain+Vista',
  true,
  true,
  NOW(),
  NOW()
FROM category_ids, license_ids;

WITH category_ids AS (
  SELECT id as equirectangular_id FROM categories WHERE name = 'equirectangular' LIMIT 1
), license_ids AS (
  SELECT id as pro_id FROM licenses WHERE name = 'PRO' LIMIT 1
)
INSERT INTO images (
  id, title, description, category_id, license_id, price, 
  file_path, is_featured, active, created_at, updated_at
) 
SELECT 
  gen_random_uuid(),
  'Urban Skyline 360°',
  'Complete 360-degree view of modern city skyline at golden hour',
  category_ids.equirectangular_id,
  license_ids.pro_id,
  39.99,
  '/placeholder.svg?height=400&width=800&text=Urban+Skyline+360°',
  false,
  true,
  NOW(),
  NOW()
FROM category_ids, license_ids;

WITH category_ids AS (
  SELECT id as fisheye_id FROM categories WHERE name = 'fisheye' LIMIT 1
), license_ids AS (
  SELECT id as pro_id FROM licenses WHERE name = 'PRO' LIMIT 1
)
INSERT INTO images (
  id, title, description, category_id, license_id, price, 
  file_path, is_featured, active, created_at, updated_at
) 
SELECT 
  gen_random_uuid(),
  'Fisheye Forest Canopy',
  '180-degree fisheye view looking up through forest canopy',
  category_ids.fisheye_id,
  license_ids.pro_id,
  24.99,
  '/placeholder.svg?height=400&width=400&text=Fisheye+Forest',
  false,
  true,
  NOW(),
  NOW()
FROM category_ids, license_ids;

WITH category_ids AS (
  SELECT id as fisheye_id FROM categories WHERE name = 'fisheye' LIMIT 1
), license_ids AS (
  SELECT id as pro_id FROM licenses WHERE name = 'PRO' LIMIT 1
)
INSERT INTO images (
  id, title, description, category_id, license_id, price, 
  file_path, is_featured, active, created_at, updated_at
) 
SELECT 
  gen_random_uuid(),
  'Architectural Fisheye',
  'Dramatic fisheye perspective of modern architecture interior',
  category_ids.fisheye_id,
  license_ids.pro_id,
  34.99,
  '/placeholder.svg?height=400&width=400&text=Architecture+Fisheye',
  true,
  true,
  NOW(),
  NOW()
FROM category_ids, license_ids;

-- Let's also add a few more 360° images to make the gallery look fuller
WITH category_ids AS (
  SELECT id as equirectangular_id FROM categories WHERE name = 'equirectangular' LIMIT 1
), license_ids AS (
  SELECT id as pro_id FROM licenses WHERE name = 'PRO' LIMIT 1
)
INSERT INTO images (
  id, title, description, category_id, license_id, price, 
  file_path, is_featured, active, created_at, updated_at
) 
SELECT 
  gen_random_uuid(),
  'Ocean Sunset 360°',
  'Complete panoramic view of ocean sunset with dramatic clouds',
  category_ids.equirectangular_id,
  license_ids.pro_id,
  44.99,
  '/placeholder.svg?height=400&width=800&text=Ocean+Sunset+360°',
  false,
  true,
  NOW(),
  NOW()
FROM category_ids, license_ids;

WITH category_ids AS (
  SELECT id as equirectangular_id FROM categories WHERE name = 'equirectangular' LIMIT 1
), license_ids AS (
  SELECT id as pro_id FROM licenses WHERE name = 'PRO' LIMIT 1
)
INSERT INTO images (
  id, title, description, category_id, license_id, price, 
  file_path, is_featured, active, created_at, updated_at
) 
SELECT 
  gen_random_uuid(),
  'Desert Landscape 360°',
  '360-degree panoramic view of vast desert landscape with sand dunes',
  category_ids.equirectangular_id,
  license_ids.pro_id,
  32.99,
  '/placeholder.svg?height=400&width=800&text=Desert+360°',
  false,
  true,
  NOW(),
  NOW()
FROM category_ids, license_ids;
