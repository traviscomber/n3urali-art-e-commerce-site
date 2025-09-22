-- Safe database migration that works with existing schema
-- This script adds missing columns and constraints without dropping existing ones

-- Add missing columns to order_items table if they don't exist
DO $$ 
BEGIN
    -- Add download_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'download_count') THEN
        ALTER TABLE order_items ADD COLUMN download_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add download_limit column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'download_limit') THEN
        ALTER TABLE order_items ADD COLUMN download_limit INTEGER DEFAULT 5;
    END IF;
END $$;

-- Add created_at column to downloads table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'downloads' AND column_name = 'created_at') THEN
        ALTER TABLE downloads ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Update existing downloads to have created_at if they don't
UPDATE downloads 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_downloads_token ON downloads(download_token);
CREATE INDEX IF NOT EXISTS idx_downloads_order_item ON downloads(order_item_id);
CREATE INDEX IF NOT EXISTS idx_downloads_expires ON downloads(expires_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_image ON order_items(image_id);

-- Create or replace function to check download limits
CREATE OR REPLACE FUNCTION check_download_limit(p_order_item_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    max_limit INTEGER;
BEGIN
    SELECT download_count, download_limit 
    INTO current_count, max_limit
    FROM order_items 
    WHERE id = p_order_item_id;
    
    RETURN COALESCE(current_count, 0) < COALESCE(max_limit, 5);
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(p_order_item_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE order_items 
    SET download_count = COALESCE(download_count, 0) + 1
    WHERE id = p_order_item_id;
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to clean up expired downloads
CREATE OR REPLACE FUNCTION cleanup_expired_downloads()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM downloads 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Update existing order_items to have proper download limits based on license type
UPDATE order_items 
SET download_limit = CASE 
    WHEN EXISTS (
        SELECT 1 FROM licenses l 
        WHERE l.id = order_items.license_id 
        AND LOWER(l.name) LIKE '%extended%'
    ) THEN 10
    WHEN EXISTS (
        SELECT 1 FROM licenses l 
        WHERE l.id = order_items.license_id 
        AND LOWER(l.name) LIKE '%commercial%'
    ) THEN 20
    ELSE 5
END
WHERE download_limit IS NULL OR download_limit = 0;

-- Ensure all downloads have proper expiration dates (7 days from creation)
UPDATE downloads 
SET expires_at = COALESCE(created_at, NOW()) + INTERVAL '7 days'
WHERE expires_at IS NULL;
