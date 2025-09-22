-- Final database cleanup and setup for simplified licensing system
-- Ensure downloads table has proper structure
ALTER TABLE downloads 
ADD COLUMN IF NOT EXISTS image_id UUID REFERENCES images(id);

-- Update any existing downloads that might be missing image_id
UPDATE downloads 
SET image_id = order_items.image_id 
FROM order_items 
WHERE downloads.order_item_id = order_items.id 
AND downloads.image_id IS NULL;

-- Ensure we have the two required licenses
INSERT INTO licenses (id, name, description, price, active) VALUES 
('660e8400-e29b-41d4-a716-446655440000', 'NON_EXCLUSIVE', 'Standard commercial license - image can be sold to multiple buyers', 25.00, true),
('660e8400-e29b-41d4-a716-446655440001', 'EXCLUSIVE', 'Exclusive rights - you will be the only buyer of this image', 75.00, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  active = EXCLUDED.active;

-- Remove any other licenses to keep it simple
DELETE FROM licenses WHERE id NOT IN (
  '660e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440001'
);

-- Ensure all images have proper pricing
UPDATE images SET price = 25.00 WHERE price IS NULL OR price = 0;

-- Clean up any orphaned downloads
DELETE FROM downloads WHERE order_item_id NOT IN (SELECT id FROM order_items);

-- Set reasonable download limits
UPDATE downloads SET download_limit = 5 WHERE download_limit IS NULL OR download_limit = 0;
