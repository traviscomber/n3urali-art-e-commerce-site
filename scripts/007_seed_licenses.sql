-- Seed the licenses table with proper license types and pricing

-- Clear existing licenses
DELETE FROM licenses;

-- Insert standard license types
INSERT INTO licenses (id, name, description, price, active) VALUES
(
  gen_random_uuid(),
  'Standard License',
  'Personal and commercial use, up to 500,000 print copies. Perfect for websites, blogs, and small marketing materials.',
  1.0,
  true
),
(
  gen_random_uuid(),
  'Extended License', 
  'Unlimited print copies, digital products, and resale rights. Ideal for products you plan to sell or distribute widely.',
  2.5,
  true
),
(
  gen_random_uuid(),
  'Commercial License',
  'Full commercial rights including merchandise, advertising, and unlimited distribution. Best for large campaigns and commercial products.',
  5.0,
  true
);

-- Update existing order_items to use proper license_id references
UPDATE order_items 
SET license_id = (SELECT id FROM licenses WHERE name = 'Standard License' LIMIT 1)
WHERE license_id IS NULL OR license_id NOT IN (SELECT id FROM licenses);
