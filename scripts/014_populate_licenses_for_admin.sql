-- Populate licenses table for admin upload functionality
-- This ensures the upload process has proper license options

-- First, check if licenses already exist
DO $$
BEGIN
    -- Only insert if licenses table is empty
    IF NOT EXISTS (SELECT 1 FROM licenses WHERE active = true LIMIT 1) THEN
        
        INSERT INTO licenses (id, name, description, price, active, created_at) VALUES
        (gen_random_uuid(), 'PRO', 'Professional license for commercial use with full resolution (4K-16K)', 99.00, true, NOW()),
        (gen_random_uuid(), 'STANDARD', 'Standard license for personal and limited commercial use', 49.00, true, NOW()),
        (gen_random_uuid(), 'EXCLUSIVE', 'Exclusive rights - you own the image completely', 299.00, true, NOW()),
        (gen_random_uuid(), 'EXTENDED', 'Extended commercial license for unlimited use', 199.00, true, NOW());
        
        RAISE NOTICE 'Successfully inserted % licenses', (SELECT COUNT(*) FROM licenses WHERE active = true);
        
    ELSE
        RAISE NOTICE 'Active licenses already exist: % licenses found', (SELECT COUNT(*) FROM licenses WHERE active = true);
    END IF;
END $$;

-- Verify the licenses were created
SELECT 
    name,
    description,
    price,
    active,
    created_at
FROM licenses 
WHERE active = true
ORDER BY price;

-- Show final count
SELECT 
    'Total active licenses in database: ' || COUNT(*) as status
FROM licenses 
WHERE active = true;
