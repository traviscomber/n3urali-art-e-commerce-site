-- Comprehensive database schema fix for download and licensing system

-- First, let's fix the order_items table to include download tracking
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS download_limit INTEGER DEFAULT 5;

-- Update existing order_items to have proper download limits
UPDATE order_items SET download_limit = 5 WHERE download_limit IS NULL;
UPDATE order_items SET download_count = 0 WHERE download_count IS NULL;

-- Fix the downloads table structure
-- Remove unnecessary columns that shouldn't be there
ALTER TABLE downloads DROP COLUMN IF EXISTS image_id;
ALTER TABLE downloads DROP COLUMN IF EXISTS user_email;

-- Add missing created_at column if it doesn't exist
ALTER TABLE downloads ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure downloads table has the correct structure
-- The downloads table should only reference order_items, not images directly
-- The image information comes through the order_item relationship

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_downloads_token ON downloads(download_token);
CREATE INDEX IF NOT EXISTS idx_downloads_order_item ON downloads(order_item_id);
CREATE INDEX IF NOT EXISTS idx_downloads_expires ON downloads(expires_at);

-- Create indexes for order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_image ON order_items(image_id);
CREATE INDEX IF NOT EXISTS idx_order_items_license ON order_items(license_id);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- Ensure we have the basic licenses in the database
INSERT INTO licenses (id, name, description) VALUES 
  ('660e8400-e29b-41d4-a716-446655440000', 'NON_EXCLUSIVE', 'Standard commercial license - image can be sold to multiple buyers')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO licenses (id, name, description) VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', 'EXCLUSIVE', 'Exclusive rights - you will be the only buyer of this image')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Create a function to generate download tokens for completed orders
CREATE OR REPLACE FUNCTION generate_download_tokens_for_order(order_id_param UUID)
RETURNS TABLE(download_token TEXT, order_item_id UUID) AS $$
DECLARE
    item_record RECORD;
    token TEXT;
BEGIN
    -- Loop through all order items for this order
    FOR item_record IN 
        SELECT oi.id as order_item_id
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.id = order_id_param AND o.status = 'completed'
    LOOP
        -- Generate a unique download token
        token := 'dl_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 9);
        
        -- Insert download record
        INSERT INTO downloads (
            order_item_id,
            download_token,
            expires_at,
            download_count
        ) VALUES (
            item_record.order_item_id,
            token,
            NOW() + INTERVAL '30 days',
            0
        );
        
        -- Return the token and order_item_id
        download_token := token;
        order_item_id := item_record.order_item_id;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if a user can download an item
CREATE OR REPLACE FUNCTION can_user_download(order_item_id_param UUID, user_email_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    item_record RECORD;
BEGIN
    SELECT 
        oi.download_count,
        oi.download_limit,
        o.user_email,
        o.status
    INTO item_record
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.id = order_item_id_param;
    
    -- Check if record exists and user matches
    IF NOT FOUND OR item_record.user_email != user_email_param THEN
        RETURN FALSE;
    END IF;
    
    -- Check if order is completed
    IF item_record.status != 'completed' THEN
        RETURN FALSE;
    END IF;
    
    -- Check download limit
    IF item_record.download_count >= item_record.download_limit THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(order_item_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE order_items 
    SET download_count = download_count + 1
    WHERE id = order_item_id_param;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
