-- Populate categories table for admin upload functionality
-- This ensures the category dropdown in /simple-admin works properly

-- First, check if categories already exist
DO $$
BEGIN
    -- Only insert if categories table is empty
    IF NOT EXISTS (SELECT 1 FROM categories LIMIT 1) THEN
        
        INSERT INTO categories (id, name, description, created_at) VALUES
        (gen_random_uuid(), 'equirectangular', 'Full 360-degree spherical panoramic images that can be viewed in VR headsets and 360 viewers', NOW()),
        (gen_random_uuid(), 'fisheye', '180-degree fisheye lens images with characteristic circular distortion and wide field of view', NOW()),
        (gen_random_uuid(), 'panoramic', 'Wide-angle panoramic images that capture expansive horizontal views', NOW()),
        (gen_random_uuid(), 'abstract', 'Abstract artistic images with creative compositions, patterns, and visual effects', NOW()),
        (gen_random_uuid(), 'nature', 'Natural landscapes, wildlife, and outdoor photography', NOW()),
        (gen_random_uuid(), 'architecture', 'Buildings, structures, and architectural photography', NOW()),
        (gen_random_uuid(), 'urban', 'City scenes, street photography, and urban environments', NOW()),
        (gen_random_uuid(), 'artistic', 'Creative and artistic photography with unique visual styles', NOW());
        
        RAISE NOTICE 'Successfully inserted % categories', (SELECT COUNT(*) FROM categories);
        
    ELSE
        RAISE NOTICE 'Categories already exist: % categories found', (SELECT COUNT(*) FROM categories);
    END IF;
END $$;

-- Verify the categories were created
SELECT 
    name,
    description,
    created_at
FROM categories 
ORDER BY name;

-- Show final count
SELECT 
    'Total categories in database: ' || COUNT(*) as status
FROM categories;
