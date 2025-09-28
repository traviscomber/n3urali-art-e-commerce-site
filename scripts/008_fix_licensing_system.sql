-- Fix licensing system to only have 2 licenses: Exclusive (price x3) and Non-exclusive (price x1)

-- First, add price column to licenses table if it doesn't exist
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 1.00;

-- Use UPSERT without changing IDs to avoid foreign key violations
-- Insert the 2 required licenses, but don't change existing IDs
INSERT INTO licenses (name, description, price, active, created_at) VALUES
('Non-Exclusive', 'Standard commercial and personal use license. Image remains available for others to purchase.', 1.00, true, NOW()),
('Exclusive', 'Exclusive rights license. Image will be removed from marketplace after purchase. Full commercial rights included.', 3.00, true, NOW())
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  active = EXCLUDED.active;

-- Get the actual IDs of our target licenses for safe updates
-- Update all existing images to use the Non-Exclusive license as default
UPDATE images 
SET license_id = (SELECT id FROM licenses WHERE name = 'Non-Exclusive' LIMIT 1)
WHERE license_id NOT IN (
  SELECT id FROM licenses WHERE name IN ('Non-Exclusive', 'Exclusive')
);

-- Update all existing order_items to use the Non-Exclusive license as default  
UPDATE order_items 
SET license_id = (SELECT id FROM licenses WHERE name = 'Non-Exclusive' LIMIT 1)
WHERE license_id NOT IN (
  SELECT id FROM licenses WHERE name IN ('Non-Exclusive', 'Exclusive')
);

-- Now safely delete all old licenses except our 2 new ones
DELETE FROM licenses 
WHERE name NOT IN ('Non-Exclusive', 'Exclusive');

-- Verify the setup
SELECT 
  id, 
  name, 
  description, 
  price, 
  active,
  created_at
FROM licenses 
ORDER BY price;

-- Show count of images per license
SELECT 
  l.name as license_name,
  COUNT(i.id) as image_count
FROM licenses l
LEFT JOIN images i ON l.id = i.license_id
GROUP BY l.id, l.name
ORDER BY l.price;
