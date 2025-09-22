-- Fix license system by handling existing records properly
-- Using INSERT ... ON CONFLICT to handle duplicate license names

-- First, ensure we have the basic license types (handle duplicates gracefully)
INSERT INTO licenses (id, name, description, price, max_width, max_height, commercial_use, print_use, digital_use, exclusive, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Personal', 'For personal, non-commercial use', 0.00, 1920, 1080, false, true, true, false, NOW(), NOW()),
  (gen_random_uuid(), 'Commercial', 'For commercial use including marketing and advertising', 25.00, 3840, 2160, true, true, true, false, NOW(), NOW()),
  (gen_random_uuid(), 'Extended', 'Extended commercial license with print rights', 50.00, 6000, 4000, true, true, true, false, NOW(), NOW()),
  (gen_random_uuid(), 'Exclusive', 'Exclusive rights to the image', 200.00, NULL, NULL, true, true, true, true, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  max_width = EXCLUDED.max_width,
  max_height = EXCLUDED.max_height,
  commercial_use = EXCLUDED.commercial_use,
  print_use = EXCLUDED.print_use,
  digital_use = EXCLUDED.digital_use,
  exclusive = EXCLUDED.exclusive,
  updated_at = NOW();

-- Ensure all images have valid license references
-- Update any images that might have invalid license_id references
UPDATE images 
SET license_id = (SELECT id FROM licenses WHERE name = 'Personal' LIMIT 1)
WHERE license_id IS NULL 
   OR license_id NOT IN (SELECT id FROM licenses);

-- Clean up any orphaned cart items with invalid license references
DELETE FROM cart_items 
WHERE license_id NOT IN (SELECT id FROM licenses);

-- Verify the fix
SELECT 'License count:' as info, COUNT(*) as count FROM licenses
UNION ALL
SELECT 'Images with valid licenses:' as info, COUNT(*) as count FROM images WHERE license_id IN (SELECT id FROM licenses)
UNION ALL
SELECT 'Cart items with valid licenses:' as info, COUNT(*) as count FROM cart_items WHERE license_id IN (SELECT id FROM licenses);
