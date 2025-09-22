-- Create standard licenses for the e-commerce system
-- This ensures we have proper license records that can be referenced by foreign keys

-- Insert standard licenses if they don't exist
INSERT INTO licenses (id, name, description, created_at) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'NON_EXCLUSIVE', 'Standard non-exclusive license for personal and commercial use', NOW()),
    ('660e8400-e29b-41d4-a716-446655440000', 'EXCLUSIVE', 'Premium exclusive license with extended rights', NOW())
ON CONFLICT (id) DO NOTHING;

-- Also insert by name in case there are duplicates
INSERT INTO licenses (id, name, description, created_at) 
SELECT 
    gen_random_uuid(),
    'NON_EXCLUSIVE',
    'Standard non-exclusive license for personal and commercial use',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM licenses WHERE name = 'NON_EXCLUSIVE');

INSERT INTO licenses (id, name, description, created_at) 
SELECT 
    gen_random_uuid(),
    'EXCLUSIVE', 
    'Premium exclusive license with extended rights',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM licenses WHERE name = 'EXCLUSIVE');

-- Update any existing images to reference valid licenses
UPDATE images 
SET license_id = (
    SELECT id FROM licenses WHERE name = 'NON_EXCLUSIVE' LIMIT 1
)
WHERE license_id IS NULL 
   OR license_id NOT IN (SELECT id FROM licenses);

-- Show the created licenses for verification
SELECT id, name, description, created_at FROM licenses ORDER BY name;
