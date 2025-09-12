-- Simplify licensing system to only EXCLUSIVE and NON_EXCLUSIVE
-- This replaces the complex multi-tier system with just two clear options

-- First, ensure we have the two license types we want
INSERT INTO licenses (id, name, description, price, active, created_at, updated_at, metadata) VALUES
(
  gen_random_uuid(),
  'NON_EXCLUSIVE',
  'Standard commercial license for personal and commercial use. Non-exclusive rights.',
  99.00,
  true,
  NOW(),
  NOW(),
  jsonb_build_object(
    'resolution', '4096x4096',
    'formats', ARRAY['JPG', 'PNG'],
    'use_cases', ARRAY['Commercial use', 'Personal projects', 'Digital media'],
    'exclusivity', false,
    'resale_rights', false,
    'nft_rights', false
  )
),
(
  gen_random_uuid(),
  'EXCLUSIVE',
  'Exclusive license with full rights including resale and NFT minting. Complete buyout.',
  750.00,
  true,
  NOW(),
  NOW(),
  jsonb_build_object(
    'resolution', '4096x4096+',
    'formats', ARRAY['JPG', 'PNG', 'EXR', 'Source files'],
    'use_cases', ARRAY['Exclusive use', 'Resale rights', 'NFT minting', 'Full copyright'],
    'exclusivity', true,
    'resale_rights', true,
    'nft_rights', true
  )
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- Update any existing order items to use one of the two remaining licenses
-- Map old license types to new simplified system
UPDATE order_items 
SET license_type = CASE 
  WHEN license_type IN ('standard', 'extended', 'commercial', 'PRO', 'PRO+', 'PRO+ Premium') THEN 'NON_EXCLUSIVE'
  WHEN license_type IN ('EXCLUSIVE', 'EXCLUSIVE Premium') THEN 'EXCLUSIVE'
  ELSE 'NON_EXCLUSIVE'
END
WHERE license_type NOT IN ('EXCLUSIVE', 'NON_EXCLUSIVE');

-- Update images to use one of the two remaining licenses
UPDATE images 
SET license_id = (SELECT id FROM licenses WHERE name = 'NON_EXCLUSIVE' LIMIT 1)
WHERE license_id NOT IN (
    SELECT id FROM licenses WHERE name IN ('EXCLUSIVE', 'NON_EXCLUSIVE')
) OR license_id IS NULL;

-- Remove all other licenses
DELETE FROM licenses 
WHERE name NOT IN ('EXCLUSIVE', 'NON_EXCLUSIVE');

-- Verify the cleanup
SELECT id, name, description, price, active, metadata FROM licenses ORDER BY name;
