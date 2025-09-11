-- Check current image count
SELECT COUNT(*) as total_images FROM images;
SELECT COUNT(*) as active_images FROM images WHERE active = true;

-- Check if we have categories and licenses
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as total_licenses FROM licenses;

-- If no categories exist, create them
INSERT INTO categories (id, name, description, active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Equirectangular',
    '360-degree panoramic images',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Equirectangular');

INSERT INTO categories (id, name, description, active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Fisheye',
    '180-degree fisheye lens images',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Fisheye');

-- If no licenses exist, create them
INSERT INTO licenses (id, name, description, price, active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Standard License',
    'Standard commercial use license',
    29.99,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM licenses WHERE name = 'Standard License');

INSERT INTO licenses (id, name, description, price, active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Extended License',
    'Extended commercial use license',
    49.99,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM licenses WHERE name = 'Extended License');

-- Add sample images if none exist
INSERT INTO images (
    id, 
    title, 
    description, 
    price, 
    image_url, 
    thumbnail_url, 
    category_id, 
    license_id, 
    active, 
    featured, 
    created_at, 
    updated_at,
    download_count,
    image_code
)
SELECT 
    gen_random_uuid(),
    'Modern Office 360°',
    'Professional 360-degree view of a modern office space with natural lighting',
    39.99,
    'https://f005.backblazeb2.com/file/Neuraliart/360-images/5dbbab2e-d4ec-43c6-9034-805af2435937-1753923750f7_thumb_1000805179.jpg',
    'https://f005.backblazeb2.com/file/Neuraliart/thumbnails/5dbbab2e-d4ec-43c6-9034-805af2435937-1753923750f7_thumb_1000805179.jpg',
    (SELECT id FROM categories WHERE name = 'Equirectangular' LIMIT 1),
    (SELECT id FROM licenses WHERE name = 'Standard License' LIMIT 1),
    true,
    true,
    NOW(),
    NOW(),
    0,
    'OFF360-001'
WHERE NOT EXISTS (SELECT 1 FROM images WHERE title = 'Modern Office 360°');

INSERT INTO images (
    id, 
    title, 
    description, 
    price, 
    image_url, 
    thumbnail_url, 
    category_id, 
    license_id, 
    active, 
    featured, 
    created_at, 
    updated_at,
    download_count,
    image_code
)
SELECT 
    gen_random_uuid(),
    'Conference Room Fisheye',
    'Wide-angle fisheye view of a professional conference room',
    29.99,
    'https://f005.backblazeb2.com/file/Neuraliart/test-image.jpg',
    'https://f005.backblazeb2.com/file/Neuraliart/test-image.jpg',
    (SELECT id FROM categories WHERE name = 'Fisheye' LIMIT 1),
    (SELECT id FROM licenses WHERE name = 'Standard License' LIMIT 1),
    true,
    false,
    NOW(),
    NOW(),
    0,
    'FISH-001'
WHERE NOT EXISTS (SELECT 1 FROM images WHERE title = 'Conference Room Fisheye');

INSERT INTO images (
    id, 
    title, 
    description, 
    price, 
    image_url, 
    thumbnail_url, 
    category_id, 
    license_id, 
    active, 
    featured, 
    created_at, 
    updated_at,
    download_count,
    image_code
)
SELECT 
    gen_random_uuid(),
    'Workspace 360° View',
    'Complete 360-degree panoramic view of a creative workspace',
    45.99,
    '/placeholder.svg?height=400&width=800&text=360°+Workspace',
    '/placeholder.svg?height=200&width=400&text=360°+Workspace+Thumb',
    (SELECT id FROM categories WHERE name = 'Equirectangular' LIMIT 1),
    (SELECT id FROM licenses WHERE name = 'Extended License' LIMIT 1),
    true,
    true,
    NOW(),
    NOW(),
    0,
    'WORK360-002'
WHERE NOT EXISTS (SELECT 1 FROM images WHERE title = 'Workspace 360° View');

-- Final count check
SELECT 
    COUNT(*) as total_images,
    COUNT(CASE WHEN active = true THEN 1 END) as active_images,
    COUNT(CASE WHEN featured = true THEN 1 END) as featured_images
FROM images;

-- Show sample of created images
SELECT 
    i.title,
    i.price,
    c.name as category,
    l.name as license,
    i.active,
    i.featured
FROM images i
LEFT JOIN categories c ON i.category_id = c.id
LEFT JOIN licenses l ON i.license_id = l.id
ORDER BY i.created_at DESC
LIMIT 5;
