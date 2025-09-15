-- Download system functions for N3urali.art e-commerce platform
-- This script adds the missing functions for secure download token management

-- Create verify_and_download function
CREATE OR REPLACE FUNCTION verify_and_download(token_input TEXT)
RETURNS TABLE (
    valid BOOLEAN,
    image_id UUID,
    order_item_id UUID,
    download_count INTEGER,
    max_downloads INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    download_record RECORD;
BEGIN
    -- Find the download record by token
    SELECT d.*, oi.image_id INTO download_record
    FROM downloads d
    JOIN order_items oi ON oi.id = d.order_item_id
    WHERE d.download_token = token_input;
    
    -- Check if token exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 0, 0, NULL::TIMESTAMP WITH TIME ZONE;
        RETURN;
    END IF;
    
    -- Check if token has expired
    IF download_record.expires_at < NOW() THEN
        RETURN QUERY SELECT FALSE, download_record.image_id, download_record.order_item_id, 
                           download_record.download_count, download_record.max_downloads, 
                           download_record.expires_at;
        RETURN;
    END IF;
    
    -- Check if download limit exceeded
    IF download_record.download_count >= download_record.max_downloads THEN
        RETURN QUERY SELECT FALSE, download_record.image_id, download_record.order_item_id,
                           download_record.download_count, download_record.max_downloads,
                           download_record.expires_at;
        RETURN;
    END IF;
    
    -- Increment download count
    UPDATE downloads 
    SET download_count = download_count + 1 
    WHERE download_token = token_input;
    
    -- Log the download
    INSERT INTO download_logs (download_id, ip_address, user_agent)
    VALUES (download_record.id, NULL, NULL);
    
    -- Return success
    RETURN QUERY SELECT TRUE, download_record.image_id, download_record.order_item_id,
                       download_record.download_count + 1, download_record.max_downloads,
                       download_record.expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate download tokens for individual order items
CREATE OR REPLACE FUNCTION generate_download_token(order_item_id_input UUID)
RETURNS TEXT AS $$
DECLARE
    token TEXT;
    expiry TIMESTAMP WITH TIME ZONE;
    order_status TEXT;
BEGIN
    -- Check if order item exists and order is completed
    SELECT o.status INTO order_status
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.id = order_item_id_input;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order item not found';
    END IF;
    
    IF order_status != 'completed' THEN
        RAISE EXCEPTION 'Order not completed';
    END IF;
    
    -- Set expiry to 24 hours from now
    expiry := NOW() + INTERVAL '24 hours';
    
    -- Generate unique token
    token := encode(gen_random_bytes(32), 'hex');
    
    -- Insert or update download record
    INSERT INTO downloads (order_item_id, download_token, expires_at, download_count, max_downloads)
    VALUES (order_item_id_input, token, expiry, 0, 5)
    ON CONFLICT (order_item_id) DO UPDATE SET
        download_token = EXCLUDED.download_token,
        expires_at = EXCLUDED.expires_at;
    
    RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate download tokens for completed orders
CREATE OR REPLACE FUNCTION create_download_tokens_for_order(order_id_input UUID)
RETURNS TABLE (
    order_item_id UUID,
    download_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    item_record RECORD;
    token TEXT;
    expiry TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Set expiry to 30 days from now
    expiry := NOW() + INTERVAL '30 days';
    
    -- Loop through all order items for this order
    FOR item_record IN 
        SELECT oi.id as order_item_id
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.id = order_id_input AND o.status = 'completed'
    LOOP
        -- Generate unique token
        token := encode(gen_random_bytes(32), 'hex');
        
        -- Insert download record
        INSERT INTO downloads (order_item_id, download_token, expires_at, download_count, max_downloads)
        VALUES (item_record.order_item_id, token, expiry, 0, 5)
        ON CONFLICT (order_item_id) DO UPDATE SET
            download_token = EXCLUDED.download_token,
            expires_at = EXCLUDED.expires_at;
        
        -- Return the token info
        RETURN QUERY SELECT item_record.order_item_id, token, expiry;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user downloads
CREATE OR REPLACE FUNCTION get_user_downloads(user_email_input TEXT)
RETURNS TABLE (
    order_item_id UUID,
    image_title TEXT,
    license_name TEXT,
    download_count INTEGER,
    download_limit INTEGER,
    order_date TIMESTAMP WITH TIME ZONE,
    can_download BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oi.id as order_item_id,
        i.title as image_title,
        l.name as license_name,
        COALESCE(d.download_count, 0) as download_count,
        COALESCE(d.max_downloads, 5) as download_limit,
        o.created_at as order_date,
        (o.status = 'completed' AND 
         COALESCE(d.expires_at, NOW() + INTERVAL '30 days') > NOW() AND 
         COALESCE(d.download_count, 0) < COALESCE(d.max_downloads, 5)) as can_download
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN images i ON i.id = oi.image_id
    JOIN licenses l ON l.id = oi.license_id
    LEFT JOIN downloads d ON d.order_item_id = oi.id
    WHERE o.user_email = user_email_input
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION verify_and_download(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION generate_download_token(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_download_tokens_for_order(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_downloads(TEXT) TO authenticated, anon;

-- Update orders table to include missing columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'demo';

-- Create unique constraint on downloads to prevent duplicates
ALTER TABLE downloads DROP CONSTRAINT IF EXISTS unique_order_item_download;
ALTER TABLE downloads ADD CONSTRAINT unique_order_item_download UNIQUE (order_item_id);

COMMIT;
