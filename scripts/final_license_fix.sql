-- DEFINITIVE LICENSE FIX - Only 2 license types with correct pricing
-- Non-Exclusive (default) and Exclusive (100% more expensive)

-- First, remove ALL existing licenses to start clean
DELETE FROM licenses;

-- Create exactly 2 license types with correct pricing
INSERT INTO licenses (id, name, description, price, active, created_at, updated_at) VALUES
(
  '660e8400-e29b-41d4-a716-446655440000',
  'Non-Exclusive',
  'Standard commercial license - image can be sold to multiple buyers. Includes high-resolution download and commercial use rights.',
  29.99,
  true,
  NOW(),
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440001', 
  'Exclusive',
  'Exclusive rights - you will be the only buyer of this image. Image will be removed from sale after purchase. Includes all source files and full commercial rights.',
  59.98,
  true,
  NOW(),
  NOW()
);

-- Update any existing order items to use the correct license types
UPDATE order_items 
SET license_type = CASE 
  WHEN license_type IN ('EXCLUSIVE', 'Exclusive', 'Extended License', 'PRO', 'PRO+') THEN 'Exclusive'
  ELSE 'Non-Exclusive'
END;

-- Update all images to use the Non-Exclusive license by default
UPDATE images 
SET license_id = '660e8400-e29b-41d4-a716-446655440000'
WHERE license_id IS NULL OR license_id NOT IN (
    '660e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440001'
);

-- Verify the final state
SELECT id, name, description, price, active FROM licenses ORDER BY price;
