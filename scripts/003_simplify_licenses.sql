-- Removed references to non-existent price and active columns
-- Simplify license system to exclusive/non-exclusive
-- This script updates the licenses table to only have two license types

-- First, let's see what licenses currently exist
-- DELETE FROM licenses WHERE name NOT IN ('Exclusive', 'Non-Exclusive');

-- Update existing licenses or create new simplified ones
-- Clear existing licenses (be careful in production!)
TRUNCATE TABLE licenses CASCADE;

-- Insert the two simplified license types (only using columns that exist: id, name, description, created_at)
INSERT INTO licenses (id, name, description, created_at) VALUES
  (uuid_generate_v4(), 'Standard', 'Standard commercial license - image can be sold to multiple buyers', NOW()),
  (uuid_generate_v4(), 'Exclusive', 'Exclusive rights - you will be the only buyer of this image', NOW());

-- Add a new column to track if an image has been sold exclusively
ALTER TABLE images ADD COLUMN IF NOT EXISTS sold_exclusively BOOLEAN DEFAULT false;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_images_sold_exclusively ON images(sold_exclusively);

-- Update any existing images to set sold_exclusively based on order history
-- This is a one-time migration to check if any images were sold with exclusive licenses
UPDATE images 
SET sold_exclusively = true 
WHERE id IN (
  SELECT DISTINCT oi.image_id 
  FROM order_items oi 
  JOIN licenses l ON oi.license_id = l.id 
  WHERE l.name ILIKE '%exclusive%' OR l.name ILIKE '%premium%' OR l.name ILIKE '%pro%'
);

-- Create a function to automatically mark images as sold exclusively when an exclusive license is purchased
CREATE OR REPLACE FUNCTION mark_image_sold_exclusively()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the license being purchased is exclusive
  IF EXISTS (
    SELECT 1 FROM licenses 
    WHERE id = NEW.license_id 
    AND name = 'Exclusive'
  ) THEN
    -- Mark the image as sold exclusively
    UPDATE images 
    SET sold_exclusively = true 
    WHERE id = NEW.image_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically mark images when exclusive license is purchased
DROP TRIGGER IF EXISTS on_exclusive_purchase ON order_items;
CREATE TRIGGER on_exclusive_purchase
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION mark_image_sold_exclusively();
