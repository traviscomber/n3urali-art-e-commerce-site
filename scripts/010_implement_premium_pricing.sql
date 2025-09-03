-- Adding premium pricing structure based on the provided pricing strategy
-- Clear existing licenses and add new premium tiers
DELETE FROM licenses;

-- Insert new premium license tiers (4K+ only)
INSERT INTO licenses (id, name, description, price, active, created_at, updated_at) VALUES
(
  gen_random_uuid(),
  'PRO',
  'Commercial license for dome shows, installations, apps, and videos. Non-exclusive, no resale rights.',
  99.00,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'PRO+',
  'Extended Commercial license for dome events, 360° video, VR, trailers, and NFTs. Non-exclusive, includes use in paid media projects.',
  199.00,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'PRO+ Premium',
  'Extended Commercial license with premium features. Perfect for professional dome installations and VR experiences.',
  299.00,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'EXCLUSIVE',
  'Full buyout license with exclusive use, resale rights, and NFT minting capabilities. Includes full copyright transfer.',
  750.00,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'EXCLUSIVE Premium',
  'Premium exclusive license with full rights and custom resolution options up to 8K.',
  1500.00,
  true,
  NOW(),
  NOW()
);

-- Add metadata column to licenses for additional license details
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update licenses with detailed metadata
UPDATE licenses SET metadata = jsonb_build_object(
  'resolution', '4096x4096',
  'formats', ARRAY['JPG', 'PNG'],
  'use_cases', ARRAY['Commercial digital use', 'Dome projections', 'VR applications'],
  'exclusivity', false,
  'resale_rights', false,
  'nft_rights', false
) WHERE name = 'PRO';

UPDATE licenses SET metadata = jsonb_build_object(
  'resolution', '4096x4096',
  'formats', ARRAY['JPG', 'PNG', 'EXR'],
  'use_cases', ARRAY['Dome events', '360° video', 'VR', 'Trailers', 'NFTs'],
  'exclusivity', false,
  'resale_rights', false,
  'nft_rights', true
) WHERE name = 'PRO+';

UPDATE licenses SET metadata = jsonb_build_object(
  'resolution', '4096x4096+',
  'formats', ARRAY['JPG', 'PNG', 'EXR'],
  'use_cases', ARRAY['Professional dome installations', 'VR experiences', 'Commercial media'],
  'exclusivity', false,
  'resale_rights', false,
  'nft_rights', true
) WHERE name = 'PRO+ Premium';

UPDATE licenses SET metadata = jsonb_build_object(
  'resolution', '4096x4096+',
  'formats', ARRAY['JPG', 'PNG', 'EXR', 'Source files'],
  'use_cases', ARRAY['Exclusive use', 'Resale', 'NFT minting', 'Full copyright'],
  'exclusivity', true,
  'resale_rights', true,
  'nft_rights', true
) WHERE name = 'EXCLUSIVE';

UPDATE licenses SET metadata = jsonb_build_object(
  'resolution', 'Up to 8192x8192',
  'formats', ARRAY['JPG', 'PNG', 'EXR', 'Source files', 'Custom formats'],
  'use_cases', ARRAY['Premium exclusive use', 'Full rights transfer', 'Custom resolution'],
  'exclusivity', true,
  'resale_rights', true,
  'nft_rights', true
) WHERE name = 'EXCLUSIVE Premium';

-- Update images table to ensure all images have proper pricing
-- Set default license for existing images to PRO
UPDATE images SET license_id = (SELECT id FROM licenses WHERE name = 'PRO' LIMIT 1) WHERE license_id IS NULL;

-- Add resolution metadata to images table
ALTER TABLE images ADD COLUMN IF NOT EXISTS resolution TEXT DEFAULT '4096x4096';
ALTER TABLE images ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'JPG';

-- Update existing images with 4K resolution
UPDATE images SET resolution = '4096x4096', format = 'JPG' WHERE resolution IS NULL OR resolution = '';

-- Add pricing tiers metadata to categories
UPDATE categories SET metadata = jsonb_build_object(
  'target_market', 'Premium 4K+ immersive visuals',
  'use_cases', ARRAY['Dome projection', 'VR environments', 'NFTs', 'Immersive installations']
) WHERE metadata IS NULL OR metadata = '{}';
