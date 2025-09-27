-- Create a proper migration that handles foreign key constraints
-- Step 1: Create the new license types
INSERT INTO licenses (id, name, description, created_at) VALUES 
  (gen_random_uuid(), 'Non-Exclusive', 'Standard non-exclusive license for commercial use', NOW()),
  (gen_random_uuid(), 'Exclusive', 'Premium exclusive license with full rights', NOW())
ON CONFLICT (name) DO NOTHING;

-- Step 2: Get the IDs of our new licenses
DO $$
DECLARE
    non_exclusive_id UUID;
    exclusive_id UUID;
BEGIN
    -- Get the new license IDs
    SELECT id INTO non_exclusive_id FROM licenses WHERE name = 'Non-Exclusive';
    SELECT id INTO exclusive_id FROM licenses WHERE name = 'Exclusive';
    
    -- Update all existing images to use Non-Exclusive license (default)
    UPDATE images 
    SET license_id = non_exclusive_id 
    WHERE license_id IS NOT NULL;
    
    -- Update all existing order_items to use Non-Exclusive license (default)
    UPDATE order_items 
    SET license_id = non_exclusive_id 
    WHERE license_id IS NOT NULL;
    
    -- Now safely delete old licenses (except our new ones)
    DELETE FROM licenses 
    WHERE name NOT IN ('Non-Exclusive', 'Exclusive');
END $$;

-- Step 3: Update image prices based on license type
UPDATE images 
SET price = 29.99 
WHERE license_id = (SELECT id FROM licenses WHERE name = 'Non-Exclusive');

-- Step 4: Create a few exclusive license images (optional - for testing)
-- This will create exclusive versions at 100% higher price
INSERT INTO images (
    id, title, description, original_url, thumbnail_small_url, 
    thumbnail_medium_url, thumbnail_large_url, file_path, 
    category_id, license_id, price, is_featured, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    title || ' (Exclusive)',
    description || ' - Exclusive license version',
    original_url,
    thumbnail_small_url,
    thumbnail_medium_url, 
    thumbnail_large_url,
    file_path,
    category_id,
    (SELECT id FROM licenses WHERE name = 'Exclusive'),
    59.98, -- 100% more than 29.99
    is_featured,
    NOW(),
    NOW()
FROM images 
WHERE license_id = (SELECT id FROM licenses WHERE name = 'Non-Exclusive')
LIMIT 1; -- Just create one exclusive version for testing

-- Verify the results
SELECT 
    l.name as license_name,
    COUNT(i.id) as image_count,
    AVG(i.price) as avg_price
FROM licenses l
LEFT JOIN images i ON l.id = i.license_id
GROUP BY l.id, l.name
ORDER BY l.name;
