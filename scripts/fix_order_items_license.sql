-- Fix the order_items table to make license_id nullable
-- This fixes the error: null value in column "license_id" violates not-null constraint

ALTER TABLE order_items ALTER COLUMN license_id DROP NOT NULL;

-- Update existing records that might have null license_id
-- Set to first available license if null
UPDATE order_items 
SET license_id = (SELECT id FROM licenses WHERE active = true LIMIT 1)
WHERE license_id IS NULL;
