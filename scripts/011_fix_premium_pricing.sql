-- Fix premium pricing implementation for existing schema
-- Clear existing licenses and add new premium tiers

-- Remove existing licenses to start fresh with premium pricing
DELETE FROM licenses;

-- Insert premium license tiers based on the pricing document
INSERT INTO licenses (id, name, description, price, active, created_at, updated_at) VALUES
-- PRO Tier - $99
(gen_random_uuid(), 'PRO', 'Commercial license for professional use. Includes 4K+ resolution, standard commercial rights, and basic support.', 99.00, true, NOW(), NOW()),

-- PRO+ Tier - $199-299 range, using $249 as middle price
(gen_random_uuid(), 'PRO_PLUS', 'Extended commercial license with enhanced rights. Includes 4K+ resolution, extended commercial use, priority support, and resale rights.', 249.00, true, NOW(), NOW()),

-- EXCLUSIVE Tier - $750-1500 range, using $999 as middle price  
(gen_random_uuid(), 'EXCLUSIVE', 'Exclusive license with full commercial rights. Includes 4K+ resolution, exclusive usage rights, premium support, and NFT/blockchain ready.', 999.00, true, NOW(), NOW()),

-- COLLECTION PACK Tier - $999-1999 range, using $1499 as middle price
(gen_random_uuid(), 'COLLECTION_PACK', 'Premium collection bundle with multiple licenses. Includes 4K+ resolution, bulk licensing, white-label rights, and custom branding options.', 1499.00, true, NOW(), NOW());

-- Update existing images to use PRO license as default
UPDATE images 
SET license_id = (SELECT id FROM licenses WHERE name = 'PRO' LIMIT 1)
WHERE license_id IS NULL;

-- Add premium metadata to existing images
UPDATE images 
SET metadata = jsonb_build_object(
  'resolution', '4K+',
  'format', 'High-resolution JPEG/PNG',
  'use_case', 'Dome projection, VR, NFT ready',
  'technical_specs', jsonb_build_object(
    'min_resolution', '4096x4096',
    'color_depth', '24-bit',
    'file_formats', '["JPEG", "PNG", "TIFF"]'
  )
)
WHERE metadata IS NULL OR metadata = '{}';

-- Ensure all images have proper pricing based on their license
UPDATE images 
SET price = l.price
FROM licenses l 
WHERE images.license_id = l.id;
