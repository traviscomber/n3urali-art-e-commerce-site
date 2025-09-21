-- Final cleanup to ensure only EXCLUSIVE and NON_EXCLUSIVE licenses exist
-- This script will create the two license types and remove all others

-- First, create the two license types we want (if they don't exist)
INSERT INTO licenses (id, name, description, price, active, created_at, updated_at) VALUES
(
  gen_random_uuid(),
  'Non-Exclusive',
  'Standard commercial license - image can be sold to multiple buyers. Includes high-resolution download and commercial use rights.',
  29.99,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Exclusive',
  'Exclusive rights - you will be the only buyer of this image. Image will be removed from sale after purchase. Includes all source files and full commercial rights.',
  199.99,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  updated_at = NOW();

-- Update any existing order items to use the simplified license types
UPDATE order_items 
SET license_type = CASE 
  WHEN license_type IN ('EXCLUSIVE', 'Exclusive') THEN 'EXCLUSIVE'
  ELSE 'NON_EXCLUSIVE'
END;

-- Update images to reference one of the two remaining licenses
UPDATE images 
SET license_id = (SELECT id FROM licenses WHERE name = 'Non-Exclusive' LIMIT 1)
WHERE license_id NOT IN (
    SELECT id FROM licenses WHERE name IN ('Exclusive', 'Non-Exclusive')
) OR license_id IS NULL;

-- Remove all other licenses
DELETE FROM licenses 
WHERE name NOT IN ('Exclusive', 'Non-Exclusive');

-- Verify the final state
SELECT id, name, description, price, active FROM licenses ORDER BY price;
