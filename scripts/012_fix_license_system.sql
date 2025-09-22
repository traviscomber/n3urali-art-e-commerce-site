-- Fix license system by ensuring proper license data exists
-- First, ensure we have the basic licenses with proper UUIDs
INSERT INTO licenses (id, name, description) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'NON_EXCLUSIVE', 'Standard non-exclusive commercial use license'),
  ('550e8400-e29b-41d4-a716-446655440001', 'EXCLUSIVE', 'Premium exclusive commercial use license')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Update any images that don't have valid license_id to use the standard license
UPDATE images 
SET license_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE license_id IS NULL OR license_id NOT IN (SELECT id FROM licenses);

-- Clean up any orphaned data
DELETE FROM order_items WHERE license_id NOT IN (SELECT id FROM licenses);

-- Ensure travis@nuanu.com has admin role
INSERT INTO profiles (id, email, full_name, role, is_active) 
SELECT auth.uid(), 'travis@nuanu.com', 'Travis Admin', 'admin', true
FROM auth.users 
WHERE email = 'travis@nuanu.com'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  is_active = true;
