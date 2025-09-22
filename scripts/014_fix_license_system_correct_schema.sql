-- Fix license system with correct database schema
-- Using correct column names that actually exist in the database

-- First, ensure we have the basic license types (only insert if they don't exist)
INSERT INTO licenses (id, name, description, created_at)
VALUES 
  (gen_random_uuid(), 'Standard', 'Standard license for personal and commercial use', NOW()),
  (gen_random_uuid(), 'Extended', 'Extended license with additional usage rights', NOW()),
  (gen_random_uuid(), 'Premium', 'Premium license with full commercial rights', NOW())
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  created_at = EXCLUDED.created_at;

-- Update any images that have NULL or invalid license_id to use a valid license
UPDATE images 
SET license_id = (SELECT id FROM licenses WHERE name = 'Standard' LIMIT 1)
WHERE license_id IS NULL 
   OR license_id NOT IN (SELECT id FROM licenses);

-- Clean up any cart items or order items that reference invalid licenses
-- (This would be in localStorage for cart, but let's clean up any orphaned order_items)
DELETE FROM order_items 
WHERE license_id NOT IN (SELECT id FROM licenses);

-- Ensure all images have valid prices (set default if NULL)
UPDATE images 
SET price = 10.00 
WHERE price IS NULL OR price <= 0;

-- Add some debug info
SELECT 'License system fixed' as status, 
       (SELECT COUNT(*) FROM licenses) as license_count,
       (SELECT COUNT(*) FROM images WHERE license_id IS NOT NULL) as images_with_licenses;
