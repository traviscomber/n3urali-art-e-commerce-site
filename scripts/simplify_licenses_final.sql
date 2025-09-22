-- Simplify licensing system to only 2 types: NON_EXCLUSIVE (default) and EXCLUSIVE (3x price)
-- This script ensures clean migration and fixes any compilation issues

-- First, ensure we have the two required licenses
INSERT INTO licenses (id, name, description, price, active, created_at, updated_at)
VALUES 
  (
    '660e8400-e29b-41d4-a716-446655440000',
    'NON_EXCLUSIVE',
    'Standard commercial license - image can be sold to multiple buyers',
    99.00,
    true,
    NOW(),
    NOW()
  ),
  (
    '660e8400-e29b-41d4-a716-446655440001', 
    'EXCLUSIVE',
    'Exclusive rights - you will be the only buyer of this image',
    297.00,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Update all existing images to use NON_EXCLUSIVE license by default
UPDATE images 
SET license_id = '660e8400-e29b-41d4-a716-446655440000'
WHERE license_id NOT IN (
    '660e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440001'
);

-- Update any existing order_items to use the simplified license types
UPDATE order_items 
SET license_type = 'NON_EXCLUSIVE'
WHERE license_type NOT IN ('NON_EXCLUSIVE', 'EXCLUSIVE');

-- Remove all other licenses except our 2 simplified ones
DELETE FROM licenses 
WHERE id NOT IN (
    '660e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440001'
);

-- Verify the final state
SELECT 
  id, 
  name, 
  description, 
  price, 
  active,
  created_at
FROM licenses 
ORDER BY price ASC;
